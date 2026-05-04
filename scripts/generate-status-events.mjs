#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

const TYPE_VALUES = new Set(['announcement', 'notice', 'maintenance', 'operational-report', 'incident']);
const SEVERITY_VALUES = new Set(['info', 'minor', 'major', 'critical']);
const STATE_VALUES = new Set(['scheduled', 'active', 'resolved']);
const HIDDEN_STATES = new Set(['draft', 'archived']);
const REQUIRED_LABEL = 'status:event';

const args = parseArgs(process.argv.slice(2));
const repoConfig = await readRepoConfig(args);
const outputPath = resolve(repoRoot, args.output ?? 'api/status-events.json');

const issues = args.fixture
  ? await readFixture(resolve(repoRoot, args.fixture))
  : await fetchStatusIssues(repoConfig);

const events = [];
const invalid = [];

for (const issue of issues) {
  if (issue.pull_request) continue;

  const labels = getLabelNames(issue);
  const parsed = parseStatusEvent(issue, labels, repoConfig);

  if (parsed.event) {
    events.push(parsed.event);
  } else if (parsed.reason) {
    invalid.push({ issueNumber: issue.number, reason: parsed.reason });
  }
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    owner: repoConfig.owner,
    repo: repoConfig.repo,
    label: REQUIRED_LABEL,
  },
  invalidCount: invalid.length,
  events: sortEvents(events),
};

const json = `${JSON.stringify(payload, null, 2)}\n`;

if (args.dryRun) {
  process.stdout.write(json);
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, json, 'utf8');
  console.log(`status_events_written=${outputPath}`);
  console.log(`status_events_count=${payload.events.length}`);
  console.log(`status_events_invalid=${payload.invalidCount}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

async function readRepoConfig(parsedArgs) {
  if (parsedArgs.owner && parsedArgs.repo) {
    return { owner: parsedArgs.owner, repo: parsedArgs.repo };
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (repository && repository.includes('/')) {
    const [owner, repo] = repository.split('/');
    return { owner, repo };
  }

  const configPath = resolve(repoRoot, '.upptimerc.yml');
  const config = await readFile(configPath, 'utf8');
  const owner = readScalar(config, 'owner');
  const repo = readScalar(config, 'repo');

  if (!owner || !repo) {
    throw new Error('Cannot resolve repository owner/repo from args, GITHUB_REPOSITORY, or .upptimerc.yml');
  }

  return { owner, repo };
}

function readScalar(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*([^#\\n]+)`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? null;
}

async function readFixture(path) {
  const raw = JSON.parse(await readFile(path, 'utf8'));
  return Array.isArray(raw) ? raw : raw.issues ?? [];
}

async function fetchStatusIssues({ owner, repo }) {
  const apiBase = process.env.GITHUB_API_URL ?? 'https://api.github.com';
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  let url = `${apiBase}/repos/${owner}/${repo}/issues?state=all&labels=${encodeURIComponent(REQUIRED_LABEL)}&per_page=100`;
  const issues = [];

  while (url) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub issues request failed: ${response.status} ${await response.text()}`);
    }

    issues.push(...await response.json());
    url = readNextLink(response.headers.get('link'));
  }

  return issues;
}

function readNextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const [rawUrl, rawRel] = part.split(';').map((value) => value.trim());
    if (rawRel === 'rel="next"') {
      return rawUrl.slice(1, -1);
    }
  }
  return null;
}

function parseStatusEvent(issue, labels, repoConfig) {
  if (!labels.includes(REQUIRED_LABEL)) {
    return { reason: 'missing status:event label' };
  }

  const metadata = parseMetadata(issue.body ?? '');
  const type = metadata.type ?? readLabelValue(labels, 'status:type:');
  const severity = metadata.severity ?? readLabelValue(labels, 'status:severity:');
  const state = normalizeState(metadata.state ?? readLabelValue(labels, 'status:state:'), issue.state);
  const audience = metadata.audience ?? 'private';

  if (!TYPE_VALUES.has(type)) return { reason: `invalid or missing type: ${type ?? 'missing'}` };
  if (!SEVERITY_VALUES.has(severity)) return { reason: `invalid or missing severity: ${severity ?? 'missing'}` };
  if (HIDDEN_STATES.has(state)) return { reason: `hidden state: ${state}` };
  if (!STATE_VALUES.has(state)) return { reason: `invalid or missing state: ${state ?? 'missing'}` };
  if (audience !== 'public') return { reason: 'audience is not public' };

  const bodyText = stripMetadata(issue.body ?? '');
  const summary = firstPublicParagraph(bodyText);
  if (!summary) return { reason: 'missing public summary' };

  const event = {
    id: String(issue.number),
    issueNumber: issue.number,
    sourceIssue: issue.html_url ?? `https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/${issue.number}`,
    title: cleanText(issue.title ?? `Status event #${issue.number}`, 140),
    type,
    severity,
    state,
    pinned: parseBoolean(metadata.pinned) || labels.includes('status:pinned'),
    components: readComponents(metadata.components, labels),
    startsAt: normalizeDate(metadata.startsAt),
    endsAt: normalizeDate(metadata.endsAt),
    scheduledFor: normalizeDate(metadata.scheduledFor),
    publishedAt: normalizeDate(metadata.publishedAt) ?? normalizeDate(issue.created_at),
    updatedAt: normalizeDate(issue.updated_at),
    summary: cleanText(summary, 600),
    updates: [],
  };

  return { event };
}

function getLabelNames(issue) {
  return (issue.labels ?? [])
    .map((label) => typeof label === 'string' ? label : label.name)
    .filter(Boolean);
}

function readLabelValue(labels, prefix) {
  const label = labels.find((value) => value.startsWith(prefix));
  return label ? label.slice(prefix.length) : null;
}

function parseMetadata(body) {
  const match = body.match(/^\s*<!--([\s\S]*?)-->/);
  if (!match) return {};

  const metadata = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    metadata[key] = value || null;
  }
  return metadata;
}

function stripMetadata(body) {
  return body.replace(/^\s*<!--[\s\S]*?-->/, '').trim();
}

function firstPublicParagraph(text) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/^#+\s*/gm, '').trim())
    .find(Boolean) ?? '';
}

function normalizeState(value, issueState) {
  if (value) return value;
  return issueState === 'closed' ? 'resolved' : 'active';
}

function parseBoolean(value) {
  return String(value ?? '').toLowerCase() === 'true';
}

function normalizeDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function readComponents(rawValue, labels) {
  const fromMetadata = String(rawValue ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const fromLabels = labels
    .filter((label) => label.startsWith('component:'))
    .map((label) => label.slice('component:'.length));

  return [...new Set([...fromMetadata, ...fromLabels])]
    .map((component) => component.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
    .filter(Boolean);
}

function cleanText(value, maxLength) {
  const cleaned = String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function sortEvents(input) {
  const stateRank = { active: 0, scheduled: 1, resolved: 2 };
  return [...input].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (stateRank[a.state] !== stateRank[b.state]) return stateRank[a.state] - stateRank[b.state];
    const aTime = Date.parse(a.startsAt ?? a.publishedAt ?? 0);
    const bTime = Date.parse(b.startsAt ?? b.publishedAt ?? 0);
    if (aTime !== bTime) return bTime - aTime;
    return b.issueNumber - a.issueNumber;
  });
}

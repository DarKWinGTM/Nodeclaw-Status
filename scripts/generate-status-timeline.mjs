#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const TIMELINE_BUCKET_COUNT = 24;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const args = parseArgs(process.argv.slice(2));
const now = parseDate(args.now) ?? new Date();
const outputDir = resolve(repoRoot, args.outputDir ?? 'api/status-timeline');
const repoConfig = await readRepoConfig();
const sites = await readSites();
const summary = await readUpptimeSummary();
const fixture = args.fixture ? await readFixture(resolve(repoRoot, args.fixture)) : null;
const components = fixture ? readFixtureComponents(fixture) : await readGitHistoryComponents();
const payload = buildPayload(components, now, fixture?.generatedAt);

if (args.dryRun) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  await writeTimeline(payload, outputDir);
  console.log(`status_timeline_index_written=${join(outputDir, 'index.json')}`);
  console.log(`status_timeline_days_written=${Object.keys(payload.days).length}`);
  console.log(`status_timeline_components=${payload.index.components.length}`);
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
      const key = arg.slice(2).replace(/-([a-z])/g, (_, value) => value.toUpperCase());
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

async function readRepoConfig() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository && repository.includes('/')) {
    const [owner, repo] = repository.split('/');
    return { owner, repo };
  }

  const config = await readFile(resolve(repoRoot, '.upptimerc.yml'), 'utf8');
  return {
    owner: readScalar(config, 'owner'),
    repo: readScalar(config, 'repo'),
  };
}

function readScalar(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*([^#\\n]+)`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? null;
}

async function readSites() {
  const config = await readFile(resolve(repoRoot, '.upptimerc.yml'), 'utf8');
  const lines = config.split('\n');
  const start = lines.findIndex((line) => /^sites:\s*$/.test(line));
  const sites = [];
  let current = null;

  if (start === -1) return sites;

  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && line.trim()) break;
    const nameMatch = line.match(/^\s*-\s+name:\s*(.+)$/);
    const urlMatch = line.match(/^\s+url:\s*(.+)$/);
    if (nameMatch) {
      current = { name: cleanYamlValue(nameMatch[1]), url: null };
      sites.push(current);
    } else if (urlMatch && current) {
      current.url = cleanYamlValue(urlMatch[1]);
      current.slug = slugify(current.name);
    }
  }

  return sites.filter((site) => site.name && site.url);
}

function cleanYamlValue(value) {
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

async function readUpptimeSummary() {
  const summaryPath = resolve(repoRoot, 'history/summary.json');
  if (!existsSync(summaryPath)) return [];
  try {
    return JSON.parse(await readFile(summaryPath, 'utf8'));
  } catch {
    return [];
  }
}

async function readFixture(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function readFixtureComponents(fixture) {
  return (fixture.components ?? []).map((component) => normalizeComponent({
    name: component.name,
    slug: component.slug ?? slugify(component.name),
    publicUrl: component.publicUrl ?? component.url,
    upptimeUptimePercent: normalizePercent(component.upptimeUptimePercent),
    samples: (component.samples ?? []).map((sample) => normalizeSample(sample, 'fixture')),
  }));
}

async function readGitHistoryComponents() {
  const historyDir = resolve(repoRoot, 'history');
  if (!existsSync(historyDir)) return sites.map((site) => normalizeComponent(site));

  const files = (await readdir(historyDir))
    .filter((file) => file.endsWith('.yml'))
    .sort();
  const components = [];

  for (const file of files) {
    const slug = basename(file, '.yml');
    const relativePath = `history/${file}`;
    const samples = await readGitSamples(relativePath);
    const metadata = findComponentMetadata(slug, samples);
    components.push(normalizeComponent({ ...metadata, slug, samples }));
  }

  const knownSlugs = new Set(components.map((component) => component.slug));
  for (const site of sites) {
    const summaryMatch = summary.find((entry) => entry.url === site.url || entry.name === site.name);
    const slug = summaryMatch?.slug ?? site.slug;
    if (!knownSlugs.has(slug)) {
      components.push(normalizeComponent({
        name: site.name,
        slug,
        publicUrl: site.url,
        upptimeUptimePercent: normalizePercent(summaryMatch?.uptimeDay ?? summaryMatch?.uptime),
        samples: [],
      }));
    }
  }

  return components;
}

async function readGitSamples(relativePath) {
  const maxCount = String(Number(args.maxCommits || 1500));
  try {
    const { stdout } = await execFileAsync('git', ['-C', repoRoot, 'log', `--max-count=${maxCount}`, '--format=%H%x09%cI', '--', relativePath], { maxBuffer: 16 * 1024 * 1024 });
    const commits = stdout.trim().split('\n').filter(Boolean).map((line) => {
      const [hash, committedAt] = line.split('\t');
      return { hash, committedAt };
    });
    const samples = [];
    for (const commit of commits.reverse()) {
      try {
        const { stdout: source } = await execFileAsync('git', ['-C', repoRoot, 'show', `${commit.hash}:${relativePath}`], { maxBuffer: 1024 * 1024 });
        samples.push(parseHistoryYaml(source, commit.committedAt));
      } catch {
        continue;
      }
    }
    return uniqueSamples(samples.map((sample) => normalizeSample(sample, 'git-check')));
  } catch {
    const path = resolve(repoRoot, relativePath);
    if (!existsSync(path)) return [];
    return [normalizeSample(parseHistoryYaml(await readFile(path, 'utf8'), null), 'git-check')];
  }
}

function parseHistoryYaml(source, committedAt) {
  const data = { committedAt };
  for (const line of source.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    data[key] = cleanYamlValue(value);
  }
  return {
    timestamp: data.lastUpdated || data.committedAt,
    status: data.status,
    code: data.code,
    responseTime: data.responseTime,
    url: data.url,
  };
}

function findComponentMetadata(slug, samples) {
  const summaryMatch = summary.find((entry) => entry.slug === slug);
  const sampleUrl = samples.find((sample) => sample.publicUrl)?.publicUrl;
  const siteMatch = sites.find((site) => site.url === summaryMatch?.url || site.url === sampleUrl || site.slug === slug);
  return {
    name: summaryMatch?.name ?? siteMatch?.name ?? titleFromSlug(slug),
    publicUrl: summaryMatch?.url ?? siteMatch?.url ?? sampleUrl ?? null,
    upptimeUptimePercent: normalizePercent(summaryMatch?.uptimeDay ?? summaryMatch?.uptime),
  };
}

function normalizeComponent(component) {
  const name = component.name ?? titleFromSlug(component.slug);
  const slug = component.slug ?? slugify(name);
  return {
    name,
    slug,
    publicUrl: component.publicUrl ?? component.url ?? null,
    upptimeUptimePercent: normalizePercent(component.upptimeUptimePercent),
    samples: (component.samples ?? []).filter(Boolean).sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp)),
  };
}

function normalizeSample(sample, source) {
  const timestamp = normalizeIso(sample.timestamp ?? sample.lastUpdated ?? sample.committedAt);
  if (!timestamp) return null;
  const statusCode = normalizeNumber(sample.statusCode ?? sample.code);
  const responseTimeMs = normalizeNumber(sample.responseTimeMs ?? sample.responseTime);
  const state = classifyState(sample.state ?? sample.status, statusCode);
  return {
    timestamp,
    state,
    status: sample.status ?? state,
    statusCode,
    responseTimeMs,
    publicUrl: sample.publicUrl ?? sample.url ?? null,
    source,
  };
}

function uniqueSamples(samples) {
  const seen = new Set();
  return samples.filter((sample) => {
    if (!sample) return false;
    const key = [sample.timestamp, sample.state, sample.statusCode, sample.responseTimeMs].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildPayload(components, now, fixtureGeneratedAt) {
  const generatedAt = normalizeIso(fixtureGeneratedAt) ?? now.toISOString();
  const windowEnd = now;
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);
  const allDates = new Set();

  for (const component of components) {
    for (const sample of component.samples) allDates.add(sample.timestamp.slice(0, 10));
  }

  const sortedDates = [...allDates].sort().reverse();
  const days = {};
  for (const date of sortedDates) {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    days[date] = buildDayPayload(date, components, dayStart, dayEnd, generatedAt);
  }

  return {
    index: {
      schemaVersion: 1,
      generatedAt,
      source: {
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        type: 'upptime-git-history',
      },
      currentWindow: {
        label: 'latest 24 hours',
        startsAt: windowStart.toISOString(),
        endsAt: windowEnd.toISOString(),
      },
      availableDays: sortedDates.map((date) => ({ date, path: `api/status-timeline/days/${date}.json` })),
      components: components.map((component) => buildComponentWindow(component, windowStart, windowEnd, '24h', component.upptimeUptimePercent)),
    },
    days,
  };
}

function buildDayPayload(date, components, windowStart, windowEnd, generatedAt) {
  return {
    schemaVersion: 1,
    generatedAt,
    source: {
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      type: 'upptime-git-history',
    },
    date,
    components: components.map((component) => buildComponentWindow(component, windowStart, windowEnd, 'day', null)),
  };
}

function buildComponentWindow(component, windowStart, windowEnd, windowLabel, upptimeUptimePercent) {
  const samples = component.samples.filter((sample) => {
    const time = Date.parse(sample.timestamp);
    return time >= windowStart.getTime() && time <= windowEnd.getTime();
  });
  const counts = countSamples(samples);
  const incidents = buildIncidents(samples);
  return {
    slug: component.slug,
    name: component.name,
    publicUrl: component.publicUrl,
    uptime: {
      window: windowLabel,
      upptimeUptimePercent,
      observedUptimePercent: observedUptimePercent(counts),
      sampleCount: counts.sampleCount,
      upSampleCount: counts.upSampleCount,
      downSampleCount: counts.downSampleCount,
      degradedSampleCount: counts.degradedSampleCount,
      unknownSampleCount: counts.unknownSampleCount,
      incidentCount: incidents.length,
    },
    segments: buildSegments(samples, windowStart, windowEnd),
    incidents,
  };
}

function countSamples(samples) {
  return samples.reduce((counts, sample) => {
    counts.sampleCount += 1;
    if (sample.state === 'up') counts.upSampleCount += 1;
    else if (sample.state === 'down') counts.downSampleCount += 1;
    else if (sample.state === 'degraded') counts.degradedSampleCount += 1;
    else counts.unknownSampleCount += 1;
    return counts;
  }, { sampleCount: 0, upSampleCount: 0, downSampleCount: 0, degradedSampleCount: 0, unknownSampleCount: 0 });
}

function observedUptimePercent(counts) {
  const known = counts.upSampleCount + counts.downSampleCount + counts.degradedSampleCount;
  if (!known) return null;
  return roundPercent((counts.upSampleCount / known) * 100);
}

function buildSegments(samples, windowStart, windowEnd) {
  const startTime = windowStart.getTime();
  const endTime = windowEnd.getTime();
  const bucketMs = Math.max(1, Math.round((endTime - startTime) / TIMELINE_BUCKET_COUNT));

  return Array.from({ length: TIMELINE_BUCKET_COUNT }, (_, index) => {
    const startsAt = new Date(startTime + bucketMs * index);
    const endsAt = index === TIMELINE_BUCKET_COUNT - 1
      ? new Date(endTime)
      : new Date(startTime + bucketMs * (index + 1));
    const bucketSamples = samples.filter((sample) => {
      const time = Date.parse(sample.timestamp);
      return time >= startsAt.getTime() && (index === TIMELINE_BUCKET_COUNT - 1 ? time <= endsAt.getTime() : time < endsAt.getTime());
    });
    const state = bucketState(bucketSamples);
    const representative = representativeSample(bucketSamples, state);
    const statusCodes = [...new Set(bucketSamples.map((sample) => sample.statusCode).filter((value) => value !== null))];

    return {
      state,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      observedDurationSeconds: Math.max(0, Math.round((endsAt.getTime() - startsAt.getTime()) / 1000)),
      sampleCount: bucketSamples.length,
      statusCode: representative?.statusCode ?? null,
      statusCodes,
      responseTimeMs: representative?.responseTimeMs ?? null,
      source: representative?.source ?? null,
      bucketIndex: index,
      bucketCount: TIMELINE_BUCKET_COUNT,
    };
  });
}

function bucketState(samples) {
  if (samples.some((sample) => sample.state === 'down')) return 'down';
  if (samples.some((sample) => sample.state === 'degraded')) return 'degraded';
  if (samples.some((sample) => sample.state === 'up')) return 'up';
  return 'unknown';
}

function representativeSample(samples, state) {
  const matching = samples.filter((sample) => sample.state === state);
  return matching.at(-1) ?? samples.at(-1) ?? null;
}

function buildIncidents(samples) {
  const incidents = [];
  let active = null;

  for (const sample of samples) {
    if (sample.state === 'up') {
      if (active) {
        active.recoveryAt = sample.timestamp;
        active.endsAt = sample.timestamp;
        active.observedDurationSeconds = secondsBetween(active.startsAt, sample.timestamp);
        incidents.push(finishIncident(active));
        active = null;
      }
      continue;
    }

    if (sample.state !== 'down' && sample.state !== 'degraded') continue;

    if (!active) {
      active = {
        state: sample.state,
        startsAt: sample.timestamp,
        lastObservedAt: sample.timestamp,
        endsAt: sample.timestamp,
        recoveryAt: null,
        samples: [],
      };
    }

    if (active.state !== 'down' && sample.state === 'down') active.state = 'down';
    active.samples.push(sample);
    active.lastObservedAt = sample.timestamp;
    active.endsAt = sample.timestamp;
    active.observedDurationSeconds = secondsBetween(active.startsAt, active.lastObservedAt);
  }

  if (active) incidents.push(finishIncident(active));
  return incidents;
}

function finishIncident(incident) {
  const statusCodes = [...new Set(incident.samples.map((sample) => sample.statusCode).filter((value) => value !== null))];
  const responseTimes = incident.samples.map((sample) => sample.responseTimeMs).filter((value) => value !== null);
  return {
    state: incident.state,
    startsAt: incident.startsAt,
    lastObservedAt: incident.lastObservedAt,
    endsAt: incident.endsAt,
    recoveryAt: incident.recoveryAt,
    observedDurationSeconds: incident.observedDurationSeconds,
    sampleCount: incident.samples.length,
    statusCodes,
    maxResponseTimeMs: responseTimes.length ? Math.max(...responseTimes) : null,
    summary: incidentSummary(incident, statusCodes),
  };
}

function incidentSummary(incident, statusCodes) {
  const codeText = statusCodes.length ? ` with HTTP ${statusCodes.join(', ')}` : '';
  return `${capitalize(incident.state)} samples observed${codeText}. Duration is an observed window from sparse checks.`;
}

async function writeTimeline(payload, targetDir) {
  await mkdir(join(targetDir, 'days'), { recursive: true });
  await writeFile(join(targetDir, 'index.json'), `${JSON.stringify(payload.index, null, 2)}\n`, 'utf8');
  for (const [date, day] of Object.entries(payload.days)) {
    await writeFile(join(targetDir, 'days', `${date}.json`), `${JSON.stringify(day, null, 2)}\n`, 'utf8');
  }
}

function classifyState(status, code) {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'up' && code !== null && code < 400) return 'up';
  if (normalized === 'down' || (code !== null && code >= 500)) return 'down';
  if (normalized === 'degraded' || (code !== null && code >= 400)) return 'degraded';
  if (normalized === 'up') return 'up';
  return 'unknown';
}

function normalizeIso(value) {
  const date = parseDate(value);
  return date ? date.toISOString() : null;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizePercent(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(String(value).replace('%', '').trim());
  return Number.isFinite(number) ? roundPercent(number) : null;
}

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

function secondsBetween(start, end) {
  return Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000));
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromSlug(slug) {
  return String(slug ?? '')
    .split('-')
    .filter(Boolean)
    .map(capitalize)
    .join(' ');
}

function capitalize(value) {
  const text = String(value ?? '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

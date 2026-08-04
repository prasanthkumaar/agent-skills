#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);

function argument(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function localDate(timestamp, timeZone) {
  const { year, month, day } = zonedParts(new Date(timestamp), timeZone);
  return `${year}-${month}-${day}`;
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || 'unknown error').trim();
    throw new Error(`${command} ${commandArgs.join(' ')} failed: ${detail}`);
  }
  return result.stdout;
}

function ccusage(commandArgs) {
  // Current pricing is required because Claude's transcript format stores token
  // usage but may not store the locally estimated historical session cost.
  return run('npx', ['--yes', 'ccusage@latest', ...commandArgs]);
}

function messageText(message) {
  if (typeof message?.content === 'string') return message.content;
  if (!Array.isArray(message?.content)) return '';
  return message.content
    .filter((part) => part?.type === 'text')
    .map((part) => part.text ?? '')
    .join(' ');
}

function sanitise(text) {
  return text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, ' ')
    .replace(/https?:\/\/\S+\?\S+/g, (url) => `${url.split('?')[0]}?[query removed]`)
    .replace(/\b(sk-ant-[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{16,})\b/g, '[redacted credential]')
    .replace(/\s+/g, ' ')
    .trim();
}

function isHumanPrompt(row, text) {
  if (row.type !== 'user' || row.isMeta || row.isSidechain || !text) return false;
  return ![
    '<command-name>',
    '<local-command',
    'Another Claude session sent a message:',
    'This came from another Claude session',
  ].some((prefix) => text.startsWith(prefix));
}

function readRows(transcript) {
  if (!fs.existsSync(transcript)) return [];
  const rows = [];
  for (const line of fs.readFileSync(transcript, 'utf8').split('\n')) {
    if (!line) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      continue;
    }
  }
  return rows.filter((row) => row.timestamp).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function latestPrompt(prompts, timestamp) {
  let match;
  for (const prompt of prompts) {
    if (prompt.timestamp > timestamp) break;
    match = prompt;
  }
  return match;
}

function usageWeight(usage = {}) {
  const cache = usage.cache_creation ?? {};
  const oneHour = cache.ephemeral_1h_input_tokens ?? 0;
  const fiveMinute = cache.ephemeral_5m_input_tokens ?? 0;
  const otherCache = Math.max(0, (usage.cache_creation_input_tokens ?? 0) - oneHour - fiveMinute);
  return (usage.input_tokens ?? 0)
    + (usage.output_tokens ?? 0) * 5
    + (usage.cache_read_input_tokens ?? 0) * 0.1
    + fiveMinute * 1.25
    + oneHour * 2
    + otherCache * 1.25;
}

function sessionLedger(session, transcript, timeZone, month, windowStart, windowEnd) {
  const rows = readRows(transcript);
  const prompts = rows
    .map((row, index) => ({ row, index, text: sanitise(messageText(row.message)) }))
    .filter(({ row, text }) => isHumanPrompt(row, text))
    .map(({ row, index, text }) => ({
      key: row.uuid ?? `${row.timestamp}:${index}`,
      timestamp: row.timestamp,
      date: localDate(row.timestamp, timeZone),
      text: text.length > 700 ? `${text.slice(0, 697)}...` : text,
      estimatedCostUSD: 0,
    }));

  const requests = new Map();
  function addRequests(sourceRows, fixedPrompt) {
    for (const row of sourceRows) {
      if (row.type !== 'assistant' || !row.requestId || !row.message?.usage) continue;
      const responseDate = localDate(row.timestamp, timeZone);
      if (responseDate < windowStart || responseDate > windowEnd || requests.has(row.requestId)) continue;
      const prompt = fixedPrompt ?? latestPrompt(prompts, row.timestamp) ?? prompts[0];
      if (!prompt) continue;
      requests.set(row.requestId, {
        model: row.message.model,
        prompt,
        weight: usageWeight(row.message.usage),
      });
    }
  }

  addRequests(rows);
  const subagents = path.join(path.dirname(transcript), session.sessionId, 'subagents');
  if (fs.existsSync(subagents)) {
    for (const entry of fs.readdirSync(subagents)) {
      if (!entry.endsWith('.jsonl')) continue;
      const agentRows = readRows(path.join(subagents, entry));
      const firstTimestamp = agentRows.find((row) => row.type === 'assistant')?.timestamp;
      const parentPrompt = firstTimestamp ? latestPrompt(prompts, firstTimestamp) ?? prompts[0] : prompts[0];
      addRequests(agentRows, parentPrompt);
    }
  }

  for (const breakdown of session.modelBreakdowns ?? []) {
    const modelRequests = [...requests.values()].filter((request) => request.model === breakdown.modelName);
    const totalWeight = modelRequests.reduce((sum, request) => sum + request.weight, 0);
    if (modelRequests.length === 0) {
      const fallback = prompts.find((prompt) => prompt.date.startsWith(month)) ?? prompts[0];
      if (fallback) fallback.estimatedCostUSD += breakdown.cost ?? 0;
      continue;
    }
    for (const request of modelRequests) {
      const share = totalWeight > 0 ? request.weight / totalWeight : 1 / modelRequests.length;
      request.prompt.estimatedCostUSD += (breakdown.cost ?? 0) * share;
    }
  }

  const monthPrompts = prompts.filter((prompt) => prompt.date.slice(0, 7) === month);
  return {
    sessionId: session.sessionId,
    project: session.projectPath,
    firstActivity: session.firstActivity,
    lastActivity: session.lastActivity,
    estimatedCostUSD: monthPrompts.reduce((sum, prompt) => sum + prompt.estimatedCostUSD, 0),
    prompts: monthPrompts.map(({ date, text, estimatedCostUSD }) => ({ date, text, estimatedCostUSD })),
  };
}

const timeZone = argument('--timezone') || 'UTC';
const now = zonedParts(new Date(), timeZone);
const month = argument('--month') || `${now.year}-${now.month}`;
if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`Invalid --month: ${month}`);

const [year, monthNumber] = month.split('-').map(Number);
const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
const bufferStart = new Date(Date.UTC(year, monthNumber - 1, -1));
const bufferEnd = new Date(Date.UTC(year, monthNumber - 1, lastDay + 2));
const compactDate = (date) => date.toISOString().slice(0, 10).replaceAll('-', '');
const since = compactDate(bufferStart);
const until = compactDate(bufferEnd);
const common = ['--since', since, '--until', until, '--timezone', timeZone, '--json'];

const sessionReport = JSON.parse(ccusage(['claude', 'session', ...common]));
const projectsRoot = path.join(os.homedir(), '.claude', 'projects');
const windowStart = localDate(bufferStart, timeZone);
const windowEnd = localDate(bufferEnd, timeZone);

const sessions = (sessionReport.sessions ?? []).map((session) => {
  const transcript = path.join(projectsRoot, session.projectPath, `${session.sessionId}.jsonl`);
  return sessionLedger(session, transcript, timeZone, month, windowStart, windowEnd);
}).filter((session) => session.prompts.length > 0 || session.estimatedCostUSD > 0);

const localEstimatedMonthCostUSD = sessions.reduce(
  (sum, session) => sum + session.estimatedCostUSD,
  0,
);
const authoritativeTotalArgument = argument('--authoritative-total-usd');
const authoritativeMonthCostUSD = authoritativeTotalArgument === undefined
  ? undefined
  : Number(authoritativeTotalArgument);
if (authoritativeTotalArgument !== undefined
    && (!Number.isFinite(authoritativeMonthCostUSD) || authoritativeMonthCostUSD < 0)) {
  throw new Error(`Invalid --authoritative-total-usd: ${authoritativeTotalArgument}`);
}
if (authoritativeMonthCostUSD > 0 && localEstimatedMonthCostUSD === 0) {
  throw new Error('Cannot reconcile a positive authoritative total with zero local usage');
}

const normalizationFactor = authoritativeMonthCostUSD === undefined
  ? 1
  : authoritativeMonthCostUSD / (localEstimatedMonthCostUSD || 1);
if (normalizationFactor !== 1) {
  for (const session of sessions) {
    session.estimatedCostUSD *= normalizationFactor;
    for (const prompt of session.prompts) prompt.estimatedCostUSD *= normalizationFactor;
  }
}

const projectDays = new Map();
for (const session of sessions) {
  for (const prompt of session.prompts) {
    const key = `${session.project}\t${prompt.date}`;
    projectDays.set(key, (projectDays.get(key) ?? 0) + prompt.estimatedCostUSD);
  }
}
const projects = [...new Set(sessions.map((session) => session.project))].map((project) => ({
  project,
  days: [...projectDays.entries()]
    .filter(([key]) => key.startsWith(`${project}\t`))
    .map(([key, estimatedCostUSD]) => ({ date: key.split('\t')[1], estimatedCostUSD }))
    .sort((a, b) => a.date.localeCompare(b.date)),
}));
const estimatedMonthCostUSD = sessions.reduce((sum, session) => sum + session.estimatedCostUSD, 0);

process.stdout.write(`${JSON.stringify({
  month,
  timeZone,
  currency: 'USD',
  costBasis: authoritativeMonthCostUSD === undefined
    ? 'Locally estimated API-equivalent cost via current ccusage pricing'
    : 'Claude-displayed API-equivalent total distributed using local transcript cost weights',
  attribution: `Estimated cost is assigned to the ${timeZone} date of the initiating human prompt.`,
  localEstimatedMonthCostUSD,
  authoritativeMonthCostUSD: authoritativeMonthCostUSD ?? null,
  normalizationFactor,
  estimatedMonthCostUSD,
  sessions,
  projects,
}, null, 2)}\n`);

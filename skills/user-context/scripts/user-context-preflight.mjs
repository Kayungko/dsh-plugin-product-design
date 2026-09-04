#!/usr/bin/env node
/**
 * Read local Product Design context and print compact JSON.
 *
 * State layout:
 *   <state-dir>/user-context.md
 *   <state-dir>/assets/
 *
 * The state directory resolves from (first wins):
 *   --state-dir <dir>  >  $DSH_HOME/product-design  >  ~/.dsh/product-design
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const DEFAULT_MAX_CONTEXT_BYTES = 2_000_000;

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const raw = arg.slice(2);
    const [key, inlineValue] = raw.split('=', 2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function resolveStateDir(args) {
  if (typeof args['state-dir'] === 'string' && args['state-dir'].length > 0) {
    return resolve(args['state-dir']);
  }
  const dshHome = process.env.DSH_HOME && process.env.DSH_HOME.trim().length > 0
    ? process.env.DSH_HOME.trim()
    : join(homedir(), '.dsh');
  return resolve(join(dshHome, 'product-design'));
}

function fileMtimeIso(filePath) {
  try {
    return new Date(statSync(filePath).mtimeMs).toISOString();
  } catch {
    return null;
  }
}

function parseResourceName(line) {
  const linkMatch = /^\[(.+?)\]\((.+?)\)\s*$/.exec(line);
  if (linkMatch) return { name: linkMatch[1].trim(), url: linkMatch[2].trim() };
  const urlMatch = /^(https?:\/\/\S+)\s*$/.exec(line);
  if (urlMatch) return { name: urlMatch[1].trim(), url: urlMatch[1].trim() };
  return { name: line.trim() };
}

function summarizeUserContext(markdown) {
  const entries = [];
  const unresolvedCategories = [];
  let category = null;
  let inSavedContext = false;
  let currentEntry = null;

  const flushEntry = () => {
    if (currentEntry) {
      entries.push(currentEntry);
      currentEntry = null;
    }
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('<!--') || line.startsWith('-->')) continue;

    const categoryMatch = /^# ([^#].*?)\s*$/.exec(line);
    if (categoryMatch) {
      flushEntry();
      category = categoryMatch[1].trim();
      inSavedContext = false;
      continue;
    }

    if (line === '## Saved Links And Context') {
      flushEntry();
      inSavedContext = true;
      continue;
    }

    if (!category || !inSavedContext) continue;

    if (line.toLowerCase() === 'status: not provided' || line.toLowerCase() === 'status: not provided.') {
      flushEntry();
      unresolvedCategories.push(category);
      continue;
    }

    if (!line.startsWith('- ')) {
      flushEntry();
      currentEntry = { category, ...parseResourceName(line) };
      continue;
    }

    if (!currentEntry) continue;

    const bullet = line.slice(2).trim();
    const prefixes = [
      ['Date Added:', 'date_added'],
      ['File:', 'file'],
      ['Useful Context:', 'useful_context'],
      ['Future Use:', 'future_use'],
    ];
    const matched = prefixes.find(([prefix]) => bullet.startsWith(prefix));
    if (matched) {
      const [prefix, key] = matched;
      currentEntry[key] = bullet.slice(prefix.length).trim().replace(/\.$/, '');
    } else {
      if (!currentEntry.notes) currentEntry.notes = [];
      currentEntry.notes.push(bullet);
    }
  }

  flushEntry();
  return { entries, unresolved_categories: unresolvedCategories };
}

function missingPayload(stateDir, contextPath) {
  return {
    plugin: 'product-design',
    state_dir: stateDir,
    user_context: {
      path: contextPath,
      exists: false,
      status: 'missing',
      entries: [],
      unresolved_categories: [],
    },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const stateDir = resolveStateDir(args);
  const contextPath = join(stateDir, 'user-context.md');

  if (!existsSync(contextPath)) {
    console.log(JSON.stringify(missingPayload(stateDir, contextPath), null, 2));
    return 0;
  }

  const size = statSync(contextPath).size;
  const maxBytes = Number.isFinite(Number(args['max-context-bytes'])) && Number(args['max-context-bytes']) > 0
    ? Number(args['max-context-bytes'])
    : DEFAULT_MAX_CONTEXT_BYTES;
  if (size > maxBytes) {
    console.log(JSON.stringify({
      plugin: 'product-design',
      state_dir: stateDir,
      user_context: {
        path: contextPath,
        exists: true,
        status: 'too_large',
        size_bytes: size,
        max_context_bytes: maxBytes,
        entries: [],
        unresolved_categories: [],
      },
    }, null, 2));
    return 0;
  }

  const markdown = readFileSync(contextPath, 'utf8');
  const summary = summarizeUserContext(markdown);
  console.log(JSON.stringify({
    plugin: 'product-design',
    state_dir: stateDir,
    user_context: {
      path: contextPath,
      exists: true,
      status: 'present',
      sha256: createHash('sha256').update(markdown, 'utf8').digest('hex'),
      modified_at: fileMtimeIso(contextPath),
      ...summary,
    },
  }, null, 2));
  return 0;
}

process.exit(main());

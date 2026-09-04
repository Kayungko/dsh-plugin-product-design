#!/usr/bin/env node
/**
 * Create the local Product Design context file from the bundled template.
 *
 * State layout:
 *   <state-dir>/user-context.md
 *   <state-dir>/assets/
 *
 * The state directory resolves from (first wins):
 *   --state-dir <dir>  >  $DSH_HOME/product-design  >  ~/.dsh/product-design
 *
 * Flags:
 *   --overwrite   overwrite an existing user-context.md (default preserves it)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_PATH = join(SKILL_ROOT, 'plugin-author-config', 'user-context-template.md');

const CONTEXT_NOTE = `<!--
Product Design context. This file is user-editable.
Unresolved \`status: not provided\` entries are setup prompts, not saved facts.
Saved references should include Date Added, Useful Context, and Future Use when available.
-->

`;

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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const stateDir = resolveStateDir(args);
  const contextPath = join(stateDir, 'user-context.md');

  if (!existsSync(TEMPLATE_PATH)) {
    console.error('Missing Product Design context template.');
    console.error(`- ${TEMPLATE_PATH}`);
    return 1;
  }

  mkdirSync(stateDir, { recursive: true });
  mkdirSync(join(stateDir, 'assets'), { recursive: true });

  const existed = existsSync(contextPath);
  let result;
  if (existed && !args.overwrite) {
    result = 'preserved';
  } else {
    writeFileSync(contextPath, CONTEXT_NOTE + readFileSync(TEMPLATE_PATH, 'utf8'), 'utf8');
    result = existed ? 'overwritten' : 'created';
  }

  console.log(`Product Design state directory: ${stateDir}`);
  console.log(`user-context.md: ${result}`);
  return 0;
}

process.exit(main());

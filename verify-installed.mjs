#!/usr/bin/env node
/**
 * Post-install integration verification for dsh-plugin-product-design.
 *
 * Checks, against the real installed copy and the real host provider package:
 *   1. the plugin is registered in the desktop profile (dependency + bundle);
 *   2. the installed files are complete (shell, skills, references, scripts,
 *      templates);
 *   3. the host's @deepseek-ai/dsh-skill-filesystem discovers exactly the ten
 *      bundled skills (one entry + nine `pd-*`) from the installed skills
 *      directory and loads every body.
 *
 * Usage:
 *   node verify-installed.mjs [--profile <dir>] [--app-node-modules <dir>]
 *
 * Defaults:
 *   --profile           ~/.dsh/profiles/desktop
 *   --app-node-modules  %LOCALAPPDATA%/Programs/DSHDesktop/DSH Desktop/resources/app.asar.unpacked/node_modules
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PLUGIN_NAME = 'dsh-plugin-product-design';

const EXPECTED_SKILLS = [
  'product-design',
  'pd-get-context',
  'pd-user-context',
  'pd-research',
  'pd-ideate',
  'pd-image-to-code',
  'pd-url-to-code',
  'pd-audit',
  'pd-design-qa',
  'pd-share',
];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
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

const args = parseArgs(process.argv.slice(2));
const profile = resolve(args.profile ?? join(homedir(), '.dsh', 'profiles', 'desktop'));
const appNodeModules = resolve(args['app-node-modules'] ?? join(
  process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'),
  'Programs', 'DSHDesktop', 'DSH Desktop', 'resources', 'app.asar.unpacked', 'node_modules',
));

const results = [];
let failed = false;

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
}

// --- 1. profile registration -------------------------------------------------
const pluginDir = join(profile, 'node_modules', PLUGIN_NAME);
const manifestPath = join(profile, 'package.json');

check('installed plugin directory exists', existsSync(pluginDir), pluginDir);

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const dep = manifest?.dependencies?.[PLUGIN_NAME];
  check('profile dependency registered', typeof dep === 'string' && dep.startsWith('file:'), String(dep));
  check('profile bundle registered', Array.isArray(manifest?.dsh?.profile?.bundles) && manifest.dsh.profile.bundles.includes(PLUGIN_NAME));
} else {
  check('profile manifest exists', false, manifestPath);
}

// --- 2. installed file completeness -------------------------------------------
const requiredPaths = [
  'package.json',
  'cordis.patch.yml',
  'index.mjs',
  'skills.mjs',
  'references/critical-overrides.md',
  'references/communication-protocol.md',
  'references/existing-codebase-edits.md',
  'references/local-prototype-preflight.md',
  'scripts/bootstrap-prototype.mjs',
  'templates/prototype/package.json',
  'templates/prototype/src/App.jsx',
];
for (const rel of requiredPaths) {
  check(`installed file: ${rel}`, existsSync(join(pluginDir, rel)));
}

const installedSkillsDir = join(pluginDir, 'skills');
if (existsSync(installedSkillsDir)) {
  const dirs = readdirSync(installedSkillsDir).filter((entry) => statSync(join(installedSkillsDir, entry)).isDirectory());
  check('installed skills: 10 directories', dirs.length === 10, dirs.join(', '));
  for (const dir of dirs) {
    check(`installed skill bundle: ${dir}/SKILL.md`, existsSync(join(installedSkillsDir, dir, 'SKILL.md')));
  }
} else {
  check('installed skills directory exists', false, installedSkillsDir);
}

// --- 3. real host provider discovers the installed skills ---------------------
const providerEntry = join(appNodeModules, '@deepseek-ai', 'dsh-skill-filesystem', 'lib', 'index.js');
if (!existsSync(providerEntry)) {
  check('host dsh-skill-filesystem resolvable', false, providerEntry);
} else {
  try {
    const { FileSystemSkillProvider } = await import(pathToFileURL(providerEntry).href);
    const control = { invalidate: () => {}, signal: new AbortController().signal };
    // Minimal host stand-in: no `fs` service (provider falls back to Node I/O),
    // no events. `ctx.get` must exist because the provider probes `ctx.get("fs")`.
    const ctx = { logger: { warn: () => {} }, on: () => {}, get: () => undefined };
    const provider = new FileSystemSkillProvider(ctx, control, {
      providerName: 'product-design',
      includeDefaultRoots: false,
      customSkillDirs: [installedSkillsDir],
      watch: false,
    });
    const listed = await provider.list({ cwd: profile });
    const candidates = Array.isArray(listed) ? listed : listed?.candidates ?? [];
    const names = candidates.map((candidate) => candidate.name).sort();
    check('provider discovers exactly the ten bundled skills (1 entry + 9 pd-*)', JSON.stringify(names) === JSON.stringify([...EXPECTED_SKILLS].sort()), names.join(', '));
    check('every candidate is provider-tagged', candidates.every((candidate) => candidate.provider === 'product-design'));

    let loaded = 0;
    for (const candidate of candidates) {
      const skill = await provider.get(candidate, { signal: control.signal });
      if (skill && typeof skill.content === 'string' && skill.content.length > 0 && skill.resourceBase?.kind === 'directory') loaded += 1;
    }
    check('every skill body loads with a directory resource base', loaded === candidates.length && loaded > 0, `${loaded}/${candidates.length}`);

    await provider.dispose();
  } catch (error) {
    check('host provider integration', false, error?.message ?? String(error));
  }
}

// --- report --------------------------------------------------------------------
for (const { name, ok, detail } of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}
console.log(failed ? '\nverification FAILED' : '\nverification OK');
process.exit(failed ? 1 : 0);

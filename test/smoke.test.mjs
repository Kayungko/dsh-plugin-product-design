/**
 * Smoke tests for dsh-plugin-product-design (mock host, node --test).
 *
 * Covers: skill bundle discovery contract (frontmatter validity, pd-* naming,
 * uniqueness), cross-reference existence, bootstrap script behavior,
 * user-context scripts round-trip, skill provider config, and the degraded
 * mount path when @deepseek-ai/dsh-skill-filesystem is unavailable.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(PLUGIN_ROOT, 'skills');
const NODE = process.execPath;

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

const SKILL_DIRS = [
  'index',
  'get-context',
  'user-context',
  'research',
  'ideate',
  'image-to-code',
  'url-to-code',
  'audit',
  'design-qa',
  'share',
];

function parseFrontmatter(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown);
  assert.ok(match, 'SKILL.md must start with YAML frontmatter');
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
  }
  return fields;
}

test('all ten skill bundles exist with SKILL.md', () => {
  for (const dir of SKILL_DIRS) {
    const skillFile = join(SKILLS_DIR, dir, 'SKILL.md');
    assert.ok(existsSync(skillFile), `missing ${dir}/SKILL.md`);
  }
});

test('frontmatter: one user entry (product-design) + nine hidden pd-* sub-skills', () => {
  const names = [];
  for (const dir of SKILL_DIRS) {
    const markdown = readFileSync(join(SKILLS_DIR, dir, 'SKILL.md'), 'utf8');
    const fields = parseFrontmatter(markdown);
    assert.ok(fields.name, `${dir}: missing name`);
    assert.match(fields.name, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, `${dir}: name not kebab-case`);
    if (dir === 'index') {
      assert.equal(fields.name, 'product-design', 'router must be the single user entry');
      assert.notEqual(fields['user-invocable'], 'false', 'router must stay user-invocable');
    } else {
      assert.ok(fields.name.startsWith('pd-'), `${dir}: sub-skill must carry the pd- prefix`);
      assert.equal(fields['user-invocable'], 'false', `${dir}: sub-skill must be hidden from the user command list`);
    }
    assert.ok(fields.description && fields.description.length > 20, `${dir}: description too short`);
    assert.ok(fields.description.length <= 500, `${dir}: description exceeds catalog cap`);
    names.push(fields.name);
  }
  assert.deepEqual([...names].sort(), [...EXPECTED_SKILLS].sort());
});

test('shared references resolve from every skill directory', () => {
  for (const dir of SKILL_DIRS) {
    const base = join(SKILLS_DIR, dir);
    assert.ok(existsSync(join(base, '..', '..', 'references', 'critical-overrides.md')), `${dir}: critical-overrides missing`);
    assert.ok(existsSync(join(base, '..', '..', 'references', 'communication-protocol.md')), `${dir}: communication-protocol missing`);
  }
});

test('router references every focused skill by its pd-* name', () => {
  const indexBody = readFileSync(join(SKILLS_DIR, 'index', 'SKILL.md'), 'utf8');
  for (const dir of SKILL_DIRS.filter((dir) => dir !== 'index')) {
    assert.ok(indexBody.includes(`$pd-${dir}`), `product-design router does not reference $pd-${dir}`);
  }
  // the user-context skill is additionally linked by relative path
  assert.ok(indexBody.includes('../user-context/SKILL.md'));
});

test('bootstrap-prototype.mjs scaffolds into an empty destination', () => {
  const work = mkdtempSync(join(tmpdir(), 'pd-boot-'));
  const dest = join(work, 'My Proto App');
  try {
    const out = execFileSync(NODE, [join(PLUGIN_ROOT, 'scripts', 'bootstrap-prototype.mjs'), '--dest', dest], { encoding: 'utf8' });
    const result = JSON.parse(out);
    assert.equal(result.status, 'created');
    assert.equal(result.template, 'prototype');
    const pkg = JSON.parse(readFileSync(join(dest, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'my-proto-app');
    assert.ok(existsSync(join(dest, 'vite.config.mjs')));
    assert.ok(existsSync(join(dest, 'src', 'App.jsx')));
    assert.ok(existsSync(join(dest, 'AGENTS.md')));
    assert.ok(!existsSync(join(dest, 'node_modules')));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test('bootstrap-prototype.mjs refuses a non-empty destination', () => {
  const work = mkdtempSync(join(tmpdir(), 'pd-boot-'));
  const dest = join(work, 'occupied');
  try {
    mkdirSync(dest, { recursive: true });
    writeFileSync(join(dest, 'keep.txt'), 'x', { flag: 'w' });
    assert.throws(() => {
      execFileSync(NODE, [join(PLUGIN_ROOT, 'scripts', 'bootstrap-prototype.mjs'), '--dest', dest], { encoding: 'utf8', stdio: 'pipe' });
    });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test('user-context scripts: init creates state, preflight parses it', () => {
  const work = mkdtempSync(join(tmpdir(), 'pd-state-'));
  try {
    const initOut = execFileSync(NODE, [
      join(SKILLS_DIR, 'user-context', 'scripts', 'user-context-init.mjs'),
      '--state-dir', work,
    ], { encoding: 'utf8' });
    assert.ok(initOut.includes('user-context.md: created'));
    assert.ok(existsSync(join(work, 'user-context.md')));
    assert.ok(existsSync(join(work, 'assets')));

    // second init preserves the file
    const initAgain = execFileSync(NODE, [
      join(SKILLS_DIR, 'user-context', 'scripts', 'user-context-init.mjs'),
      '--state-dir', work,
    ], { encoding: 'utf8' });
    assert.ok(initAgain.includes('user-context.md: preserved'));

    const preflightOut = execFileSync(NODE, [
      join(SKILLS_DIR, 'user-context', 'scripts', 'user-context-preflight.mjs'),
      '--state-dir', work,
    ], { encoding: 'utf8' });
    const payload = JSON.parse(preflightOut);
    assert.equal(payload.plugin, 'product-design');
    assert.equal(payload.user_context.status, 'present');
    assert.equal(payload.user_context.entries.length, 0);
    assert.equal(payload.user_context.unresolved_categories.length, 8);

    // append a saved entry and confirm it parses
    const entry = [
      '',
      '# Product URLs',
      '',
      '## Saved Links And Context',
      '',
      '[Example App](https://example.com)',
      '- Date Added: 2026-07-21.',
      '- Useful Context: primary product surface',
      '- Future Use: grounding for audits and clones',
      '',
    ].join('\n');
    const current = readFileSync(join(work, 'user-context.md'), 'utf8');
    writeFileSync(join(work, 'user-context.md'), current.replace(/# Product URLs[\s\S]*?status: not provided/, entry.trim()));

    const second = JSON.parse(execFileSync(NODE, [
      join(SKILLS_DIR, 'user-context', 'scripts', 'user-context-preflight.mjs'),
      '--state-dir', work,
    ], { encoding: 'utf8' }));
    assert.equal(second.user_context.entries.length, 1);
    assert.equal(second.user_context.entries[0].url, 'https://example.com');
    assert.equal(second.user_context.entries[0].useful_context, 'primary product surface');
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test('preflight reports missing state cleanly', () => {
  const work = mkdtempSync(join(tmpdir(), 'pd-state-'));
  try {
    const out = execFileSync(NODE, [
      join(SKILLS_DIR, 'user-context', 'scripts', 'user-context-preflight.mjs'),
      '--state-dir', join(work, 'nope'),
    ], { encoding: 'utf8' });
    const payload = JSON.parse(out);
    assert.equal(payload.user_context.status, 'missing');
    assert.equal(payload.user_context.exists, false);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test('skills.mjs builds an isolated provider config', async () => {
  const { buildSkillsConfig, SKILL_PROVIDER_NAME, SKILLS_DIR } = await import('../skills.mjs');
  const config = buildSkillsConfig();
  assert.equal(config.providerName, SKILL_PROVIDER_NAME);
  assert.equal(config.providerName, 'product-design');
  assert.equal(config.includeDefaultRoots, false);
  assert.deepEqual(config.customSkillDirs, [SKILLS_DIR]);
  assert.ok(existsSync(SKILLS_DIR));
});

test('mountProductDesignSkills degrades to a warning without the provider package', async () => {
  const { mountProductDesignSkills } = await import('../skills.mjs');
  const warnings = [];
  let plugged = 0;
  const ctx = {
    logger: { warn: (message) => warnings.push(message) },
    plugin: () => { plugged += 1; },
  };
  await mountProductDesignSkills(ctx);
  // In the dev tree the peer dependency is not installed, so the dynamic
  // import fails and the mount must degrade to exactly one warning.
  assert.equal(plugged, 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /dsh-skill-filesystem unavailable/);
});

test('index.mjs apply provides productDesign and honors enabled:false', async () => {
  const mod = await import('../index.mjs');
  assert.equal(mod.name, 'product-design');
  assert.deepEqual(mod.inject, []);

  const provided = {};
  const ctx = {
    provide: (key, value) => { provided[key] = value; },
    logger: { info: () => {}, warn: () => {} },
    plugin: () => {},
  };
  mod.apply(ctx, {});
  assert.ok(provided.productDesign);
  assert.equal(provided.productDesign.enabled, true);
  assert.equal(typeof provided.productDesign.version, 'string');

  const disabled = {};
  mod.apply({
    provide: (key, value) => { disabled[key] = value; },
    logger: { info: () => {}, warn: () => {} },
    plugin: () => { throw new Error('must not mount when disabled'); },
  }, { enabled: false });
  assert.equal(disabled.productDesign.enabled, false);
});

test('package.json declares the dsh bundle patch and peer dependency', () => {
  const pkg = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'dsh-plugin-product-design');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.ok(pkg.peerDependencies['@deepseek-ai/dsh-skill-filesystem']);
  assert.ok(existsSync(join(PLUGIN_ROOT, 'cordis.patch.yml')));
});

test('templates bundle ships the prototype starter', () => {
  const templateRoot = join(PLUGIN_ROOT, 'templates', 'prototype');
  assert.ok(existsSync(join(templateRoot, 'package.json')));
  assert.ok(existsSync(join(templateRoot, 'vite.config.mjs')));
  assert.ok(existsSync(join(templateRoot, 'index.html')));
  assert.ok(existsSync(join(templateRoot, 'src', 'App.jsx')));
  const entries = readdirSync(join(PLUGIN_ROOT, 'templates'));
  assert.deepEqual(entries, ['prototype']);
});

/**
 * Skill mounting for dsh-plugin-product-design.
 *
 * Ships the ten Product Design skills (one `product-design` entry plus nine
 * `pd-*` sub-skills) inside the bundle by mounting an
 * ISOLATED @deepseek-ai/dsh-skill-filesystem provider that serves only this
 * plugin's own `skills/` directory (same pattern as the shipped
 * @openviking/dsh-memory-plugin and dsh-plugin-task-coordinator).
 *
 * The provider package is imported dynamically so that a missing skill
 * dependency can never break the bundle itself: failure degrades to a
 * warning and the plugin simply provides no skills.
 */

import { fileURLToPath } from 'node:url';

/** Provider name on `ctx.skills`; must not collide with DSH's own `filesystem`. */
export const SKILL_PROVIDER_NAME = 'product-design';

/** The bundled skills directory (ten skill bundles: one entry + nine `pd-*`). */
export const SKILLS_DIR = fileURLToPath(new URL('./skills', import.meta.url));

export function buildSkillsConfig() {
  return {
    providerName: SKILL_PROVIDER_NAME,
    includeDefaultRoots: false,
    customSkillDirs: [SKILLS_DIR],
  };
}

/**
 * Mount the isolated skill provider on the plugin context.
 * @param {object} ctx cordis context
 * @returns {Promise<void>}
 */
export async function mountProductDesignSkills(ctx) {
  let skillFilesystem;
  try {
    skillFilesystem = await import('@deepseek-ai/dsh-skill-filesystem');
  } catch (error) {
    ctx.logger?.warn(`product-design: skills not mounted, dsh-skill-filesystem unavailable (${error?.message ?? error})`);
    return;
  }
  try {
    ctx.plugin(skillFilesystem, buildSkillsConfig());
  } catch (error) {
    ctx.logger?.warn(`product-design: skill mount failed (${error?.message ?? error})`);
  }
}

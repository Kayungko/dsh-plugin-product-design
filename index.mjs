/**
 * dsh-plugin-product-design — entry point.
 *
 * A skill-only plugin: it registers no model tools, no slash commands and no
 * client modules. Its entire surface is the bundled `pd-*` skill suite,
 * mounted through an ISOLATED @deepseek-ai/dsh-skill-filesystem provider
 * (same proven pattern as dsh-plugin-task-coordinator's supervisor skill),
 * so the skills:
 *  - appear in every session's skill catalog with hot reload on edit;
 *  - never shadow or duplicate what DSH's default `filesystem` provider
 *    discovers under the project and user skill roots;
 *  - disappear together with the plugin on uninstall.
 *
 * The skill dependency is imported dynamically inside skills.mjs: a host
 * without @deepseek-ai/dsh-skill-filesystem degrades to a warning instead
 * of failing the bundle.
 */

import { mountProductDesignSkills } from './skills.mjs';

export const name = 'product-design';
export const inject = [];

export const VERSION = '0.1.0';

/**
 * @param {object} ctx cordis context
 * @param {{ enabled?: boolean }} [input]
 */
export function apply(ctx, input = {}) {
  const enabled = input?.enabled !== false;
  ctx.provide('productDesign', { version: VERSION, enabled });
  if (!enabled) {
    ctx.logger?.info('product-design: disabled by config; skills not mounted');
    return;
  }
  // Fire-and-forget by design: the skill mount degrades to a logged warning
  // on failure and can never take the bundle down with it.
  void mountProductDesignSkills(ctx);
}

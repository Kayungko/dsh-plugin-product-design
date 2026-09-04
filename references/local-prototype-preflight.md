# Local Prototype Preflight

Use this before creating a new local prototype.

- Keep the work self-contained in the new project folder.
- The bundled starter template lives in `../templates/` (relative to this file).
- Create the app with the bootstrap script. Resolve the script path relative to this file, then run it with an absolute path:

```bash
node /absolute/path/to/plugin-product-design/scripts/bootstrap-prototype.mjs --dest /absolute/path/to/new-prototype
```

- From the generated project root, run `npm install --prefer-offline --no-audit --no-fund`. Use the environment's configured npm cache.
- Do not replace the starter with static HTML because package install is slow. If install is genuinely blocked, report the blocker.
- Start the preview (`npm run dev`) as soon as dependencies are installed so the user can see progress while screens are built. Keep the preview alive through implementation and QA.
- The template uses ordinary Vite development. Do not hardcode `localhost` or any port in app code; use relative URLs and same-origin requests.
- After the dev server starts, hand the user the clickable local URL and ask them to open it in their browser; the DSH web GUI does not render the preview itself.
- When the task edits an existing prototype instead of creating a new one, follow [existing-codebase-edits](existing-codebase-edits.md) instead of this preflight.

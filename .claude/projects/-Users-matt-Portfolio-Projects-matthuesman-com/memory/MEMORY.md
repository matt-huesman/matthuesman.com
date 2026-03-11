# matthuesman.com Portfolio — Project Memory

## Stack
- SvelteKit 2 + Svelte 5 (using `$props()`, `$state()` — NOT Svelte 4 syntax)
- Tailwind CSS 4 + PostCSS (no DaisyUI, commented out)
- Static adapter → outputs to `build/`, deployed to GitHub Pages
- Base path: `/matthuesman.com` in prod, empty in dev
- Fonts: Roboto (body), Sedgwick Ave Display (particle text headers)
- Font Awesome for icons (loaded externally, e.g. `fa-circle-half-stroke`)

## Key Files
- `src/routes/+layout.svelte` — header + footer shell
- `src/routes/+page.svelte` — homepage (ParticleText + Terminal + sections)
- `src/routes/Header.svelte` — fixed nav bar, profile image, gradient logo
- `src/routes/HeaderItem.svelte` — nav link with animated underline
- `src/routes/Footer.svelte` — two-column links + copyright
- `src/routes/ParticleText.svelte` — canvas particle animation (main hero)
- `src/routes/Terminal.svelte` — interactive terminal emulator
- `src/routes/Banner.svelte` — alternate canvas banner (currently unused/commented out)
- `src/routes/CTA.svelte` — cycling gradient text words (not currently used in pages)
- `src/routes/Melt.svelte` — deprecated particle animation (unused)
- `src/routes/AboutMe.svelte` — empty placeholder
- `src/routes/me/+page.svelte` — About Me page (minimal: just a heading)
- `src/routes/404/+page.svelte` — 404 page with random messages
- `src/lib/main.js` — Emscripten/WASM glue code (65KB)
- `src/lib/images/profile.png` — profile photo

## Svelte 5 Conventions
- Use `$props()` for component props (NOT `export let`)
- Use `$state()` for reactive state
- Use `onclick`/`onkeydown` (NOT `on:click`/`on:keydown`)
- Use `{@render children()}` (NOT `<slot>`)
- Header.svelte and HeaderItem.svelte still use legacy `<slot>` / `export let` — these need updating

## Architecture Notes
- `me/main.js` is a 65KB duplicate of `src/lib/main.js` — both are the same WASM glue code
- WASM integration is partially implemented in Terminal.svelte (calls `_example_function()`)
- Dark mode toggle icon exists in layout but has no functionality yet
- `commandStack` in Terminal.svelte starts with `['']` (one empty string sentinel)

## Unfinished Areas (to work on)
1. **Dark mode toggle** — icon in header has no onclick handler; needs theme switching logic
2. **Me/About page** — only has a heading, needs full content (bio, skills, photo, etc.)
3. **Projects section** — empty grid on homepage; needs project cards
4. **Contact section** — referenced in footer links but no page/section exists
5. **Terminal commands** — only `clear` and `project` (redirects to `#`) implemented; `help` referenced in TODO but not done
6. **WASM integration** — `_example_function()` called but result unused; full stdin/stdout pipe planned
7. **Banner.svelte** — canvas animation scaffolded but has no drawing logic
8. **HeaderItem / Header** — still using Svelte 4 `export let` / `<slot>` syntax
9. **`me/main.js`** — duplicate WASM file; should be removed once me page imports from `$lib/main.js`

## Gradient Colors (brand)
Cyan → Purple → Orange: `rgb(6,182,212)` → `rgb(124,58,237)` → `rgb(249,115,22)`
CSS: `linear-gradient(135deg, rgb(6,182,212), rgb(124,58,237), rgb(249,115,22))`

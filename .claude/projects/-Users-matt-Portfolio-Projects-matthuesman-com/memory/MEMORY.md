# matthuesman.com Portfolio — Project Memory

## Stack
- SvelteKit 2 + Svelte 5 (`$props()`, `$state()`, `$derived()`, `$effect()`, `onclick`)
- Tailwind CSS 4 + PostCSS (no DaisyUI)
- Static adapter → outputs to `build/`, deployed to GitHub Pages
- Base path: `/matthuesman.com` in prod, empty in dev — ALWAYS use `{base}` from `$app/paths` for internal links
- Font Awesome 6.5.2 loaded from Cloudflare CDN in `app.html`
- Fonts: Roboto (body), Sedgwick Ave Display (ParticleText hero)

## Design System
- Page bg: `#030712`, Surface cards: `rgba(15,22,41,0.8)` + `backdrop-filter: blur(8px)`
- Border: `1px solid rgba(6,182,212,0.12)`, hover: `rgba(6,182,212,0.4)`
- Brand gradient: `linear-gradient(135deg, #06b6d4, #7c3aed, #f97316)` (cyan→purple→orange)
- CSS utilities in `app.css`: `.glass-card`, `.gradient-text`, `.gradient-divider`, `.reveal-hidden/.reveal-visible`
- Section padding pattern: `px-6 py-24` + `mx-auto max-w-6xl`

## Key Files
- `src/routes/+layout.svelte` — imports `base` from `$app/paths` for nav hrefs
- `src/routes/+page.svelte` — homepage: ParticleText + sections (About, Skills, Projects, Terminal, Experience, Contact)
- `src/routes/Header.svelte` — fixed nav, scroll-aware backdrop blur, mobile hamburger, Svelte 5
- `src/routes/HeaderItem.svelte` — nav link with gradient underline, Svelte 5 `$props()`
- `src/routes/Footer.svelte` — glassmorphism footer with gradient top border
- `src/routes/ParticleText.svelte` — canvas particle animation hero (do NOT touch; SSR guard: `typeof window !== 'undefined'` in onDestroy)
- `src/routes/Terminal.svelte` — filesystem terminal; wires to `$lib/terminal/commands.ts`; WASM swap point is commented
- `src/routes/SectionHeader.svelte` — `{ label, title, align? }` section titles
- `src/routes/SkillBadge.svelte` — `{ name, color, icon? }` colored left-border pill
- `src/routes/ProjectCard.svelte` — `{ project }` glass card with gradient top bar
- `src/routes/sections/About.svelte` — id="about", photo + bio + stat pills + CTAs
- `src/routes/sections/Skills.svelte` — id="skills", 4 skill groups
- `src/routes/sections/Projects.svelte` — id="projects", 3-col grid
- `src/routes/sections/Experience.svelte` — id="experience", vertical timeline
- `src/routes/sections/Contact.svelte` — id="contact", CTAs + social icons
- `src/routes/me/+page.svelte` — full About Me page (education, skills, bio narrative)
- `src/routes/projects/+page.svelte` — filterable all-projects page
- `src/routes/404/+page.svelte` — 404 page with random messages
- `src/lib/actions/reveal.ts` — IntersectionObserver scroll-reveal: `use:reveal={{ delay: N }}`
- `src/lib/terminal/filesystem.ts` — VFS tree (`VFS`, `getNode`, `resolvePath`)
- `src/lib/terminal/commands.ts` — pure `dispatch(input, state) → CommandResult`; WASM-ready
- `src/lib/data/projects.ts` — 6 placeholder `Project[]` objects
- `src/lib/data/skills.ts` — 4 `SkillGroup[]` with `SkillColor`
- `src/lib/main.js` — 65KB Emscripten/WASM glue (never touch)
- `src/lib/images/profile.png` — profile photo

## Terminal Commands
`help`, `pwd`, `ls`, `ls -la`, `cd`, `cat`, `whoami`, `echo`, `date`, `clear`, `neofetch` (easter egg), `sudo`, `vim`
VFS root: `/home/matt/` with `README.md`, `resume.txt`, `skills.txt`, `contact.txt`, `projects/` (6 subdirs)

## SSR Gotchas
- `onDestroy` DOES run during SSR — guard `window` references: `if (typeof window !== 'undefined')`
- `$effect` does NOT run during SSR — safe to use `window` inside effects
- Svelte actions (`use:`) do NOT run during SSR — safe
- `$derived(expr)` not `$derived(() => expr)` — use `$derived.by(() => expr)` for multi-line

## Unfinished Areas
1. **WASM/C backend** — Terminal `dispatch()` is pure TS; swap point commented in Terminal.svelte; C functions need Emscripten compilation
2. **Tab completion** — stubbed in Terminal.svelte keyboard handler (`case 'Tab'`)
3. **Resume link** — "View Resume" CTA links to `#` placeholder in Contact + me pages
4. **Real project content** — 6 placeholder projects need real GitHub URLs and descriptions
5. **Contact form** — currently just email + social; static site so needs external service (Formspree, etc.) if form needed

## Gradient Colors (brand)
Cyan → Purple → Orange: `#06b6d4` → `#7c3aed` → `#f97316`
CSS: `linear-gradient(135deg, #06b6d4, #7c3aed, #f97316)`

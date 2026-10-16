# Production audit and delivery

## Initial findings (before implementation)

The existing app is a static-export Next.js 16.4.2 App Router site, React 19.3.1 and TypeScript 6, styled with global CSS plus one 3D CSS module. Client state is local React state. Three.js/React Three Fiber/Drei provide an optional dynamically loaded washer scene. There are no API calls, authentication, forms, tables, charts, accounts or payment workflows. Company details are deliberately unconfigured.

The remote repository initially contains one README commit (59271a4); the local application has no Git metadata. Preserve the remote history when publishing the app.

| Priority | Finding | Affected files | Planned correction |
| --- | --- | --- | --- |
| High | Layered responsive overrides and width-sized gallery images can push captions below shorter viewports | brand.css, globals.css, Experience.tsx | Separate one final responsive layout policy, measure available space, preserve natural document flow |
| High | No route/global branded error fallback | app/ | Add current-version error boundaries with retry/reload actions |
| High | Mobile navigation opens with focus but lacks a complete focus loop and return handling | Experience.tsx | Trap Tab within menu/close button and restore focus on close |
| Medium | Scene fallback can leave decorative bubbles/playback looking active after failure | Experience.tsx | Propagate failure and disable scene-dependent effects |
| Medium | Upstream Fiber creates deprecated THREE.Clock; older WebGL logs include driver precision warnings | LaundryMachineScene.tsx, dependencies | Identify supported migration path; do not suppress console output or patch globals |
| Medium | Bubbles animate bottom, causing repeated layout work | brand.css | Use container-relative transform travel with the same navbar clearance |
| Medium | Scroll reveal assumes Web Animations support and retains completed animation objects | Experience.tsx | Feature-check and release completed animations |
| Medium | Gallery images total almost 2 MB and fonts are a live external stylesheet | images/, globals.css | Review asset/font delivery without altering original logos |
| Medium | Rejected visual previews and unreferenced original variants remain in public/design | public/, design/ | Keep only referenced shipping assets; preserve source/history outside public where useful |
| Low | Extremely compressed CSS and duplicate blank lines obscure maintenance | styles, Experience.tsx | Format and prune demonstrably unused rules without blind visual rewrites |

## Constraints

Keep the original About towel design, original banner logo, pearl/aqua/navy/gold palette, continuous washer loop and supplied photographs. Never hide important content merely to force a section into one screen. Desktop presentation should use the available viewport; mobile and zoomed pages must scroll naturally.

The browser automation surface was previously denied by URL policy; no alternative browser automation or screenshot workaround will be used. Browser/physical-device/Lighthouse results cannot be claimed. Code, exported HTML, HTTP assets, deterministic trajectory tests and numerical layout budgets can be checked.

This report will be updated with final results and remaining launch requirements.

## Final implementation

- Measured layout budgets: the hero subtracts its top/bottom bars and playback controls; gallery images subtract the actual heading, padding, grid gap and largest caption. Observer targets exclude the resized media to avoid measurement loops. Minimum sizes fall back to natural scrolling.
- A final responsive stylesheet governs the measured layout after legacy brand styles. Removed 231 selectors for retired designs and formatted both global stylesheets. Preserved the requested original About towel artwork, logo, palette and all business/service data.
- Mobile menu traps focus across its close button and links, closes with Escape, returns focus, and makes background content inert. Native dialog, keyboard gallery navigation, process-tab arrow navigation and visible focus remain.
- Scene failure disables dependent bubbles/playback. The scene pauses offscreen, in a hidden tab and on user pause. Reduced motion and unavailable WebGL retain the static fallback. Scroll reveals are feature-checked and release completed animations; decorative automatic captions no longer repeatedly announce to screen readers.
- Branded page/global error and 404 screens use the current Next 16.4 retry API, with no raw exception details in the interface. Exceptions remain visible in diagnostics rather than being swallowed.
- The original washer loop, closed-door wash-only bubbles and repaired garment paths remain covered by deterministic tests. Bubbles now travel using container-relative transforms, retaining their navbar safety zone.
- Three.js/types are exactly pinned to 0.182.0, within installed Fiber/Drei peer requirements. Fiber still constructs Clock; Three deprecates it starting with r183. No console filtering, global monkey-patching or node_modules patch is used. Revisit the pin when Fiber migrates to Timer. Source: https://threejs.org/docs/pages/Clock.html .
- Gallery PNGs converted losslessly to WebP: 1,949,827 to 1,022,500 bytes (about 48% smaller), with identical decoded pixels. Original versions are retained locally outside the public website. DM Sans WOFF2 and its OFL licence are self-hosted; unused external font imports removed.
- Removed redundant ambient CSS declaration and retired art assets from shipping paths. Historical sources/previews are locally preserved in ignored `.local-design-history/`, not deleted from the user's workspace.
- CI installs from the lockfile, runs ordered quality checks and audits production dependencies. A dependency-free static preview replaces a first-run npx download. GitHub's existing README commit is preserved as the parent history.

## Validation results

| Check | Result |
| --- | --- |
| ESLint | Passed; no disabled rules added |
| Production Webpack/static export | Passed; eight generated pages/routes/assets |
| TypeScript | Passed after production build |
| Garment/timeline/bubble tests | Passed; closed-door emission, opening/cabinet clearance, separated hanger slots, smooth trajectories, loop |
| Numerical layout budgets | 144 cases passed; includes insufficient-space fallback |
| Export structure | 25 section links and 20 referenced local assets passed; one main heading, original logo placement, two gallery cards, favicon, local font files and branded 404 |
| Production HTTP | Root and 22 HTML/CSS/font/image assets return 200; unknown path uses branded 404; unsupported method returns 405 |
| npm audit --omit=dev | Zero reported vulnerabilities at audit time |
| CI workflow syntax | YAML parsed; action revisions pinned |
| Browser console / screenshots / physical devices / Lighthouse | Not verified: existing browser URL-policy restriction; no workaround attempted |

The first build attempt compiled but the type-check worker exhausted host memory while a live dev server was also running. Retried successfully with the project's dev server stopped, a 2GB Node heap for the local command, and Next's supported two-worker/memory-aware build settings. These settings are retained for reproducibility; experimental-setting notices are build configuration notices, not application console errors.

## Responsive review checklist

These are **code and layout-budget review results**, not screenshots or browser test claims.

| Target | Reviewed behaviour | Browser confirmation |
| --- | --- | --- |
| 320–480px mobile | Single-column services/gallery, wrapped CTAs, bounded logo, 44px controls, stacked About/contact; no fixed-height content clipping | Pending |
| 481–767px large mobile | Mobile layout through 680px; two gallery columns above that with measured media height | Pending |
| 768–1024px tablet | Collapsible nav through 850px, stacked About/contact, measured gallery and readable process tabs | Pending |
| 1025–1440px laptop | Measured hero/gallery, process uses available height; collections scroll naturally when longer | Pending |
| 1441–1920px desktop | Maximum content widths, bounded media heights and original branding | Pending |
| Above 1920px | 1440px content caps and flexible page gutters | Pending |
| Short windows / enlarged text | Minimum media sizes retain natural page/dialog scrolling instead of hiding text | Pending |
| Reduced motion / WebGL unavailable | Static fallback, no bubble/reveal/tilt motion | Pending runtime confirmation |

A section with many cards cannot always fit on a short screen at readable sizes. The implementation never hides important content or constrains a long section to a clipping height to claim a one-screen fit.

## Remaining launch requirements and limits

1. The owner must supply verified phone/WhatsApp/email/address/hours/service locations/maps URL and production domain in `src/config/company.ts`, and confirm the proposed services/process. Sitemap/canonical URLs need the real domain.
2. Gallery photos are supplied references, not verified photos of this business. The owner should confirm their use and replace with company photography where appropriate.
3. The original About composition intentionally uses layered decorative art; its core layout is preserved because the user explicitly requested restoration. It still needs visual approval on real devices.
4. Device-specific WebGL shader/compiler messages and the previous refresh-only removeChild report cannot be certified absent without browser execution. A clean production HTTP response/build is not a console audit.
5. Test screen sizes, keyboard menu/dialog behaviour, font loading and 200% zoom in actual browsers before launch. CI is not a substitute for visual QA.
6. Three 0.182 compatibility should be reviewed when Fiber's upstream clock implementation changes.
7. Publishing source to GitHub does not configure public hosting or a custom domain. `out/` is the static deployable build.

## Commands

```sh
npm ci
npm run dev        # development at localhost:3001
npm run lint
npm run build      # export to out/
npm run typecheck  # after build
npm test
npm run check      # full ordered validation
npm run preview    # production preview; stop dev first
npm run icons      # regenerate original SS crest icons
```

## Delivered files

The remote repository originally contained only README.md. The following application, configuration, asset and documentation files are added/updated in this delivery:

- `README.md`
- `.gitattributes`
- `.github/workflows/ci.yml`
- `.gitignore`
- `.nvmrc`
- `AGENTS.md`
- `ASSET-SOURCES.md`
- `AUDIT-AND-VALIDATION.md`
- `BRAND-AND-IMPLEMENTATION.md`
- `design/favicon-brand-preview.png`
- `design/marble-asset.md`
- `eslint.config.mjs`
- `next-env.d.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `public/fonts/OFL.txt`
- `public/fonts/dm-sans-latin-ext.woff2`
- `public/fonts/dm-sans-latin.woff2`
- `public/images/brand-banner.jpeg`
- `public/images/brand-marble-v2.webp`
- `public/images/gallery-fresh-folds.webp`
- `public/images/gallery-linen-care.webp`
- `scripts/generate-brand-icons.mjs`
- `scripts/preview.mjs`
- `scripts/verify-cycle.mjs`
- `scripts/verify-export.mjs`
- `scripts/verify-layout.mjs`
- `src/app/apple-icon.png`
- `src/app/brand.css`
- `src/app/error.tsx`
- `src/app/favicon.ico`
- `src/app/fonts.css`
- `src/app/global-error.tsx`
- `src/app/globals.css`
- `src/app/icon.svg`
- `src/app/layout.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/app/responsive.css`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/CareDisplay.tsx`
- `src/components/Experience.tsx`
- `src/components/LaundryMachineScene.tsx`
- `src/components/LaundryShowcase.module.css`
- `src/components/WashBubbles.tsx`
- `src/components/errors/ErrorScreen.module.css`
- `src/components/errors/ErrorScreen.tsx`
- `src/config/company.ts`
- `src/hooks/useViewportLayout.ts`
- `src/instrumentation-client.ts`
- `src/lib/laundry-cycle.mjs`
- `src/lib/layout-metrics.mjs`
- `tsconfig.json`

# Shree Sudhya Laundry Services

A Next.js informational website using the original pearl, navy, aqua and gold brand. Includes a continuous optional 3D laundry cycle, wash-synchronised bubbles, the original About towel artwork, service cards, keyboard-operable process tabs, a photography gallery/lightbox and owner-configurable contact information. No booking, authentication, payment or dashboard features are implied.

## Run locally

Node.js 20.19+ is supported; Node 22 is used in CI.

```sh
npm ci
npm run dev
```

Open http://localhost:3001.

## Validate and build

```sh
npm run lint
npm run build
npm run typecheck
npm test
```

On memory-constrained machines, stop the dev server before building. The project caps build workers at two.

Or run `npm run check` for the full ordered sequence. Run TypeScript after the build, because Next regenerates its type files. `npm test` includes deterministic garment/bubble tests, numerical viewport-budget tests and checks of the built export. These do not substitute for browser/device testing.

The production static site is exported to `out/`. `npm run preview` serves it on port 3001; stop the dev server first. Publish `out/` to a static host. GitHub code publication and website deployment are separate; no hosting credentials or domain are embedded.

## Responsive layout

The sticky header is measured with ResizeObserver. Hero and gallery media use the remaining viewport height after their actual text and controls are measured. Short screens, mobile and enlarged text use normal document scrolling rather than clipping or hiding information. Reduced-motion and unavailable WebGL use a static fallback. Native section anchors, keyboard focus, mobile focus trapping and the dialog's Escape/arrow navigation are retained.

## Dependency compatibility

Three.js is pinned to 0.182.0 with matching types while Fiber 9.8.2 still constructs Clock internally. This is within Fiber/Drei's peer ranges and avoids the r183+ Clock deprecation without console filtering or monkey-patching. Revisit this pin when Fiber supports Timer. The lockfile is authoritative; use `npm ci`.

## Before public launch

Populate verified phone, WhatsApp, email, address, hours, service locations, maps URL and production domain in `src/config/company.ts`. Confirm the proposed service collection and process. The supplied gallery images are reference photographs. No contact details, prices, customer reviews or business statistics were fabricated.

See [AUDIT-AND-VALIDATION.md](AUDIT-AND-VALIDATION.md) for findings, changes and honest validation limits; [BRAND-AND-IMPLEMENTATION.md](BRAND-AND-IMPLEMENTATION.md) for design/architecture; and [ASSET-SOURCES.md](ASSET-SOURCES.md) for provenance.

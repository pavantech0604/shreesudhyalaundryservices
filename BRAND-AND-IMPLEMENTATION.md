# Brand and implementation

## Brand

The original banner is used only in the navbar and footer. Its SS crest is also the favicon. No duplicate wordmark is placed beside the logo. Sampled background regions are #FAF9F7 (pearl light), #F6F5F1 and #F6F4F0 (warm pearl); the shared base is #F8F7F4. Navy #072B4B, aqua #1393D0 and gold #BD8C35 provide restrained contrast. The original About towel/ribbon/shirt composition is preserved as requested.

The logo is a JPEG with an opaque, subtly variable marble background, not vector paths or transparency. Edge masking blends its outer edge without multiplying/darkening its background. The active marble texture is a generated material reference, not an exact extraction.

## Architecture

- App Router `/` composes the informational sections through `Experience.tsx`. Robots/sitemap and metadata are static-export friendly.
- `LaundryMachineScene.tsx` is dynamically imported and provides the hinged washer, drum, garment paths, hanging rail, folded reveal, lighting and local environment. No network HDR is required.
- `laundry-cycle.mjs` is the shared 29-second deterministic timeline and garment motion model. Bubbles emit only during the running closed-door wash phase.
- `useViewportLayout.ts` measures stable header/title/caption/control elements. `layout-metrics.mjs` computes media budgets, preserving minimum media size with natural scrolling when space is insufficient.
- `responsive.css` is the final authoritative responsive layer, following base globals and brand styles. Retired illustration selectors have been pruned from the legacy layers.
- Native dialog and process tabs preserve keyboard interaction. Mobile navigation loops focus and restores it on close.
- Error, global-error and not-found screens provide branded recovery. Scene failure falls back independently and stops dependent decorative effects.

## Motion and performance

The scene caps pixel ratio at 1.5, pauses offscreen/hidden/when requested, and falls back for reduced motion or unavailable WebGL. Frame time is clamped to prevent jumps after a suspended tab. Garments align with the opening before entering; they clear the cabinet before traversing to separated hanger slots. These are stylised meshes, not physical cloth/fluid simulation.

Bubbles use container-relative transform travel and fade below the measured navbar safety zone. Scroll reveals feature-check Web Animations, release completed animations and honour reduced motion. Gallery photos are lossless WebP and fonts are local WOFF2. Original screenshots and rejected designs are not shipped as public assets.

## Launch and validation

See AUDIT-AND-VALIDATION.md for exact checks and limitations. Browser policy prevented new visual/runtime automation; no complete console-clean, physical-device, Lighthouse or screenshot certification is claimed. Driver-specific WebGL messages still require device testing. Business contact details and domain remain owner inputs. `out/` is the deployable static artifact; source code publication alone does not deploy a website.

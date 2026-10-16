# Asset sources

- `public/images/brand-banner.jpeg`: original Shree Sudhya banner supplied by the owner. Navbar/footer use the original artwork.
- `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`: viewport extraction of the original SS crest, generated reproducibly by `npm run icons`; the SVG embeds original JPEG pixels and is not a vector tracing.
- `public/images/gallery-linen-care.webp` and `gallery-fresh-folds.webp`: user-supplied reference photographs, losslessly converted from PNG. Decoded pixel equality was checked. These are not represented as verified company facilities.
- `public/images/brand-marble-v2.webp`: generated logo-inspired material texture; generation details are in `design/marble-asset.md`.
- `public/fonts/dm-sans-*.woff2`: DM Sans variable fonts from Google Fonts, self-hosted under the SIL Open Font License in `public/fonts/OFL.txt`. Original project: https://github.com/google/fonts/tree/main/ofl/dmsans .
- `lucide-react`: installed icon library, ISC licence; see its package metadata.

Historical sources and rejected preview images are preserved locally in the ignored `.local-design-history/` folder instead of being shipped as unused website assets. The current shipping WebP photographs preserve all original decoded pixels.

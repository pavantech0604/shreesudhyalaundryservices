import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('out');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const references = [...html.matchAll(/<(?:a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)].map(match => match[1]);
let anchors = 0;
const assets = new Set();
for (const ref of references) {
  if (ref.startsWith('#')) {
    assert(ids.has(ref.slice(1)), `Broken section link: ${ref}`);
    anchors++;
  } else if (ref.startsWith('/')) {
    const pathname = new URL(ref, 'https://local.test').pathname;
    if (pathname === '/') continue;
    const target = path.join(root, decodeURIComponent(pathname));
    await access(target);
    assets.add(pathname);
  } else if (ref.startsWith('tel:') || ref.startsWith('mailto:')) {
    assert(ref.split(':')[1].trim(), `Empty contact link: ${ref}`);
  }
}
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'The page must have one primary heading');
assert(html.includes('lang="en"'), 'Missing document language');
assert(html.includes('Supplied reference photographs'), 'Gallery must disclose supplied reference photography');
assert.equal((html.match(/class="gallery-photo"/g) || []).length, 2, 'Both supplied photographs must appear in the gallery');
const logoImages = [...html.matchAll(/<img\b[^>]*src="\/images\/brand-banner.jpeg"/g)];
assert.equal(logoImages.length, 2, 'The original logo belongs only in the navbar and footer');
assert(!/<img\b[^>]*src="\/images\/brand-seal.jpeg"/.test(html), 'Decorative logo repetition must stay removed');
await access(path.join(root, 'images/brand-marble-v2.webp'));
for (const route of ['favicon.ico', 'icon.svg', '404.html', 'robots.txt', 'sitemap.xml', 'images/brand-banner.jpeg']) await access(path.join(root, route));
const favicon = await readFile(path.join(root, 'favicon.ico'));
assert.equal(favicon.readUInt16LE(2), 1, 'Favicon must be an ICO image');
assert.equal(favicon.readUInt16LE(4), 4, 'Favicon must contain four browser sizes');
assert(/rel="icon"[^>]*href="\/favicon.ico/.test(html), 'Missing favicon metadata');
for (const font of ['dm-sans-latin.woff2', 'dm-sans-latin-ext.woff2', 'OFL.txt']) await access(path.join(root, 'fonts', font));
assert(!html.includes('fonts.googleapis.com'), 'Fonts must be self-hosted');
const notFound = await readFile(path.join(root, '404.html'), 'utf8');
assert(notFound.includes('Page not found.'), '404 must use the branded fallback');
console.log(`PASS: ${anchors} section links, ${assets.size} local assets, semantic heading, photography disclosure and exported routes.`);

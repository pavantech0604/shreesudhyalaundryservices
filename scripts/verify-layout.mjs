import assert from 'node:assert/strict';
import { mediaBudget } from '../src/lib/layout-metrics.mjs';
import { Clock, REVISION } from 'three';

// These are numerical layout-budget tests, not browser/screenshot tests.
for (const viewport of [320, 480, 540, 600, 720, 768, 900, 1080, 1440]) {
  for (const header of [77, 88, 100, 120]) {
    for (const chrome of [160, 220, 300, 420]) {
      const result = mediaBudget({ viewport, header, chrome, minimum: 140, maximum: 420 });
      assert(result.height >= 140 && result.height <= 420);
      if (!result.requiresScroll) assert(result.height + header + chrome <= viewport);
      else assert.equal(result.height, 140, 'Tight screens retain natural scrolling, not clipped content');
    }
  }
}
assert.deepEqual(mediaBudget({viewport: 600, header: 88, chrome: 220, minimum: 140, maximum: 420}), {height: 292, requiresScroll: false});
assert.deepEqual(mediaBudget({viewport: 300, header: 88, chrome: 220, minimum: 140, maximum: 420}), {height: 140, requiresScroll: true});
assert.equal(mediaBudget({viewport: NaN, header: Infinity, chrome: -1, minimum: 140, maximum: 420}).height, 140);
assert.equal(REVISION, '182', 'Keep the supported Fiber/Three clock compatibility pin explicit');
const clock = new Clock();
clock.start();
assert(Number.isFinite(clock.getDelta()));
clock.stop();
console.log('PASS: 144 numerical viewport budgets, safe overflow fallback and supported Three clock.');

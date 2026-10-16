import assert from 'node:assert/strict';
import { sampleCycle, loadingProgress, unloadingProgress, cycleDuration, loadingPose, hangingPose, hangingSlots } from '../src/lib/laundry-cycle.mjs';
assert.equal(sampleCycle(0).stage, 'loading');
assert.equal(sampleCycle(7).stage, 'washing');
assert.equal(sampleCycle(16).stage, 'drying');
assert.equal(sampleCycle(25).stage, 'ready');
for (let t = 6; t < 20; t += .1) assert.equal(sampleCycle(t).door, 0, 'Door must remain shut while washing or drying');
for (let garment = 0; garment < 3; garment++) {
  assert.equal(loadingProgress(1.5, garment), 0, 'Garments wait for the door to open');
  assert.equal(loadingProgress(4.8, garment), 1, 'All garments must be inside before closing');
  assert.equal(unloadingProgress(21, garment), 0, 'Garments wait for the second opening');
  assert.equal(unloadingProgress(23.9, garment), 1, 'Garments finish unloading before the reveal');
}
assert.deepEqual(sampleCycle(0), sampleCycle(cycleDuration));
assert.equal(sampleCycle(24.5).folded, 1);
assert.equal(sampleCycle(14).washing, false, 'The stronger wash-bubble effect stops at the drying phase');
assert.equal(sampleCycle(6).drumSpeed, 0, 'The wash drum starts from rest');
assert(sampleCycle(6.4).drumSpeed > 0 && sampleCycle(6.4).drumSpeed < sampleCycle(7).drumSpeed, 'Wash speed builds gradually');
assert(sampleCycle(13.7).drumSpeed < sampleCycle(13).drumSpeed, 'Wash drum slows before drying');
assert.equal(sampleCycle(14).drumSpeed, 0);
assert(sampleCycle(14.4).drumSpeed < sampleCycle(15).drumSpeed, 'Drying speed builds gradually');
assert.equal(sampleCycle(20).drumSpeed, 0, 'The drum stops before opening');
console.log('PASS: stage boundaries, garment clearance, closed wash/dry door, smooth drum speed, folded reveal and loop continuity.');

for (let t = 0; t < cycleDuration; t += .05) {
  const frame = sampleCycle(t);
  if (frame.bubbles) {
    assert.equal(frame.door, 0, 'Bubbles require a fully closed door');
    assert(frame.washing && frame.drumSpeed > 0, 'Bubbles require an active wash drum');
  }
}
assert.equal(sampleCycle(6).bubbles, false);
assert.equal(sampleCycle(7).bubbles, true);
assert.equal(sampleCycle(14).bubbles, false);
assert.equal(sampleCycle(25).bubbles, false);
console.log('PASS: bubble emission only during the closed-door running wash phase.');

for (let garment = 0; garment < 3; garment++) {
  assert.equal(loadingPose(1.6 + garment * .55, garment).visible, false, 'No piled-up waiting shirts');
  const hung = hangingPose(24.5, garment);
  assert.equal(hung.x, hangingSlots[garment], 'Garment aligns with its hanger');
  assert(Math.abs(hung.y - .74) < 1e-9 && Math.abs(hung.z - .27) < 1e-9, 'Garment rests on the rail plane');
  assert.equal(hung.scale, .58);
  let previous;
  for (let t = 1.7 + garment * .55; t < 4.51; t += .005) {
    const pose = loadingPose(t, garment);
    if (!pose.visible) continue;
    if (pose.z <= 1.2) assert(Math.hypot(pose.x, pose.y + .15) + .37 * pose.scale < .72, 'Loading clears the circular opening');
    if (previous) assert(Math.hypot(pose.x-previous.x,pose.y-previous.y,pose.z-previous.z) < .08, 'No loading position jumps');
    previous = pose;
  }
  previous = undefined;
  for (let t = 21.5 + garment * .3; t < 25; t += .005) {
    const pose = hangingPose(t, garment);
    if (pose.x > .5 && pose.x < 1.5) assert(pose.z > 1.3, 'Garment crosses in front of the cabinet');
    if (previous) assert(Math.hypot(pose.x-previous.x,pose.y-previous.y,pose.z-previous.z) < .1, 'No unloading position jumps');
    previous = pose;
  }
}
assert(.72 * .58 < hangingSlots[1] - hangingSlots[0], 'Hanging garments must not overlap');
console.log('PASS: smooth garment paths, opening/cabinet clearance and separated hanger alignment.');

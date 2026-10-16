/** @typedef {'loading' | 'washing' | 'drying' | 'ready'} LaundryStage */
/** @type {readonly LaundryStage[]} */
export const laundryStages = ['loading', 'washing', 'drying', 'ready'];
export const stageStarts = [0, 6, 14, 23];
export const cycleDuration = 29;
const ease = value => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };

/** One deterministic timeline shared by the door, garments, drum and effects.
 * @param {number} seconds
 */
export function sampleCycle(seconds) {
  const t = ((seconds % cycleDuration) + cycleDuration) % cycleDuration;
  const index = t < 6 ? 0 : t < 14 ? 1 : t < 23 ? 2 : 3;
  let door = 0;
  if (t < 1.5) door = ease(t / 1.5);
  else if (t < 4.8) door = 1;
  else if (t < 6) door = 1 - ease((t - 4.8) / 1.2);
  else if (t >= 20 && t < 21.5) door = ease((t - 20) / 1.5);
  else if (t >= 21.5 && t < 26.5) door = 1;
  else if (t >= 26.5) door = 1 - ease((t - 26.5) / 2);
  return {
    t, index, stage: laundryStages[index], door,
    washing: t >= 6 && t < 14,
    bubbles: t >= 6.35 && t < 13.8,
    drying: t >= 14 && t < 20,
    unloading: t >= 21.5 && t < 24,
    folded: ease((t - 23) / 1.5),
    drumSpeed: t >= 6 && t < 14 ? 3.6 * ease((t - 6) / .8) * ease((14 - t) / .8) : t >= 14 && t < 20 ? 1.8 * ease((t - 14) / .8) * ease((20 - t) / .8) : 0,
  };
}

/** @param {number} t @param {number} garment */
export function loadingProgress(t, garment) { return ease((t - 1.7 - garment * .55) / 1.7); }
/** @param {number} t @param {number} garment */
export function unloadingProgress(t, garment) { return ease((t - 21.5 - garment * .3) / 1.1); }

/** Fixed spacing keeps the shirt shoulders separate on the rail. */
export const hangingSlots = [1.68, 2.16, 2.64];
/** @param {number} t @param {number} garment */
export function loadingPose(t, garment) {
  const start = 1.7 + garment * .55;
  const p = loadingProgress(t, garment);
  const align = ease(p / .42), insert = ease((p - .42) / .58);
  return {
    visible: t >= start && t < start + 1.7,
    x: 2.05 * (1 - align), y: -.15 + .35 * (1 - align),
    z: 1.7 - 1.25 * insert,
    tilt: .12 * (1 - align),
    scale: .76 * ease(p / .12) * (1 - .55 * ease((p - .85) / .15)),
  };
}
/** @param {number} t @param {number} garment */
export function hangingPose(t, garment) {
  const start = 21.5 + garment * .3;
  const p = unloadingProgress(t, garment);
  // Exit along the drum axis first. Cross in front of the cabinet, then settle back.
  const exit = ease(p / .3), travel = ease((p - .3) / .4), settle = ease((p - .72) / .28);
  const reveal = ease(p / .1), finish = 1 - ease((t - 25) / .65);
  const scale = .58 * reveal * finish;
  return {
    visible: t >= start && t < 25.65,
    x: hangingSlots[garment] * travel,
    y: -.15 + .89 * travel + .12 * Math.sin(Math.PI * travel) + .28 * (.58 - scale) * travel,
    z: .45 + 1.25 * exit - 1.43 * settle,
    scale,
    swing: Math.sin((t - start) * 4) * .035 * (1 - p),
  };
}

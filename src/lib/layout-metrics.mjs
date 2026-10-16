/** Calculate a natural-flow media budget without hiding content below its minimum size.
 * @param {{ viewport: number, header: number, chrome: number, minimum: number, maximum: number }} input
 */
export function mediaBudget({ viewport, header, chrome, minimum, maximum }) {
  const safe = value => Number.isFinite(value) ? Math.max(0, value) : 0;
  const min = safe(minimum), max = Math.max(min, safe(maximum));
  const available = Math.max(0, safe(viewport) - safe(header));
  const remaining = Math.max(0, available - safe(chrome));
  return { height: Math.max(min, Math.min(max, remaining)), requiresScroll: remaining < min };
}

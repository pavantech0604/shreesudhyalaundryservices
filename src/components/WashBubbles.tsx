'use client';
import type { CSSProperties } from 'react';

/** Particles stay inside the scene or outer gutters, clear of readable content. */
export default function WashBubbles({ active, intense, placement = 'scene' }: { active: boolean; intense: boolean; placement?: 'scene' | 'edges' }) {
  const edges = placement === 'edges';
  return <div className="wash-bubble-layer" data-placement={placement} data-active={active} data-intense={intense} aria-hidden="true">{Array.from({ length: edges ? 4 : 10 }, (_, i) => <span key={i} className="rising-wash-bubble" style={{ '--bubble-left': edges ? (i % 2 ? 'calc(100% - 24px)' : '-6px') : `${(i * 37 + 7) % 92}%`, '--bubble-size': `${edges ? 26 + i % 3 * 5 : 26 + i % 4 * 9}px`, '--bubble-duration': `${6 + i % 4 * .65}s`, '--bubble-delay': `${(edges ? .4 : 0) + i % 5 * .18}s`, '--bubble-drift': `${(i % 2 ? 1 : -1) * (edges ? 6 : 16)}px` } as CSSProperties} />)}</div>;
}

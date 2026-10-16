'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Leaf, Shirt, Sparkles, Waves } from 'lucide-react';

export function SoapBubbles({ staticOnly = false }: { staticOnly?: boolean }) {
  const [popped, setPopped] = useState<number[]>([]);
  useEffect(() => {
    if (!popped.length) return;
    const timeout = setTimeout(() => setPopped([]), 700);
    return () => clearTimeout(timeout);
  }, [popped]);
  return <div className="soap-garden" aria-label={staticOnly ? undefined : 'Interactive soap bubbles'} aria-hidden={staticOnly || undefined}>
    {[0, 1, 2, 3, 4, 5].map(i => staticOnly ? <span className={`soap-bubble bubble-${i}`} key={i} /> : <button type="button" className={`soap-bubble bubble-${i} ${popped.includes(i) ? 'bubble-popped' : ''}`} key={i} aria-label={`Pop soap bubble ${i + 1}`} onClick={() => setPopped(values => [...new Set([...values, i])])} onAnimationEnd={event => { if (event.animationName === 'soap-pop') setPopped(values => values.filter(value => value !== i)); }}><span /></button>)}
  </div>;
}

export default function CareDisplay() {
  return <div className="care-display">
    <div className="care-aura" /><SoapBubbles />
    <span className="care-overline">THE FEELING OF FRESH</span>
    <div className="care-sculpture" aria-hidden="true"><div className="care-plinth" /><div className="care-towels"><i /><i /><i /><div className="care-ribbon" /><Leaf className="care-leaf" strokeWidth={.8} /></div><div className="care-hanging-shirt"><Shirt strokeWidth={.9} /></div><span className="care-spark">✦</span></div>
    <div className="care-label"><Sparkles size={17} /><span>Softness you feel.<strong>Freshness you love.</strong></span></div>
    <a href="#home" className="care-watch">Watch the care unfold <ArrowUpRight size={16} /></a>
  </div>;
}

export function LaundryDiorama({ step }: { step: number }) {
  return <div className={`laundry-diorama diorama-step-${step}`} aria-hidden="true">
    <span className="diorama-orbit" /><span className="diorama-bubble db-one" /><span className="diorama-bubble db-two" />
    <div className="diorama-basket"><i /><i /><i /></div>
    <div className="diorama-garment"><Shirt strokeWidth={1.1} /></div>
    <div className="diorama-machine"><span /><div className="diorama-door"><Waves strokeWidth={1.3} /></div></div>
    <div className="diorama-folds"><i /><i /><i /></div><div className="diorama-road" />
  </div>;
}

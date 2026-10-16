'use client';

// @refresh reset

import dynamic from 'next/dynamic';

import { Component, useEffect, useRef, useState, type ReactNode, type ErrorInfo } from 'react';

import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Leaf, Menu, Pause, Play, Shirt, Sparkles, Truck, Waves, Wind, X, Phone, Mail, MapPin, Clock, PackageCheck } from 'lucide-react';

import { company, services } from '@/config/company';
import { useViewportLayout } from '@/hooks/useViewportLayout';

import type { CareStage } from './LaundryMachineScene';

import CareDisplay, { LaundryDiorama, SoapBubbles } from './CareDisplay';

import WashBubbles from './WashBubbles';

import showcase from './LaundryShowcase.module.css';

const Scene = dynamic(() => import('./LaundryMachineScene'), { ssr: false, loading: () => <SceneFallback label="Preparing your fabric-care experience…" /> });

const nav = [['About us', 'about'], ['Our services', 'services'], ['The process', 'process'], ['Gallery', 'gallery']] as const;

const icons = { wash: Waves, shirt: Shirt, sparkle: Sparkles, wind: Wind, leaf: Leaf, truck: Truck };

const stageLabels: Record<CareStage, string> = { loading: 'Thoughtful care starts here', washing: 'A fresh clean, down to every fibre', drying: 'Warm air. Soft, beautifully dry fabrics.', ready: 'Freshness in every fold' };

const journey = [

  { title: 'Let’s arrange a pickup', text: 'Contact our team to discuss your laundry needs and collection availability.', icon: Phone },

  { title: 'A thoughtful collection', text: 'Your garments begin their journey with a careful collection and fabric review.', icon: Truck },

  { title: 'A fresh transformation', text: 'A considered wash, matched to each garment’s care requirements.', icon: Waves },

  { title: 'Dried with care', text: 'A hygienic drying stage prepares your clothes for a beautiful finish.', icon: Wind },

  { title: 'The finishing touch', text: 'Careful ironing and neat folding bring everything together.', icon: Shirt },

  { title: 'Back where they belong', text: 'Fresh, neatly packed garments make their way back to your wardrobe.', icon: PackageCheck },

];

const gallery = [

  { title: 'Care in every fold', category: 'Linen care', src: '/images/gallery-linen-care.webp', alt: 'Fresh white linens being folded beside front-loading laundry machines', description: 'Thoughtful handling. A beautifully neat finish.' },

  { title: 'Freshness, ready to wear', category: 'Everyday favourites', src: '/images/gallery-fresh-folds.webp', alt: 'A neatly folded stack of soft neutral and aqua garments held by a person in a pale blue shirt', description: 'Soft textures, fresh layers and your favourites, beautifully together.' },

];

function SceneFallback({ label = 'Explore our signature care' }: { label?: string }) { return <div className="scene-fallback"><div className="fallback-laundry"><GalleryArt /><SoapBubbles staticOnly /></div><span>{label}</span></div>; }

class SceneBoundary extends Component<{children: ReactNode; onFailure: () => void}, {failed: boolean}> {

  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {

    console.error('[Laundry scene error]', error.stack ?? error.message, info.componentStack);
    this.props.onFailure();

  }

  render() { return this.state.failed ? <SceneFallback label="Premium care, with or without 3D" /> : this.props.children; }

}

function GalleryArt() {
  return <div className="gallery-art art-wash" aria-hidden="true"><div className="art-washer"><div className="art-panel"><i /><b>SS</b></div><div className="art-drum"><Waves /></div></div><span className="art-sparkle">✧</span></div>;
}

export default function Experience() {

  const [menu, setMenu] = useState(false);

  const [active, setActive] = useState('home');

  const [stage, setStage] = useState<CareStage>('loading');
  const [washingBubbles, setWashingBubbles] = useState(false);

  const [paused, setPaused] = useState(false);

  const [visible, setVisible] = useState(true);

  const [reduced, setReduced] = useState(true);

  const [webgl, setWebgl] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const [step, setStep] = useState(0);

  const [selected, setSelected] = useState<number | null>(null);

  const sceneRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef<HTMLDivElement>(null);

  const dialog = useRef<HTMLDialogElement>(null);

  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {

    const media = matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReduced(media.matches);

    update(); media.addEventListener('change', update);

    const canvas = document.createElement('canvas');

    try { const context = canvas.getContext('webgl2') || canvas.getContext('webgl'); setWebgl(Boolean(context)); context?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { setWebgl(false); }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });

    if (sceneRef.current) observer.observe(sceneRef.current);

    return () => { media.removeEventListener('change', update); observer.disconnect(); };

  }, []);

  useViewportLayout();
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {

    if (reduced || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

    const animations = new Set<Animation>();

    const targets = [...document.querySelectorAll<HTMLElement>('.values-strip>div, .section-top, .service-card, .about-art, .about-copy, .journey-tabs, .journey-panel, .gallery-card, .contact-copy, .contact-card, .footer-top')];

    const observer = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const element = entry.target as HTMLElement;

        observer.unobserve(element);

        const siblings = element.parentElement ? [...element.parentElement.children] : [];

        const stagger = element.matches('.service-card, .gallery-card, .values-strip>div') ? (siblings.indexOf(element) % 3) * 65 : 0;

        const animation = element.animate([

          { opacity: .45, translate: '0 18px' },

          { opacity: 1, translate: '0 0' },

        ], { duration: 560, delay: stagger, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);

      });

    }, { threshold: .08, rootMargin: '0px 0px -16px 0px' });

    targets.forEach(target => observer.observe(target));

    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); };

  }, [reduced]);

  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = menu || selected !== null ? 'hidden' : previous; return () => { document.body.style.overflow = previous; }; }, [menu, selected]);

  useEffect(() => {
    if (!menu) return;
    const links = [...document.querySelectorAll<HTMLAnchorElement>('#mobile-nav a')];
    links[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false); return; }
      if (event.key !== 'Tab') return;
      const items = [menuButton.current, ...links].filter((item): item is HTMLButtonElement | HTMLAnchorElement => item !== null);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      if (menuButton.current?.isConnected) menuButton.current.focus();
    };
  }, [menu]);

  useEffect(() => {

    let frame = 0;

    const update = () => {

      frame = 0;

      const total = document.documentElement.scrollHeight - innerHeight;

      if (progressRef.current) progressRef.current.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;

      let currentSection = 'home';

      document.querySelectorAll<HTMLElement>('main section[id]').forEach(section => { if (section.getBoundingClientRect().top <= Math.min(innerHeight * .3, 200)) currentSection = section.id; });

      setActive(currentSection);

    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    addEventListener('scroll', onScroll, { passive: true });

    update();

    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };

  }, []);

  useEffect(() => { if (selected !== null) dialog.current?.showModal(); else dialog.current?.close(); }, [selected]);

  const closeMenu = () => setMenu(false);
  const sceneAvailable = webgl && !reduced && !sceneFailed;
  const scenePlaying = sceneAvailable && visible && pageVisible && !paused;

  return <>

    <div className="scroll-progress" ref={progressRef} aria-hidden="true" />

    <WashBubbles placement="edges" active={washingBubbles && scenePlaying} intense={stage === 'washing'} />

    <a className="skip" href="#main">Skip to content</a>

    <header className="header"><a className="brand" inert={menu} href="#home" aria-label="Shree Sudhya Laundry Services home"><img src="/images/brand-banner.jpeg" alt="Shree Sudhya Laundry Services" width={1600} height={640} /></a>

      <nav inert={menu} aria-label="Main navigation" className="desktop-nav">{nav.map(([label, id]) => <a className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} key={id} href={`#${id}`} onClick={() => { if (id === 'process') setStep(0); }}>{label}</a>)}</nav>

      <a className="nav-contact" inert={menu} href="#contact">Let’s talk <ArrowUpRight size={16} /></a>

      <button ref={menuButton} className="menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? 'Close menu' : 'Open menu'}>{menu ? <X /> : <Menu />}</button>

    </header>

    {menu && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={event => { if (event.key === 'Escape') { closeMenu(); menuButton.current?.focus(); } }}>{[...nav, ['Contact us', 'contact']].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => { closeMenu(); if (id === 'process') setStep(0); }}>{label}<ArrowUpRight /></a>)}</nav>}

    <main id="main" inert={menu}>

      <section id="home" className="hero marble" onPointerMove={event => { if (reduced || event.pointerType !== 'mouse') return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--light-x', `${event.clientX - rect.left}px`); event.currentTarget.style.setProperty('--light-y', `${event.clientY - rect.top}px`); event.currentTarget.style.setProperty('--bubble-parallax', `${((event.clientX - rect.left) / rect.width - .5) * 12}px`); }}>

        <div className="hero-topline"><span>A LITTLE LUXURY. EVERY LAUNDRY DAY.</span><span className="topline-right"><i /> CLEAN · FRESH · BEAUTIFULLY FINISHED</span></div>

        <div className="hero-layout">

          <div className="hero-copy"><div className="eyebrow"><span /> EXCEPTIONAL CARE, BEAUTIFULLY DELIVERED</div>

            <h1>Premium care.<br />For every <span className="fabric-word">favourite.</span></h1>

            <p>Your favourite clothes deserve a little extra care.<br className="desktop-break" /> Discover freshness, thoughtful cleaning, and a<br className="desktop-break" /> beautiful finish — all with Shree Sudhya.</p>

            <div className="hero-actions"><a className="button primary" href="#services">Explore our services <ArrowUpRight size={18} /></a><a className="text-link" href="#about">Discover our story <ArrowRight size={17} /></a></div>

            <div className="hero-note"><span className="note-icon"><Leaf size={21} /></span><span>Gentle on your fabrics.<br /><strong>Thoughtful in every detail.</strong></span></div>

          </div>

          <div className={showcase.panel} ref={sceneRef} data-laundry-part="showcase">

            <div className={showcase.viewport} data-laundry-part="viewport">

              <SceneBoundary onFailure={() => setSceneFailed(true)}>{sceneAvailable ? <Scene playing={scenePlaying} onStage={setStage} onBubbles={setWashingBubbles} /> : <SceneFallback label={reduced ? 'Freshness in every fold' : 'Our signature fabric care'} />}</SceneBoundary>

              <WashBubbles active={washingBubbles && scenePlaying} intense={stage === 'washing'} />

            </div>

            <div className={showcase.interface} data-laundry-part="interface">

              <p className={showcase.caption}><span className={showcase.star} aria-hidden="true">✦</span><span>{!sceneAvailable ? 'Freshness in every fold' : stageLabels[stage]}</span></p>

              {sceneAvailable && <div className={showcase.playback}><span><i className={`${showcase.dot} ${paused ? '' : showcase.running}`} /> INTERACTIVE 3D EXPERIENCE</span><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Play animation' : 'Pause animation'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button></div>}

            </div>

          </div>

        </div>

        <div className="hero-bottom"><a href="#services"><span className="scroll-circle"><ArrowDown size={16} /></span>SCROLL TO DISCOVER</a><span>Freshness in every fold. <span className="gold-star">✦</span></span><span className="hero-number">01 — THE EXPERIENCE</span></div>

      </section>

      <div className="values-strip">{[{ icon: Waves, name: 'Clean clothes', detail: 'A fresh start, every time' }, {icon: Leaf, name: 'Fresh & hygienic', detail: 'Care that feels different' }, { icon: Shirt, name: 'Neat finish', detail: 'The details make it' }, {icon: Truck, name: 'Pickup & delivery', detail: 'Convenience, considered'}].map(({icon: Icon, name, detail}) => <div key={name}><Icon strokeWidth={1.3} /><span><strong>{name}</strong><small>{detail}</small></span></div>)}</div>

      <section id="services" className="section services-section"><div className="section-top"><div><div className="eyebrow"><span /> THE CARE COLLECTION</div><h2>Good clothes.<br /><em>Exceptional care.</em></h2></div><div className="section-intro"><p>From everyday favourites to your most treasured pieces, discover a more thoughtful approach to laundry.</p><span className="availability">Proposed service collection · Availability to be confirmed</span></div></div>

        <div className="service-grid">{services.map(({ name, detail, description, icon, tag }, index) => { const Icon = icons[icon]; return <article tabIndex={0} className="service-card" key={name} onPointerMove={event => { if (event.pointerType !== 'mouse' || reduced) return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--rx', `${-(event.clientY - rect.top - rect.height / 2) / 65}deg`); event.currentTarget.style.setProperty('--ry', `${(event.clientX - rect.left - rect.width / 2) / 65}deg`); }} onPointerLeave={event => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg'); }}><div className="service-card-top"><span className="service-icon"><Icon size={34} strokeWidth={1.1} /></span><span className="service-no">0{index + 1}</span></div><span className="service-tag">{tag}</span><h3>{name}</h3><p>{detail}</p><div className="service-expanded">{description}</div><a href="#contact" className="service-link" aria-label={`Enquire about ${name}`}>Explore care <ArrowUpRight size={17} /></a></article>; })}</div>

      </section>

      <section id="about" className="about-section section marble"><div className="about-art"><CareDisplay /></div><div className="about-copy"><div className="eyebrow"><span /> THE HEART BEHIND THE FRESHNESS</div><h2>Where cleanliness<br />meets <em>care.</em></h2><p>At Shree Sudhya Laundry Services, we believe every garment deserves exceptional care. Because the clothes you wear hold a little of your everyday life.</p><p>Our focus is simple: clean clothes, lasting freshness, a neat finish, and a convenient laundry experience. Thoughtful care, from the first wash to the final fold.</p><div className="about-signature">A little care makes all the difference.<Sparkles size={24} strokeWidth={1} /></div><a className="text-link" href="#process">See how the care unfolds <ArrowRight size={17} /></a></div></section>

      <section id="process" className="process-section section"><div className="section-top"><div><div className="eyebrow"><span /> A SEAMLESS LITTLE JOURNEY</div><h2>From your doorstep.<br /><em>To fresh perfection.</em></h2></div><p className="section-intro">Six thoughtful steps.<br />One beautifully fresh feeling.</p></div><div className="journey-tabs" role="tablist" aria-label="Laundry care journey">{journey.map(({title, icon: Icon}, i) => <button role="tab" aria-selected={step === i} aria-controls="journey-panel" id={`journey-tab-${i}`} key={title} onClick={() => setStep(i)} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i + (e.key === 'ArrowRight' ? 1 : 5)) % 6; setStep(n); document.getElementById(`journey-tab-${n}`)?.focus(); } }} tabIndex={step === i ? 0 : -1}><span className="step-number">0{i + 1}</span><Icon size={26} strokeWidth={1.3} /><span>{['Arrange pickup', 'Collection', 'Washing', 'Drying', 'Finishing', 'Delivery'][i]}</span></button>)}</div><div className="journey-panel" id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${step}`}><div className="journey-illustration" key={step}><LaundryDiorama step={step} /></div><div><span className="service-tag">STEP 0{step + 1} / 06</span><h3>{journey[step].title}</h3><p>{journey[step].text}</p><small>Illustrative process · Details subject to service confirmation</small></div><button className="round-button" aria-label="Next process step" onClick={() => setStep((step + 1) % 6)}><ArrowRight size={21} /></button></div></section>

      <section id="gallery" className="section gallery-section"><div className="section-top"><div><div className="eyebrow"><span /> FRESHNESS, IN FOCUS</div><h2>The beauty is<br /><em>in the details.</em></h2></div><div className="section-intro"><p>A glimpse into the feeling of fresh, beautifully cared-for clothes.</p><span className="availability">Supplied reference photographs - Laundry care inspiration</span></div></div><div className="gallery-grid">{gallery.map((item, i) => <button className="gallery-card" key={item.title} onClick={() => setSelected(i)} aria-label={`View photograph: ${item.title}`}><div className="gallery-photo"><img src={item.src} alt={item.alt} width={1366} height={800} loading="lazy" decoding="async" /><span className="gallery-photo-hint">View photograph <ArrowUpRight size={16} /></span></div><div className="gallery-caption"><span><small>{item.category}</small><strong>{item.title}</strong></span><ArrowUpRight size={22} /></div></button>)}</div></section>

      <section id="contact" className="contact-section section marble"><div className="contact-copy"><div className="eyebrow"><span /> LET’S MAKE LAUNDRY FEEL DIFFERENT</div><h2>A fresh start<br />is <em>closer than you think.</em></h2><p>Have a question about fabric care or our services?<br />We look forward to caring for your favourites.</p><div className="contact-flourish"><Waves size={46} strokeWidth={.8} /><span>Freshness in Every Fold.</span></div></div><div className="contact-card"><span className="service-tag">YOUR NEXT FRESH CHAPTER</span><h3>Let’s connect.</h3>{company.phone || company.whatsapp || company.email ? <div className="contact-actions">{company.phone && <a className="button primary" href={`tel:${company.phone}`}><Phone size={17} /> Call our team</a>}{company.whatsapp && <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}>Chat on WhatsApp <ArrowUpRight size={16} /></a>}{company.email && <a href={`mailto:${company.email}`}><Mail size={17} /> {company.email}</a>}</div> : <p className="contact-pending">Our contact details are being finalised.<br />Please check back soon to connect with the team.</p>}<div className="contact-detail"><MapPin size={18} /><span><strong>Find us</strong>{[company.address, company.locations].filter(Boolean).join(' · ') || 'Address & service locations coming soon'}</span></div><div className="contact-detail"><Clock size={18} /><span><strong>A time that works for you</strong>{company.hours || 'Business hours to be announced'}</span></div>{company.mapUrl && <a className="text-link" href={company.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={16} /></a>}<span className="contact-bottom"><Leaf size={14} /> Thoughtful care starts with a conversation.</span></div></section>

    </main>

    <footer inert={menu}><div className="footer-top"><a className="brand footer-brand" href="#home" aria-label="Shree Sudhya Laundry Services home"><img src="/images/brand-banner.jpeg" alt="Shree Sudhya Laundry Services" width={1600} height={640} /></a><p>Premium care for every fabric.<br />Freshness in every fold.</p><div className="footer-links">{[...nav, ['Contact us', 'contact']].map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Shree Sudhya Laundry Services.</span><span>Clean. Fresh. Beautifully finished. <span className="gold-star">✦</span></span><a href="#home">Back to top <ArrowUpRight size={14} /></a></div></footer>

    <dialog ref={dialog} className="gallery-dialog" onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }} onKeyDown={e => { if (e.key === 'ArrowRight') setSelected(s => s === null ? 0 : (s + 1) % gallery.length); if (e.key === 'ArrowLeft') setSelected(s => s === null ? 0 : (s + gallery.length - 1) % gallery.length); }} aria-label="Laundry photography gallery">{selected !== null && <><button className="dialog-close round-button" onClick={() => setSelected(null)} aria-label="Close gallery"><X /></button><img className="gallery-full-photo" src={gallery[selected].src} alt={gallery[selected].alt} width={1366} height={800} /><div className="dialog-caption"><button className="round-button" onClick={() => setSelected((selected + gallery.length - 1) % gallery.length)} aria-label="Previous photograph"><ChevronLeft /></button><div><h3>{gallery[selected].title}</h3><p>{gallery[selected].description}</p><small>Supplied reference photograph</small></div><button className="round-button" onClick={() => setSelected((selected + 1) % gallery.length)} aria-label="Next photograph"><ChevronRight /></button></div></>}</dialog>

  </>;

}

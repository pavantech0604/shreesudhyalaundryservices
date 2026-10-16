import { useEffect } from 'react';
import { mediaBudget } from '@/lib/layout-metrics.mjs';

/** Measure only stable UI chrome; never observe the image/canvas being resized. */
export function useViewportLayout() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    const hero = document.querySelector<HTMLElement>('#home');
    const gallery = document.querySelector<HTMLElement>('#gallery');
    if (!header) return;
    const height = (element: Element | null) => element?.getBoundingClientRect().height ?? 0;
    const pixels = (value: string) => Number.parseFloat(value) || 0;
    const set = (element: HTMLElement, name: string, value: number) => {
      const next = `${value.toFixed(3)}px`;
      if (element.style.getPropertyValue(name) !== next) element.style.setProperty(name, next);
    };
    const update = () => {
      const headerHeight = height(header);
      const viewport = document.documentElement.clientHeight;
      set(document.documentElement, '--header-height', headerHeight);
      if (hero) {
        const layout = hero.querySelector<HTMLElement>('.hero-layout');
        const panel = hero.querySelector<HTMLElement>('[data-laundry-part="showcase"]');
        const layoutStyle = layout ? getComputedStyle(layout) : null;
        const panelStyle = panel ? getComputedStyle(panel) : null;
        const reserve = height(hero.querySelector('.hero-topline')) + height(hero.querySelector('.hero-bottom'))
          + height(hero.querySelector('[data-laundry-part="interface"]'))
          + pixels(layoutStyle?.paddingTop ?? '') + pixels(layoutStyle?.paddingBottom ?? '')
          + pixels(panelStyle?.rowGap ?? '');
        set(hero, '--hero-chrome', reserve);
        set(hero, '--hero-stage-height', mediaBudget({ viewport, header: headerHeight, chrome: reserve, minimum: 230, maximum: 460 }).height);
      }
      if (gallery) {
        const style = getComputedStyle(gallery);
        const title = gallery.querySelector<HTMLElement>('.section-top');
        const titleStyle = title ? getComputedStyle(title) : null;
        const captions = [...gallery.querySelectorAll('.gallery-caption')];
        const reserve = height(title) + Math.max(0, ...captions.map(height))
          + pixels(style.paddingTop) + pixels(style.paddingBottom) + pixels(style.rowGap)
          + pixels(titleStyle?.marginBottom ?? '');
        set(gallery, '--gallery-chrome', reserve);
        const budget = mediaBudget({ viewport, header: headerHeight, chrome: reserve, minimum: 140, maximum: 420 });
        set(gallery, '--gallery-image-height', budget.height);
        gallery.dataset.viewportFit = budget.requiresScroll ? 'scroll' : 'fit';
      }
    };
    const targets = [header, ...document.querySelectorAll('.hero-topline, .hero-bottom, [data-laundry-part="interface"], #gallery .section-top, #gallery .gallery-caption')];
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    targets.forEach(target => observer?.observe(target));
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      document.documentElement.style.removeProperty('--header-height');
      hero?.style.removeProperty('--hero-chrome');
      hero?.style.removeProperty('--hero-stage-height');
      gallery?.style.removeProperty('--gallery-chrome');
      gallery?.style.removeProperty('--gallery-image-height');
      if (gallery) delete gallery.dataset.viewportFit;
    };
  }, []);
}

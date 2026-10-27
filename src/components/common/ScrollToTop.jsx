import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the user switches between pages,
 * the viewport immediately and reliably starts at the very top (0, 0).
 */
export default function ScrollToTop() {
  const location = useLocation();

  // 1. Disable browser's automatic scroll restoration so it never retains
  // previous page's scroll offset on client-side routing.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const forceScrollTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTop = 0;
    }
  };

  // 2. Immediate synchronous reset before browser paint
  useLayoutEffect(() => {
    forceScrollTop();
  }, [location.pathname, location.search, location.key]);

  // 3. Post-render and multi-frame fallback to override any dynamic
  // DOM expansion (Leaflet maps, charts, async data hydration)
  useEffect(() => {
    forceScrollTop();

    const rafId = requestAnimationFrame(forceScrollTop);
    const t1 = setTimeout(forceScrollTop, 20);
    const t2 = setTimeout(forceScrollTop, 80);
    const t3 = setTimeout(forceScrollTop, 200);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search, location.key]);

  return null;
}

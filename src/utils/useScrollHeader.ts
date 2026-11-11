import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll direction and determine if sticky headers should be visible.
 * - Always visible when near the top of the page (scrollY <= topOffset).
 * - Smoothly hides on downward scroll (delta > threshold).
 * - Smoothly reveals on upward scroll (delta < -threshold).
 */
export function useScrollHeader(threshold: number = 10, topOffset: number = 60): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always visible near top of the page
          if (currentScrollY <= topOffset) {
            setIsVisible(true);
          } else {
            const diff = currentScrollY - lastScrollY;
            if (diff > threshold) {
              // Scrolling down -> collapse/hide header
              setIsVisible(false);
            } else if (diff < -threshold) {
              // Scrolling up -> expand/show header
              setIsVisible(true);
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, topOffset]);

  return isVisible;
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Shared timing for every tile: one beat each, staggered in reading order.
export const LEAD = 450;
export const STEP = 110;

export const before = { on: false };
export const after = { on: true };

/** A script that waits for its turn, then plays its one beat. */
export const beat = (i) => async (a) => {
  await a.wait(LEAD + i * STEP);
  await a.set({ on: true });
};

/** Measure the picture slot, not the page: a wide page can hold a narrow tile. */
export function usePictureWidth(initial = 340) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(1, Math.round(node.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/** True once the element has scrolled into view, after `delay` ms. */
export function useInView(delay) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        t = window.setTimeout(() => setSeen(true), delay);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [delay]);
  return [ref, seen];
}

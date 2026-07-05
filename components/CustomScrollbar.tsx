"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Sample the background color at a given point on the page by
// drawing a 1×1 area of the viewport into an offscreen canvas.
// Falls back gracefully if not supported.
function sampleBgLuminance(x: number, y: number): number | null {
  try {
    // Walk the element stack at (x, y) and find the first element
    // that has a non-transparent background color.
    const els = document.elementsFromPoint(x, y) as HTMLElement[];
    for (const el of els) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") continue;
      const m = bg.match(/[\d.]+/g);
      if (!m || m.length < 3) continue;
      const r = parseFloat(m[0]) / 255;
      const g = parseFloat(m[1]) / 255;
      const b = parseFloat(m[2]) / 255;
      // Relative luminance (WCAG formula)
      const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }
    return null;
  } catch {
    return null;
  }
}

export default function CustomScrollbar() {
  const thumbRef  = useRef<HTMLDivElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);

  const [thumbHeight, setThumbHeight] = useState(40);
  const [thumbTop,    setThumbTop]    = useState(0);
  // 0 = dark bg → light thumb  |  1 = light bg → dark thumb
  const [luminance, setLuminance]     = useState<number>(0);

  const isDragging      = useRef(false);
  const dragStartY      = useRef(0);
  const dragStartScroll = useRef(0);

  // ── geometry update ───────────────────────────────────────────────────────
  const update = useCallback(() => {
    const scrollTop    = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const trackH       = clientHeight;

    const ratio  = clientHeight / scrollHeight;
    const h      = Math.max(ratio * trackH, 32);
    const maxTop = trackH - h;
    const top    = scrollHeight > clientHeight
      ? (scrollTop / (scrollHeight - clientHeight)) * maxTop
      : 0;

    setThumbHeight(h);
    setThumbTop(top);

    // Sample luminance at the centre of the thumb
    const thumbCentreY = top + h / 2;
    const thumbX       = window.innerWidth - 6; // right: 3px + width 6px centre
    const lum = sampleBgLuminance(thumbX, thumbCentreY);
    if (lum !== null) setLuminance(lum);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  // ── drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current      = true;
    dragStartY.current      = e.clientY;
    dragStartScroll.current = window.scrollY;
    document.body.style.userSelect = "none";
    if (thumbRef.current) thumbRef.current.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const ratio        = clientHeight / scrollHeight;
      const thumbH       = Math.max(ratio * clientHeight, 32);
      const maxTop       = clientHeight - thumbH;
      const maxScroll    = scrollHeight - clientHeight;
      const dy           = e.clientY - dragStartY.current;
      const scrollDelta  = maxTop > 0 ? (dy / maxTop) * maxScroll : 0;
      window.scrollTo({ top: dragStartScroll.current + scrollDelta });
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.userSelect = "";
      if (thumbRef.current) thumbRef.current.style.cursor = "grab";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, []);

  // ── adaptive color ────────────────────────────────────────────────────────
  // luminance 0 = pure black → use light/white thumb
  // luminance 1 = pure white → use dark thumb
  // Threshold at 0.4: below → light, above → dark
  const isDark    = luminance < 0.4;
  // Base thumb color adapts, stays semi-transparent so it floats
  const thumbColor   = isDark
    ? `rgba(255, 255, 255, 0.55)`   // light thumb on dark bg
    : `rgba(0,   0,   0,   0.40)`; // dark  thumb on light bg

  const thumbHover   = isDark
    ? `rgba(255, 255, 255, 0.90)`
    : `rgba(0,   0,   0,   0.70)`;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={trackRef}
      style={{
        position:      "fixed",
        right:         0,
        top:           0,
        bottom:        0,
        width:         "12px",
        zIndex:        9999,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        ref={thumbRef}
        onMouseDown={onMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position:      "absolute",
          right:         "3px",
          top:           `${thumbTop}px`,
          width:         "6px",
          height:        `${thumbHeight}px`,
          background:    isHovered ? thumbHover : thumbColor,
          borderRadius:  "10px",
          pointerEvents: "auto",
          cursor:        "grab",
          transition:    "background 0.25s ease, top 0.05s linear",
          backdropFilter: "blur(2px)",
        }}
      />
    </div>
  );
}

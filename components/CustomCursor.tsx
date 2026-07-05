"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Ring lags behind with lerp
    let mx = -100, my = -100; // mouse
    let rx = -100, ry = -100; // ring (lerped)
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      // Dot follows immediately
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(animate);
    };

    // Hover effects — scale up ring on interactive elements
    const onEnter = () => {
      ring.style.width  = "48px";
      ring.style.height = "48px";
      ring.style.opacity = "0.5";
      dot.style.opacity = "0";
    };
    const onLeave = () => {
      ring.style.width  = "32px";
      ring.style.height = "32px";
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    };

    const bindHovers = () => {
      document.querySelectorAll<HTMLElement>("a, button, [role='button'], input, textarea, select, label").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    // Mouse down / up
    const onDown = () => {
      dot.style.transform  = dot.style.transform.replace("scale", "") + " scale(0.6)";
      ring.style.transform = ring.style.transform.replace("scale", "") + " scale(0.85)";
    };
    const onUp = () => {
      // reset handled naturally on next frame
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    bindHovers();
    animate();

    // Re-bind after any dynamic content changes
    const observer = new MutationObserver(bindHovers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Outer ring — lags */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          border: "1.5px solid rgba(174,140,60,0.8)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-100px,-100px)",
          marginLeft: "-16px",
          marginTop: "-16px",
          transition: "width 0.2s ease, height 0.2s ease, opacity 0.2s ease, background 0.2s ease",
          mixBlendMode: "difference",
        }}
        aria-hidden="true"
      />

      {/* Inner dot — instant */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "6px",
          height: "6px",
          background: "#AE8C3C",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-100px,-100px)",
          marginLeft: "-3px",
          marginTop: "-3px",
          transition: "opacity 0.15s ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}

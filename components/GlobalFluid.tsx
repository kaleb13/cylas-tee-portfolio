"use client";

import dynamic from "next/dynamic";

// Lazy-load the heavy WebGL canvas only on the client
const FluidCanvas = dynamic(() => import("./FluidCanvas"), { ssr: false });

/**
 * Fixed full-viewport fluid overlay.
 * pointer-events: none so it never blocks clicks.
 * mixBlendMode: screen on the canvas means it only lights up
 * dark areas — it is invisible on the bright golden section.
 */
export default function GlobalFluid() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,          // above background, below all content
        pointerEvents: "none",
        width: "100%",
        height: "100dvh",
      }}
      aria-hidden="true"
    >
      <FluidCanvas />
    </div>
  );
}

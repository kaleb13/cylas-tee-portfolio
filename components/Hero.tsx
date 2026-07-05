"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import SiteLink from "./SiteLink";

// Load FluidCanvas client-side only (WebGL)
const FluidCanvas = dynamic(() => import("./FluidCanvas"), { ssr: false });

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full"
      style={{ height: "110vh", backgroundColor: "#0B1014" }}
    >
      {/* Fluid distortion overlay — absolute within section so it scrolls naturally */}
      <FluidCanvas />

      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ opacity: 0 }}
      >
        <span
          style={{
            fontSize: "clamp(120px, 30vw, 380px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.05)",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          Cylas Tee
        </span>
      </div>

      {/* Person image — centered, anchored to bottom */}
      <div
        id="hero-image"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          height: "calc(110vh - 110px)",
          maxHeight: "800px",
          maxWidth: "min(600px, 65vw)",
          aspectRatio: "680 / 900",
          opacity: 0,
        }}
      >
        <Image
          src="/cylas-tee.png"
          alt="Cylas Tee"
          width={600}
          height={794}
          className="w-full h-full object-contain object-bottom"
          priority
        />
      </div>

      {/* Left text block — z-10 keeps it above the FluidCanvas */}
      <div
        className="absolute left-0 bottom-0 z-10 flex flex-col"
        style={{ padding: "0 48px 200px 48px", maxWidth: "420px", zIndex: 10 }}
      >
        <h1
          id="hero-title"
          className="font-normal leading-tight mb-5 text-white"
          style={{ fontSize: "clamp(32px, 3.8vw, 46px)", opacity: 0 }}
        >
          Create Your Website Today
        </h1>
        <p
          className="text-gray-400 leading-relaxed mb-7"
          style={{ fontSize: "15px" }}
        >
          Helping Individuals Increase Their Online Reach &amp; Presence.
          Starting With Their Personal Brand Website.
        </p>
        <SiteLink href="#services" theme="light">
          Browse Services
        </SiteLink>
      </div>
    </section>
  );
}

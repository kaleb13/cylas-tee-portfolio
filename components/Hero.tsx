"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full"
      style={{ height: "110vh", backgroundColor: "#0B1014" }}
    >
      {/* Smoke animation */}
      <ParticleBackground />

      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: "600px" }}
      >
        <Image
          src="/cylas-tee.png"
          alt="Cylas Tee"
          width={680}
          height={900}
          className="w-full h-auto object-contain object-bottom"
          priority
        />
      </div>

      {/* Left text block — lower left, wider, bigger description */}
      <div
        className="absolute left-0 bottom-0 z-10 flex flex-col"
        style={{ padding: "0 48px 200px 48px", maxWidth: "420px" }}
      >
        <h1
          className="font-normal leading-tight mb-5 text-white"
          style={{ fontSize: "clamp(32px, 3.8vw, 46px)" }}
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
        <Link
          href="#services"
          className="inline-flex items-center gap-2 text-white text-sm hover:text-[#AE8C3C] transition-colors self-start"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.5)", paddingBottom: "3px" }}
        >
          Browse service
          <Image src="/arrow.svg" alt="" width={14} height={14} />
        </Link>
      </div>
    </section>
  );
}

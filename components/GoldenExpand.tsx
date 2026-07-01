"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GoldenExpand() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 = card, 1 = fullscreen

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionH = el.offsetHeight;
      const viewH = window.innerHeight;

      // progress: 0 when sticky starts, 1 when sticky ends
      const scrollable = sectionH - viewH;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / scrollable, 0), 1);
      setProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Interpolation helpers
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // ease out — zooms fast at start, settles smoothly at the end
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const p = ease(progress);

  // Card dimensions as % of viewport
  // Start: matches the current about card (roughly 75vw wide, auto height)
  // End: 100vw x 100vh
  const scaleX = lerp(0.78, 1, p);   // width scale
  const scaleY = lerp(0.42, 1, p);   // height scale
  const borderRadius = lerp(2, 0, p);

  // Content fades in during second half of scroll
  const contentOpacity = progress < 0.5 ? 0 : (progress - 0.5) / 0.5;
  const aboutOpacity   = progress > 0.4 ? Math.max(0, 1 - (progress - 0.4) / 0.3) : 1;

  return (
    /*
      Outer section is tall (300vh) so scroll has room.
      Inner sticky div pins the panel to the viewport while user scrolls.
    */
    <div
      ref={sectionRef}
      id="track-record"
      style={{ height: "130vh", backgroundColor: "#0B1014", marginTop: "-42vh" }}
    >
      <div
        className="sticky top-0 w-full flex items-center justify-center overflow-hidden"
        style={{ height: "100vh", zIndex: 10 }}
      >
        {/* Golden panel */}
        <div
          style={{
            backgroundColor: "#AE8C3C",
            borderRadius: `${borderRadius}px`,
            width: `${scaleX * 100}vw`,
            height: `${scaleY * 100}vh`,
            position: "relative",
            overflow: "hidden",
            transition: "none",
          }}
        >
          {/* ── ABOUT content (fades OUT as panel expands) ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "48px 52px 44px 52px",
              opacity: aboutOpacity,
              pointerEvents: aboutOpacity < 0.05 ? "none" : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
                marginBottom: "28px",
              }}
            >
              About
            </p>
            <p className="text-white leading-relaxed mb-6" style={{ fontSize: "15px" }}>
              Cylas Tee Had Been In The Digital Wealth Creation Niche For Close To A
              Decade. In Less Than A Year, He Has Built A 6 Figure Business Creating
              Websites For Small Medium Businesses And Aspiring Personal Brands Such
              As Solopreneurs And Thought Leaders.
            </p>
            <p className="text-white leading-relaxed mb-10" style={{ fontSize: "15px" }}>
              He Has Helped Hundreds Of Individuals Create Their Personal Brand
              Website – Without Spending A Lot Of Time, Understanding Coding, Or
              Having Any Design Knowledge.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 text-white text-sm hover:opacity-70 transition-opacity self-start"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.6)", paddingBottom: "3px" }}
            >
              More About Cylas Tee
              <Image src="/arrow.svg" alt="" width={14} height={14} />
            </Link>
          </div>

          {/* ── TRACK RECORD content (fades IN as panel expands) ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "80px 64px",
              opacity: contentOpacity,
              pointerEvents: contentOpacity < 0.05 ? "none" : "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Label */}
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "40px",
              }}
            >
              Proven Track Record
            </p>

            {/* Two-column layout */}
            <div className="flex flex-col md:flex-row md:items-start" style={{ gap: "48px" }}>
              {/* Left — big heading + Upwork icon */}
              <div className="flex items-start gap-4 flex-shrink-0">
                <h2
                  className="font-bold text-white leading-tight"
                  style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
                >
                  Top Rated Plus<br />On Upwork.
                </h2>
                <Image
                  src="/upwork-icon.png"
                  alt="Upwork Top Rated Plus"
                  width={60}
                  height={60}
                  className="object-contain mt-1 flex-shrink-0"
                />
              </div>

              {/* Right — description + link */}
              <div style={{ maxWidth: "360px", paddingTop: "8px" }}>
                <p
                  className="text-white/80 leading-relaxed mb-6"
                  style={{ fontSize: "15px" }}
                >
                  Cylas Tee Has Already Accumulated Over 6 Figures On Upwork,
                  And That&apos;s Only One Source Of Clients And Income. Figures
                  On Upwork Don&apos;t Lie.
                </p>
                <Link
                  href="https://www.upwork.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white text-sm hover:opacity-70 transition-opacity"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.6)", paddingBottom: "3px" }}
                >
                  See Upwork Profile
                  <Image src="/arrow.svg" alt="" width={14} height={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

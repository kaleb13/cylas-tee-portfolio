"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FluidImage from "./FluidImage";
import SiteLink from "./SiteLink";

// ─── Math helpers ─────────────────────────────────────────────────────────────
function clamp(v: number, min = 0, max = 1) {
  return Math.min(Math.max(v, min), max);
}
function norm(v: number, inMin: number, inMax: number) {
  return clamp((v - inMin) / (inMax - inMin));
}
function smoothstep(v: number, inMin: number, inMax: number) {
  const t = norm(v, inMin, inMax);
  return t * t * (3 - 2 * t);
}

export default function GoldenExpand() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 → 1 over total scroll

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollable = 2.9 * viewH;
      const scrolled = -rect.top;
      setProgress(clamp(scrolled / scrollable));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  // ── Panel expansion (first ~17% of scroll = ~68vh physical) ────────────────
  const expandP = ease(norm(progress, 0, 0.17));
  const scaleX = 0.78 + (1 - 0.78) * expandP;
  const scaleY = 0.42 + (1 - 0.42) * expandP;
  const borderRadius = 2 * (1 - expandP);

  // ── No fade to dark section transition ──────────────
  const panelBgColor = "#AE8C3C";
  const p4ContentOpacity = 1;

  // Phase active states — thresholds aligned to scroll-snap target positions:
  //   snap at 55dvh  → progress ≈ 0.19  (P1 start)
  //   snap at 110dvh → progress ≈ 0.38  (P2 start)
  //   snap at 168dvh → progress ≈ 0.58  (P3 start)
  //   snap at 220dvh → progress ≈ 0.76  (P4 start)
  const isP1 = progress >= 0.19 && progress < 0.38;
  const isP2 = progress >= 0.38 && progress < 0.58;
  const isP3 = progress >= 0.58 && progress < 0.76;
  const isP4 = progress >= 0.76;

  // Shared label style
  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "36px",
    textAlign: "center",
  };

  // Shared phase wrapper style
  const phaseStyle = (active: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    padding: "0 clamp(16px, 6vw, 72px)",
    opacity: active ? 1 : 0,
    pointerEvents: active ? "auto" : "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.6s ease",
  });

  return (
    /*
      340 vh gives 5 phases comfortable scroll room.
      The inner sticky div pins the golden panel while the user scrolls.
    */
    <div
      ref={sectionRef}
      id="track-record"
      style={{ height: "590dvh", backgroundColor: "#0B1014", marginTop: "-42dvh", position: "relative" }}
    >
      {/* Scroll Snap Targets — positions tuned to match phase thresholds:
           P1(About)      progress ~0.19 → scrolled = 0.19 * 290vh ≈ 55dvh
           P2(TrackRec)   progress ~0.38 → scrolled = 0.38 * 290vh ≈ 110dvh
           P3(Features)   progress ~0.58 → scrolled = 0.58 * 290vh ≈ 168dvh
           P4(Focus)      progress ~0.76 → scrolled = 0.76 * 290vh ≈ 220dvh */}
      <div className="scroll-snap-target" style={{ position: "absolute", top: "0dvh", left: 0, width: "1px", height: "1px", pointerEvents: "none" }} />
      <div className="scroll-snap-target" style={{ position: "absolute", top: "55dvh", left: 0, width: "1px", height: "1px", pointerEvents: "none" }} />
      <div className="scroll-snap-target" style={{ position: "absolute", top: "110dvh", left: 0, width: "1px", height: "1px", pointerEvents: "none" }} />
      <div className="scroll-snap-target" style={{ position: "absolute", top: "168dvh", left: 0, width: "1px", height: "1px", pointerEvents: "none" }} />
      <div className="scroll-snap-target" style={{ position: "absolute", top: "220dvh", left: 0, width: "1px", height: "1px", pointerEvents: "none" }} />

      <div
        className="sticky top-0 w-full flex items-center justify-center overflow-hidden"
        style={{ height: "100dvh", zIndex: 10, pointerEvents: "none" }}
      >
        {/* ── Golden panel ─────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: panelBgColor,
            borderRadius: `${borderRadius}px`,
            width: `${scaleX * 100}vw`,
            height: `${scaleY * 100}dvh`,
            position: "relative",
            overflow: "hidden",
            transition: "none",
            pointerEvents: "auto",
          }}
        >

          {/* ── PHASE 1: About ──────────────────────────────────────────── */}
          <div style={phaseStyle(isP1)}>
            <p style={{
              ...labelStyle,
              opacity: isP1 ? 1 : 0,
              transform: isP1 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>About</p>
            <p
              className="text-white leading-relaxed"
              style={{
                fontSize: "15px",
                textAlign: "center",
                maxWidth: "680px",
                marginBottom: "20px",
                opacity: isP1 ? 1 : 0,
                transform: isP1 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "100ms"
              }}
            >
              Cylas Tee Had Been In The Digital Wealth Creation Niche For Close To A
              Decade. In Less Than A Year, He Has Built A 6 Figure Business Creating
              Websites For Small Medium Businesses And Aspiring Personal Brands Such
              As Solopreneurs And Thought Leaders.
            </p>
            <p
              className="text-white leading-relaxed"
              style={{
                fontSize: "15px",
                textAlign: "center",
                maxWidth: "680px",
                marginBottom: "36px",
                opacity: isP1 ? 1 : 0,
                transform: isP1 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "180ms"
              }}
            >
              He Has Helped Hundreds Of Individuals Create Their Personal Brand
              Website – Without Spending A Lot Of Time, Understanding Coding, Or
              Having Any Design Knowledge.
            </p>
            <div style={{
              opacity: isP1 ? 1 : 0,
              transform: isP1 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "260ms"
            }}>
              <SiteLink href="#contact" theme="light">
                More About Cylas Tee
              </SiteLink>
            </div>
          </div>

          {/* ── PHASE 2: Proven Track Record ────────────────────────────── */}
          <div style={phaseStyle(isP2)}>
            <p style={{
              ...labelStyle,
              opacity: isP2 ? 1 : 0,
              transform: isP2 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>Proven Track Record</p>
            <div
              className="golden-track-row"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "40px",
                width: "100%",
                maxWidth: "1100px",
              }}
            >
              <div style={{
                flexShrink: 0,
                opacity: isP2 ? 1 : 0,
                transform: isP2 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "100ms"
              }}>
                <Image
                  src="/upwork-icon.svg"
                  alt="Upwork Top Rated Plus"
                  width={72}
                  height={72}
                  className="object-contain"
                />
              </div>
              <div style={{
                flexShrink: 0,
                opacity: isP2 ? 1 : 0,
                transform: isP2 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "180ms"
              }}>
                <h2
                  className="font-bold text-white leading-tight"
                  style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
                >
                  Top Rated Plus<br />On Upwork.
                </h2>
              </div>
              <div className="golden-divider" style={{
                width: "1px",
                height: "80px",
                background: "rgba(255,255,255,0.25)",
                flexShrink: 0,
                alignSelf: "center",
                opacity: isP2 ? 1 : 0,
                transition: "opacity 0.8s ease",
                transitionDelay: "260ms"
              }} />
              <div style={{
                maxWidth: "500px",
                opacity: isP2 ? 1 : 0,
                transform: isP2 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "260ms"
              }}>
                <p className="text-white/80 leading-relaxed mb-5" style={{ fontSize: "17px" }}>
                  Cylas Tee Has Already Accumulated Over 6 Figures On Upwork,
                  And That&apos;s Only One Source Of Clients And Income. Figures
                  On Upwork Don&apos;t Lie.
                </p>
                <SiteLink href="https://www.upwork.com" theme="light" external>
                  See Upwork Profile
                </SiteLink>
              </div>
            </div>
          </div>

          {/* ── PHASE 3: Features & Accreditations ──────────────────────── */}
          <div style={phaseStyle(isP3)}>
            <p style={{
              ...labelStyle,
              marginBottom: "48px",
              opacity: isP3 ? 1 : 0,
              transform: isP3 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>Features &amp; Accreditations</p>
            <div
              className="golden-logos-row"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                width: "100%",
                maxWidth: "1100px",
              }}
            >
              {[
                { src: "/Upwork-logo-white.svg", alt: "Upwork", w: 140, h: 56, maxH: 56 },
                { separator: true },
                { src: "/Elementor White 400x70.svg", alt: "Elementor", w: 160, h: 56, maxH: 56 },
                { separator: true },
                { src: "/Unity-logo-white.svg", alt: "Unity", w: 130, h: 56, maxH: 56 },
                { separator: true },
                { src: "/CylasTee-Home-FeaturedLogo-3.svg", alt: "Featured Logo 3", w: 120, h: 72, maxH: 72 },
                { separator: true },
                { src: "/CylasTee-Home-FeaturedLogo-4.svg", alt: "Featured Logo 4", w: 120, h: 72, maxH: 72 }
              ].map((item, idx) => {
                if ('separator' in item && item.separator) {
                  return (
                    <div key={idx} className="logo-separator" style={{
                      width: "1px",
                      height: "56px",
                      background: "rgba(255,255,255,0.25)",
                      flexShrink: 0,
                      opacity: isP3 ? 1 : 0,
                      transition: "opacity 0.8s ease",
                      transitionDelay: `${100 + idx * 50}ms`
                    }} />
                  );
                }
                
                const logo = item as { src: string; alt: string; w: number; h: number; maxH: number };
                return (
                  <div key={idx} className="logo-wrap" style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 32px",
                    opacity: isP3 ? 1 : 0,
                    transform: isP3 ? "translateY(0)" : "translateY(30px)",
                    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                    transitionDelay: `${100 + idx * 50}ms`
                  }}>
                    <Image src={logo.src} alt={logo.alt} width={logo.w} height={logo.h} className="object-contain" style={{ maxHeight: logo.maxH }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PHASE 4: Primary Focus — Passion For Personal Brands (Collage) ── */}
          <div style={{
            ...phaseStyle(isP4),
            opacity: isP4 ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}>
            <p style={{
              ...labelStyle,
              opacity: isP4 ? 1 : 0,
              transform: isP4 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>Primary Focus Areas</p>
            
            <h2
              style={{
                fontSize: "clamp(24px, 3.8vw, 46px)",
                fontWeight: 400,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: "64px",
                letterSpacing: "-0.01em",
                textAlign: "center",
                opacity: isP4 ? 1 : 0,
                transform: isP4 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "100ms"
              }}
            >
              Passion For Personal Brands
            </h2>

            {/* Staggered wavy collage row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                width: "100%",
                maxWidth: "1350px",
                overflow: "visible",
              }}
            >
              {[
                { src: "/C1.webp", rot: -6, y: 20, z: 10 },
                { src: "/C2.webp", rot: 4, y: -5, z: 20 },
                { src: "/C3.webp", rot: -8, y: -20, z: 30 },
                { src: "/C4.webp", rot: 6, y: -35, z: 40 },
                { src: "/C5.webp", rot: -5, y: -25, z: 30 },
                { src: "/C6.webp", rot: 7, y: -10, z: 20 },
                { src: "/C7.webp", rot: -6, y: 5, z: 10 },
                { src: "/C8.webp", rot: 8, y: 25, z: 0 },
              ].map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    transform: isP4
                      ? `translateY(${img.y}px) rotate(${img.rot}deg)`
                      : "translateY(160px) rotate(0deg)",
                    zIndex: img.z,
                    marginLeft: idx === 0
                      ? "0"
                      : (isP4 ? "var(--collage-margin)" : "clamp(-175px, -11vw, -115px)"),
                    width: "clamp(115px, 11vw, 175px)",
                    aspectRatio: "3/4",
                    flexShrink: 0,
                    opacity: isP4 ? 1 : 0,
                    transition: "transform 2.0s cubic-bezier(0.16, 1, 0.3, 1), margin-left 2.0s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: isP4 ? `${200 + idx * 80}ms` : "0ms",
                  }}
                  className="relative hover:z-50 golden-collage-card"
                >
                  <FluidImage
                    src={img.src}
                    alt={`Cylas Tee collage photo ${idx + 1}`}
                    width={160}
                    height={213}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.85)",
                textAlign: "center",
                maxWidth: "750px",
                marginTop: "48px",
                opacity: isP4 ? 1 : 0,
                transform: isP4 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "800ms"
              }}
            >
              Cylas Tee Believes Small Businesses And Talented Individuals Drive Real Change. With Years Of Experience And Mentorship From Industry Leaders, He Helps Personal Brands Build, Grow, And Scale Successfully.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FluidImage from "./FluidImage";
import SiteLink from "./SiteLink";

function clamp(v: number, min = 0, max = 1) {
  return Math.min(Math.max(v, min), max);
}
function smoothstep(v: number, a: number, b: number) {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / Math.max(scrollable, 1));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Phase active states for triggering CSS transitions
  const isP1 = progress >= 0.0 && progress < 0.35;
  const isP2 = progress >= 0.35 && progress < 0.75;
  const isP3 = progress >= 0.75;

  const phaseWrap = (active: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    padding: "100px 48px 60px",
    opacity: active ? 1 : 0,
    pointerEvents: active ? "auto" : "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    transition: "opacity 0.6s ease",
  });

  return (
    <div
      ref={sectionRef}
      id="services"
      style={{ height: "380vh", backgroundColor: "#0B1014", position: "relative", zIndex: 20 }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Dark surface */}
        <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#0B1014" }}>

          {/* ── PHASE 1: Intro ─────────────────────────────────────────────── */}
          <div style={phaseWrap(isP1)}>
            {/* Static label — always white, small caps */}
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "32px",
              textAlign: "center",
              opacity: isP1 ? 1 : 0,
              transform: isP1 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>
              Main Service Offering
            </p>

            {/* Big title */}
            <h2 style={{
              fontSize: "clamp(38px, 5.5vw, 72px)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: "760px",
              marginBottom: "32px",
              textAlign: "center",
              alignSelf: "center",
              opacity: isP1 ? 1 : 0,
              transform: isP1 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "100ms"
            }}>
              Work With Cylas Tee
            </h2>

            {/* Description */}
            <div style={{
              maxWidth: "600px",
              alignSelf: "center",
              textAlign: "center",
              opacity: isP1 ? 1 : 0,
              transform: isP1 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "180ms"
            }}>
              <p style={{
                fontSize: "16px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.80)",
                marginBottom: "18px",
              }}>
                Cylas Tee&apos;s main service offering is full personal brand website
                creation or redesign &amp; Elementor development work.
              </p>
              <p style={{
                fontSize: "14px",
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.42)",
                marginBottom: "14px",
              }}>
                Whether you are an entrepreneur just starting out or a small–medium
                business bringing in 7 figures a year — we can help you build a website
                that earns authority, trust, and drives sales.
              </p>
              <p style={{
                fontSize: "14px",
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.42)",
              }}>
                Additional services like Funnel Design, SEO, and Digital Marketing
                are exclusive to existing clients only.
              </p>
            </div>
          </div>

          {/* ── PHASE 2: Cards ─────────────────────────────────────────────── */}
          <div style={phaseWrap(isP2)}>
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "56px",
              textAlign: "center",
              opacity: isP2 ? 1 : 0,
              transform: isP2 ? "translateY(0)" : "translateY(30px)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              transitionDelay: "0ms"
            }}>
              Main Service Offering
            </p>

            <div className="services-cards-row" style={{ display: "flex", flexDirection: "row", gap: "48px" }}>

              {/* Card 1 — Agency */}
              <div style={{
                flex: 1,
                borderTop: "1px solid rgba(255,255,255,0.10)",
                paddingTop: "36px",
                display: "flex",
                flexDirection: "column",
                opacity: isP2 ? 1 : 0,
                transform: isP2 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "150ms",
              }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: "16px" }}>
                  Hire Us · DFY
                </p>
                <h3 style={{ fontSize: "clamp(28px, 3.2vw, 44px)", fontWeight: 300, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "24px" }}>
                  Agency
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.85, color: "rgba(255,255,255,0.42)", flex: 1, marginBottom: "18px" }}>
                  Full site creation or redesign, development services, and design-to-Elementor
                  conversion. We handle everything so you can focus on growing your business.
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.72)", marginBottom: "32px" }}>
                  Find out whether you are a good fit.
                </p>
                <SiteLink href="#contact" theme="light">
                  Browse Services
                </SiteLink>
              </div>

              {/* Card 2 — Courses */}
              <div style={{
                flex: 1,
                borderTop: "1px solid rgba(255,255,255,0.10)",
                paddingTop: "36px",
                display: "flex",
                flexDirection: "column",
                opacity: isP2 ? 1 : 0,
                transform: isP2 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "300ms",
              }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: "16px" }}>
                  Learn How · DIY
                </p>
                <h3 style={{ fontSize: "clamp(28px, 3.2vw, 44px)", fontWeight: 300, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "24px" }}>
                  Courses
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.85, color: "rgba(255,255,255,0.42)", flex: 1, marginBottom: "18px" }}>
                  Step-by-step website development programs for small businesses and
                  individuals — complete at your own pace, no coding or design experience needed.
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.72)", marginBottom: "32px" }}>
                  Everything you need to know at a reasonable investment.
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  fontSize: "13px", color: "rgba(255,255,255,0.22)",
                  borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "3px",
                  alignSelf: "flex-start", cursor: "default",
                }}>
                  Enrollment Closed
                  <LockIcon />
                </span>
              </div>

            </div>
          </div>

          {/* ── PHASE 3: Vision & Mission ───────────────────────────────── */}
          <div
            className="services-vision-wrap"
            style={{
              position: "absolute",
              inset: 0,
              opacity: isP3 ? 1 : 0,
              pointerEvents: isP3 ? "auto" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 80px 60px",
              gap: "0px",
              transition: "opacity 0.6s ease"
            }}
          >
            {/* Left — Text content */}
            <div
              style={{
                flex: 1,
                maxWidth: "560px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Section label */}
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: "24px",
                  opacity: isP3 ? 1 : 0,
                  transform: isP3 ? "translateY(0)" : "translateY(30px)",
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                  transitionDelay: "0ms"
                }}
              >
                What Motivates Cylas Tee
              </p>

              {/* Heading */}
              <h2
                style={{
                  fontSize: "clamp(36px, 4.5vw, 64px)",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  marginBottom: "32px",
                  opacity: isP3 ? 1 : 0,
                  transform: isP3 ? "translateY(0)" : "translateY(30px)",
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                  transitionDelay: "100ms"
                }}
              >
                Personal Vision
                <br />
                <span style={{ color: "rgba(255,255,255,0.55)" }}>&amp; Mission</span>
              </h2>

              {/* Thin gold rule */}
              <div
                style={{
                  width: "40px",
                  height: "1px",
                  backgroundColor: "#AE8C3C",
                  marginBottom: "32px",
                  opacity: isP3 ? 1 : 0,
                  transform: isP3 ? "translateY(0)" : "translateY(30px)",
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                  transitionDelay: "180ms"
                }}
              />

              {/* Description */}
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.60)",
                  marginBottom: "40px",
                  maxWidth: "480px",
                  opacity: isP3 ? 1 : 0,
                  transform: isP3 ? "translateY(0)" : "translateY(30px)",
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                  transitionDelay: "260ms"
                }}
              >
                Cylas Tee&apos;s vision is to help individuals live to their fullest
                potential and attain a higher level of happiness. He can&apos;t do that
                alone. Understanding the impact personal brands can have, it&apos;s his
                mission to empower Personal Brands to spread their message in their niche
                and change their lives. This indirectly brings his vision to life.
              </p>

              {/* CTA link */}
              <div style={{
                opacity: isP3 ? 1 : 0,
                transform: isP3 ? "translateY(0)" : "translateY(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "340ms"
              }}>
                <SiteLink href="#portfolio" theme="light">
                  See Example Sites
                </SiteLink>
              </div>
            </div>

            {/* Vertical divider */}
            <div
              className="services-vision-divider"
              style={{
                width: "1px",
                height: "340px",
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.10) 70%, transparent)",
                flexShrink: 0,
                margin: "0 64px",
                opacity: isP3 ? 1 : 0,
                transition: "opacity 0.8s ease",
                transitionDelay: "260ms"
              }}
            />

            {/* Right — portrait image */}
            <FluidImage
              src="/Cylas Tee 2.png"
              alt="Cylas Tee"
              width={380}
              height={480}
              className="services-vision-portrait"
              style={{
                flexShrink: 0,
                width: "clamp(240px, 28vw, 380px)",
                opacity: isP3 ? 1 : 0,
                transform: isP3 ? "translateX(0)" : "translateX(30px)",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                transitionDelay: "420ms",
                position: "relative",
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Intersection-observer hook ───────────────────────────────────────────────
function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Shared label ─────────────────────────────────────────────────────────────
function SectionLabel() {
  return (
    <p
      style={{
        fontSize: "11px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.65)",
        marginBottom: "52px",
        textAlign: "center",
      }}
    >
      Primary Focus Areas
    </p>
  );
}

// ─── Section 1 ────────────────────────────────────────────────────────────────
function SectionOne() {
  const { ref, visible } = useReveal(0.15);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#AE8C3C",
        padding: "72px 52px 80px 52px",
        width: "100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: "opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      <SectionLabel />

      {/* Two-column layout: image left, text right */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "64px",
          maxWidth: "1140px",
          margin: "0 auto",
        }}
      >
        {/* Left — collage image */}
        <div
          style={{
            flexShrink: 0,
            width: "clamp(260px, 38%, 440px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-28px)",
            transition:
              "opacity 1.1s 0.15s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s 0.15s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <Image
            src="/Gold Section 1.png"
            alt="Cylas Tee with industry leaders"
            width={440}
            height={440}
            className="object-cover"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Right — heading + description */}
        <div
          style={{
            flex: 1,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(28px)",
            transition:
              "opacity 1.1s 0.25s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4.5vw, 52px)",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.18,
              marginBottom: "24px",
              letterSpacing: "-0.01em",
            }}
          >
            Passion For Personal Brands
          </h2>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.82)",
              maxWidth: "480px",
            }}
          >
            Cylas Tee Has Personally Experienced The Impact
            <br />A Single Individual Or A Small Team Can Make.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2 ────────────────────────────────────────────────────────────────
function SectionTwo() {
  const { ref, visible } = useReveal(0.12);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#AE8C3C",
        padding: "72px 52px 80px 52px",
        width: "100%",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition:
          "opacity 0.9s 0.08s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.9s 0.08s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      <SectionLabel />

      {/* Two-column layout: image left, text right */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "64px",
          maxWidth: "1140px",
          margin: "0 auto",
        }}
      >
        {/* Left — second collage image */}
        <div
          style={{
            flexShrink: 0,
            width: "clamp(260px, 38%, 440px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-28px)",
            transition:
              "opacity 1.1s 0.18s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s 0.18s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <Image
            src="/Gold Section 2.png"
            alt="Cylas Tee at events and with mentors"
            width={440}
            height={440}
            className="object-cover"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        {/* Right — detailed paragraphs */}
        <div
          style={{
            flex: 1,
            paddingTop: "8px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(28px)",
            transition:
              "opacity 1.1s 0.3s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.88)",
              marginBottom: "22px",
              maxWidth: "560px",
            }}
          >
            He Strongly Believes That Those Who Change The World Are Not Big
            Companies, But Small Medium Businesses And Talented Individuals.
          </p>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.88)",
              marginBottom: "22px",
              maxWidth: "560px",
            }}
          >
            Being In The Personal Growth Niche For Years, Cylas Tee Had Learned
            From Industry Leaders Like Gary Vee, Tony Robbins, Joel Bauer And Eben
            Pagan. He Has A Thorough Understanding Of How To Properly Build, Grow
            And Scale A Personal Brand Business.
          </p>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.88)",
              maxWidth: "560px",
            }}
          >
            Therefore, It Is The Only Logical Choice For Him To Help Personal Brands.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────
export default function PrimaryFocus() {
  return (
    <section id="primary-focus" style={{ width: "100%" }}>
      <SectionOne />
      <SectionTwo />
    </section>
  );
}

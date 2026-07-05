"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ContactCTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track global mouse — hooks into the same window.mousemove the fluid system uses
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // 3D Donut — Canvas 2D torus projection in amber/gold palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Tilt follows mouse (pitch + yaw)
      const tiltX = (my - 0.5) * 0.7;
      const tiltY = (mx - 0.5) * 0.7;

      const R = Math.min(w, h) * 0.28;  // major radius
      const r = R * 0.38;               // tube radius
      const RINGS = 56;
      const TUBE  = 28;

      for (let i = 0; i < RINGS; i++) {
        const theta = (i / RINGS) * Math.PI * 2 + t * 0.35;
        const cosT = Math.cos(theta + tiltY);
        const sinT = Math.sin(theta + tiltY);

        for (let j = 0; j < TUBE; j++) {
          const phi = (j / TUBE) * Math.PI * 2 + t * 0.65;
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // 3D torus coords
          let x3 = (R + r * cosPhi) * cosT;
          let y3 = (R + r * cosPhi) * sinT;
          let z3 = r * sinPhi;

          // Rotate around X (pitch)
          const yR = y3 * Math.cos(tiltX) - z3 * Math.sin(tiltX);
          const zR = y3 * Math.sin(tiltX) + z3 * Math.cos(tiltX);
          y3 = yR; z3 = zR;

          // Perspective projection
          const fov   = 800;
          const depth = fov / (fov + z3 + R * 1.5);
          const px    = cx + x3 * depth;
          const py    = cy + y3 * depth;

          // Gold hue range 28–65 (amber)
          const hue   = ((i / RINGS) * 38 + 28 + t * 6) % 360;
          const light = 40 + depth * 28;
          const alpha = Math.max(0, depth * 0.5 + 0.05);
          const dotR  = depth * r * 0.26;
          if (dotR < 0.5) continue;

          const grad = ctx.createRadialGradient(px, py, 0, px, py, dotR * 2.2);
          grad.addColorStop(0, `hsla(${hue}, 65%, ${light}%, ${alpha})`);
          grad.addColorStop(1, `hsla(${hue}, 65%, ${light}%, 0)`);

          ctx.beginPath();
          ctx.arc(px, py, dotR * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      t += 0.007;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        // White/warm background so the donut glows through the frosted glass
        backgroundColor: "#FAFAF8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Keyframe styles */}
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes ctaFadeUp {
            from { opacity: 0; transform: translateY(36px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ctaPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(174,140,60,0.25); }
            50%       { box-shadow: 0 0 0 18px rgba(174,140,60,0); }
          }
          .cta-primary:hover {
            background: #AE8C3C !important;
            color: #fff !important;
            border-color: #AE8C3C !important;
            transform: translateY(-3px) !important;
          }
          .cta-secondary:hover {
            color: #AE8C3C !important;
            letter-spacing: 0.3em !important;
          }
        `}} />
      )}

      {/* ── 3D Donut Canvas — sits BEHIND frosted glass ─────────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.9,
        }}
      />

      {/* ── Frosted glass overlay — WHITE / transparent white ───────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          // Semi-transparent white to let the donut glow through subtly
          background: "linear-gradient(160deg, rgba(250,250,248,0.78) 0%, rgba(250,250,248,0.65) 50%, rgba(250,250,248,0.82) 100%)",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "80px 24px",
          maxWidth: "860px",
          margin: "0 auto",
          animation: "ctaFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#AE8C3C",
            fontWeight: 600,
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          <span style={{ display: "inline-block", width: "36px", height: "1px", backgroundColor: "#AE8C3C", opacity: 0.5 }} />
          Ready to build something exceptional
          <span style={{ display: "inline-block", width: "36px", height: "1px", backgroundColor: "#AE8C3C", opacity: 0.5 }} />
        </p>

        {/* Headline */}
        <h2
          style={{
            fontSize: "clamp(48px, 9vw, 108px)",
            fontWeight: 200,
            color: "#0B1014",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: "12px",
          }}
        >
          Let&apos;s create
        </h2>
        <h2
          style={{
            fontSize: "clamp(48px, 9vw, 108px)",
            fontWeight: 200,
            color: "transparent",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: "48px",
            WebkitTextStroke: "1px rgba(174,140,60,0.65)",
          }}
        >
          together.
        </h2>

        {/* Supporting copy */}
        <p
          style={{
            fontSize: "clamp(15px, 2vw, 17px)",
            lineHeight: 1.85,
            color: "rgba(11,16,20,0.55)",
            fontWeight: 300,
            maxWidth: "520px",
            margin: "0 auto 56px",
          }}
        >
          Cylas Tee builds digital experiences that move people — from personal brands
          to revenue-generating funnels. One conversation is all it takes.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/contact"
            id="contact-cta-primary"
            className="cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "20px 52px",
              backgroundColor: "#0B1014",
              border: "1px solid #0B1014",
              color: "#F8F5EE",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "2px",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              animation: "ctaPulse 3s ease-in-out infinite",
            }}
          >
            Start A Conversation
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <Link
            href="/contact"
            className="cta-secondary"
            style={{
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(11,16,20,0.4)",
              textDecoration: "none",
              transition: "all 0.4s ease",
            }}
          >
            Or send a direct email →
          </Link>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          borderTop: "1px solid rgba(11,16,20,0.07)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <p style={{ fontSize: "11px", color: "rgba(11,16,20,0.3)", margin: 0 }}>
          &copy; {new Date().getFullYear()} Cylas Tee &nbsp;&middot;&nbsp;
          <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#AE8C3C"}
            onMouseOut={e => e.currentTarget.style.color = "rgba(11,16,20,0.3)"}
          >Privacy</a>
          &nbsp;&middot;&nbsp;
          <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#AE8C3C"}
            onMouseOut={e => e.currentTarget.style.color = "rgba(11,16,20,0.3)"}
          >Terms</a>
        </p>

        {/* Social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {[
            { label: "Facebook",  path: "M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.009C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" },
            { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
            { label: "X",         path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
            { label: "YouTube",   path: "M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
          ].map(s => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              style={{ color: "rgba(11,16,20,0.3)", transition: "color 0.25s ease" }}
              onMouseOver={e => e.currentTarget.style.color = "#AE8C3C"}
              onMouseOut={e => e.currentTarget.style.color = "rgba(11,16,20,0.3)"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        <p style={{ fontSize: "11px", color: "rgba(11,16,20,0.18)", margin: 0 }}>
          Not affiliated with or endorsed by Facebook, Inc.
        </p>
      </div>
    </section>
  );
}

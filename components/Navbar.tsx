"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import SiteLink from "./SiteLink";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGoldenFullscreen, setIsGoldenFullscreen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Track if golden section covers the logo
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("track-record");
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionH = el.offsetHeight;
      const viewH = window.innerHeight;

      // progress: 0 when sticky starts, 1 when sticky ends
      const scrollable = sectionH - viewH;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / scrollable, 0), 1);

      // ease out progress
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeP = ease(p);
      const scaleY = 0.42 + (1 - 0.42) * easeP;

      // Calculate panel top and bottom relative to viewport
      let panelTop = 0;
      let panelBottom = 0;

      if (rect.top > 0) {
        panelTop = rect.top + (1 - scaleY) / 2 * viewH;
        panelBottom = rect.top + (1 + scaleY) / 2 * viewH;
      } else if (rect.bottom < viewH) {
        panelTop = rect.bottom - viewH + (1 - scaleY) / 2 * viewH;
        panelBottom = rect.bottom - viewH + (1 + scaleY) / 2 * viewH;
      } else {
        panelTop = (1 - scaleY) / 2 * viewH;
        panelBottom = (1 + scaleY) / 2 * viewH;
      }

      // logo is at top of viewport (y: 0 to 58).
      // So logo is covered if panelTop <= 28 && panelBottom >= 58
      const isCoveringLogo = panelTop <= 28 && panelBottom >= 58;
      setIsGoldenFullscreen(isCoveringLogo);

      // Check if testimonials (light section) is under the navbar
      const testEl = document.getElementById("testimonials");
      if (testEl) {
        const testRect = testEl.getBoundingClientRect();
        // If the top of the testimonials section is at or above the navbar area
        setIsLightSection(testRect.top <= 60 && testRect.bottom >= 20);
      } else {
        setIsLightSection(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDarkText = isLightSection && !menuOpen;
  const textColor = isDarkText ? "text-[#0B1014]" : "text-white";
  const bgColor = isDarkText ? "bg-[#0B1014]" : "bg-white";
  const iconFill = isDarkText ? "#0B1014" : "white";

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between"
        style={{ padding: "28px 48px" }}
      >
        {/* Animated Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center gap-3 text-xs tracking-widest uppercase hover:text-[#AE8C3C] transition-colors focus:outline-none z-50 cursor-pointer ${textColor}`}
          aria-label="Toggle menu"
        >
          <div className="relative w-8 h-2.5 flex flex-col justify-between">
            <span
              className={`block h-[1.5px] w-8 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[4.25px] bg-[#AE8C3C]" : bgColor
              }`}
            />
            <span
              className={`block h-[1.5px] w-8 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[4.25px] bg-[#AE8C3C]" : bgColor
              }`}
            />
          </div>
          <span className={menuOpen ? "text-[#AE8C3C]" : textColor}>
            {menuOpen ? "Close" : "Menu"}
          </span>
        </button>

        {/* Logo — absolutely centered */}
        <Link
          href="/"
          className={`absolute left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${
            menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-label="Cylas Tee Home"
        >
          <svg
            width="130"
            height="30"
            viewBox="0 0 149 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-auto h-[30px]"
          >
            <path
              d="M16.2377 12.9938C17.2501 12.2705 18.2625 11.5472 19.2749 10.8239C18.7864 10.1475 18.2288 9.67499 17.6659 9.28076C14.9867 7.526 12.0492 7.06783 9.09596 7.42148C5.53839 7.81157 2.29186 10.5343 1.09088 13.7075L1.13862 13.6203C1.11603 13.6649 1.09361 13.7098 1.07137 13.7551C-1.05322 17.8618 0.16487 22.9753 3.13349 25.7489C3.51691 26.1409 3.90864 26.4942 4.32716 26.8394C4.32716 26.8394 4.32716 26.8394 4.32716 26.8394C3.98239 26.4206 3.67372 25.9989 3.38321 25.5492C1.09685 22.2064 1.29883 17.926 3.37959 15.0895C3.40166 15.0581 3.42381 15.0272 3.44604 14.9966L3.49378 14.9093C4.88889 12.605 7.14526 11.4313 9.596 11.1205C11.6329 10.8397 13.9942 11.2981 15.5376 12.3473C15.8498 12.5621 16.1048 12.8048 16.2377 12.9938Z"
              fill={isGoldenFullscreen ? "rgba(255, 255, 255, 0.4)" : "#AE8C3C"}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <path
              d="M16.8362 23.3398C17.7431 24.1917 18.6499 25.0436 19.5568 25.8955C19.2422 26.2304 18.9081 26.5503 18.5546 26.8517C16.8904 28.2879 14.7112 29.2661 12.4647 29.4596C10.3853 29.6546 8.36374 29.0486 6.68384 28.1418C6.04118 27.809 5.51598 27.3916 5.05555 26.9502C2.59469 24.5062 1.68842 20.9572 2.56375 18.0069C2.67964 17.6176 2.82451 17.2452 2.99658 16.8858C2.92362 17.2775 2.88562 17.6672 2.8797 18.0563C2.843 20.9969 4.65234 23.558 6.72896 24.8746C7.1032 25.1053 7.4973 25.2797 7.8428 25.3596C9.3257 25.7761 10.7742 25.8692 12.1217 25.7427C13.5917 25.6111 14.9763 25.0018 16.1331 24.0111C16.3774 23.8029 16.6119 23.5786 16.8362 23.3398Z"
              fill={iconFill}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <rect x="28.3281" y="19.1963" width="3.55492" height="10.1315" fill={iconFill} style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} />
            <path
              d="M19.7891 7.99854L24.2327 7.99854L31.8758 19.1965L28.7764 21.0771L19.7891 7.99854Z"
              fill={iconFill}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <path
              d="M39.8672 8.12891L36.1484 8.12891L30.3006 16.3523L33.8645 16.4744L39.8672 8.12891Z"
              fill={isGoldenFullscreen ? "rgba(255, 255, 255, 0.4)" : "#AE8C3C"}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <path
              d="M42.0399 29V7.05121H46.0159V25.667H55.6828V29H42.0399ZM63.3812 29H59.1372L66.8643 7.05121H71.7728L79.5106 29H75.2666L69.4043 11.5524H69.2328L63.3812 29ZM63.5205 20.3941H75.0951V23.5878H63.5205V20.3941ZM94.5797 13.085C94.4796 12.149 94.0581 11.4203 93.315 10.8987C92.5791 10.3771 91.6217 10.1163 90.4428 10.1163C89.614 10.1163 88.9031 10.2414 88.3101 10.4914C87.7171 10.7415 87.2634 11.0809 86.949 11.5096C86.6347 11.9382 86.4739 12.4277 86.4668 12.9778C86.4668 13.4351 86.5704 13.8316 86.7776 14.1674C86.9919 14.5032 87.2813 14.789 87.6456 15.0248C88.01 15.2534 88.4137 15.4463 88.8567 15.6035C89.2997 15.7607 89.7462 15.8929 90.1963 16.0001L92.254 16.5145C93.0828 16.7074 93.8795 16.9682 94.644 17.2968C95.4156 17.6255 96.1051 18.0399 96.7124 18.54C97.3268 19.0402 97.8127 19.6439 98.1699 20.3512C98.5272 21.0586 98.7058 21.8874 98.7058 22.8376C98.7058 24.1237 98.3771 25.2561 97.7198 26.235C97.0625 27.2067 96.1122 27.9676 94.869 28.5177C93.633 29.0607 92.1361 29.3322 90.3785 29.3322C88.6709 29.3322 87.1884 29.0679 85.9309 28.5392C84.6806 28.0104 83.7017 27.2388 82.9944 26.2243C82.2942 25.2097 81.9155 23.9736 81.8584 22.5161H85.7701C85.8273 23.2806 86.0631 23.9165 86.4775 24.4238C86.8919 24.931 87.4313 25.3097 88.0958 25.5598C88.7674 25.8099 89.5176 25.9349 90.3464 25.9349C91.2109 25.9349 91.9682 25.8063 92.6184 25.5491C93.2757 25.2847 93.7902 24.9203 94.1617 24.4559C94.5332 23.9844 94.7226 23.4342 94.7297 22.8055C94.7226 22.2339 94.5547 21.7623 94.226 21.3908C93.8973 21.0121 93.4365 20.6978 92.8435 20.4477C92.2576 20.1905 91.5717 19.9618 90.7858 19.7618L88.2887 19.1188C86.481 18.6543 85.0521 17.9506 84.0018 17.0075C82.9587 16.0572 82.4371 14.7962 82.4371 13.2243C82.4371 11.9311 82.7872 10.7987 83.4874 9.82696C84.1947 8.85527 85.1557 8.1015 86.3703 7.56564C87.5849 7.02264 88.9603 6.75113 90.4964 6.75113C92.054 6.75113 93.4186 7.02264 94.5904 7.56564C95.7693 8.1015 96.6945 8.84813 97.3661 9.80553C98.0377 10.7558 98.3843 11.8489 98.4057 13.085H94.5797Z"
              fill={iconFill}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <path
              opacity="0.5"
              d="M99.5861 8.8517V7.05121H115.501V8.8517H108.546V29H106.542V8.8517H99.5861ZM117.901 29V7.05121H130.633V8.8517H119.905V17.1146H129.957V18.9151H119.905V27.1995H130.847V29H117.901ZM133.707 29V7.05121H146.439V8.8517H135.711V17.1146H145.764V18.9151H135.711V27.1995H146.653V29H133.707Z"
              fill={iconFill}
              style={{ transition: "fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </svg>
        </Link>

        {/* CTA */}
        <div
          className={`z-50 transition-opacity duration-300 ${
            menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <SiteLink
            href="#contact"
            theme={isDarkText ? "dark" : "light"}
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: "13px", color: isDarkText ? "#0B1014" : "#fff" }}
          >
            Let&apos;s Chat
          </SiteLink>
        </div>
      </nav>

      {/* Full Screen Minimalist Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 w-screen h-screen z-40 bg-[#0B1014]/95 backdrop-blur-xl flex animate-fade-in"
          style={{ padding: "100px 0 0 0" }}
        >
          {/* Subtle background glow circles */}
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#AE8C3C]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#AE8C3C]/5 rounded-full blur-[150px] pointer-events-none" />

          {/* Left — Nav Links (centered vertically) */}
          <div className="flex-1 flex flex-col justify-center" style={{ padding: "0 48px 60px 48px" }}>
            <div className="flex flex-col gap-5 max-w-2xl w-full">
              {[
                { name: "Services", num: "01", desc: "Crafting modern identity & experience" },
                { name: "About", num: "02", desc: "Designing for personal brands" },
                { name: "Portfolio", num: "03", desc: "Explore selected case studies" },
                { name: "Contact", num: "04", desc: "Let's construct your vision" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={`#${item.name.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-baseline gap-6 border-b border-white/5 pb-4 hover:border-[#AE8C3C]/30 transition-colors duration-300"
                >
                  <span className="text-xs font-mono text-[#AE8C3C]/60 tracking-wider w-6 flex-shrink-0">
                    {item.num}
                  </span>
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-8">
                    <span className="text-5xl md:text-7xl font-light tracking-tight text-white group-hover:translate-x-2 transition-all duration-300 relative">
                      {item.name}
                      <span className="absolute bottom-[-4px] left-0 h-[1px] w-0 group-hover:w-full bg-white/60 transition-all duration-500" />
                    </span>
                    <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                      — {item.desc}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-[1px] bg-white/5 self-stretch my-20" />

          {/* Right — Get In Touch Panel */}
          <div
            className="hidden md:flex flex-col justify-center"
            style={{ width: "320px", padding: "0 48px 60px 48px" }}
          >
            {/* Panel title */}
            <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(174,140,60,0.7)", marginBottom: "32px", fontFamily: "monospace" }}>
              Get In Touch
            </p>

            {/* Social */}
            <div style={{ marginBottom: "36px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "14px", fontFamily: "monospace" }}>
                Social
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { name: "LinkedIn", url: "#" },
                  { name: "Dribbble", url: "#" },
                  { name: "Twitter / X", url: "#" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-200"
                    style={{ fontSize: "13px" }}
                  >
                    <span className="w-[18px] h-[1px] bg-white/20 group-hover:w-[28px] group-hover:bg-[#AE8C3C] transition-all duration-300 flex-shrink-0" />
                    {s.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "36px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "14px", fontFamily: "monospace" }}>
                Email
              </p>
              <a
                href="mailto:cylas@cylastee.com"
                className="group inline-flex text-white/60 hover:text-white transition-colors duration-200"
                style={{ fontSize: "13px", fontFamily: "monospace", borderBottom: "1px solid transparent" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                cylas@cylastee.com
              </a>
            </div>

            {/* Location */}
            <div>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "14px", fontFamily: "monospace" }}>
                Location
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: "2px", flexShrink: 0, opacity: 0.4 }}>
                  <path d="M6 0C3.24 0 1 2.24 1 5C1 8.75 6 14 6 14C6 14 11 8.75 11 5C11 2.24 8.76 0 6 0ZM6 6.5C5.17 6.5 4.5 5.83 4.5 5C4.5 4.17 5.17 3.5 6 3.5C6.83 3.5 7.5 4.17 7.5 5C7.5 5.83 6.83 6.5 6 6.5Z" fill="white"/>
                </svg>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.5" }}>
                  London,<br />United Kingdom
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";

export default function FooterCTA() {
  return (
    <>
      {/* ── CTA Section ── */}
      <section
        id="contact"
        style={{
          backgroundColor: "#0B1014",
          padding: "160px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 25,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#AE8C3C",
            marginBottom: "24px",
          }}
        >
          Got A Question?
        </p>
        <h2
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 300,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "32px",
          }}
        >
          Send Us A Message
        </h2>
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.6)",
            maxWidth: "500px",
            marginBottom: "48px",
          }}
        >
          Each message is personally read and replied to by Cylas Tee. He usually tries to respond to all queries within 24 hours. We look forward to your note.
        </p>
        <Link
          href="mailto:cylas@cylastee.com"
          style={{
            backgroundColor: "#AE8C3C",
            color: "#000000",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "18px 42px",
            borderRadius: "2px",
            textDecoration: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c29d44")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#AE8C3C")}
        >
          Contact Us
        </Link>
      </section>

      {/* ── Footer Section ── */}
      <footer
        style={{
          backgroundColor: "#05080A",
          padding: "80px 48px 40px",
          position: "relative",
          zIndex: 25,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "64px",
              justifyContent: "space-between",
              marginBottom: "80px",
            }}
          >
            {/* Left: Brand */}
            <div style={{ maxWidth: "320px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.1em", marginBottom: "24px" }}>
                CYLAS<span style={{ color: "rgba(255,255,255,0.5)" }}>TEE</span>
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: "32px" }}>
                Helping Individuals Increase Their Online Reach &amp; Presence, Starting With Their Personal Brand Website
              </p>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "2px",
                  color: "#FFFFFF",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>

            {/* Middle/Right: Links */}
            <div style={{ display: "flex", gap: "80px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFFFFF", marginBottom: "24px" }}>
                  Work With Us
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {["One Page Website", "Full Website Creation", "Hosting & Maintenance Plans", "Elementor Development"].map((link) => (
                    <Link key={link} href="#" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFFFFF", marginBottom: "24px" }}>
                  Learn More
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {["Portfolio", "Resources", "Blog", "Contact"].map((link) => (
                    <Link key={link} href="#" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s ease" }} onMouseOver={(e) => e.currentTarget.style.color = "#FFFFFF"} onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Disclaimer & Copyright */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", lineHeight: 1.6, color: "rgba(255,255,255,0.3)", maxWidth: "800px", margin: "0 auto 24px" }}>
              This site is not part of Facebook website or Facebook Inc. Additionally this site is NOT endorsed by Facebook in any way. Facebook is a trademark of Facebook, Inc.<br />
              Disclaimer: The information contained on cylastee.com website is for general information purposes only. Cylas Tee assumes no responsibility for errors or omissions in the contents.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              &copy; 2023, Cylas Tee &bull; Terms &amp; Conditions &bull; Privacy Policy
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

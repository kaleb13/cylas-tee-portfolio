"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between"
        style={{ padding: "28px 48px" }}
      >
        {/* Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-white hover:text-[#AE8C3C] transition-colors"
          aria-label="Toggle menu"
        >
          <Image src="/menu.svg" alt="" width={18} height={18} />
          Menu
        </button>

        {/* Logo — absolutely centered */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/logo.svg" alt="Cylas Tee" width={130} height={30} priority />
        </Link>

        {/* CTA */}
        <Link
          href="#contact"
          className="text-sm text-white hover:text-[#AE8C3C] transition-colors flex items-center gap-1.5"
        >
          Let&apos;s chat
          <Image src="/arrow.svg" alt="" width={14} height={14} />
        </Link>
      </nav>

      {menuOpen && (
        <div
          className="fixed top-[84px] left-0 w-full z-40 bg-[#0B1014] border-t border-[#AE8C3C]/20 flex flex-col gap-4"
          style={{ padding: "24px 48px" }}
        >
          {["Services", "About", "Portfolio", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white hover:text-[#AE8C3C] transition-colors flex items-center gap-2"
            >
              {item}
              <Image src="/arrow.svg" alt="" width={14} height={14} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

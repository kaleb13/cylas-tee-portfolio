"use client";

import { useState } from "react";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  /** dark = underline is dark/black (for light sections), light = white (default) */
  theme?: "light" | "dark";
  showArrow?: boolean;
  external?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * SiteLink — the single shared link component used across all sections.
 *
 * Rules:
 * - No underline at rest
 * - Underline appears on hover (gold tint on dark bg, dark tint on light bg)
 * - Title Case label (caller's responsibility)
 * - Font: inherit (set globally to the site font, weight 300)
 * - Optional trailing arrow icon (same /arrow.svg used everywhere)
 */
export default function SiteLink({
  href,
  children,
  theme = "light",
  showArrow = true,
  external = false,
  onClick,
  style,
  className = "",
}: NavLinkProps) {
  const [hovered, setHovered] = useState(false);

  const underlineColor =
    theme === "dark" ? "rgba(11,16,20,0.55)" : "rgba(255,255,255,0.65)";

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 300,
    letterSpacing: "0.05em",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    pointerEvents: "auto",
    ...style,
  };

  const arrowEl = showArrow ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M14.125 5.875L5.875 14.125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.32812 5.8335L14.1198 5.87433L14.1615 11.6668"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : null;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={base}
        className={className}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <span
          style={{
            borderBottom: `1px solid ${hovered ? underlineColor : "transparent"}`,
            paddingBottom: "2px",
            transition: "border-color 0.28s ease",
          }}
        >
          {children}
        </span>
        {arrowEl}
      </a>
    );
  }

  return (
    <Link
      href={href}
      style={base}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span
        style={{
          borderBottom: `1px solid ${hovered ? underlineColor : "transparent"}`,
          paddingBottom: "2px",
          transition: "border-color 0.28s ease",
        }}
      >
        {children}
      </span>
      {arrowEl}
    </Link>
  );
}

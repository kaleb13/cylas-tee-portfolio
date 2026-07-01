import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div
      style={{
        backgroundColor: "#AE8C3C",
        borderRadius: "2px",
        padding: "48px 52px 44px 52px",
        width: "100%",
      }}
    >
      {/* Label */}
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
        className="inline-flex items-center gap-2 text-white text-sm hover:opacity-70 transition-opacity"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.6)", paddingBottom: "3px" }}
      >
        More About Cylas Tee
        <Image src="/arrow.svg" alt="" width={14} height={14} />
      </Link>
    </div>
  );
}

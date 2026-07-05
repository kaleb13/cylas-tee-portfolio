import Image from "next/image";
import Link from "next/link";


export default function TrackRecord() {
  return (
    <section
      id="track-record"
      className="w-full"
      style={{ backgroundColor: "#0B1014", padding: "80px 48px" }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "32px",
        }}
      >
        Proven Track Record
      </p>

      {/* Two-column row — gap tightened */}
      <div
        className="flex flex-col md:flex-row md:items-start"
        style={{ gap: "40px" }}
      >
        {/* Left — big heading + icon */}
        <div className="flex items-start gap-4 flex-shrink-0">
          <h2
            className="font-bold text-white leading-tight"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Top Rated Plus<br />On Upwork.
          </h2>
          <Image
            src="/upwork-icon.png"
            alt="Upwork Top Rated Plus"
            width={52}
            height={52}
            className="object-contain mt-1 flex-shrink-0"
          />
        </div>

        {/* Right — description + link, sits right next to the heading */}
        <div style={{ maxWidth: "320px", paddingTop: "6px" }}>
          <p
            className="text-gray-400 leading-relaxed mb-5"
            style={{ fontSize: "13px" }}
          >
            Cylas Tee Has Already Accumulated Over 6 Figures On Upwork, And
            That&apos;s Only One Source Of Clients And Income. Figures On
            Upwork Don&apos;t Lie.
          </p>
          <Link
            href="https://www.upwork.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white text-sm hover:text-[#AE8C3C] link-hover-gold"
            style={{ paddingBottom: "2px" }}
          >
            See Upwork Profile
            <Image src="/arrow.svg" alt="" width={14} height={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GoldenExpand from "@/components/GoldenExpand";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0B1014" }} className="relative">
      <Navbar />
      <Hero />
      <GoldenExpand />
    </main>
  );
}

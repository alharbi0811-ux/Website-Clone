import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HelpTools } from "@/components/sections/HelpTools";
import { Faq } from "@/components/sections/Faq";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 container mx-auto px-4 max-w-4xl py-2" dir="rtl">
      <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.12)" }} />
      <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: "rgba(123,47,190,0.4)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.12)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <Navbar />
      <main>
        <Hero />
        <SectionDivider label="عن اللعبة" />
        <About />
        <SectionDivider label="أدواتك" />
        <HelpTools />
        <SectionDivider label="مساعدة" />
        <Faq />
        <div className="h-16" />
      </main>
    </div>
  );
}

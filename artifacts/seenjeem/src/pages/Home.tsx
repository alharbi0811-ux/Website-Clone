import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HelpTools } from "@/components/sections/HelpTools";
import { Faq } from "@/components/sections/Faq";
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HelpTools />
        <Faq />
      </main>
    </div>
  );
}

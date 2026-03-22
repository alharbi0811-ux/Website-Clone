import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HelpTools } from "@/components/sections/HelpTools";
import { SocialReels } from "@/components/sections/SocialReels";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HelpTools />
        <SocialReels />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

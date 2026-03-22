import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Categories } from "@/components/sections/Categories";
import { HelpTools } from "@/components/sections/HelpTools";
import { Gift } from "@/components/sections/Gift";
import { TvShow } from "@/components/sections/TvShow";
import { SocialReels } from "@/components/sections/SocialReels";
import { Faq } from "@/components/sections/Faq";
import { Cta } from "@/components/sections/Cta";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Categories />
        <HelpTools />
        <Gift />
        <TvShow />
        <SocialReels />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

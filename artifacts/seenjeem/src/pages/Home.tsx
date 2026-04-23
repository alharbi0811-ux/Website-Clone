import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Swords, BookOpenCheck, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HelpTools } from "@/components/sections/HelpTools";
import { Faq } from "@/components/sections/Faq";

const ACTION_CARDS = [
  {
    Icon: Swords,
    title: "إنشاء لعبة",
    desc: "قسّم الفريقين، اختار الفئات، وابدأ التحدي الحقيقي",
    badge: "٦ فئات  •  ٣٦ سؤال",
    gradient: "linear-gradient(135deg, #6d28d9 0%, #4a1a7e 100%)",
    glow: "rgba(109,40,217,0.38)",
    path: "/start-game",
  },
  {
    Icon: BookOpenCheck,
    title: "وضع الدراسة",
    desc: "حوّل المذاكرة إلى تحدي ممتع بين فريقين",
    badge: "مراجعة  •  اختبار  •  تحدي",
    gradient: "linear-gradient(135deg, #9b59f5 0%, #6d28d9 100%)",
    glow: "rgba(155,89,245,0.35)",
    path: "/study-setup",
  },
];

function ActionCards() {
  const [, navigate] = useLocation();
  return (
    <section className="relative z-10 -mt-10 pb-4" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {ACTION_CARDS.map(({ Icon, title, desc, badge, gradient, glow, path }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ y: -7 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path)}
              className="relative rounded-3xl overflow-hidden cursor-pointer p-7 group"
              style={{
                background: gradient,
                boxShadow: `0 10px 40px ${glow}`,
                transition: "box-shadow 0.3s, transform 0.3s",
              }}
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 55%, transparent 70%)" }} />

              {/* Radial glow */}
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />

              {/* Dot grid pattern */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

              <div className="relative z-10">
                {/* Icon box */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}>
                  <Icon size={28} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-black text-white mb-2 leading-tight">{title}</h3>

                {/* Description */}
                <p className="text-white/75 font-medium text-base mb-5 leading-relaxed">{desc}</p>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <span className="text-white/45 text-xs font-bold tracking-wide">{badge}</span>
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:-translate-x-1 transition-transform duration-300"
                    style={{ background: "rgba(255,255,255,0.2)" }}>
                    <ArrowLeft size={18} className="text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Divider ── */
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
        <ActionCards />
        <SectionDivider label="عن اللعبة" />
        <About />
        <SectionDivider label="أدواتك" />
        <HelpTools />
        <SectionDivider label="مساعدة" />
        <Faq />
        {/* Footer spacing */}
        <div className="h-16" />
      </main>
    </div>
  );
}

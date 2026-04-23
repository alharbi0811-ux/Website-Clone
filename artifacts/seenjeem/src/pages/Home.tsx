import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Swords, BookOpenCheck } from "lucide-react";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HelpTools } from "@/components/sections/HelpTools";
import { Faq } from "@/components/sections/Faq";

/* ─────────────────── Game Modes ─────────────────── */

const MODES = [
  {
    Icon: Swords,
    title: "إنشاء لعبة",
    desc: "قسّم الفريقين، اختار الفئات\nوابدأ التحدي الحقيقي",
    cta: "ابدأ اللعبة",
    badge: null,
    bg: "linear-gradient(145deg, #0f0022 0%, #2d0a6e 55%, #5b1db8 100%)",
    border: "rgba(139,92,246,0.45)",
    glow: "rgba(109,40,217,0.55)",
    glowHover: "rgba(139,92,246,0.22)",
    accent: "#a78bfa",
    accentBg: "rgba(139,92,246,0.85)",
    path: "/start-game",
  },
  {
    Icon: BookOpenCheck,
    title: "وضع الدراسة",
    desc: "حوّل المذاكرة إلى تحدي\nممتع بين فريقين",
    cta: "ادخل وضع الدراسة",
    badge: "الأفضل للمراجعة",
    bg: "linear-gradient(145deg, #080018 0%, #1e0856 55%, #4c14a8 100%)",
    border: "rgba(167,139,250,0.4)",
    glow: "rgba(79,50,180,0.5)",
    glowHover: "rgba(167,139,250,0.18)",
    accent: "#c4b5fd",
    accentBg: "rgba(109,40,217,0.85)",
    path: "/study-setup",
  },
];

function GameModes() {
  const [, navigate] = useLocation();
  return (
    <section className="py-10 pb-6" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.15)" }} />
          <span className="text-[10px] font-black tracking-[0.35em] uppercase"
            style={{ color: "rgba(123,47,190,0.45)" }}>اختر وضع اللعب</span>
          <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.15)" }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODES.map(({ Icon, title, desc, cta, badge, bg, border, glow, glowHover, accent, accentBg, path }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 280, damping: 24 }}
              whileHover={{ scale: 1.025, boxShadow: `0 28px 70px ${glow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path)}
              className="relative group cursor-pointer rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: bg,
                border: `1.5px solid ${border}`,
                boxShadow: `0 10px 40px ${glow}`,
                minHeight: 320,
              }}
            >
              {/* Scanline texture */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)" }} />

              {/* Radial center glow on hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 50% 35%, ${glowHover}, transparent 68%)` }} />

              {/* Top shimmer on hover */}
              <div className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)" }} />

              {/* Corner brackets */}
              {["top-4 right-4 border-t-2 border-r-2", "top-4 left-4 border-t-2 border-l-2",
                "bottom-4 right-4 border-b-2 border-r-2", "bottom-4 left-4 border-b-2 border-l-2"].map((cls, j) => (
                <div key={j} className={`absolute w-6 h-6 pointer-events-none ${cls}`}
                  style={{ borderColor: `${accent}60` }} />
              ))}

              {/* Badge */}
              {badge && (
                <div className="absolute top-5 left-5">
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="px-3 py-1 rounded-full text-[11px] font-black"
                    style={{ background: "rgba(255,255,255,0.1)", color: accent, border: `1px solid ${accent}50` }}>
                    {badge}
                  </motion.div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-10 flex-1">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${accent}45`,
                    boxShadow: `0 0 24px ${accent}20`,
                  }}>
                  <Icon size={38} style={{ color: accent }} />
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                  {title}
                </h2>

                {/* Description */}
                <p className="font-medium text-lg mb-8 leading-relaxed whitespace-pre-line"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  {desc}
                </p>

                {/* CTA button */}
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className="py-4 px-10 rounded-2xl font-black text-white text-lg transition-all duration-300"
                  style={{
                    background: accentBg,
                    border: `1px solid ${accent}50`,
                    boxShadow: `0 0 24px ${glow}`,
                  }}>
                  {cta}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Section Divider ─────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 container mx-auto px-4 max-w-5xl py-2" dir="rtl">
      <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.1)" }} />
      <span className="text-[10px] font-black tracking-[0.35em] uppercase"
        style={{ color: "rgba(123,47,190,0.38)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(123,47,190,0.1)" }} />
    </div>
  );
}

/* ─────────────────── Page ─────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <Navbar />
      <main>
        {/* 1 ── Brand hero (compact) */}
        <Hero />

        {/* 2 ── Game modes — the most prominent section */}
        <GameModes />

        {/* 3 ── Quick stats strip */}
        <About />

        <SectionDivider label="أدواتك" />

        {/* 4 ── Help tools / features */}
        <HelpTools />

        <SectionDivider label="مساعدة" />

        {/* 5 ── FAQ */}
        <Faq />

        <div className="h-16" />
      </main>
    </div>
  );
}

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center" style={{ minHeight: "52vh" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[4rem]">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,0,26,0.15) 0%, rgba(8,0,26,0.55) 100%)" }} />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center pt-24 pb-8">
        {/* Logo */}
        <motion.img
          src="/logo-white.png"
          alt="ركز"
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="w-40 md:w-60 lg:w-80 mb-4"
          style={{
            mixBlendMode: "screen",
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6)) drop-shadow(0 0 28px rgba(200,150,255,0.3))",
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-white font-black text-3xl md:text-4xl tracking-wide mb-2"
          dir="rtl"
        >
          فكر بسرعة...  جاوب بدقة
        </motion.p>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-white/65 font-semibold text-lg md:text-xl"
          dir="rtl"
        >
          لعبة أسئلة جماعية — فئات متنوعة لكل المناسبات
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={22} className="text-white/35" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

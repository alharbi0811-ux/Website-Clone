import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const [, navigate] = useLocation();
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center pt-24 pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[5rem]">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover object-top" />
        {/* Extra subtle dark vignette at bottom */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center mt-8 md:mt-16">

        {/* Logo + tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-4 flex flex-col items-center"
        >
          <img
            src="/logo-white.png"
            alt="ركز"
            className="w-48 md:w-72 lg:w-96"
            style={{
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 22px rgba(255,255,255,0.25))",
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tracking-wide mt-2 text-white font-black text-[38px]"
            dir="rtl"
          >
            فكر بسرعة...  جاوب بدقة
          </motion.p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium mb-12 max-w-3xl leading-relaxed"
        >
          ٦ فئات، ٣٦ سؤال، و معاهم ٣ وسائل مساعدة
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-lg justify-center"
        >
          <button
            onClick={() => navigate("/start-game")}
            className="group relative w-full sm:w-auto bg-gradient-to-l from-[#9b59f5] to-[#7B2FBE] text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-[0_0_28px_rgba(123,47,190,0.5)] hover:shadow-[0_0_45px_rgba(123,47,190,0.8)] hover:-translate-y-1 transition-all overflow-hidden"
          >
            <span className="relative z-10">إنشاء لعبة</span>
            <div className="absolute inset-0 bg-white/15 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12" />
          </button>
          <button
            onClick={() => navigate("/study-setup")}
            className="group relative w-full sm:w-auto bg-gradient-to-l from-[#9b59f5] to-[#7B2FBE] text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-[0_0_28px_rgba(123,47,190,0.6)] hover:shadow-[0_0_45px_rgba(123,47,190,0.9)] hover:-translate-y-1 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex flex-col items-center gap-0.5">
              <span>وضع الدراسة</span>
              <span className="text-xs font-medium text-white/70">حوّل المذاكرة إلى تحدي</span>
            </span>
            <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12" />
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col items-center gap-1"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={26} className="text-white/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

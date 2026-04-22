import { motion } from "framer-motion";
import { useLocation } from "wouter";

export function Hero() {
  const [, navigate] = useLocation();
  return (
    <section className="relative min-h-[80vh] sm:min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-10 sm:pt-24 sm:pb-12">
      {/* Background image */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[4rem] sm:rounded-b-[7rem]">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center mt-8 sm:mt-12 md:mt-24">

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-4 flex flex-col items-center"
        >
          <img
            src="/logo-white.png"
            alt="ركز"
            className="w-36 sm:w-48 md:w-72 lg:w-96"
            style={{
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.25))",
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="tracking-wide mt-2 text-[#ffffff] font-black"
            style={{ fontSize: "clamp(1.25rem, 4vw, 2.375rem)" }}
            dir="rtl"
          >فكر بسرعة… جاوب بدقة</motion.p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white/90 font-medium mb-8 sm:mb-12 max-w-3xl leading-relaxed px-2"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.875rem)" }}
        >
          ٦ فئات، ٣٦ سؤال، و معاهم ٣ وسائل مساعدة
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 sm:mb-16 w-full max-w-sm sm:max-w-lg justify-center"
        >
          <button
            onClick={() => navigate("/start-game")}
            className="group relative w-full sm:w-auto bg-[#7B2FBE] text-white font-bold text-lg sm:text-xl py-3.5 sm:py-4 px-8 sm:px-10 rounded-2xl shadow-[0_0_28px_rgba(123,47,190,0.5)] hover:shadow-[0_0_45px_rgba(123,47,190,0.8)] hover:bg-[#8B35D6] hover:-translate-y-1 transition-all overflow-hidden"
          >
            <span className="relative z-10">إنشاء لعبة</span>
            <div className="absolute inset-0 bg-white/15 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}

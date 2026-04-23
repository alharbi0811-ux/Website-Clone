import { motion } from "framer-motion";

const tools = [
  {
    title: "دبل نقاطك",
    desc: "فعّلها واضرب نقاط السؤال في ٢ — مرة واحدة بس لكل فريق في المباراة!",
    timing: "تستخدمها أثناء دورك في السؤال",
    icon: `${import.meta.env.BASE_URL}icon-x2.png`,
    colored: true,
  },
  {
    title: "الحفرة",
    desc: "احفر لهم! جاوب صح, واخصم عدد النقاط اللي فزت فيها من نقاط الفريق الثاني",
    timing: "تستخدمها قبل ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-replace.png",
  },
  {
    title: "جاوب جوابين",
    desc: "متردد بجوابين؟ هذه لك. جاوب بالآثنين عشان تضمن النقاط",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg",
  },
  {
    title: "استريح",
    desc: "اختار اكثر شخص مثقف ضدك, وخله يستريح شوي عن المشاركة في إجابة هالسؤال",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-hand.png",
  },
];

export function HelpTools() {
  return (
    <section className="py-20 relative" dir="rtl">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4"
            style={{ background: "rgba(123,47,190,0.1)", color: "#7B2FBE", border: "1px solid rgba(123,47,190,0.18)" }}
          >
            الأدوات
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black text-foreground"
          >
            وسائل المساعدة
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-foreground/55 font-medium mt-3 text-lg"
          >
            ٣ وسائل لكل فريق في كل لعبة
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, idx) => (
            /* Float wrapper — CSS animation so it composes with Framer hover */
            <div key={idx} className={`game-float-${idx}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.09, type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 24px 60px rgba(123,47,190,0.28)",
                }}
                whileTap={{ scale: 0.97 }}
                className="relative rounded-3xl overflow-hidden flex flex-col group cursor-default h-full"
                style={{
                  background: "linear-gradient(160deg, rgba(123,47,190,0.08) 0%, rgba(155,89,245,0.04) 100%)",
                  border: "1px solid rgba(123,47,190,0.15)",
                  boxShadow: "0 4px 16px rgba(123,47,190,0.08)",
                }}
              >
                {/* Top accent */}
                <div className="h-[3px] w-full"
                  style={{ background: "linear-gradient(90deg, #7B2FBE, #9b59f5, #c084fc)" }} />

                {/* Number badge */}
                <motion.div
                  className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{ background: "rgba(123,47,190,0.12)", color: "#7B2FBE" }}
                  whileHover={{ scale: 1.2, rotate: -5 }}
                >
                  {idx + 1}
                </motion.div>

                {/* Hover glow burst */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(123,47,190,0.1), transparent 65%)" }} />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                  style={{ background: "linear-gradient(105deg, transparent 30%, rgba(123,47,190,0.08) 50%, transparent 70%)" }} />

                <div className="p-7 pt-8 flex flex-col items-center text-center flex-1 relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="w-20 h-20 mb-5"
                    whileHover={{ scale: 1.18, rotate: [-2, 2, -2, 0] }}
                    transition={{ rotate: { duration: 0.35 } }}
                  >
                    <img
                      src={tool.icon}
                      alt={tool.title}
                      className="w-full h-full object-contain"
                      style={!("colored" in tool && tool.colored) ? {
                        filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15) drop-shadow(0 4px 16px rgba(123,47,190,0.4))",
                      } : { filter: "drop-shadow(0 4px 16px rgba(123,47,190,0.4))" }}
                    />
                  </motion.div>

                  <h3 className="text-xl font-black text-foreground mb-3">{tool.title}</h3>
                  <p className="text-foreground/65 font-medium mb-5 flex-grow text-sm leading-relaxed">{tool.desc}</p>

                  <div className="w-full rounded-xl py-2.5 px-4 text-xs font-black text-center"
                    style={{
                      background: "rgba(123,47,190,0.08)",
                      color: "#7B2FBE",
                      border: "1px solid rgba(123,47,190,0.15)",
                    }}>
                    {tool.timing}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

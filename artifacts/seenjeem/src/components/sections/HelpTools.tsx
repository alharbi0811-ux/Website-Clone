import { motion } from "framer-motion";

const tools = [
  {
    title: "اتصال بصديق",
    desc: "صديقك اللي يعرف كل شي هذا وقته دق عليه !",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-call.png",
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

        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
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
            className="text-4xl md:text-5xl font-black text-foreground"
          >
            وسائل المساعدة
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/55 font-medium mt-3 text-lg"
          >
            ٣ وسائل لكل فريق في كل لعبة
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(123,47,190,0.2)" }}
              key={idx}
              className="relative rounded-3xl overflow-hidden flex flex-col group transition-all duration-300"
              style={{
                background: "linear-gradient(160deg, rgba(123,47,190,0.08) 0%, rgba(155,89,245,0.04) 100%)",
                border: "1px solid rgba(123,47,190,0.15)",
              }}
            >
              {/* Top accent line */}
              <div className="h-[3px] w-full"
                style={{ background: "linear-gradient(90deg, #7B2FBE, #9b59f5, #c084fc)" }} />

              {/* Number badge */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: "rgba(123,47,190,0.12)", color: "#7B2FBE" }}>
                {idx + 1}
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(123,47,190,0.07), transparent 70%)" }} />

              <div className="p-7 pt-8 flex flex-col items-center text-center flex-1 relative z-10">
                <div className="w-20 h-20 mb-5">
                  <img
                    src={tool.icon}
                    alt={tool.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15) drop-shadow(0 4px 16px rgba(123,47,190,0.4))",
                    }}
                  />
                </div>

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
          ))}
        </div>

      </div>
    </section>
  );
}

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
    <section className="py-20 relative">
      <div className="container mx-auto px-4">

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-foreground mb-6"
          >
            وسائل المساعدة
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="bg-gradient-to-b from-violet-500/10 to-purple-600/5 border border-purple-300/40 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3 sm:mb-4 md:mb-6 relative z-10">
                <img
                  src={tool.icon}
                  alt={tool.title}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15) drop-shadow(0 4px 16px rgba(123,47,190,0.4))",
                  }}
                />
              </div>

              <h3 className="text-base sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 z-10">
                {tool.title}
              </h3>

              <p className="text-foreground font-medium mb-3 sm:mb-4 md:mb-6 flex-grow z-10 text-xs sm:text-sm md:text-base leading-relaxed">
                {tool.desc}
              </p>

              <div className="bg-purple-50 rounded-xl py-1.5 px-2 sm:py-2 sm:px-4 w-full text-xs sm:text-sm text-primary font-bold z-10 border border-purple-200/50">
                {tool.timing}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

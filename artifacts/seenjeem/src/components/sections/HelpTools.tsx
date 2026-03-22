import { motion } from "framer-motion";
import { Phone, Swords, HandMetal, Coffee } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const tools: {
  title: string;
  desc: string;
  timing: string;
  Icon: LucideIcon;
  gradient: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    title: "اتصال بصديق",
    desc: "صديقك اللي يعرف كل شي هذا وقته دق عليه !",
    timing: "تستخدمها بعد ما تشوف السؤال",
    Icon: Phone,
    gradient: "from-violet-500/10 to-purple-600/5",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    iconColor: "text-white",
  },
  {
    title: "الحفرة",
    desc: "احفر لهم! جاوب صح, واخصم عدد النقاط اللي فزت فيها من نقاط الفريق الثاني",
    timing: "تستخدمها قبل ما تشوف السؤال",
    Icon: Swords,
    gradient: "from-purple-500/10 to-violet-600/5",
    iconBg: "bg-gradient-to-br from-purple-600 to-violet-800",
    iconColor: "text-white",
  },
  {
    title: "جاوب جوابين",
    desc: "متردد بجوابين؟ هذه لك. جاوب بالآثنين عشان تضمن النقاط",
    timing: "تستخدمها بعد ما تشوف السؤال",
    Icon: HandMetal,
    gradient: "from-fuchsia-500/10 to-purple-600/5",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-700",
    iconColor: "text-white",
  },
  {
    title: "استريح",
    desc: "اختار اكثر شخص مثقف ضدك, وخله يستريح شوي عن المشاركة في إجابة هالسؤال",
    timing: "تستخدمها بعد ما تشوف السؤال",
    Icon: Coffee,
    gradient: "from-violet-400/10 to-purple-500/5",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
    iconColor: "text-white",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className={`bg-gradient-to-b ${tool.gradient} border border-purple-200/60 glass-panel rounded-3xl p-8 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Icon container */}
              <div className={`w-20 h-20 mb-6 relative z-10 rounded-2xl ${tool.iconBg} flex items-center justify-center shadow-[0_8px_24px_rgba(123,47,190,0.35)] group-hover:shadow-[0_12px_32px_rgba(123,47,190,0.5)] group-hover:scale-110 transition-all duration-300`}>
                <tool.Icon size={36} className={tool.iconColor} strokeWidth={1.8} />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-4 z-10">
                {tool.title}
              </h3>

              <p className="text-foreground font-medium mb-6 flex-grow z-10">
                {tool.desc}
              </p>

              <div className="bg-purple-50 rounded-xl py-2 px-4 w-full text-sm text-primary font-bold z-10 border border-purple-200/50">
                {tool.timing}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Target, HelpCircle, Zap, Users } from "lucide-react";

const STATS = [
  { value: "200+", label: "فئة منوعة",       Icon: Target   },
  { value: "36",   label: "سؤال باللعبة",    Icon: HelpCircle },
  { value: "3",    label: "وسائل مساعدة",    Icon: Zap      },
  { value: "2",    label: "فريق في كل جلسة", Icon: Users    },
];

export function About() {
  return (
    <section className="py-20 relative overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4 relative z-10">

        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-primary mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          >
            ركـــز
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            لعبة أسئلة جماعية تضم أكثر من 200 فئة منوعة وتحتوي على أقسام خاصة بالكبار و الطلبة والأطفال
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {STATS.map(({ value, label, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, type: "spring", stiffness: 400, damping: 20 }}
              whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(123,47,190,0.18)" }}
              className="rounded-2xl p-5 text-center flex flex-col items-center gap-2 border transition-all"
              style={{
                background: "rgba(123,47,190,0.06)",
                borderColor: "rgba(123,47,190,0.14)",
              }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(123,47,190,0.12)" }}>
                <Icon size={20} style={{ color: "#7B2FBE" }} />
              </div>
              <p className="text-3xl font-black leading-none" style={{ color: "#7B2FBE" }}>{value}</p>
              <p className="text-sm font-bold text-foreground/55 leading-tight">{label}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

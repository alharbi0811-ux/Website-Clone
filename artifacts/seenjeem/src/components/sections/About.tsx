import { motion } from "framer-motion";
import { Target, HelpCircle, Zap, Users } from "lucide-react";

const STATS = [
  { value: "200+", label: "فئة منوعة",       Icon: Target    },
  { value: "36",   label: "سؤال باللعبة",    Icon: HelpCircle },
  { value: "3",    label: "وسائل مساعدة",    Icon: Zap       },
  { value: "2",    label: "فريق في كل جلسة", Icon: Users     },
];

export function About() {
  return (
    <section className="py-5" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{
            background: "rgba(123,47,190,0.05)",
            border: "1px solid rgba(123,47,190,0.12)",
          }}
        >
          {STATS.map(({ value, label, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 400 }}
              className="flex flex-col items-center text-center"
            >
              <Icon size={17} style={{ color: "#7B2FBE" }} className="mb-1.5 opacity-70" />
              <p className="text-2xl font-black leading-none" style={{ color: "#7B2FBE" }}>{value}</p>
              <p className="text-xs font-bold text-foreground/45 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

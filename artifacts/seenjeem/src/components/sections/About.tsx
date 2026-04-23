import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Target, HelpCircle, Zap, Users } from "lucide-react";

const STATS = [
  { num: 200, suffix: "+", label: "فئة منوعة",       Icon: Target    },
  { num: 36,  suffix: "",  label: "سؤال باللعبة",    Icon: HelpCircle },
  { num: 3,   suffix: "",  label: "وسائل مساعدة",    Icon: Zap       },
  { num: 2,   suffix: "",  label: "فريق في كل جلسة", Icon: Users     },
];

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const duration = 1100;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [active, target]);

  return <>{count}{suffix}</>;
}

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section className="py-5" dir="rtl" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{
            background: "rgba(123,47,190,0.05)",
            border: "1px solid rgba(123,47,190,0.12)",
          }}
        >
          {STATS.map(({ num, suffix, label, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 22 }}
              whileHover={{ scale: 1.1, y: -3 }}
              className="flex flex-col items-center text-center cursor-default"
            >
              <motion.div
                animate={{ rotate: inView ? [0, -8, 8, 0] : 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
              >
                <Icon size={17} style={{ color: "#7B2FBE" }} className="mb-1.5 opacity-70" />
              </motion.div>
              <p className="text-2xl font-black leading-none" style={{ color: "#7B2FBE" }}>
                <CountUp target={num} suffix={suffix} active={inView} />
              </p>
              <p className="text-xs font-bold text-foreground/45 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

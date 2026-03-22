import { motion } from "framer-motion";

export function About() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-primary mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            سين جيم
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            لعبة أسئلة جماعية تضم أكثر من 200 فئة منوعة وتحتوي على أقسام خاصة بالكبار و الطلبة والأطفال
          </motion.p>
        </div>

      </div>
    </section>
  );
}

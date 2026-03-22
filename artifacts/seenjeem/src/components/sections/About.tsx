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

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Boy Character */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block w-48 xl:w-64"
          >
            <img 
              src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/boy-img.png" 
              alt="Boy Player" 
              className="w-full h-auto drop-shadow-2xl animate-[bounce_4s_infinite]"
            />
          </motion.div>

          {/* Screen Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-3xl"
          >
            <img 
              src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/screen-sin-jim.png"
              alt="سين جيم"
              className="w-full h-auto drop-shadow-2xl rounded-2xl"
            />
          </motion.div>

          {/* Girl Character */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block w-48 xl:w-64"
          >
            <img 
              src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/girl-img.png" 
              alt="Girl Player" 
              className="w-full h-auto drop-shadow-2xl animate-[bounce_5s_infinite_0.5s]"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

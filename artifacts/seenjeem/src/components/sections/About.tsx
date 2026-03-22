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

          {/* Video Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(138,43,226,0.3)] glass-panel"
          >
            <div className="aspect-video relative">
              <iframe 
                src="https://www.youtube.com/embed/kr7eygkKC6k" 
                title="شرح لعبة سين جيم" 
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Play CTA below video */}
            <div className="p-6 bg-card/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/radius-plus-icon.png" 
                  alt="Plus" 
                  className="w-12 h-12"
                />
                <span className="text-2xl font-bold text-white">اشتر باقه وألعب</span>
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1 w-full sm:w-auto">
                الباقات
              </button>
            </div>
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

import { motion } from "framer-motion";

export function Gift() {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Decorative Dots */}
      <img 
        src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-dots-gift-start.png" 
        alt="" 
        className="absolute top-0 right-0 w-32 opacity-50 pointer-events-none"
      />
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-secondary/80 to-primary/80 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(138,43,226,0.3)] relative overflow-hidden"
        >
          {/* Internal Decoration */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-dot-shape.png')] bg-repeat bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
                اهدي أحبابك
              </h2>
              <p className="text-xl text-white/90 font-medium max-w-2xl">
                من خلال قسم الهدايا تقدر تشتري كود لعبة أو اكثر وتهديه للي تحبه
              </p>
            </div>
            
            <button className="whitespace-nowrap bg-white text-secondary hover:bg-gray-100 font-black text-xl py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              قسم الهدايا
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

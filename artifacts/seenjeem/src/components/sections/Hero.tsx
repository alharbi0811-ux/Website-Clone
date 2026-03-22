import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-12">
      {/* Decorative Banners */}
      <div className="absolute top-0 left-0 w-full flex justify-between pointer-events-none opacity-80 z-0">
        <img 
          src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/eid-2026/sem-jem-right-toran.png" 
          alt="" 
          className="w-1/3 md:w-1/4 max-w-[300px] object-contain drop-shadow-2xl"
        />
        <img 
          src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/eid-2026/sem-jem-banner-toran.png" 
          alt="" 
          className="w-1/3 md:w-1/2 max-w-[600px] object-contain object-top drop-shadow-2xl"
        />
        <img 
          src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/eid-2026/sem-jem-left-toran.png" 
          alt="" 
          className="w-1/3 md:w-1/4 max-w-[300px] object-contain drop-shadow-2xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center mt-12 md:mt-24">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <img 
            src="https://seenjeemkw.com/assets/logo-lg-WLxzaRHo.svg" 
            alt="Seen Jeem" 
            className="w-48 md:w-72 lg:w-96 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 text-gradient"
          style={{ lineHeight: 1.2 }}
        >
          الجواب عليك، و السؤال علينا
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium mb-12 max-w-3xl leading-relaxed"
        >
          ٦ فئات، ٣٦ سؤال، و معاهم ٣ وسائل مساعدة
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mb-16 w-full max-w-lg justify-center"
        >
          <button className="group relative w-full sm:w-auto bg-gradient-to-r from-primary to-[#ff9d42] text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-[0_0_20px_rgba(255,136,26,0.4)] hover:shadow-[0_0_30px_rgba(255,136,26,0.6)] hover:-translate-y-1 transition-all overflow-hidden">
            <span className="relative z-10">إنشاء لعبة</span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12"></div>
          </button>
          
          <button className="group relative w-full sm:w-auto bg-secondary text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-[0_0_20px_rgba(138,43,226,0.4)] hover:shadow-[0_0_30px_rgba(138,43,226,0.6)] hover:-translate-y-1 transition-all overflow-hidden">
            <span className="relative z-10">إنشاء بطولة</span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out skew-x-12"></div>
          </button>
        </motion.div>

        {/* Special Logos */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex items-center justify-center gap-8 md:gap-16 opacity-80 hover:opacity-100 transition-opacity"
        >
          <img 
            src="https://seenjeemkw.com/assets/games-especially-logo-CDiQRXrl.webp" 
            alt="Games Especially" 
            className="h-16 md:h-24 object-contain"
          />
          <img 
            src="https://seenjeemkw.com/assets/ramadaniyat-logo-2irMXK4D.webp" 
            alt="Ramadaniyat" 
            className="h-16 md:h-24 object-contain"
          />
        </motion.div>

      </div>
    </section>
  );
}

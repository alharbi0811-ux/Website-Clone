import { motion } from "framer-motion";

export function Cta() {
  return (
    <section className="py-24 relative overflow-hidden">
      
      {/* Background radial gradient specifically for CTA */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-right flex-1 max-w-xl"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
              جاهزين تلعبون؟
            </h2>
            <p className="text-2xl md:text-3xl text-primary font-bold mb-10 drop-shadow-md">
              لعبتك الأولى علينا ، جرّربها ألحين
            </p>
            
            <button className="bg-gradient-to-r from-primary to-[#ff9d42] text-white font-black text-2xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(255,136,26,0.5)] hover:shadow-[0_0_40px_rgba(255,136,26,0.7)] hover:-translate-y-1 transition-all mb-12 w-full sm:w-auto text-center">
              إنشاء لعبة
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#" className="hover:scale-105 transition-transform">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on App Store" 
                  className="h-12 w-auto"
                />
              </a>
              <a href="#" className="hover:scale-105 transition-transform">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex-1 relative max-w-lg"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
            <img 
              src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/seemjeem-ipad-img.png" 
              alt="Seen Jeem on iPad" 
              className="w-full h-auto relative z-10 drop-shadow-2xl"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

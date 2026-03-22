import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

// Sample of episodes
const episodes = [
  { id: 1, img: "https://d442zbpa1tgal.cloudfront.net/1758692670600-266167990.jpg", link: "https://youtu.be/iJmAPHIOs-Q" },
  { id: 2, img: "https://d442zbpa1tgal.cloudfront.net/1758693107684-385690923.jpg", link: "https://youtu.be/DfSna0brCgQ" },
  { id: 3, img: "https://d442zbpa1tgal.cloudfront.net/1758693169873-991857071.jpg", link: "https://youtu.be/ZKBJIXhX7Gg" },
  { id: 4, img: "https://d442zbpa1tgal.cloudfront.net/1758717950073-240797014.jpg", link: "https://youtu.be/87y6vChZ9Ig" },
  { id: 5, img: "https://d442zbpa1tgal.cloudfront.net/1758717997072-765467429.jpg", link: "https://youtu.be/DIZGg7hR22c" },
  { id: 6, img: "https://d442zbpa1tgal.cloudfront.net/1758819514479-453617235.jpg", link: "https://youtu.be/Iut76zafBuE" },
  { id: 7, img: "https://d442zbpa1tgal.cloudfront.net/1758819546465-24590839.jpg", link: "https://youtu.be/M6Z_CyzZXUE" },
  { id: 8, img: "https://d442zbpa1tgal.cloudfront.net/1758819591420-960274148.jpg", link: "https://youtu.be/DtHk7l7-TTI" },
];

export function TvShow() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: 'rtl',
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-20 bg-background/30">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <motion.h2 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white"
          >
            برنامج ياهلا سين جيم | الموسم الأول
          </motion.h2>
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-primary hover:text-white font-bold text-lg flex items-center gap-2 transition-colors"
          >
            مشاهدة الكل
          </motion.button>
        </div>

        <div className="relative">
          <div className="overflow-hidden py-4" ref={emblaRef} dir="rtl">
            <div className="flex gap-4 -ml-4">
              {episodes.map((ep, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  key={ep.id} 
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 pl-4"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-white/5 shadow-lg group">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={ep.img} 
                        alt={`الحلقة ${ep.id}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <img 
                          src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/play-icon-orange.png"
                          alt="Play"
                          className="w-12 h-12 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 drop-shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <h4 className="text-white font-bold text-lg">
                        الحلقة {ep.id} | ياهلا سين جيم
                      </h4>
                      <a 
                        href={ep.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-white/80 hover:text-primary transition-colors font-medium bg-white/5 rounded-lg p-2"
                      >
                        <span>مشاهدة الحلقة</span>
                        <img 
                          src="https://seenjeemkw.com/assets/youtube-icon-Cs899iTp.png" 
                          alt="YouTube" 
                          className="h-6 w-auto"
                        />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button 
            onClick={scrollPrev}
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 z-10 bg-card/90 hover:bg-primary text-white p-2 rounded-full border border-white/10 shadow-xl backdrop-blur-md transition-all"
          >
            <ChevronRight size={24} />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 z-10 bg-card/90 hover:bg-primary text-white p-2 rounded-full border border-white/10 shadow-xl backdrop-blur-md transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

      </div>
    </section>
  );
}

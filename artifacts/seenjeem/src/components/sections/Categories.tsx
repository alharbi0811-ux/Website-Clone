import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    title: "تحدي الفنانين",
    image: "https://d442zbpa1tgal.cloudfront.net/1755014255038-275397763.jpg",
    link: "https://www.instagram.com/reel/DNQseZkscxS/"
  },
  {
    id: 2,
    title: "ولا كلمة",
    image: "https://d442zbpa1tgal.cloudfront.net/1758730614435-177662848.jpg",
    link: "https://www.instagram.com/reel/DGol_2bMAt_/"
  },
  {
    id: 3,
    title: "خمن اللاعب",
    image: "https://d442zbpa1tgal.cloudfront.net/1735653198089-167770968.jpg",
    link: "https://www.instagram.com/reel/DEScILQsS_S/"
  },
  {
    id: 4,
    title: "رسم",
    image: "https://d442zbpa1tgal.cloudfront.net/1767614066641-156094918.jpg",
    link: "https://www.instagram.com/reel/DTswS48iL0o/"
  },
  {
    id: 5,
    title: "تحدي اللاعبين",
    image: "https://d442zbpa1tgal.cloudfront.net/1755014260974-206323728.jpg",
    link: "https://www.instagram.com/reel/DNQseZkscxS/"
  },
];

export function Categories() {
  // Use RTL option for the carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    direction: 'rtl',
    align: 'start',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-20 bg-background/50 relative">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            شرح الفئات
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, delay: 0.1 }}
            className="text-xl text-white/80"
          >
            بعض الفئات في اللعبة لها طريقة لعب مختلفة ، شوفوا طريقتها قبل لا تلعبونها
          </motion.p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Carousel */}
          <div className="overflow-hidden py-4" ref={emblaRef} dir="rtl">
            <div className="flex gap-6 -ml-6">
              {categories.map((cat, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={cat.id} 
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 pl-6"
                >
                  <div className="bg-card rounded-3xl overflow-hidden border border-white/10 shadow-xl group hover:shadow-[0_0_20px_rgba(255,136,26,0.3)] hover:border-primary/50 transition-all duration-300">
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img 
                        src={cat.image} 
                        alt={cat.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center">
                        <h4 className="text-2xl font-bold text-white mb-4 drop-shadow-md">
                          {cat.title}
                        </h4>
                        <a 
                          href={cat.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary/90 hover:bg-primary text-white font-bold py-2.5 px-6 rounded-full w-full text-center transition-transform hover:-translate-y-1 shadow-lg backdrop-blur-sm"
                        >
                          ابدأ الشرح
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={scrollPrev}
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10 bg-card/80 hover:bg-primary text-white p-3 rounded-full border border-white/10 shadow-xl backdrop-blur-md transition-all"
            aria-label="Previous slide"
          >
            <ChevronRight size={24} />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10 bg-card/80 hover:bg-primary text-white p-3 rounded-full border border-white/10 shadow-xl backdrop-blur-md transition-all"
            aria-label="Next slide"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

      </div>
    </section>
  );
}

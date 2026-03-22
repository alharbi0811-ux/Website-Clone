import { motion } from "framer-motion";

const reels = [
  { img: "https://d442zbpa1tgal.cloudfront.net/1758882238414-700289893.jpg", link: "https://www.instagram.com/reel/DN--gbQiB6A/" },
  { img: "https://d442zbpa1tgal.cloudfront.net/1758882229760-207901937.jpg", link: "https://www.instagram.com/reel/DIOzUYBs4_G/" },
  { img: "https://d442zbpa1tgal.cloudfront.net/1758883380064-863175358.jpg", link: "https://www.instagram.com/reel/DG1G59pMpT4/" },
  { img: "https://d442zbpa1tgal.cloudfront.net/1758884009818-600866109.jpg", link: "https://www.instagram.com/reel/DARTjw9s27O/" },
  { img: "https://d442zbpa1tgal.cloudfront.net/1763629964473-36653107.jpg", link: "https://www.instagram.com/reel/DPorVkxiFME/" },
  { img: "https://d442zbpa1tgal.cloudfront.net/1758884340202-236716942.jpg", link: "https://www.instagram.com/reel/DOd8lXNCHOd/" },
];

export function SocialReels() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        
        <div className="flex justify-center mb-12">
          <img 
            src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/seenjeem-poster.png" 
            alt="Seen Jeem Poster" 
            className="w-full max-w-2xl h-auto object-contain drop-shadow-2xl rounded-3xl"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reels.map((reel, idx) => (
            <motion.a
              href={reel.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden group block border border-white/10 shadow-lg hover:shadow-[0_0_20px_rgba(255,136,26,0.5)] hover:border-primary/50 transition-all duration-300"
            >
              <img 
                src={reel.img} 
                alt="Instagram Reel" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <img 
                  src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/play-icon-orange.png"
                  alt="Play"
                  className="w-12 h-12 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

const tools = [
  {
    title: "اتصال بصديق",
    desc: "صديقك اللي يعرف كل شي هذا وقته دق عليه !",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-call.png",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30"
  },
  {
    title: "الحفرة",
    desc: "احفر لهم! جاوب صح, واخصم عدد النقاط اللي فزت فيها من نقاط الفريق الثاني",
    timing: "تستخدمها قبل ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-replace.png",
    color: "from-orange-500/20 to-orange-600/5",
    borderColor: "border-orange-500/30"
  },
  {
    title: "جاوب جوابين",
    desc: "متردد بجوابين؟ هذه لك. جاوب بالآثنين عشان تضمن النقاط",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg",
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/30"
  },
  {
    title: "استريح",
    desc: "اختار اكثر شخص مثقف ضدك, وخله يستريح شوي عن المشاركة في إجابة هالسؤال",
    timing: "تستخدمها بعد ما تشوف السؤال",
    icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-hand.png",
    color: "from-red-500/20 to-red-600/5",
    borderColor: "border-red-500/30"
  }
];

export function HelpTools() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            وسائل المساعدة
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className={`bg-gradient-to-b ${tool.color} border ${tool.borderColor} glass-panel rounded-3xl p-8 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-24 h-24 mb-6 relative z-10">
                <img 
                  src={tool.icon} 
                  alt={tool.title} 
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 z-10">
                {tool.title}
              </h3>
              
              <p className="text-white/80 font-medium mb-6 flex-grow z-10">
                {tool.desc}
              </p>
              
              <div className="bg-background/50 rounded-xl py-2 px-4 w-full text-sm text-primary font-bold z-10 border border-white/5">
                {tool.timing}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

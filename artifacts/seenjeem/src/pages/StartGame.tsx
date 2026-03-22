import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/sections/Navbar";
import { Check, Trophy, Gamepad2, Info, X } from "lucide-react";
import { useLocation } from "wouter";

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  desc: string;
  img: string;
};

const CDN = "https://d442zbpa1tgal.cloudfront.net";

const CATEGORIES: Category[] = [
  {
    id: "kw",
    name: "الكويت",
    desc: "أسئلة تتعلق بالكويت في جميع المجالات",
    img: `${CDN}/flags/kuwait.png`,
  },
  {
    id: "kw-parliament",
    name: "مجلس الأمة",
    desc: "أسئلة تتعلق بكل ما يخص مجلس الأمة وأعضاءه",
    img: `${CDN}/1772459128688-499091855.jpg`,
  },
  {
    id: "kw-restaurants",
    name: "شارع المطاعم",
    desc: "أسئلة تتعلق بالمطاعم والمأكولات الكويتية والعالمية",
    img: `${CDN}/1772459069961-721054682.jpg`,
  },
  {
    id: "kw-ads",
    name: "دعايات",
    desc: "أسئلة ومقاطع تتعلق بدعايات الشركات المحلية والعالمية",
    img: `${CDN}/1773857820860-639734911.jpg`,
  },
  {
    id: "kw-old",
    name: "جيل الطيبين",
    desc: "أسئلة تتعلق بالجيل السابق بالكويت في جميع المجالات",
    img: `${CDN}/1773857753928-637269502.jpg`,
  },
  {
    id: "kw-location",
    name: "لوكيشن",
    desc: "أسئلة تتعلق بمواقع الأماكن في الكويت",
    img: `${CDN}/1769955614865-48498592.jpg`,
  },
  {
    id: "kw-malls",
    name: "مجمعات الكويت",
    desc: "أسئلة تتعلق بكل ما يخص المجمعات في الكويت",
    img: `${CDN}/1714490868454-914972575.jpg`,
  },
  {
    id: "kw-cafe",
    name: "قهاوي",
    desc: "أسئلة تتعلق بالقهاوي والقهوة في الكويت",
    img: `${CDN}/1722983854149-260057650.jpg`,
  },
  {
    id: "kw-traffic",
    name: "مرور الكويت",
    desc: "أسئلة تتعلق بمرور الكويت وقوانينها",
    img: `${CDN}/1739270060080-288600531.jpg`,
  },
  {
    id: "kw-oil",
    name: "نفط الكويت",
    desc: "أسئلة تتعلق بشركة نفط الكويت وتاريخها",
    img: `${CDN}/1756575104773-387256081.png`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StartGame() {
  const [, navigate] = useLocation();
  const [gameType, setGameType] = useState<"game" | "tournament">("game");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [infoCard, setInfoCard] = useState<Category | null>(null);

  const MAX = 6;

  const toggleCategory = (cat: Category) => {
    setSelectedIds((prev) => {
      if (prev.includes(cat.id)) return prev.filter((id) => id !== cat.id);
      if (prev.length >= MAX) return prev;
      return [...prev, cat.id];
    });
  };

  const team1 = selectedIds.slice(0, 3);
  const team2 = selectedIds.slice(3, 6);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">إنشاء لعبة</h1>
            <p className="text-foreground/60 text-lg">لعبة جماعية تفاعلية نختبر فيها معرفتكم وثقافتكم</p>
          </motion.div>

          {/* Game Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-14"
          >
            <button
              onClick={() => setGameType("game")}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all font-bold text-lg ${
                gameType === "game"
                  ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_24px_rgba(123,47,190,0.5)]"
                  : "bg-white border-purple-200 text-foreground hover:border-[#7B2FBE]/50"
              }`}
            >
              <Gamepad2 size={32} />
              إنشاء لعبة
            </button>
            <button
              onClick={() => setGameType("tournament")}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all font-bold text-lg ${
                gameType === "tournament"
                  ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_24px_rgba(123,47,190,0.5)]"
                  : "bg-white border-purple-200 text-foreground hover:border-[#7B2FBE]/50"
              }`}
            >
              <Trophy size={32} />
              إنشاء بطولة
            </button>
          </motion.div>

          {/* Category Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-foreground mb-2">اختر الفئات</h2>
              <p className="text-foreground/60">
                ٣ فئات لفريقك، و٣ فئات للفريق المنافس، بمجموع ٦ فئات بـ ٣٦ سؤال مختلف
              </p>
            </div>

            {/* Selection Status */}
            <div className="flex items-center justify-center gap-8 mb-10">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-foreground/50 font-medium">فريقك</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all text-sm ${
                        team1[i]
                          ? "bg-[#7B2FBE] border-[#7B2FBE] text-white scale-110"
                          : "border-purple-200 bg-white text-foreground/30"
                      }`}
                    >
                      {team1[i] ? <Check size={16} /> : i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-foreground/30 font-black text-xl">VS</div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-foreground/50 font-medium">الفريق المنافس</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all text-sm ${
                        team2[i]
                          ? "bg-violet-400 border-violet-400 text-white scale-110"
                          : "border-purple-200 bg-white text-foreground/30"
                      }`}
                    >
                      {team2[i] ? <Check size={16} /> : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {CATEGORIES.map((cat, idx) => {
                const selected = selectedIds.includes(cat.id);
                const teamIdx = selectedIds.indexOf(cat.id);
                const isTeam1 = teamIdx >= 0 && teamIdx < 3;
                const disabled = !selected && selectedIds.length >= MAX;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: disabled ? 0.4 : 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all group ${
                      selected
                        ? isTeam1
                          ? "border-[#7B2FBE] shadow-[0_0_20px_rgba(123,47,190,0.45)] scale-[1.03]"
                          : "border-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.4)] scale-[1.03]"
                        : "border-purple-100 hover:border-[#7B2FBE]/60 hover:shadow-lg"
                    } ${disabled ? "cursor-not-allowed" : ""}`}
                    onClick={() => !disabled && toggleCategory(cat)}
                  >
                    {/* Image */}
                    <div className="relative h-32 overflow-hidden bg-purple-50">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://d442zbpa1tgal.cloudfront.net/flags/kuwait.png";
                        }}
                      />
                      {/* Overlay on selected */}
                      {selected && (
                        <div className={`absolute inset-0 ${isTeam1 ? "bg-[#7B2FBE]/40" : "bg-violet-400/40"}`} />
                      )}
                      {/* Check badge */}
                      {selected && (
                        <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${isTeam1 ? "bg-[#7B2FBE]" : "bg-violet-400"}`}>
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      {/* Info button */}
                      <button
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
                        onClick={(e) => { e.stopPropagation(); setInfoCard(cat); }}
                      >
                        <Info size={12} className="text-white" />
                      </button>
                    </div>

                    {/* Name */}
                    <div className={`px-3 py-3 ${selected ? isTeam1 ? "bg-[#7B2FBE]" : "bg-violet-400" : "bg-white"}`}>
                      <p className={`font-bold text-sm text-center leading-tight ${selected ? "text-white" : "text-foreground"}`}>
                        {cat.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Start Button */}
          <AnimatePresence>
            {selectedIds.length === MAX && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
              >
                <button className="bg-[#7B2FBE] text-white font-black text-xl py-4 px-14 rounded-full shadow-[0_0_40px_rgba(123,47,190,0.6)] hover:bg-[#8B35D6] hover:shadow-[0_0_60px_rgba(123,47,190,0.8)] hover:-translate-y-1 transition-all">
                  ابدأ اللعبة 🎮
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Info Modal */}
      <AnimatePresence>
        {infoCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setInfoCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48">
                <img src={infoCard.img} alt={infoCard.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setInfoCard(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-foreground mb-2">{infoCard.name}</h3>
                <p className="text-foreground/70 leading-relaxed">{infoCard.desc}</p>
                <button
                  className="mt-5 w-full bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#8B35D6] transition-colors"
                  onClick={() => { toggleCategory(infoCard); setInfoCard(null); }}
                >
                  {selectedIds.includes(infoCard.id) ? "إلغاء الاختيار" : "اختر هذه الفئة"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/sections/Navbar";
import { Check, Gamepad2, Info, X } from "lucide-react";
import { useLocation } from "wouter";

const CDN = "https://d442zbpa1tgal.cloudfront.net";

type Category = {
  id: string;
  name: string;
  img: string;
  flag?: string;
};

type Section = {
  name: string;
  flag?: string;
  categories: Category[];
};

const SECTIONS: Section[] = [
  {
    name: "الكويت",
    flag: `${CDN}/flags/kuwait.png`,
    categories: [
      { id: "kw", name: "الكويت", img: `${CDN}/1769955614865-48498592.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-parliament", name: "مجلس الأمة", img: `${CDN}/1714490868454-914972575.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-restaurants", name: "شارع المطاعم", img: `${CDN}/1722983854149-260057650.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-ads", name: "دعايات", img: `${CDN}/1739270060080-288600531.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-old", name: "جيل الطيبين", img: `${CDN}/1756575104773-387256081.png`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-location", name: "لوكيشن", img: `${CDN}/1765874335281-496463000.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-malls", name: "مجمعات الكويت", img: `${CDN}/1739335430643-464471679.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-cafe", name: "قهاوي", img: `${CDN}/1767613947069-838912003.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-traffic", name: "مرور الكويت", img: `${CDN}/1744055130505-535557156.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-oil", name: "نفط الكويت", img: `${CDN}/1734967569913-926736893.jpg`, flag: `${CDN}/flags/kuwait.png` },
    ],
  },
];

export default function StartGame() {
  const [, navigate] = useLocation();
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

      <main className="pt-28 pb-28">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">إنشاء لعبة</h1>
            <p className="text-foreground/60 text-lg">لعبة جماعية تفاعلية نختبر فيها معرفتكم وثقافتكم</p>
          </motion.div>

          {/* Game Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center max-w-lg mx-auto mb-10"
          >
            <button
              onClick={() => setGameType("game")}
              className="flex flex-col items-center justify-center gap-3 py-6 px-8 rounded-2xl border-2 bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_24px_rgba(123,47,190,0.5)] transition-all font-bold text-lg hover:bg-[#8B35D6]"
            >
              <Gamepad2 size={32} />
              إنشاء لعبة
            </button>
          </motion.div>

          {/* Selection Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-8 mb-8"
          >
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
          </motion.div>

          {/* Sections with categories */}
          <div className="space-y-12">
            {SECTIONS.map((section, sIdx) => (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.05 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  {section.flag && (
                    <img
                      src={section.flag}
                      alt={section.name}
                      className="h-7 w-10 object-cover rounded shadow-sm"
                    />
                  )}
                  <h2 className="text-2xl font-black text-foreground">{section.name}</h2>
                  <div className="flex-1 h-px bg-purple-100" />
                  <span className="text-sm text-foreground/40 font-medium">{section.categories.length} فئة</span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {section.categories.map((cat, idx) => {
                    const selected = selectedIds.includes(cat.id);
                    const teamIdx = selectedIds.indexOf(cat.id);
                    const isTeam1 = teamIdx >= 0 && teamIdx < 3;
                    const disabled = !selected && selectedIds.length >= MAX;

                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: disabled ? 0.45 : 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all group border-2 ${
                          selected
                            ? isTeam1
                              ? "border-[#7B2FBE] shadow-[0_0_18px_rgba(123,47,190,0.5)] scale-[1.03]"
                              : "border-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.45)] scale-[1.03]"
                            : "border-transparent hover:border-[#7B2FBE]/50 hover:shadow-lg hover:scale-[1.02]"
                        } ${disabled ? "cursor-not-allowed" : ""}`}
                        onClick={() => !disabled && toggleCategory(cat)}
                      >
                        {/* Card image */}
                        <div className="relative aspect-[4/5] bg-purple-100">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                          {/* Selected color overlay */}
                          {selected && (
                            <div className={`absolute inset-0 ${isTeam1 ? "bg-[#7B2FBE]/35" : "bg-violet-400/35"}`} />
                          )}

                          {/* Info button - top left */}
                          <button
                            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#3193e9] hover:bg-[#2280d0] flex items-center justify-center transition-colors z-10 shadow"
                            onClick={(e) => { e.stopPropagation(); setInfoCard(cat); }}
                          >
                            <Info size={12} className="text-white" />
                          </button>

                          {/* Check badge - top right */}
                          {selected && (
                            <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10 ${isTeam1 ? "bg-[#7B2FBE]" : "bg-violet-400"}`}>
                              <Check size={14} className="text-white" />
                            </div>
                          )}

                          {/* Country flag badge - bottom right */}
                          {cat.flag && (
                            <div className="absolute bottom-10 right-2 z-10">
                              <img
                                src={cat.flag}
                                alt="flag"
                                className="h-5 w-7 object-cover rounded shadow"
                              />
                            </div>
                          )}

                          {/* Category name at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4 z-10">
                            <p className="text-white font-black text-sm text-center leading-tight drop-shadow-lg">
                              {cat.name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      {/* Floating start button */}
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

      {/* Info Modal */}
      <AnimatePresence>
        {infoCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setInfoCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-52">
                <img src={infoCard.img} alt={infoCard.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setInfoCard(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                <p className="absolute bottom-3 right-4 text-white font-black text-xl drop-shadow-lg">
                  {infoCard.name}
                </p>
              </div>
              <div className="p-6">
                <button
                  className="w-full bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#8B35D6] transition-colors"
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

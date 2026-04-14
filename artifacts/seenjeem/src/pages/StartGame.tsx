import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/sections/Navbar";
import { Check, Gamepad2, Info, X } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

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
    name: "أجدد الفئات",
    categories: [
      { id: "new-gulf-outfit", name: "طقم فنان خليجي", img: `${CDN}/1772110864905-588292764.jpg` },
      { id: "new-faisal", name: "فيصل بوغازي", img: `${CDN}/1773064818148-154584863.jpg` },
      { id: "new-live1", name: "الغميضة", img: `${CDN}/1772459128688-499091855.jpg` },
      { id: "new-live2", name: "شارع الأعشى", img: `${CDN}/1772459069961-721054682.jpg` },
      { id: "new-muzaffar", name: "مسرح المظفر", img: `${CDN}/1773857820860-639734911.jpg` },
      { id: "new-manae", name: "مسرح المانع", img: `${CDN}/1773857753928-637269502.jpg` },
    ],
  },
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
  {
    name: "عام",
    categories: [
      { id: "gen-lang", name: "لغة وأدب", img: `${CDN}/1714490801753-92992552.jpg` },
      { id: "gen-poetry", name: "عالم الشعر", img: `${CDN}/1738076222656-24201363.jpg` },
      { id: "gen-history", name: "تاريخ", img: `${CDN}/1732722554184-592567878.jpg` },
      { id: "gen-info", name: "معلومات عامة", img: `${CDN}/1714490927962-855974365.jpg` },
      { id: "gen-tech", name: "تكنولوجيا", img: `${CDN}/1755459861188-495099916.jpg` },
      { id: "gen-animals", name: "عالم الحيوان", img: `${CDN}/1764093254679-304463454.jpg` },
      { id: "gen-logos", name: "شعارات", img: `${CDN}/1714490898211-217129236.jpg` },
      { id: "gen-global-logos", name: "شعارات عالمية", img: `${CDN}/1742549852188-992634557.jpg` },
      { id: "gen-products", name: "منتجات", img: `${CDN}/1714490909938-715756503.jpg` },
      { id: "gen-fridges", name: "برادات", img: `${CDN}/1761744080374-488242381.jpg` },
      { id: "gen-global-perfume", name: "عطور عالمية", img: `${CDN}/1730264280284-540083233.jpg` },
      { id: "gen-arab-perfume", name: "عطور عربية", img: `${CDN}/1730300632401-389262153.jpg` },
      { id: "gen-medicine", name: "طب عام", img: `${CDN}/1751455054389-639034112.jpg` },
      { id: "gen-dentist", name: "طب الأسنان", img: `${CDN}/1750684630717-880873314.jpg` },
      { id: "gen-celebrity-voice", name: "صوت المشهور", img: `${CDN}/1726407003679-293178624.jpg` },
      { id: "gen-influencer", name: "مين المؤثر", img: `${CDN}/1743129834094-775188715.jpg` },
      { id: "gen-celeb", name: "منو المشهور", img: `${CDN}/1714490378267-914373042.jpg` },
      { id: "gen-cars", name: "سيارات", img: `${CDN}/1714490889843-486344234.jpg` },
      { id: "gen-ai", name: "Ai", img: `${CDN}/1745426626316-573405766.jpg` },
      { id: "gen-memes", name: "ميمز", img: `${CDN}/1761550412694-487896749.jpg` },
      { id: "gen-sea", name: "أهل البحر", img: `${CDN}/1722435481839-15933924.jpg` },
      { id: "gen-land", name: "أهل البر", img: `${CDN}/1727597919229-423909262.jpg` },
      { id: "gen-watches", name: "عالم الساعات", img: `${CDN}/1728282309112-255164521.jpg` },
      { id: "gen-masbaha", name: "مسابيح", img: `${CDN}/1730098837241-909061261.jpg` },
      { id: "gen-young-celebs", name: "مشاهير صغار", img: `${CDN}/1728894055592-705280977.jpg` },
      { id: "gen-ramadan-food", name: "سفرة رمضان", img: `${CDN}/1771770008527-709681698.jpg` },
      { id: "gen-falcons", name: "Falcons", img: `${CDN}/1741245413047-631315591.jpg` },
    ],
  },
  {
    name: "إسلامي",
    categories: [
      { id: "isl", name: "إسلامي", img: `${CDN}/1714587052246-942365572.jpg` },
      { id: "isl-quran", name: "القرآن", img: `${CDN}/1714490763615-804290584.jpg` },
      { id: "isl-sira", name: "السيرة النبوية", img: `${CDN}/1745761792642-238244994.jpg` },
      { id: "isl-prophets", name: "قصص الأنبياء", img: `${CDN}/1745756957420-785833694.jpg` },
      { id: "isl-sahaba", name: "الصحابة", img: `${CDN}/1773064749476-916155318.jpg` },
      { id: "isl-meanings", name: "معاني القرآن", img: `${CDN}/1773339115646-402328276.jpg` },
      { id: "isl-juz-amma", name: "جزء عم", img: `${CDN}/1761550612337-650723201.jpg` },
      { id: "isl-juz-tabarak", name: "جزء تبارك", img: `${CDN}/1761550626433-874087255.jpg` },
      { id: "isl-reader", name: "من القارئ", img: `${CDN}/1742176948768-787080369.jpg` },
      { id: "isl-nasheeds", name: "أناشيد", img: `${CDN}/1741633698076-825972243.jpg` },
      { id: "isl-hadith", name: "أحاديث", img: `${CDN}/1741180480937-623190732.jpg` },
    ],
  },
  {
    name: "دول",
    categories: [
      { id: "geo", name: "جغرافيا", img: `${CDN}/1714490823112-594631607.jpg` },
      { id: "geo-capitals", name: "دول و عواصم", img: `${CDN}/1714490389783-90315349.jpg` },
      { id: "geo-tourism", name: "سياحة وسفر", img: `${CDN}/1751823486828-666948533.jpg` },
      { id: "geo-aviation", name: "عالم الطيران", img: `${CDN}/1737401411021-607955302.jpg` },
      { id: "geo-currencies", name: "عملات", img: `${CDN}/1753725581646-683343990.jpg` },
      { id: "geo-britain", name: "دفعة بريطانيا", img: `${CDN}/1758283744357-618177912.png` },
      { id: "geo-which", name: "ما هي الدولة", img: `${CDN}/1763215353499-90714495.jpg` },
      { id: "geo-leaders", name: "رؤساء الدول", img: `${CDN}/1747833902627-605228857.jpg` },
      { id: "geo-flags", name: "أعلام", img: `${CDN}/1722983894998-509200770.jpg` },
      { id: "geo-old-flags", name: "أعلام قديمة", img: `${CDN}/1759149433197-606488893.jpg` },
      { id: "geo-capitals2", name: "عواصم", img: `${CDN}/1735135560932-219437472.jpg` },
      { id: "geo-maps", name: "خرايط", img: `${CDN}/1735135576406-177842775.jpg` },
      { id: "geo-ww", name: "الحرب العالمية", img: `${CDN}/1768222795615-493918481.jpg` },
      { id: "geo-anthem", name: "النشيد الوطني", img: `${CDN}/1767614045560-840191955.jpg` },
      { id: "geo-langs", name: "لغات ولهجات", img: `${CDN}/1752498388016-570045889.jpg` },
    ],
  },
  {
    name: "حروف",
    categories: [
      { id: "hruf-moving", name: "حروف متحركة", img: `${CDN}/1771091376268-243364857.jpg` },
      { id: "hruf", name: "حروف", img: `${CDN}/1748246029846-706132118.png` },
      { id: "hruf-isl", name: "حروف إسلامي", img: `${CDN}/1770136313789-732561747.png` },
      { id: "hruf-ghanawi", name: "حروف غناوي", img: `${CDN}/1770136408983-879349423.png` },
      { id: "hruf-football", name: "حروف كروية", img: `${CDN}/1770136192977-789761540.jpg` },
      { id: "hruf-anime", name: "حروف أنمي", img: `${CDN}/1771283051278-419027110.jpg` },
    ],
  },
  {
    name: "ولا كلمة",
    categories: [
      { id: "wkl", name: "ولا كلمة", img: `${CDN}/1758730614435-177662848.jpg` },
      { id: "wkl-gen", name: "ولا كلمة عامة", img: `${CDN}/1758730605907-282527981.jpg` },
      { id: "wkl-proverbs", name: "ولا كلمة أمثال", img: `${CDN}/1771282358866-323638439.jpg` },
      { id: "wkl-football", name: "ولا كلمة كروية", img: `${CDN}/1743279432236-578046154.jpg` },
      { id: "wkl-foreign-art", name: "ولا كلمة فن أجنبي", img: `${CDN}/1758083049744-88645125.jpg` },
      { id: "wkl-wrestling", name: "ولا كلمة مصارعة", img: `${CDN}/1758002643221-783499255.jpg` },
      { id: "wkl-anime", name: "ولا كلمة أنمي", img: `${CDN}/1758083565554-400511051.jpg` },
    ],
  },
  {
    name: "التفكير",
    categories: [
      { id: "amthal", name: "أمثال و ألغاز", img: `${CDN}/1714490940317-508575914.jpg` },
      { id: "amthal-riddle", name: "لغز ومثل", img: `${CDN}/1740578260875-602703145.jpg` },
      { id: "amthal-puzzles", name: "ألغاز", img: `${CDN}/1742998174143-415830477.jpg` },
      { id: "amthal-focus", name: "ركز شوي", img: `${CDN}/1718204665916-744508258.jpg` },
      { id: "amthal-guess", name: "خمن الصورة", img: `${CDN}/1743570879626-653531544.jpg` },
      { id: "amthal-reversed", name: "كلمات معكوسة", img: `${CDN}/1732211373480-958818078.jpg` },
      { id: "amthal-color", name: "لون الصورة", img: `${CDN}/1760953350974-354375971.jpg` },
      { id: "amthal-draw", name: "رسم", img: `${CDN}/1767614066641-156094918.jpg` },
    ],
  },
];

export default function StartGame() {
  const [, navigate] = useLocation();
  const { user, token } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [infoCard, setInfoCard] = useState<Category | null>(null);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1Tools, setTeam1Tools] = useState<string[]>([]);
  const [team2Tools, setTeam2Tools] = useState<string[]>([]);
  const [showSplitTeams, setShowSplitTeams] = useState(false);

  const HELP_TOOLS = [
    { id: "double", name: "جاوب جوابين", icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg", color: "#7B2FBE" },
    { id: "call", name: "اتصال بصديق", icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-call.png", color: "#22c55e" },
    { id: "pit", name: "الحفرة", icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-replace.png", color: "#22c55e" },
    { id: "rest", name: "استريح", icon: "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/circle-hand.png", color: "#ef4444" },
  ];

  const toggleTool = (team: 1 | 2, toolId: string) => {
    const setter = team === 1 ? setTeam1Tools : setTeam2Tools;
    const current = team === 1 ? team1Tools : team2Tools;
    if (current.includes(toolId)) {
      setter(current.filter(t => t !== toolId));
    } else if (current.length < 3) {
      setter([...current, toolId]);
    }
  };

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
            className="hidden"
          >
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
                className="border-2 border-[#7B2FBE] rounded-3xl p-8 shadow-[0_0_24px_rgba(123,47,190,0.3)]"
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

          {/* Game Info Section */}
          {selectedIds.length === MAX && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <h2 className="text-3xl font-black text-foreground mb-8 text-center">حدد معلومات الفرق</h2>

              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-full py-3 px-6 text-right text-foreground font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                    placeholder="اسم اللعبة"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold bg-white px-2">اسم اللعبة</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-foreground mb-4">الفريق الأول</h3>
                  <div className="relative w-full max-w-xs mx-auto mb-6">
                    <input
                      type="text"
                      value={team1Name}
                      onChange={(e) => setTeam1Name(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-full py-3 px-6 text-right text-foreground font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                      placeholder="اسم الفريق"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold bg-white px-2">اسم الفريق</span>
                  </div>

                  <p className="text-sm font-bold text-foreground/70 mb-3">الفريق الأول : اختر 3 وسائل مساعدة</p>
                  <div className="flex justify-center gap-3">
                    {HELP_TOOLS.map(tool => {
                      const selected = team1Tools.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => toggleTool(1, tool.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${selected ? "ring-3 ring-[#7B2FBE] bg-[#7B2FBE]/10" : "bg-gray-100"}`}>
                            <img
                              src={tool.icon}
                              alt={tool.name}
                              className="w-10 h-10 object-contain"
                              style={selected ? { filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15)" } : { filter: "grayscale(100%) opacity(0.5)" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-foreground/60">{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-foreground mb-4">الفريق الثاني</h3>
                  <div className="relative w-full max-w-xs mx-auto mb-6">
                    <input
                      type="text"
                      value={team2Name}
                      onChange={(e) => setTeam2Name(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-full py-3 px-6 text-right text-foreground font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                      placeholder="اسم الفريق"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold bg-white px-2">اسم الفريق</span>
                  </div>

                  <p className="text-sm font-bold text-foreground/70 mb-3">الفريق الثاني : اختر 3 وسائل مساعدة</p>
                  <div className="flex justify-center gap-3">
                    {HELP_TOOLS.map(tool => {
                      const selected = team2Tools.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => toggleTool(2, tool.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${selected ? "ring-3 ring-[#7B2FBE] bg-[#7B2FBE]/10" : "bg-gray-100"}`}>
                            <img
                              src={tool.icon}
                              alt={tool.name}
                              className="w-10 h-10 object-contain"
                              style={selected ? { filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15)" } : { filter: "grayscale(100%) opacity(0.5)" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-foreground/60">{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <button
                  onClick={async () => {
                    const allCats = SECTIONS.flatMap(s => s.categories);
                    const t1Cats = team1.map(id => allCats.find(c => c.id === id)!).filter(Boolean);
                    const t2Cats = team2.map(id => allCats.find(c => c.id === id)!).filter(Boolean);
                    const gData = {
                      team1Name: team1Name || "الفريق الأول",
                      team2Name: team2Name || "الفريق الثاني",
                      gameName: gameName || "ركز",
                      team1Categories: t1Cats.map(c => ({ id: c.id, name: c.name, img: c.img })),
                      team2Categories: t2Cats.map(c => ({ id: c.id, name: c.name, img: c.img })),
                      team1Tools,
                      team2Tools,
                    };
                    localStorage.setItem("rakez-game-data", JSON.stringify(gData));
                    localStorage.removeItem("rakez-played-cells");
                    localStorage.setItem("rakez-scores", JSON.stringify({ team1Score: 0, team2Score: 0 }));
                    localStorage.setItem("rakez-current-team", JSON.stringify(1));
                    localStorage.removeItem("rakez-session-id");

                    if (user && token) {
                      try {
                        const res = await fetch(`${API_BASE}/history`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ gameName: gData.gameName, gameData: gData }),
                        });
                        if (res.ok) {
                          const session = await res.json();
                          localStorage.setItem("rakez-session-id", String(session.id));
                        }
                      } catch {}
                    }
                    navigate("/score-page");
                  }}
                  className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black text-xl py-4 px-16 rounded-full shadow-[0_0_40px_rgba(123,47,190,0.6)] transition-all hover:shadow-[0_0_60px_rgba(123,47,190,0.8)] hover:-translate-y-1"
                >
                  ابدأ اللعب
                </button>
              </motion.div>
            </motion.div>
          )}

        </div>
      </main>

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

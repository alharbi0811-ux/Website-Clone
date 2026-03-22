import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, LogOut, Gamepad2, Eye, Minus, Plus, RotateCcw, Trophy } from "lucide-react";

const CDN = "https://d442zbpa1tgal.cloudfront.net";

type CategoryData = {
  id: string;
  name: string;
  img: string;
};

type GameData = {
  team1Name: string;
  team2Name: string;
  gameName: string;
  team1Categories: CategoryData[];
  team2Categories: CategoryData[];
};

const POINTS = [200, 400, 600];

export default function ScorePage() {
  const [, navigate] = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [playedCells, setPlayedCells] = useState<Set<string>>(new Set());
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-game-data");
    if (stored) {
      setGameData(JSON.parse(stored));
    } else {
      setGameData({
        team1Name: "الفريق الأول",
        team2Name: "الفريق الثاني",
        gameName: "ركز",
        team1Categories: [
          { id: "kw", name: "الكويت", img: `${CDN}/1769955614865-48498592.jpg` },
          { id: "gen-info", name: "معلومات عامة", img: `${CDN}/1714490927962-855974365.jpg` },
          { id: "gen-products", name: "منتجات", img: `${CDN}/1714490909938-715756503.jpg` },
        ],
        team2Categories: [
          { id: "new-live1", name: "الغميضة", img: `${CDN}/1772459128688-499091855.jpg` },
          { id: "gen-tech", name: "تكنولوجيا", img: `${CDN}/1755459861188-495099916.jpg` },
          { id: "gen-poetry", name: "عالم الشعر", img: `${CDN}/1738076222656-24201363.jpg` },
        ],
      });
    }

    const scores = localStorage.getItem("rakez-scores");
    if (scores) {
      const parsed = JSON.parse(scores);
      setTeam1Score(parsed.team1Score || 0);
      setTeam2Score(parsed.team2Score || 0);
    }

    const savedCells = localStorage.getItem("rakez-played-cells");
    if (savedCells) {
      setPlayedCells(new Set(JSON.parse(savedCells)));
    }

    const savedTeam = localStorage.getItem("rakez-current-team");
    if (savedTeam) {
      setCurrentTeam(JSON.parse(savedTeam) as 1 | 2);
    }

    const answered = localStorage.getItem("rakez-answered-cell");
    if (answered) {
      const { catIdx, points, correct, team } = JSON.parse(answered);
      localStorage.removeItem("rakez-answered-cell");
      const key = `${catIdx}-${points}`;
      setPlayedCells((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      if (correct) {
        if (team === 1) setTeam1Score((s) => s + points);
        else setTeam2Score((s) => s + points);
      }
      setCurrentTeam((t) => (t === 1 ? 2 : 1));
    }
  }, []);

  useEffect(() => {
    if (playedCells.size > 0) {
      localStorage.setItem("rakez-played-cells", JSON.stringify([...playedCells]));
    }
  }, [playedCells]);

  useEffect(() => {
    localStorage.setItem("rakez-scores", JSON.stringify({ team1Score, team2Score }));
  }, [team1Score, team2Score]);

  useEffect(() => {
    localStorage.setItem("rakez-current-team", JSON.stringify(currentTeam));
  }, [currentTeam]);

  if (!gameData) return null;

  const allCategories = [...gameData.team1Categories, ...gameData.team2Categories];
  const totalCells = allCategories.length * POINTS.length;
  const allPlayed = playedCells.size >= totalCells;

  const SAMPLE_QUESTIONS = [
    "ما هو أكبر كوكب في المجموعة الشمسية؟",
    "في أي عام استقلت الكويت؟",
    "ما هي عاصمة اليابان؟",
  ];

  const handleCellClick = (catIdx: number, points: number) => {
    const key = `${catIdx}-${points}`;
    if (playedCells.has(key)) return;

    const category = allCategories[catIdx];
    const qIdx = POINTS.indexOf(points);

    localStorage.setItem("rakez-current-question", JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      points,
      catIdx,
      currentTeam,
      question: SAMPLE_QUESTIONS[qIdx] || "سؤال تجريبي",
      answer: "الإجابة التجريبية",
      image: category.img,
    }));

    navigate("/question");
  };

  const handleEndGame = () => {
    setShowEndModal(true);
  };

  const handleExit = () => {
    localStorage.removeItem("rakez-game-data");
    localStorage.removeItem("rakez-scores");
    localStorage.removeItem("rakez-played-cells");
    localStorage.removeItem("rakez-current-team");
    localStorage.removeItem("rakez-used-tools");
    localStorage.removeItem("rakez-current-question");
    navigate("/start-game");
  };

  const handleResetBoard = () => {
    setPlayedCells(new Set());
    setTeam1Score(0);
    setTeam2Score(0);
    setCurrentTeam(1);
    setShowEndModal(false);
    localStorage.removeItem("rakez-played-cells");
    localStorage.setItem("rakez-scores", JSON.stringify({ team1Score: 0, team2Score: 0 }));
    localStorage.setItem("rakez-current-team", JSON.stringify(1));
    localStorage.removeItem("rakez-used-tools");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0e8ff] via-[#e8e0f0] to-[#f0f0ff] flex flex-col" dir="rtl">
      {/* Top Bar - Glassmorphic */}
      <div className="bg-gradient-to-l from-[#7B2FBE]/80 to-[#5a1f8e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg border-b border-white/20">
        <div className="flex items-center gap-4">
          <img
            src={`${CDN}/logos/logo.webp`}
            alt="ركز"
            className="h-12 brightness-0 invert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-12 pl-[25px] pr-[25px]" />
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-base border border-white/30 shadow-lg">
            دور فريق: {currentTeam === 1 ? gameData.team1Name : gameData.team2Name}
          </div>
          <div className="text-white/90 font-medium text-base hidden md:block">
            {gameData.gameName}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEndGame}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-lg"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">انتهاء اللعبة</span>
          </button>
          <button
            onClick={handleResetBoard}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-lg"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">إعادة</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-lg"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">الخروج</span>
          </button>
        </div>
      </div>

      {/* Game Board - Centered */}
      <div className="flex-1 px-10 py-10 flex items-center justify-center">
        <div className="w-full max-w-7xl">
          {/* Team 1 Categories - Top Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {gameData.team1Categories.map((cat, catIdx) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                catIdx={catIdx}
                playedCells={playedCells}
                onCellClick={handleCellClick}
                teamColor="#7B2FBE"
              />
            ))}
          </div>

          {/* Team 2 Categories - Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {gameData.team2Categories.map((cat, catIdx) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                catIdx={catIdx + 3}
                playedCells={playedCells}
                onCellClick={handleCellClick}
                teamColor="#9333ea"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Glassmorphic */}
      <div className="bg-gradient-to-l from-[#7B2FBE]/80 to-[#5a1f8e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-white/20">
        {/* Team 1 Score */}
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl font-black text-sm min-w-[120px] text-center border border-white/30 shadow-lg">
            {gameData.team1Name}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam1Score((s) => Math.max(0, s - 200))}
              className="w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg"
            >
              <Minus size={16} />
            </button>
            <div className="bg-white/20 backdrop-blur-md text-[#7B2FBE] font-black text-2xl min-w-[70px] text-center py-2 px-4 rounded-xl border border-white/30 shadow-lg">
              {team1Score}
            </div>
            <button
              onClick={() => setTeam1Score((s) => s + 200)}
              className="w-9 h-9 rounded-full bg-green-500/80 hover:bg-green-600 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Center - Game Icon */}
        <div className="flex items-center justify-center px-6">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
            <Gamepad2 size={28} className="text-white" />
          </div>
        </div>

        {/* Team 2 Score */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam2Score((s) => Math.max(0, s - 200))}
              className="w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg"
            >
              <Minus size={16} />
            </button>
            <div className="bg-white/20 backdrop-blur-md text-[#7B2FBE] font-black text-2xl min-w-[70px] text-center py-2 px-4 rounded-xl border border-white/30 shadow-lg">
              {team2Score}
            </div>
            <button
              onClick={() => setTeam2Score((s) => s + 200)}
              className="w-9 h-9 rounded-full bg-green-500/80 hover:bg-green-600 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl font-black text-sm min-w-[120px] text-center border border-white/30 shadow-lg">
            {gameData.team2Name}
          </div>
        </div>
      </div>
      {/* End Game Modal */}
      <AnimatePresence>
        {(showEndModal || allPlayed) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEndModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] p-8 text-center">
                <Trophy size={64} className="text-yellow-300 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">
                  {team1Score > team2Score
                    ? `🎉 فاز ${gameData.team1Name}!`
                    : team2Score > team1Score
                    ? `🎉 فاز ${gameData.team2Name}!`
                    : "تعادل! 🤝"}
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-around mb-6">
                  <div className="text-center">
                    <p className="text-sm text-foreground/60 mb-1">{gameData.team1Name}</p>
                    <p className="text-4xl font-black text-[#7B2FBE]">{team1Score}</p>
                  </div>
                  <div className="text-foreground/30 font-black text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-sm text-foreground/60 mb-1">{gameData.team2Name}</p>
                    <p className="text-4xl font-black text-[#9333ea]">{team2Score}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleResetBoard}
                    className="flex-1 bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    لعبة جديدة
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-foreground font-bold py-3 rounded-xl transition-colors"
                  >
                    الخروج
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryCard({
  category,
  catIdx,
  playedCells,
  onCellClick,
  teamColor,
}: {
  category: CategoryData;
  catIdx: number;
  playedCells: Set<string>;
  onCellClick: (catIdx: number, points: number) => void;
  teamColor: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl flex flex-col h-80 border border-white/40 hover:border-white/60 transition-all"
    >
      <div className="flex flex-1">
        {/* Left score column */}
        <div className="flex flex-col justify-center gap-3 p-5 flex-1">
          {POINTS.map((points) => {
            const key = `${catIdx}-${points}`;
            const played = playedCells.has(key);
            return (
              <motion.button
                key={`l-${points}`}
                whileHover={!played ? { scale: 1.08 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points)}
                disabled={played}
                className={`
                  w-full py-4 rounded-2xl font-black text-3xl transition-all border
                  ${played
                    ? "bg-[#e8e2ef]/50 text-[#8a7f99] cursor-not-allowed border-gray-300/30"
                    : "bg-white/50 hover:bg-[#7B2FBE] text-gray-700 hover:text-white cursor-pointer shadow-md hover:shadow-lg border-white/40 hover:border-white/60"
                  }
                `}
              >
                {points}
              </motion.button>
            );
          })}
        </div>

        {/* Category image */}
        <div className="w-[35%] min-w-[120px] relative self-stretch overflow-hidden">
          <img
            src={category.img}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right score column */}
        <div className="flex flex-col justify-center gap-3 p-5 flex-1">
          {POINTS.map((points) => {
            const key = `${catIdx}-${points}`;
            const played = playedCells.has(key);
            return (
              <motion.button
                key={`r-${points}`}
                whileHover={!played ? { scale: 1.08 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points)}
                disabled={played}
                className={`
                  w-full py-4 rounded-2xl font-black text-3xl transition-all border
                  ${played
                    ? "bg-[#e8e2ef]/50 text-[#8a7f99] cursor-not-allowed border-gray-300/30"
                    : "bg-white/50 hover:bg-[#7B2FBE] text-gray-700 hover:text-white cursor-pointer shadow-md hover:shadow-lg border-white/40 hover:border-white/60"
                  }
                `}
              >
                {points}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category name bar - Glassmorphic */}
      <div
        className="text-center py-5 font-black text-white text-3xl backdrop-blur-sm border-t border-white/20"
        style={{ backgroundColor: `${teamColor}cc` }}
      >
        {category.name}
      </div>
    </motion.div>
  );
}

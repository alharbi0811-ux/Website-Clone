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
  }, [navigate]);

  if (!gameData) return null;

  const allCategories = [...gameData.team1Categories, ...gameData.team2Categories];
  const totalCells = allCategories.length * POINTS.length;
  const allPlayed = playedCells.size >= totalCells;

  const handleCellClick = (catIdx: number, points: number) => {
    const key = `${catIdx}-${points}`;
    if (playedCells.has(key)) return;

    setPlayedCells((prev) => new Set(prev).add(key));

    if (currentTeam === 1) {
      setTeam1Score((s) => s + points);
    } else {
      setTeam2Score((s) => s + points);
    }

    setCurrentTeam((t) => (t === 1 ? 2 : 1));
  };

  const handleEndGame = () => {
    setShowEndModal(true);
  };

  const handleExit = () => {
    localStorage.removeItem("rakez-game-data");
    navigate("/start-game");
  };

  const handleResetBoard = () => {
    setPlayedCells(new Set());
    setTeam1Score(0);
    setTeam2Score(0);
    setCurrentTeam(1);
    setShowEndModal(false);
  };

  return (
    <div className="min-h-screen bg-[#e8e0f0] flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src={`${CDN}/logos/logo.webp`}
            alt="ركز"
            className="h-10 brightness-0 invert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-white font-black text-xl hidden sm:block">ركز</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-sm">
            دور فريق: {currentTeam === 1 ? gameData.team1Name : gameData.team2Name}
          </div>
          <div className="text-white/80 font-medium text-sm hidden md:block">
            {gameData.gameName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEndGame}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">انتهاء اللعبة</span>
          </button>
          <button
            onClick={handleResetBoard}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">إعادة</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">الخروج</span>
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 p-3 md:p-5">
        {/* Team 1 Categories - Top Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
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
        <div className="grid grid-cols-3 gap-3 md:gap-4">
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

      {/* Bottom Bar */}
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        {/* Team 1 Score */}
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-white/20 text-white px-3 py-1.5 rounded-lg font-black text-sm min-w-[80px] text-center">
            {gameData.team1Name}
          </div>
          <span className="text-white/60 text-xs font-medium hidden md:block">وسائل المساعدة</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam1Score((s) => Math.max(0, s - 200))}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="bg-white text-[#7B2FBE] font-black text-xl min-w-[60px] text-center py-1.5 px-3 rounded-lg">
              {team1Score}
            </div>
            <button
              onClick={() => setTeam1Score((s) => s + 200)}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Center - Game Icon */}
        <div className="flex items-center justify-center px-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Gamepad2 size={24} className="text-white" />
          </div>
        </div>

        {/* Team 2 Score */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam2Score((s) => Math.max(0, s - 200))}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="bg-white text-[#7B2FBE] font-black text-xl min-w-[60px] text-center py-1.5 px-3 rounded-lg">
              {team2Score}
            </div>
            <button
              onClick={() => setTeam2Score((s) => s + 200)}
              className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-white/60 text-xs font-medium hidden md:block">وسائل المساعدة</span>
          <div className="bg-white/20 text-white px-3 py-1.5 rounded-lg font-black text-sm min-w-[80px] text-center">
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
    <div className="bg-[#d4cce0] rounded-2xl overflow-hidden shadow-md flex flex-col">
      <div className="flex flex-1">
        {/* Left score column */}
        <div className="flex flex-col justify-center gap-2 p-2 md:p-3 flex-1">
          {POINTS.map((points) => {
            const key = `${catIdx}-${points}`;
            const played = playedCells.has(key);
            return (
              <motion.button
                key={`l-${points}`}
                whileHover={!played ? { scale: 1.05 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points)}
                disabled={played}
                className={`
                  w-full py-2 md:py-3 rounded-xl font-black text-sm md:text-lg transition-all
                  ${played
                    ? "bg-[#b8afc5] text-[#8a7f99] cursor-not-allowed"
                    : "bg-[#e8e2ef] hover:bg-[#7B2FBE] text-gray-600 hover:text-white cursor-pointer shadow-sm hover:shadow-lg"
                  }
                `}
              >
                {points}
              </motion.button>
            );
          })}
        </div>

        {/* Category image */}
        <div className="w-[30%] min-w-[80px] relative self-stretch">
          <img
            src={category.img}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right score column */}
        <div className="flex flex-col justify-center gap-2 p-2 md:p-3 flex-1">
          {POINTS.map((points) => {
            const key = `${catIdx}-${points}`;
            const played = playedCells.has(key);
            return (
              <motion.button
                key={`r-${points}`}
                whileHover={!played ? { scale: 1.05 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points)}
                disabled={played}
                className={`
                  w-full py-2 md:py-3 rounded-xl font-black text-sm md:text-lg transition-all
                  ${played
                    ? "bg-[#b8afc5] text-[#8a7f99] cursor-not-allowed"
                    : "bg-[#e8e2ef] hover:bg-[#7B2FBE] text-gray-600 hover:text-white cursor-pointer shadow-sm hover:shadow-lg"
                  }
                `}
              >
                {points}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category name bar */}
      <div
        className="text-center py-2 font-black text-white text-sm md:text-base"
        style={{ backgroundColor: teamColor }}
      >
        {category.name}
      </div>
    </div>
  );
}

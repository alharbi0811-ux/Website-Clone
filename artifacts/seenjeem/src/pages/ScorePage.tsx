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
      const { catIdx, points, side, correct, team } = JSON.parse(answered);
      localStorage.removeItem("rakez-answered-cell");
      const key = `${catIdx}-${points}-${side ?? "l"}`;
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
  const totalCells = allCategories.length * POINTS.length * 2;
  const allPlayed = playedCells.size >= totalCells;

  const SAMPLE_QUESTIONS = [
    "ما هو أكبر كوكب في المجموعة الشمسية؟",
    "في أي عام استقلت الكويت؟",
    "ما هي عاصمة اليابان؟",
  ];

  const handleCellClick = (catIdx: number, points: number, side: "l" | "r") => {
    const key = `${catIdx}-${points}-${side}`;
    if (playedCells.has(key)) return;

    const category = allCategories[catIdx];
    const qIdx = POINTS.indexOf(points);

    localStorage.setItem("rakez-current-question", JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      points,
      catIdx,
      side,
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#f0e8ff] via-[#e8e0f0] to-[#f0f0ff] flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="shrink-0 bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-6 py-3 shadow-lg border-b border-white/10 pt-[24px] pb-[24px]">
        <div className="flex items-center justify-between relative">
          {/* Right side — Logo + Team turn */}
          <div className="flex items-center gap-4 shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-10 pl-[22px] pr-[22px]" />
            <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-xl font-bold border border-white/20 text-[15px] text-justify rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] rounded-bl-[100px] border-t-[2px] border-r-[2px] border-b-[2px] border-l-[2px] pt-[10px] pb-[10px] pl-[25px] pr-[25px]">
              دور فريق: {currentTeam === 1 ? gameData.team1Name : gameData.team2Name}
            </div>
          </div>

          {/* Center — Game name */}
          <div className="absolute inset-x-0 flex justify-center pointer-events-none">
            <span className="text-white font-bold text-lg">{gameData.gameName}</span>
          </div>

          {/* Left side — Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEndGame}
              className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border-2 border-white/25 hover:border-white/50 w-32"
            >
              <Eye size={14} />
              <span>انتهاء اللعبة</span>
            </button>
            <button
              onClick={handleResetBoard}
              className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border-2 border-white/25 hover:border-white/50 w-32"
            >
              <RotateCcw size={14} />
              <span>إعادة</span>
            </button>
            <button
              onClick={handleExit}
              className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border-2 border-white/25 hover:border-white/50 w-32"
            >
              <LogOut size={14} />
              <span>الخروج</span>
            </button>
          </div>
        </div>
      </div>
      {/* Game Board — fills all remaining space */}
      <div className="flex-1 min-h-0 p-4 flex flex-col gap-4">
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
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
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
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
      <div className="shrink-0 bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-6 py-3 flex items-center justify-between border-t border-white/10 pt-[24px] pb-[24px]">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl min-w-[100px] border border-white/20 text-[15px] text-justify font-black rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] rounded-bl-[100px] border-t-[2px] border-r-[2px] border-b-[2px] border-l-[2px] pt-[10px] pb-[10px] pl-[30px] pr-[30px]">
            {gameData.team1Name}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam1Score((s) => Math.max(0, s - 200))}
              className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="bg-white/90 text-[#7B2FBE] font-black text-xl min-w-[60px] text-center py-1.5 px-3 rounded-xl shadow-inner pl-[50px] pr-[50px] pt-[10px] pb-[10px] rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] rounded-bl-[100px] border-t-[2px] border-r-[2px] border-b-[2px] border-l-[2px]">
              {team1Score}
            </div>
            <button
              onClick={() => setTeam1Score((s) => s + 200)}
              className="w-8 h-8 rounded-full bg-green-500/80 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center px-4">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Gamepad2 size={24} className="text-white" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeam2Score((s) => Math.max(0, s - 200))}
              className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="bg-white/90 text-[#7B2FBE] font-black text-xl min-w-[60px] text-center py-1.5 px-3 rounded-xl shadow-inner pl-[50px] pr-[50px] pt-[10px] pb-[10px] rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] rounded-bl-[100px] border-t-[2px] border-r-[2px] border-b-[2px] border-l-[2px]">
              {team2Score}
            </div>
            <button
              onClick={() => setTeam2Score((s) => s + 200)}
              className="w-8 h-8 rounded-full bg-green-500/80 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-black min-w-[100px] border border-white/20 border-t-[2px] border-r-[2px] border-b-[2px] border-l-[2px] rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] rounded-bl-[100px] pt-[10px] pb-[10px] pl-[30px] pr-[30px] text-[15px] text-center">
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
                    ? `فاز ${gameData.team1Name}!`
                    : team2Score > team1Score
                    ? `فاز ${gameData.team2Name}!`
                    : "تعادل!"}
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
  onCellClick: (catIdx: number, points: number, side: "l" | "r") => void;
  teamColor: string;
}) {
  const btnClass = (played: boolean) => `
    w-full flex-1 rounded-xl font-black text-2xl transition-all
    ${played
      ? "bg-gray-300/40 text-gray-400 cursor-not-allowed"
      : "bg-white/60 hover:bg-[#7B2FBE] text-gray-700 hover:text-white cursor-pointer shadow-sm hover:shadow-lg border border-white/50 hover:border-[#7B2FBE]"
    }
  `;

  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/50 min-h-0">
      <div className="flex flex-1 min-h-0">

        {/* Left column */}
        <div className="flex flex-col justify-center gap-2 p-3 flex-1">
          {POINTS.map((points) => {
            const played = playedCells.has(`${catIdx}-${points}-l`);
            return (
              <motion.button
                key={`l-${points}`}
                whileHover={!played ? { scale: 1.05 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "l")}
                disabled={played}
                className={btnClass(played)}
              >
                {points}
              </motion.button>
            );
          })}
        </div>

        {/* Category image */}
        <div className="w-[40%] min-w-[120px] relative self-stretch flex items-center justify-center overflow-hidden">
          <img
            src={category.img}
            alt={category.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col justify-center gap-2 p-3 flex-1">
          {POINTS.map((points) => {
            const played = playedCells.has(`${catIdx}-${points}-r`);
            return (
              <motion.button
                key={`r-${points}`}
                whileHover={!played ? { scale: 1.05 } : {}}
                whileTap={!played ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "r")}
                disabled={played}
                className={btnClass(played)}
              >
                {points}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div
        className="shrink-0 text-center py-3 font-black text-white text-xl"
        style={{ backgroundColor: teamColor }}
      >
        {category.name}
      </div>
    </div>
  );
}

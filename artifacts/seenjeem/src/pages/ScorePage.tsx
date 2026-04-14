import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, LogOut, Gamepad2, Eye, Minus, Plus, RotateCcw, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useViewport } from "@/context/ViewportContext";

const API_BASE = "/api";

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
  const { token } = useAuth();
  const { viewMode } = useViewport();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [playedCells, setPlayedCells] = useState<Set<string>>(new Set());
  const [showEndModal, setShowEndModal] = useState(false);
  const [loadingCell, setLoadingCell] = useState<string | null>(null);
  const [questionCache, setQuestionCache] = useState<Record<string, any>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const sessionId = localStorage.getItem("rakez-session-id");
    if (!sessionId || !token) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`${API_BASE}/history/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          boardState: {
            playedCells: [...playedCells],
            team1Score,
            team2Score,
            currentTeam,
          },
        }),
      }).catch(() => {});
    }, 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [playedCells, team1Score, team2Score, currentTeam, token]);

  const DIFF_MAP: Record<number, string> = { 200: "easy", 400: "medium", 600: "hard" };

  useEffect(() => {
    if (!gameData) return;
    const cats = [...gameData.team1Categories, ...gameData.team2Categories];
    const diffs = ["easy", "medium", "hard"];
    const usedIds: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
    const excludeParam = usedIds.length ? `&excludeIds=${usedIds.join(",")}` : "";

    cats.forEach((cat) => {
      diffs.forEach((diff) => {
        const cacheKey = `${cat.id}-${diff}`;
        setQuestionCache((prev) => {
          if (prev[cacheKey]) return prev;
          fetch(`${API_BASE}/questions/game?categoryId=${cat.id}&difficulty=${diff}${excludeParam}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data) setQuestionCache((p) => ({ ...p, [cacheKey]: data }));
            })
            .catch(() => {});
          return prev;
        });
      });
    });
  }, [gameData]);

  if (!gameData) return null;

  const allCategories = [...gameData.team1Categories, ...gameData.team2Categories];
  const totalCells = allCategories.length * POINTS.length * 2;
  const allPlayed = playedCells.size >= totalCells;

  const prefetchQuestion = (categoryId: string, diff: string, excludeIds: number[]) => {
    const cacheKey = `${categoryId}-${diff}`;
    const excludeParam = excludeIds.length ? `&excludeIds=${excludeIds.join(",")}` : "";
    fetch(`${API_BASE}/questions/game?categoryId=${categoryId}&difficulty=${diff}${excludeParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setQuestionCache((p) => ({ ...p, [cacheKey]: data }));
      })
      .catch(() => {});
  };

  const handleCellClick = (catIdx: number, points: number, side: "l" | "r") => {
    const key = `${catIdx}-${points}-${side}`;
    if (playedCells.has(key) || loadingCell) return;

    const category = allCategories[catIdx];
    const diff = DIFF_MAP[points] || "medium";
    const cacheKey = `${category.id}-${diff}`;
    const cached = questionCache[cacheKey];

    if (cached) {
      const usedIds: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
      const newUsed = [...usedIds, cached.id];
      localStorage.setItem("rakez-used-question-ids", JSON.stringify(newUsed));

      setQuestionCache((prev) => {
        const next = { ...prev };
        delete next[cacheKey];
        return next;
      });

      prefetchQuestion(category.id, diff, newUsed);

      localStorage.setItem("rakez-current-question", JSON.stringify({
        categoryId: category.id,
        categoryName: category.name,
        points,
        catIdx,
        side,
        currentTeam,
        questionId: cached.id,
        question: cached.question,
        answer: cached.answer,
        image: cached.image || category.img,
      }));

      navigate("/question");
    } else {
      setLoadingCell(key);
      const usedIds: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
      const excludeParam = usedIds.length ? `&excludeIds=${usedIds.join(",")}` : "";
      fetch(`${API_BASE}/questions/game?categoryId=${category.id}&difficulty=${diff}${excludeParam}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const q = data || { question: "لا توجد أسئلة لهذه الفئة. يرجى إضافة أسئلة من لوحة التحكم.", answer: "—", image: category.img };
          if (data?.id) {
            const latest: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
            const newUsed = [...latest, data.id];
            localStorage.setItem("rakez-used-question-ids", JSON.stringify(newUsed));
            prefetchQuestion(category.id, diff, newUsed);
          }
          localStorage.setItem("rakez-current-question", JSON.stringify({
            categoryId: category.id,
            categoryName: category.name,
            points,
            catIdx,
            side,
            currentTeam,
            question: q.question,
            answer: q.answer,
            image: q.image || category.img,
          }));
          navigate("/question");
        })
        .catch(() => setLoadingCell(null))
        .finally(() => setLoadingCell(null));
    }
  };

  const handleEndGame = () => {
    setShowEndModal(true);
  };

  const handleExit = () => {
    const sessionId = localStorage.getItem("rakez-session-id");
    if (sessionId && token) {
      fetch(`${API_BASE}/history/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "completed" }),
      }).catch(() => {});
    }
    localStorage.removeItem("rakez-game-data");
    localStorage.removeItem("rakez-scores");
    localStorage.removeItem("rakez-played-cells");
    localStorage.removeItem("rakez-current-team");
    localStorage.removeItem("rakez-used-tools");
    localStorage.removeItem("rakez-current-question");
    localStorage.removeItem("rakez-session-id");
    localStorage.removeItem("rakez-used-question-ids");
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
    <div className={`${viewMode === "mobile" ? "min-h-full overflow-auto" : "h-screen overflow-hidden"} bg-gradient-to-br from-[#f0e8ff] via-[#e8e0f0] to-[#f0f0ff] flex flex-col`} dir="rtl">
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
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36"
            >
              <Eye size={15} />
              <span>انتهاء اللعبة</span>
            </button>
            <button
              onClick={handleResetBoard}
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36"
            >
              <RotateCcw size={15} />
              <span>إعادة</span>
            </button>
            <button
              onClick={handleExit}
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36"
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
              loadingCell={loadingCell}
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
              loadingCell={loadingCell}
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
  loadingCell,
}: {
  category: CategoryData;
  catIdx: number;
  playedCells: Set<string>;
  onCellClick: (catIdx: number, points: number, side: "l" | "r") => void;
  teamColor: string;
  loadingCell?: string | null;
}) {
  const btnClass = (played: boolean, isLoading: boolean) => `
    w-full flex-1 rounded-xl font-black text-2xl transition-all relative
    ${played
      ? "bg-gray-300/40 text-gray-400 cursor-not-allowed"
      : isLoading
        ? "bg-[#7B2FBE] text-white cursor-wait"
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
            const isLoading = loadingCell === `${catIdx}-${points}-l`;
            return (
              <motion.button
                key={`l-${points}`}
                whileHover={!played && !isLoading ? { scale: 1.05 } : {}}
                whileTap={!played && !isLoading ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "l")}
                disabled={played || !!loadingCell}
                className={btnClass(played, isLoading)}
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                ) : points}
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
            const isLoading = loadingCell === `${catIdx}-${points}-r`;
            return (
              <motion.button
                key={`r-${points}`}
                whileHover={!played && !isLoading ? { scale: 1.05 } : {}}
                whileTap={!played && !isLoading ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "r")}
                disabled={played || !!loadingCell}
                className={btnClass(played, isLoading)}
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                ) : points}
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

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, LogOut, Eye, Minus, Plus, RotateCcw, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useViewport } from "@/context/ViewportContext";

const API_BASE = "/api";
const CDN = "https://d442zbpa1tgal.cloudfront.net";
const TOOLS_CDN = "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page";

const HELP_TOOLS_MAP: Record<string, { name: string; icon: string }> = {
  double: { name: "جاوب جوابين", icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg" },
  call:   { name: "اتصال بصديق", icon: `${TOOLS_CDN}/circle-call.png` },
  pit:    { name: "الحفرة",       icon: `${TOOLS_CDN}/circle-replace.png` },
  rest:   { name: "استريح",      icon: `${TOOLS_CDN}/circle-hand.png` },
};

type CategoryData = { id: string; name: string; img: string };
type GameData = {
  team1Name: string; team2Name: string; gameName: string;
  team1Categories: CategoryData[]; team2Categories: CategoryData[];
  team1Tools?: string[]; team2Tools?: string[];
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
  const [usedTools, setUsedTools] = useState<{ team1: string[]; team2: string[] }>({ team1: [], team2: [] });
  const [pitActive, setPitActive] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-game-data");
    if (stored) setGameData(JSON.parse(stored));
    else setGameData({
      team1Name: "الفريق الأول", team2Name: "الفريق الثاني", gameName: "ركز",
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
      team1Tools: ["double", "pit", "rest"],
      team2Tools: ["double", "pit", "rest"],
    });

    const scores = localStorage.getItem("rakez-scores");
    if (scores) { const p = JSON.parse(scores); setTeam1Score(p.team1Score || 0); setTeam2Score(p.team2Score || 0); }

    const savedCells = localStorage.getItem("rakez-played-cells");
    if (savedCells) setPlayedCells(new Set(JSON.parse(savedCells)));

    const savedTeam = localStorage.getItem("rakez-current-team");
    if (savedTeam) setCurrentTeam(JSON.parse(savedTeam) as 1 | 2);

    const tools = localStorage.getItem("rakez-used-tools");
    if (tools) setUsedTools(JSON.parse(tools));

    const answered = localStorage.getItem("rakez-answered-cell");
    if (answered) {
      const { catIdx, points, side, correct, team, pitActive } = JSON.parse(answered);
      localStorage.removeItem("rakez-answered-cell");
      const key = `${catIdx}-${points}-${side ?? "l"}`;
      setPlayedCells((prev) => { const next = new Set(prev); next.add(key); return next; });
      if (correct && team !== 0) {
        if (pitActive) {
          // الحفرة: الفائز يكسب النقاط والخاسر يخسرها
          if (team === 1) {
            setTeam1Score((s) => s + points);
            setTeam2Score((s) => s - points);
          } else {
            setTeam2Score((s) => s + points);
            setTeam1Score((s) => s - points);
          }
        } else {
          if (team === 1) setTeam1Score((s) => s + points);
          else setTeam2Score((s) => s + points);
        }
      }
      setCurrentTeam((t) => (t === 1 ? 2 : 1));
    }
  }, []);

  useEffect(() => { if (playedCells.size > 0) localStorage.setItem("rakez-played-cells", JSON.stringify([...playedCells])); }, [playedCells]);
  useEffect(() => { localStorage.setItem("rakez-scores", JSON.stringify({ team1Score, team2Score })); }, [team1Score, team2Score]);
  useEffect(() => { localStorage.setItem("rakez-current-team", JSON.stringify(currentTeam)); }, [currentTeam]);

  const allCategories = gameData ? [...gameData.team1Categories, ...gameData.team2Categories] : [];
  const totalCells = allCategories.length * POINTS.length * 2;
  const allPlayed = totalCells > 0 && playedCells.size >= totalCells;

  useEffect(() => {
    if (totalCells > 0 && allPlayed) {
      const t = setTimeout(() => navigate("/win-page"), 1200);
      return () => clearTimeout(t);
    }
  }, [allPlayed, totalCells]);

  useEffect(() => {
    const sessionId = localStorage.getItem("rakez-session-id");
    if (!sessionId || !token) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`${API_BASE}/history/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ boardState: { playedCells: [...playedCells], team1Score, team2Score, currentTeam } }),
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
            .then((data) => { if (data) setQuestionCache((p) => ({ ...p, [cacheKey]: data })); })
            .catch(() => {});
          return prev;
        });
      });
    });
  }, [gameData]);

  if (!gameData) return null;

  const prefetchQuestion = (categoryId: string, diff: string, excludeIds: number[]) => {
    const cacheKey = `${categoryId}-${diff}`;
    const excludeParam = excludeIds.length ? `&excludeIds=${excludeIds.join(",")}` : "";
    fetch(`${API_BASE}/questions/game?categoryId=${categoryId}&difficulty=${diff}${excludeParam}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setQuestionCache((p) => ({ ...p, [cacheKey]: data })); })
      .catch(() => {});
  };

  const currentTeamKey = currentTeam === 1 ? "team1" : "team2";

  const handlePitToggle = () => setPitActive((v) => !v);

  const handleCellClick = (catIdx: number, points: number, side: "l" | "r") => {
    const key = `${catIdx}-${points}-${side}`;
    if (playedCells.has(key) || loadingCell) return;

    const category = allCategories[catIdx];
    const diff = DIFF_MAP[points] || "medium";
    const cacheKey = `${category.id}-${diff}`;
    const cached = questionCache[cacheKey];

    // Lock pit when question is pressed
    if (pitActive) {
      const updatedTools = { ...usedTools, [currentTeamKey]: [...usedTools[currentTeamKey], "pit"] };
      setUsedTools(updatedTools);
      localStorage.setItem("rakez-used-tools", JSON.stringify(updatedTools));
    }

    const navigateToQuestion = (q: any) => {
      localStorage.setItem("rakez-current-question", JSON.stringify({
        categoryId: category.id, categoryName: category.name,
        points, catIdx, side, currentTeam,
        questionId: q.id, question: q.question, answer: q.answer,
        image: q.image || category.img,
        pitActive,
      }));
      setPitActive(false);
      navigate("/question");
    };

    if (cached) {
      const usedIds: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
      const newUsed = [...usedIds, cached.id];
      localStorage.setItem("rakez-used-question-ids", JSON.stringify(newUsed));
      setQuestionCache((prev) => { const next = { ...prev }; delete next[cacheKey]; return next; });
      prefetchQuestion(category.id, diff, newUsed);
      navigateToQuestion(cached);
    } else {
      setLoadingCell(key);
      const usedIds: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
      const excludeParam = usedIds.length ? `&excludeIds=${usedIds.join(",")}` : "";
      fetch(`${API_BASE}/questions/game?categoryId=${category.id}&difficulty=${diff}${excludeParam}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const q = data || { question: "لا توجد أسئلة لهذه الفئة.", answer: "—", image: category.img };
          if (data?.id) {
            const latest: number[] = JSON.parse(localStorage.getItem("rakez-used-question-ids") || "[]");
            const newUsed = [...latest, data.id];
            localStorage.setItem("rakez-used-question-ids", JSON.stringify(newUsed));
            prefetchQuestion(category.id, diff, newUsed);
          }
          navigateToQuestion(q);
        })
        .catch(() => setLoadingCell(null))
        .finally(() => setLoadingCell(null));
    }
  };

  const handleEndGame = () => setShowEndModal(true);

  const handleExit = () => {
    const sessionId = localStorage.getItem("rakez-session-id");
    if (sessionId && token) {
      fetch(`${API_BASE}/history/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "completed" }),
      }).catch(() => {});
    }
    ["rakez-game-data","rakez-scores","rakez-played-cells","rakez-current-team","rakez-used-tools","rakez-current-question","rakez-session-id","rakez-used-question-ids"].forEach(k => localStorage.removeItem(k));
    navigate("/start-game");
  };

  const handleResetBoard = () => {
    setPlayedCells(new Set()); setTeam1Score(0); setTeam2Score(0); setCurrentTeam(1);
    setShowEndModal(false); setPitActive(false);
    setUsedTools({ team1: [], team2: [] });
    localStorage.removeItem("rakez-played-cells");
    localStorage.setItem("rakez-scores", JSON.stringify({ team1Score: 0, team2Score: 0 }));
    localStorage.setItem("rakez-current-team", JSON.stringify(1));
    localStorage.removeItem("rakez-used-tools");
  };

  const currentTeamName = currentTeam === 1 ? gameData.team1Name : gameData.team2Name;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#f0e8ff] via-[#e8e0f0] to-[#f0f0ff] flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="shrink-0 bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-6 py-3 shadow-lg border-b border-white/10 pt-[24px] pb-[24px]">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4 shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-10 pl-[22px] pr-[22px]" />
            <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full font-bold border border-white/20 text-[15px] pt-[10px] pb-[10px] pl-[25px] pr-[25px]">
              دور فريق: {currentTeamName}
            </div>
          </div>
          <div className="absolute inset-x-0 flex justify-center pointer-events-none">
            <span className="text-white font-bold text-lg">{gameData.gameName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleEndGame} className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36">
              <Eye size={15} /><span>انتهاء اللعبة</span>
            </button>
            <button onClick={handleResetBoard} className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36">
              <RotateCcw size={15} /><span>إعادة</span>
            </button>
            <button onClick={handleExit} className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 border-white/25 hover:border-white/50 w-36">
              <LogOut size={14} /><span>الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 min-h-0 p-4 flex flex-col gap-4">
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
          {gameData.team1Categories.map((cat, catIdx) => (
            <CategoryCard key={cat.id} category={cat} catIdx={catIdx} playedCells={playedCells} onCellClick={handleCellClick} teamColor="#7B2FBE" loadingCell={loadingCell} />
          ))}
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
          {gameData.team2Categories.map((cat, catIdx) => (
            <CategoryCard key={cat.id} category={cat} catIdx={catIdx + 3} playedCells={playedCells} onCellClick={handleCellClick} teamColor="#9333ea" loadingCell={loadingCell} />
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="shrink-0 bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-6 border-t border-white/10 py-4 flex items-center justify-between gap-4 relative">
        {/* Team 1 */}
        <div className="flex items-center gap-2 flex-1">
          <div className="h-10 flex items-center bg-white/20 text-white px-4 rounded-full font-black border border-white/20 text-[14px] shrink-0 whitespace-nowrap">
            {gameData.team1Name}
          </div>
          <div className="h-10 flex items-center justify-center bg-white/90 text-[#7B2FBE] font-black text-lg rounded-full shadow-inner px-4 border-2 min-w-[60px] shrink-0">
            {team1Score}
          </div>
          {/* Tool icons — same height h-10 */}
          {((gameData.team1Tools?.length > 0) ? gameData.team1Tools : ["double", "pit", "rest"]).map((toolId) => {
            const tool = HELP_TOOLS_MAP[toolId];
            if (!tool) return null;
            const used = usedTools.team1.includes(toolId);
            const isActive = toolId === "pit" && currentTeam === 1 && !used;
            return (
              <motion.button
                key={toolId}
                whileHover={isActive ? { scale: 1.1 } : {}}
                whileTap={isActive ? { scale: 0.9 } : {}}
                onClick={() => isActive && handlePitToggle()}
                disabled={!isActive}
                title={tool.name}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                  isActive && pitActive
                    ? "bg-yellow-400 border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.9)] cursor-pointer"
                    : isActive
                      ? "bg-white/25 border-white/50 hover:bg-white/40 cursor-pointer"
                      : "bg-white/8 border-white/15 cursor-not-allowed"
                }`}
              >
                <img src={tool.icon} alt={tool.name} className="w-5 h-5 object-contain"
                  style={isActive ? { filter: "brightness(0) invert(1)" } : { filter: "brightness(0) invert(1) opacity(0.35)" }} />
              </motion.button>
            );
          })}
          {/* Score controls */}
          <button onClick={() => setTeam1Score((s) => s - 200)} className="w-10 h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-colors shrink-0 shadow-sm">
            <Minus size={18} color="#5a1f8e" strokeWidth={3} />
          </button>
          <button onClick={() => setTeam1Score((s) => s + 200)} className="w-10 h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-colors shrink-0 shadow-sm">
            <Plus size={18} color="#5a1f8e" strokeWidth={3} />
          </button>
        </div>

        {/* Center — absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <img
            src={`${import.meta.env.BASE_URL}logo-diwan-white.png`}
            alt="ديوان الدارع"
            className="h-16 w-auto object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button onClick={() => setTeam2Score((s) => s - 200)} className="w-10 h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-colors shrink-0 shadow-sm">
            <Minus size={18} color="#5a1f8e" strokeWidth={3} />
          </button>
          <button onClick={() => setTeam2Score((s) => s + 200)} className="w-10 h-10 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-colors shrink-0 shadow-sm">
            <Plus size={18} color="#5a1f8e" strokeWidth={3} />
          </button>
          {/* Tool icons */}
          {((gameData.team2Tools?.length > 0) ? gameData.team2Tools : ["double", "pit", "rest"]).map((toolId) => {
            const tool = HELP_TOOLS_MAP[toolId];
            if (!tool) return null;
            const used = usedTools.team2.includes(toolId);
            const isActive = toolId === "pit" && currentTeam === 2 && !used;
            return (
              <motion.button
                key={toolId}
                whileHover={isActive ? { scale: 1.1 } : {}}
                whileTap={isActive ? { scale: 0.9 } : {}}
                onClick={() => isActive && handlePitToggle()}
                disabled={!isActive}
                title={tool.name}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                  isActive && pitActive
                    ? "bg-yellow-400 border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.9)] cursor-pointer"
                    : isActive
                      ? "bg-white/25 border-white/50 hover:bg-white/40 cursor-pointer"
                      : "bg-white/8 border-white/15 cursor-not-allowed"
                }`}
              >
                <img src={tool.icon} alt={tool.name} className="w-5 h-5 object-contain"
                  style={isActive ? { filter: "brightness(0) invert(1)" } : { filter: "brightness(0) invert(1) opacity(0.35)" }} />
              </motion.button>
            );
          })}
          <div className="h-10 flex items-center justify-center bg-white/90 text-[#7B2FBE] font-black text-lg rounded-full shadow-inner px-4 border-2 min-w-[60px] shrink-0">
            {team2Score}
          </div>
          <div className="h-10 flex items-center bg-white/20 text-white px-4 rounded-full font-black border border-white/20 text-[14px] shrink-0 whitespace-nowrap">
            {gameData.team2Name}
          </div>
        </div>
      </div>

      {/* Pit active indicator */}
      <AnimatePresence>
        {pitActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-black font-black px-6 py-3 rounded-full shadow-xl text-sm border-2 border-yellow-300"
          >
            ⚡ الحفرة نشطة — اضغط على سؤال لتفعيلها
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Game Modal */}
      <AnimatePresence>
        {(showEndModal || allPlayed) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEndModal(false)}
          >
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] p-8 text-center">
                <Trophy size={64} className="text-yellow-300 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">
                  {team1Score > team2Score ? `فاز ${gameData.team1Name}!` : team2Score > team1Score ? `فاز ${gameData.team2Name}!` : "تعادل!"}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-around mb-6">
                  <div className="text-center"><p className="text-sm text-foreground/60 mb-1">{gameData.team1Name}</p><p className="text-4xl font-black text-[#7B2FBE]">{team1Score}</p></div>
                  <div className="text-foreground/30 font-black text-2xl">VS</div>
                  <div className="text-center"><p className="text-sm text-foreground/60 mb-1">{gameData.team2Name}</p><p className="text-4xl font-black text-[#9333ea]">{team2Score}</p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleResetBoard} className="flex-1 bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-bold py-3 rounded-xl transition-colors">لعبة جديدة</button>
                  <button onClick={handleExit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-foreground font-bold py-3 rounded-xl transition-colors">الخروج</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryCard({ category, catIdx, playedCells, onCellClick, teamColor, loadingCell }: {
  category: CategoryData; catIdx: number; playedCells: Set<string>;
  onCellClick: (catIdx: number, points: number, side: "l" | "r") => void;
  teamColor: string; loadingCell?: string | null;
}) {
  const btnClass = (played: boolean, isLoading: boolean) => `
    w-full flex-1 rounded-xl font-black text-2xl transition-all relative
    ${played ? "bg-gray-300/40 text-gray-400 cursor-not-allowed"
      : isLoading ? "bg-[#7B2FBE] text-white cursor-wait"
      : "bg-white/60 hover:bg-[#7B2FBE] text-gray-700 hover:text-white cursor-pointer shadow-sm hover:shadow-lg border border-white/50 hover:border-[#7B2FBE]"}
  `;
  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/50 min-h-0">
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col justify-center gap-2 p-3 flex-1">
          {POINTS.map((points) => {
            const played = playedCells.has(`${catIdx}-${points}-l`);
            const isLoading = loadingCell === `${catIdx}-${points}-l`;
            return (
              <motion.button key={`l-${points}`} whileHover={!played && !isLoading ? { scale: 1.05 } : {}} whileTap={!played && !isLoading ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "l")} disabled={played || !!loadingCell} className={btnClass(played, isLoading)}>
                {isLoading ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> : points}
              </motion.button>
            );
          })}
        </div>
        <div className="w-[40%] min-w-[120px] relative self-stretch flex items-center justify-center overflow-hidden">
          <img src={category.img} alt={category.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col justify-center gap-2 p-3 flex-1">
          {POINTS.map((points) => {
            const played = playedCells.has(`${catIdx}-${points}-r`);
            const isLoading = loadingCell === `${catIdx}-${points}-r`;
            return (
              <motion.button key={`r-${points}`} whileHover={!played && !isLoading ? { scale: 1.05 } : {}} whileTap={!played && !isLoading ? { scale: 0.95 } : {}}
                onClick={() => onCellClick(catIdx, points, "r")} disabled={played || !!loadingCell} className={btnClass(played, isLoading)}>
                {isLoading ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> : points}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 px-3 py-2 text-center font-black text-sm truncate" style={{ color: teamColor }}>
        {category.name}
      </div>
    </div>
  );
}

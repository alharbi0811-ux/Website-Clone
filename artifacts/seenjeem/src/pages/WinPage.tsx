import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const CONFETTI_COLORS = [
  "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
  "#ec4899", "#f97316", "#06b6d4", "#84cc16", "#ffffff",
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  shape: "rect" | "circle";
}

function Confetti() {
  const pieces: Piece[] = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
    rotate: Math.random() * 720 - 360,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0.8, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.shape === "rect" ? p.size : p.size,
            height: p.shape === "rect" ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function WinPage() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<{
    team1Name: string; team2Name: string;
    team1Score: number; team2Score: number;
  } | null>(null);

  useEffect(() => {
    const gameData = localStorage.getItem("rakez-game-data");
    const scores = localStorage.getItem("rakez-scores");
    if (gameData && scores) {
      const g = JSON.parse(gameData);
      const s = JSON.parse(scores);
      setData({
        team1Name: g.team1Name || "الفريق الأول",
        team2Name: g.team2Name || "الفريق الثاني",
        team1Score: s.team1Score || 0,
        team2Score: s.team2Score || 0,
      });
    }
  }, []);

  const handlePlayAgain = () => {
    ["rakez-game-data","rakez-scores","rakez-played-cells","rakez-current-team",
     "rakez-used-tools","rakez-current-question","rakez-session-id","rakez-used-question-ids"]
      .forEach(k => localStorage.removeItem(k));
    navigate("/start-game");
  };

  if (!data) return null;

  const { team1Name, team2Name, team1Score, team2Score } = data;
  const isTie = team1Score === team2Score;
  const winner = team1Score > team2Score ? team1Name : team2Name;
  const winnerScore = Math.max(team1Score, team2Score);
  const loserScore = Math.min(team1Score, team2Score);
  const loserName = team1Score > team2Score ? team2Name : team1Name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a0f6e] via-[#5a1f8e] to-[#7B2FBE] flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
      <Confetti />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg w-full">

        {/* Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        >
          <h1 className="text-5xl font-black text-white drop-shadow-lg">
            {isTie ? "مبروك للجميع" : "مبروك الفوز"}
          </h1>
        </motion.div>

        {/* Winner name */}
        {!isTie && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              boxShadow: [
                "0 0 20px 6px rgba(251,191,36,0.7)",
                "0 0 50px 18px rgba(251,191,36,1)",
                "0 0 20px 6px rgba(251,191,36,0.7)",
              ],
            }}
            transition={{
              y: { delay: 0.3, type: "spring", bounce: 0.4 },
              opacity: { delay: 0.3, duration: 0.4 },
              boxShadow: { delay: 0.7, duration: 1.8, repeat: Infinity },
            }}
            className="bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 text-black font-black text-4xl px-10 py-4 rounded-3xl border-4 border-yellow-200"
            style={{ textShadow: "0 1px 0 rgba(0,0,0,0.25)" }}
          >
            {winner}
          </motion.div>
        )}

        {/* Score cards */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center w-full"
        >
          {/* Team 1 */}
          <div className={`flex-1 rounded-2xl overflow-hidden shadow-xl border-2 ${
            isTie ? "border-yellow-400" : team1Score >= team2Score ? "border-yellow-400" : "border-white/20"
          }`}>
            <div className="bg-black/40 px-4 py-2 text-white font-black text-center text-sm">{team1Name}</div>
            <div className={`px-4 py-5 flex items-center justify-center font-black text-4xl text-white ${
              isTie ? "bg-yellow-500/70" : team1Score >= team2Score ? "bg-yellow-500/70" : "bg-red-600/70"
            }`}>
              {team1Score}
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <span className="text-white/50 font-black text-2xl">VS</span>
          </div>

          {/* Team 2 */}
          <div className={`flex-1 rounded-2xl overflow-hidden shadow-xl border-2 ${
            isTie ? "border-yellow-400" : team2Score >= team1Score ? "border-yellow-400" : "border-white/20"
          }`}>
            <div className="bg-black/40 px-4 py-2 text-white font-black text-center text-sm">{team2Name}</div>
            <div className={`px-4 py-5 flex items-center justify-center font-black text-4xl text-white ${
              isTie ? "bg-yellow-500/70" : team2Score >= team1Score ? "bg-yellow-500/70" : "bg-red-600/70"
            }`}>
              {team2Score}
            </div>
          </div>
        </motion.div>

        {/* Play again */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAgain}
          className="bg-white text-[#7B2FBE] font-black text-xl px-12 py-4 rounded-full shadow-2xl border-4 border-white/80 hover:bg-white/90 transition-colors"
        >
          العب مرة ثانية
        </motion.button>
      </div>
    </div>
  );
}

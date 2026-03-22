import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { LogOut, Eye, Pause, Play, RotateCw, ArrowRight } from "lucide-react";

const CDN = "https://d442zbpa1tgal.cloudfront.net";
const TOOLS_CDN = "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page";

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
  team1Tools?: string[];
  team2Tools?: string[];
};

type QuestionData = {
  categoryId: string;
  categoryName: string;
  points: number;
  catIdx: number;
  currentTeam: 1 | 2;
  question: string;
  answer: string;
  image?: string;
};

const HELP_TOOLS_MAP: Record<string, { name: string; icon: string }> = {
  double: { name: "جاوب جوابين", icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg" },
  call: { name: "اتصال بصديق", icon: `${TOOLS_CDN}/circle-call.png` },
  pit: { name: "الحفرة", icon: `${TOOLS_CDN}/circle-replace.png` },
  rest: { name: "استريح", icon: `${TOOLS_CDN}/circle-hand.png` },
};


export default function QuestionPage() {
  const [, navigate] = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [usedTools, setUsedTools] = useState<{ team1: string[]; team2: string[] }>({ team1: [], team2: [] });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-game-data");
    if (stored) {
      setGameData(JSON.parse(stored));
    } else {
      setGameData({
        team1Name: "الفريق الأول",
        team2Name: "الفريق الثاني",
        gameName: "ركز",
        team1Categories: [],
        team2Categories: [],
        team1Tools: ["double", "call", "pit", "rest"],
        team2Tools: ["double", "call", "pit", "rest"],
      });
    }

    const qStored = localStorage.getItem("rakez-current-question");
    if (qStored) {
      setQuestionData(JSON.parse(qStored));
    } else {
      setQuestionData({
        categoryId: "sample",
        categoryName: "معلومات عامة",
        points: 200,
        catIdx: 0,
        currentTeam: 1,
        question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
        answer: "المشتري",
        image: "",
      });
    }

    const scores = localStorage.getItem("rakez-scores");
    if (scores) {
      const parsed = JSON.parse(scores);
      setTeam1Score(parsed.team1Score || 0);
      setTeam2Score(parsed.team2Score || 0);
    }

    const tools = localStorage.getItem("rakez-used-tools");
    if (tools) setUsedTools(JSON.parse(tools));
  }, []);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timer]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const resetTimer = () => {
    setTimer(30);
    setIsTimerRunning(true);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleCorrect = () => {
    if (!questionData) return;
    const points = questionData.points;
    const team = questionData.currentTeam;
    const newT1 = team === 1 ? team1Score + points : team1Score;
    const newT2 = team === 2 ? team2Score + points : team2Score;
    localStorage.setItem("rakez-scores", JSON.stringify({ team1Score: newT1, team2Score: newT2 }));
    localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points, correct: true, team: questionData.currentTeam }));
    navigate("/score-page");
  };

  const handleWrong = () => {
    if (!questionData) return;
    localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points: questionData.points, correct: false, team: questionData.currentTeam }));
    navigate("/score-page");
  };

  const handleBackToBoard = () => {
    navigate("/score-page");
  };

  const handleUseTool = (team: 1 | 2, toolId: string) => {
    const key = team === 1 ? "team1" : "team2";
    if (usedTools[key].includes(toolId)) return;
    const updated = { ...usedTools, [key]: [...usedTools[key], toolId] };
    setUsedTools(updated);
    localStorage.setItem("rakez-used-tools", JSON.stringify(updated));
  };

  if (!gameData || !questionData) return null;

  const team1Tools = gameData.team1Tools || ["double", "call", "pit", "rest"];
  const team2Tools = gameData.team2Tools || ["double", "call", "pit", "rest"];

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-10" />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold text-sm">
            دور فريق: {questionData.currentTeam === 1 ? gameData.team1Name : gameData.team2Name}
          </div>
          <div className="text-white/80 font-medium text-sm hidden md:block">
            {gameData.gameName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToBoard}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">انتهاء اللعبة</span>
          </button>
          <button
            onClick={handleBackToBoard}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">الرجوع للوحة</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("rakez-game-data");
              navigate("/start-game");
            }}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">الخروج</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-l from-[#9333ea] to-[#7B2FBE] px-6 py-3 flex items-center justify-center gap-6 shadow-md">
        <button
          onClick={toggleTimer}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="text-white font-black text-3xl tracking-wider min-w-[100px] text-center font-mono">
          {formatTime(timer)}
        </div>
        <button
          onClick={resetTimer}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <RotateCw size={18} />
        </button>
      </div>

      <div className="flex-1 flex">
        <div className="w-[280px] bg-gray-50 border-l-2 border-gray-100 p-4 flex flex-col gap-6">
          <TeamSidebar
            teamName={gameData.team1Name}
            score={team1Score}
            tools={team1Tools}
            usedTools={usedTools.team1}
            onUseTool={(toolId) => handleUseTool(1, toolId)}
            isCurrentTeam={questionData.currentTeam === 1}
          />

          <div className="border-t-2 border-gray-200"></div>

          <TeamSidebar
            teamName={gameData.team2Name}
            score={team2Score}
            tools={team2Tools}
            usedTools={usedTools.team2}
            onUseTool={(toolId) => handleUseTool(2, toolId)}
            isCurrentTeam={questionData.currentTeam === 2}
          />
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 border-4 border-[#7B2FBE] rounded-3xl p-8 flex flex-col bg-white">
            {/* Title */}
            <div className="text-center mb-4">
              <h2 className="text-3xl font-black text-[#7B2FBE] mb-2">
                {questionData.categoryName}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                السؤال رقم {questionData.points}
              </p>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <p className="text-xl font-bold text-foreground leading-relaxed">
                {questionData.question}
              </p>
            </div>

            {/* Image/Content Area */}
            <div className="flex-1 flex items-center justify-center mb-8 overflow-hidden">
              {questionData.image ? (
                <img
                  src={questionData.image}
                  alt="صورة السؤال"
                  className="max-w-full max-h-[350px] object-contain"
                />
              ) : (
                <div className="text-8xl text-gray-300">؟</div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 bg-[#7B2FBE]/10 hover:bg-[#7B2FBE]/20 text-[#7B2FBE] font-black py-3 px-6 rounded-full transition-colors text-sm"
              >
                <span>{formatTime(timer)}</span>
              </button>

              <button
                onClick={() => setShowAnswer(true)}
                className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black text-lg py-3 px-10 rounded-full shadow-lg transition-colors"
              >
                اختر الإجابة
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-6"
            dir="rtl"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShowAnswer(false)}
                className="flex items-center gap-1.5 bg-[#7B2FBE]/15 hover:bg-[#7B2FBE]/25 text-[#7B2FBE] px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <ArrowRight size={16} />
                العودة
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <h1 className="text-4xl font-black text-[#7B2FBE] text-center">
                {questionData.categoryName}
              </h1>

              <div className="text-center max-w-2xl">
                <p className="text-gray-600 text-lg mb-6">
                  {questionData.question}
                </p>
              </div>

              <div className="bg-gradient-to-l from-[#7B2FBE] to-[#9333ea] text-white rounded-3xl p-12 text-center max-w-2xl shadow-2xl">
                <p className="text-5xl font-black mb-4">الإجابة:</p>
                <p className="text-4xl font-black leading-relaxed">
                  {questionData.answer}
                </p>
              </div>

              <div className="flex gap-6 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCorrect}
                  className="bg-green-500 hover:bg-green-600 text-white font-black text-lg py-4 px-12 rounded-full shadow-lg transition-colors"
                >
                  إجابة صحيحة ✓
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWrong}
                  className="bg-red-500 hover:bg-red-600 text-white font-black text-lg py-4 px-12 rounded-full shadow-lg transition-colors"
                >
                  إجابة خاطئة ✗
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamSidebar({
  teamName,
  score,
  tools,
  usedTools,
  onUseTool,
  isCurrentTeam,
}: {
  teamName: string;
  score: number;
  tools: string[];
  usedTools: string[];
  onUseTool: (toolId: string) => void;
  isCurrentTeam: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-full text-center py-2 rounded-xl font-black text-white text-sm ${isCurrentTeam ? "bg-[#7B2FBE]" : "bg-[#7B2FBE]/60"}`}>
        {teamName}
      </div>

      <div className="text-4xl font-black text-foreground">{score}</div>

      <p className="text-xs font-bold text-foreground/60">وسائل المساعدة</p>

      <div className="flex gap-2 flex-wrap justify-center">
        {tools.map((toolId) => {
          const tool = HELP_TOOLS_MAP[toolId];
          if (!tool) return null;
          const used = usedTools.includes(toolId);
          return (
            <button
              key={toolId}
              onClick={() => !used && onUseTool(toolId)}
              disabled={used}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                used
                  ? "bg-gray-200 opacity-40 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-[#7B2FBE]/10 hover:ring-2 hover:ring-[#7B2FBE] cursor-pointer"
              }`}
              title={tool.name}
            >
              <img
                src={tool.icon}
                alt={tool.name}
                className="w-7 h-7 object-contain"
                style={
                  used
                    ? { filter: "grayscale(100%) opacity(0.3)" }
                    : { filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15)" }
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

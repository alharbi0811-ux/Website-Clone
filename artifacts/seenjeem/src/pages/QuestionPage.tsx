import { useState, useEffect, useRef } from "react";
import { useViewport } from "@/context/ViewportContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { LogOut, Eye, Pause, Play, RotateCw, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const CDN = "https://d442zbpa1tgal.cloudfront.net";
const TOOLS_CDN = "https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page";

type CategoryData = { id: string; name: string; img: string };
type GameData = {
  team1Name: string; team2Name: string; gameName: string;
  team1Categories: CategoryData[]; team2Categories: CategoryData[];
  team1Tools?: string[]; team2Tools?: string[];
};
type QuestionData = {
  categoryId: string; categoryName: string; points: number;
  catIdx: number; side: "l" | "r"; currentTeam: 1 | 2;
  question: string; answer: string; image?: string; answerImage?: string; pitActive?: boolean;
  externalPageSlug?: string | null; externalPageId?: number | null; qrTemplateId?: number | null;
};

const HELP_TOOLS_MAP: Record<string, { name: string; icon: string }> = {
  double: { name: "جاوب جوابين", icon: "https://seenjeemkw.com/assets/handIconBlue-Cf6L4RSE.svg" },
  call:   { name: "اتصال بصديق", icon: `${TOOLS_CDN}/circle-call.png` },
  pit:    { name: "الحفرة",       icon: `${TOOLS_CDN}/circle-replace.png` },
  rest:   { name: "استريح",      icon: `${TOOLS_CDN}/circle-hand.png` },
};

const CIRCULAR_TIMER_CONFIG: Record<number, { color: string; bg: string; duration: number }> = {
  200: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  duration: 90 },
  400: { color: "#eab308", bg: "rgba(234,179,8,0.12)",  duration: 60 },
  600: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  duration: 40 },
};

function CircularTimerSVG({ timeLeft, totalTime, color, size = 160 }: { timeLeft: number; totalTime: number; color: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = size * 0.07;
  const r = cx - strokeW - 2;
  const circ = 2 * Math.PI * r;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset = circ * (1 - progress);
  const display = timeLeft.toString().padStart(2, "0");
  const fontSize = Math.round(size * 0.28);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Track circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW} strokeOpacity={0.15} />
      {/* Progress circle */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.9s linear" }}
      />
      {/* Number */}
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(90, ${cx}, ${cy})`}
        style={{ fontFamily: "'Orbitron', sans-serif", fontSize, fontWeight: 900, fill: color }}
      >
        {display}
      </text>
    </svg>
  );
}

export default function QuestionPage() {
  const [, navigate] = useLocation();
  const { viewMode } = useViewport();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showCircularTimer, setShowCircularTimer] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [circularTimeLeft, setCircularTimeLeft] = useState(0);
  const [circularRunning, setCircularRunning] = useState(false);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [usedTools, setUsedTools] = useState<{ team1: string[]; team2: string[] }>({ team1: [], team2: [] });
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [flashTool, setFlashTool] = useState<{ name: string; key: number; color: "blue" | "white" } | null>(null);
  const [activeTurnTeam, setActiveTurnTeam] = useState<1 | 2 | null>(null);
  const [turnFlash, setTurnFlash] = useState<{ teamName: string; key: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const circTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [qrTemplate, setQrTemplate] = useState<{
    templateImageUrl: string | null;
    qrPositionX: number; qrPositionY: number; qrSize: number;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-game-data");
    if (stored) setGameData(JSON.parse(stored));
    else setGameData({
      team1Name: "الفريق الأول", team2Name: "الفريق الثاني", gameName: "ركز",
      team1Categories: [], team2Categories: [],
      team1Tools: ["double", "pit", "rest"], team2Tools: ["double", "pit", "rest"],
    });

    const qStored = localStorage.getItem("rakez-current-question");
    if (qStored) {
      const q = JSON.parse(qStored);
      setQuestionData(q);
      setActiveTurnTeam(q.currentTeam as 1 | 2);
    } else {
      setQuestionData({ categoryId: "sample", categoryName: "معلومات عامة", points: 200, catIdx: 0, currentTeam: 1, side: "l", question: "ما هو أكبر كوكب في المجموعة الشمسية؟", answer: "المشتري", image: "" });
      setActiveTurnTeam(1);
    }

    const scores = localStorage.getItem("rakez-scores");
    if (scores) { const p = JSON.parse(scores); setTeam1Score(p.team1Score || 0); setTeam2Score(p.team2Score || 0); }

    const tools = localStorage.getItem("rakez-used-tools");
    if (tools) setUsedTools(JSON.parse(tools));
  }, []);

  // Regular upward timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isTimerRunning) timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  // Circular countdown timer
  useEffect(() => {
    if (circTimerRef.current) clearInterval(circTimerRef.current);
    if (circularRunning) {
      circTimerRef.current = setInterval(() => {
        setCircularTimeLeft((t) => {
          if (t <= 1) { clearInterval(circTimerRef.current!); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (circTimerRef.current) clearInterval(circTimerRef.current); };
  }, [circularRunning]);

  useEffect(() => {
    fetch("/api/qr-templates/active")
      .then((r) => r.ok ? r.json() : null)
      .then((t) => { if (t) setQrTemplate(t); })
      .catch(() => {});
  }, []);

  // تبديل الدور بعد 90 ثانية (للأسئلة العادية فقط)
  useEffect(() => {
    if (timer === 90 && questionData && gameData) {
      const other = questionData.currentTeam === 1 ? 2 : 1;
      const otherName = questionData.currentTeam === 1 ? gameData.team2Name : gameData.team1Name;
      setActiveTurnTeam(other);
      setTurnFlash({ teamName: otherName, key: Date.now() });
    }
  }, [timer]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => { setTimer(0); setIsTimerRunning(true); };
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleOpenCircularTimer = () => {
    if (!questionData) return;
    const pts = questionData.points as 200 | 400 | 600;
    const cfg = CIRCULAR_TIMER_CONFIG[pts] || CIRCULAR_TIMER_CONFIG[200];
    setCircularTimeLeft(cfg.duration);
    setCircularRunning(true);
    setIsTimerRunning(false);
    setShowCircularTimer(true);
  };

  const handleRevealAnswer = () => {
    setCircularRunning(false);
    setShowCircularTimer(false);
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    if (!questionData) return;
    const { points, currentTeam, catIdx, side, pitActive } = questionData;
    localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx, points, side, correct: true, team: currentTeam, pitActive: !!pitActive }));
    navigate("/score-page");
  };

  const handleWrong = () => {
    if (!questionData) return;
    localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points: questionData.points, side: questionData.side, correct: false, team: questionData.currentTeam, pitActive: !!questionData.pitActive }));
    navigate("/score-page");
  };

  const handleBackToBoard = () => navigate("/score-page");

  const handleUseTool = (team: 1 | 2, toolId: string) => {
    const key = team === 1 ? "team1" : "team2";
    if (usedTools[key].includes(toolId)) return;
    const updated = { ...usedTools, [key]: [...usedTools[key], toolId] };
    setUsedTools(updated);
    localStorage.setItem("rakez-used-tools", JSON.stringify(updated));
    const tool = HELP_TOOLS_MAP[toolId];
    const color = toolId === "double" ? "blue" : "white";
    if (tool) setFlashTool({ name: tool.name, key: Date.now(), color });
  };

  if (!gameData || !questionData) return null;

  const team1Tools = (gameData.team1Tools && gameData.team1Tools.length > 0) ? gameData.team1Tools : ["double", "pit", "rest"];
  const team2Tools = (gameData.team2Tools && gameData.team2Tools.length > 0) ? gameData.team2Tools : ["double", "pit", "rest"];
  const ct = questionData.currentTeam;

  // فئة بدون كلام
  const isBadounKalam = questionData.categoryName.includes("كلام") || questionData.categoryName.includes("ولا كلمة");

  const pts = questionData.points as 200 | 400 | 600;
  const circCfg = CIRCULAR_TIMER_CONFIG[pts] || CIRCULAR_TIMER_CONFIG[200];
  const circTotal = circCfg.duration;

  // ── Template display helper ──────────────────────────────────────────────
  const renderTemplate = () => {
    if (questionData.externalPageSlug && qrTemplate) {
      return (
        <div className="flex flex-col items-center pb-6 px-4">
          <div
            className="relative rounded-2xl overflow-hidden w-full"
            style={{ maxWidth: 680, aspectRatio: "16/9" }}
          >
            {qrTemplate.templateImageUrl && (
              <img
                src={qrTemplate.templateImageUrl}
                alt="قالب"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: `${qrTemplate.qrPositionX}%`,
                top: `${qrTemplate.qrPositionY}%`,
                transform: "translate(-50%, -50%)",
                width: `${Math.round((qrTemplate.qrSize / 320) * 100)}%`,
                zIndex: 2,
                background: "white",
                padding: 4,
                borderRadius: 4,
              }}
            >
              <QRCodeSVG
                value={`${window.location.origin}/p/${questionData.externalPageSlug}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>
      );
    }
    if (questionData.externalPageSlug && !qrTemplate) {
      return (
        <div className="flex flex-col items-center gap-3 pb-4">
          <div className="p-3 bg-white border-4 border-[#7B2FBE] rounded-2xl shadow-[0_0_24px_rgba(123,47,190,0.4)]">
            <QRCodeSVG value={`${window.location.origin}/p/${questionData.externalPageSlug}`} size={180} />
          </div>
          <p className="text-xs font-mono text-gray-400">/p/{questionData.externalPageSlug}</p>
        </div>
      );
    }
    if (questionData.image && qrTemplate) {
      return (
        <div className="flex justify-center pb-6 px-4">
          <div
            className="relative rounded-2xl overflow-hidden w-full cursor-zoom-in hover:opacity-95 transition-opacity"
            style={{ maxWidth: 680, aspectRatio: "16/9" }}
            onClick={() => setLightboxImage(questionData.image!)}
          >
            {qrTemplate.templateImageUrl && (
              <img
                src={qrTemplate.templateImageUrl}
                alt="قالب"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
              />
            )}
            <img
              src={questionData.image}
              alt="QR"
              style={{
                position: "absolute",
                left: `${qrTemplate.qrPositionX}%`,
                top: `${qrTemplate.qrPositionY}%`,
                transform: "translate(-50%, -50%)",
                width: `${Math.round((qrTemplate.qrSize / 320) * 100)}%`,
                maxWidth: "90%",
                zIndex: 2,
              }}
            />
          </div>
        </div>
      );
    }
    if (questionData.image) {
      return (
        <div className="flex justify-center px-8 pb-4">
          <img
            src={questionData.image}
            alt="صورة السؤال"
            onClick={() => setLightboxImage(questionData.image!)}
            className="max-h-52 max-w-md object-contain rounded-2xl cursor-zoom-in hover:opacity-90 transition-opacity"
          />
        </div>
      );
    }
    return null;
  };

  // ── Shared layout parts ──────────────────────────────────────────────────
  const renderHeader = () => (
    <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between shadow-lg relative">
      <div className="flex items-center gap-3 shrink-0">
        <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-10" />
        <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold text-sm border border-white/20">
          دور: {ct === 1 ? gameData!.team1Name : gameData!.team2Name}
        </div>
        {questionData.pitActive && (
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-black flex items-center gap-1">
            <span>⚡</span><span>الحفرة نشطة</span>
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 flex justify-center pointer-events-none">
        <span className="text-white font-bold text-lg">{gameData!.gameName}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={handleBackToBoard} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-sm font-bold transition-all border-2 border-white/25">
          <Eye size={15} /><span>انتهاء اللعبة</span>
        </button>
        <button onClick={handleBackToBoard} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-sm font-bold transition-all border-2 border-white/25">
          <ArrowRight size={15} /><span>الرجوع</span>
        </button>
        <button onClick={() => { localStorage.removeItem("rakez-game-data"); navigate("/start-game"); }} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 active:scale-95 text-white px-4 py-2 rounded-full text-sm font-bold transition-all border-2 border-white/25">
          <LogOut size={14} /><span>الخروج</span>
        </button>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-[260px] bg-gray-50 border-l-2 border-gray-100 p-4 pt-16 flex flex-col gap-6">
      <TeamToolCard
        teamName={gameData!.team1Name} score={team1Score} tools={team1Tools}
        usedTools={usedTools.team1} onUseTool={(t) => handleUseTool(1, t)}
        isCurrentTeam={ct === 1} isActiveTurn={activeTurnTeam === 1}
      />
      <div className="border-t-2 border-gray-200" />
      <TeamToolCard
        teamName={gameData!.team2Name} score={team2Score} tools={team2Tools}
        usedTools={usedTools.team2} onUseTool={(t) => handleUseTool(2, t)}
        isCurrentTeam={ct === 2} isActiveTurn={activeTurnTeam === 2}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {renderHeader()}

      <div className="flex-1 flex">
        {renderSidebar()}

        {/* Question Area */}
        <div className="flex-1 flex flex-col p-6 pt-10">
          <div className="flex-1 relative border-4 border-[#7B2FBE] rounded-3xl bg-white flex flex-col">

            {/* Regular timer — مخفي في فئة بدون كلام */}
            {!isBadounKalam && (
              <div className="absolute -top-[26px] left-1/2 -translate-x-1/2 z-10">
                <div className="bg-[#7B2FBE] rounded-2xl px-5 py-2 flex items-center gap-3 shadow-[0_4px_18px_rgba(123,47,190,0.5)]">
                  <button onClick={resetTimer} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors">
                    <RotateCw size={18} color="#ffffff" strokeWidth={2.5} />
                  </button>
                  <span className="text-white text-2xl tracking-widest min-w-[80px] text-center select-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {formatTime(timer)}
                  </span>
                  <button onClick={toggleTimer} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors">
                    {isTimerRunning ? <Pause size={18} color="#ffffff" strokeWidth={2.5} /> : <Play size={18} color="#ffffff" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            )}

            {/* Question text */}
            <div className={`px-8 ${isBadounKalam ? "pt-8" : "pt-20"} pb-4`}>
              <p className="text-gray-900 text-center font-extrabold text-[30px]">{questionData.question}</p>
            </div>

            {renderTemplate()}

            <div className="flex-1" />

            {/* Bottom row */}
            <div className="flex items-end justify-between px-8 pb-8">
              <div className="border-2 border-[#7B2FBE] rounded-2xl bg-white px-4 py-2">
                <span className="font-black text-[#7B2FBE] tracking-wide text-[20px]">{questionData.categoryName}</span>
              </div>

              {isBadounKalam ? (
                <button
                  onClick={handleOpenCircularTimer}
                  className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black py-3 px-8 rounded-full shadow-lg transition-all hover:-translate-y-0.5 text-[19px]"
                >
                  جاهز
                </button>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black py-3 px-8 rounded-full shadow-lg transition-all hover:-translate-y-0.5 text-[19px]"
                >
                  اختر الإجابة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Circular Timer Overlay (بدون كلام) ────────────────────────────── */}
      <AnimatePresence>
        {showCircularTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
            dir="rtl"
          >
            {renderHeader()}

            <div className="flex-1 flex">
              {renderSidebar()}

              <div className="flex-1 flex flex-col p-6 pt-10">
                <div className="flex-1 relative border-4 border-[#7B2FBE] rounded-3xl bg-white flex flex-col">

                  {/* Circular timer — centered in card */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-5">
                    <CircularTimerSVG
                      timeLeft={circularTimeLeft}
                      totalTime={circTotal}
                      color={circCfg.color}
                      size={460}
                    />
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { setCircularTimeLeft(circTotal); setCircularRunning(true); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{ background: `${circCfg.color}20`, border: `2px solid ${circCfg.color}` }}
                      >
                        <RotateCw size={18} color={circCfg.color} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setCircularRunning((r) => !r)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{ background: `${circCfg.color}20`, border: `2px solid ${circCfg.color}` }}
                      >
                        {circularRunning
                          ? <Pause size={18} color={circCfg.color} strokeWidth={2.5} />
                          : <Play  size={18} color={circCfg.color} strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between px-8 pb-8">
                    <div className="border-2 border-[#7B2FBE] rounded-2xl bg-white px-4 py-2">
                      <span className="font-black text-[#7B2FBE] tracking-wide text-[20px]">{questionData.categoryName}</span>
                    </div>
                    <button
                      onClick={handleRevealAnswer}
                      className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black py-3 px-8 rounded-full shadow-lg transition-all hover:-translate-y-0.5 text-[19px]"
                    >
                      كشف الإجابة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Answer overlay ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAnswer && !showTeamSelection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col" dir="rtl">
            <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-6 py-5 flex items-center justify-between shadow-lg shrink-0">
              <div className="flex items-center gap-3">
                <img src={`${import.meta.env.BASE_URL}logo-white.png`} alt="ركز" className="h-10" style={{ filter: "drop-shadow(0 0 8px rgba(180,100,255,0.7))" }} />
              </div>
              <div />
              <button onClick={() => setShowAnswer(false)} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                <ArrowRight size={14} /><span>العودة</span>
              </button>
            </div>
            <div className="flex-1 flex items-stretch justify-center p-3">
              <div className="w-full border-4 border-[#7B2FBE] rounded-3xl bg-white flex flex-col shadow-[0_8px_40px_rgba(123,47,190,0.15)] overflow-hidden">
                <div className="px-16 pt-16 pb-4">
                  <p className="text-[100px] text-gray-900 text-center leading-tight w-full">{questionData.answer}</p>
                </div>
                {(questionData.answerImage || questionData.image) ? (
                  <div className="flex-1 flex items-center justify-center px-16 py-4">
                    <img
                      src={questionData.answerImage || questionData.image}
                      alt="صورة الإجابة"
                      onClick={() => setLightboxImage((questionData.answerImage || questionData.image)!)}
                      className="max-h-52 max-w-xs object-contain rounded-2xl cursor-zoom-in hover:opacity-90 transition-opacity"
                    />
                  </div>
                ) : <div className="flex-1" />}
                <div className="flex justify-center pb-10">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setShowTeamSelection(true)}
                    className="bg-[#7B2FBE] hover:bg-[#8B35D6] text-white py-3 px-14 rounded-full shadow-lg transition-colors text-[25px]">
                    التالي
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Team selection overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showTeamSelection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col p-6" dir="rtl">
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              <h1 className="text-4xl font-black text-[#7B2FBE] text-center">أي فريق جاوب صح ؟</h1>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points: questionData.points, side: questionData.side, correct: true, team: 1, pitActive: !!questionData.pitActive }));
                      navigate("/score-page");
                    }}
                    className="flex-1 bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black text-2xl py-4 px-12 rounded-full shadow-lg transition-colors">
                    {gameData?.team1Name}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points: questionData.points, side: questionData.side, correct: true, team: 2, pitActive: !!questionData.pitActive }));
                      navigate("/score-page");
                    }}
                    className="flex-1 bg-[#7B2FBE] hover:bg-[#8B35D6] text-white font-black text-2xl py-4 px-12 rounded-full shadow-lg transition-colors">
                    {gameData?.team2Name}
                  </motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    localStorage.setItem("rakez-answered-cell", JSON.stringify({ catIdx: questionData.catIdx, points: questionData.points, side: questionData.side, correct: false, team: 0 }));
                    navigate("/score-page");
                  }}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 px-10 rounded-full shadow-lg transition-colors font-extrabold text-[25px]">
                  لا أحد
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-zoom-out p-8">
            <motion.img initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              src={lightboxImage} alt="صورة مكبّرة" className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn switch flash */}
      <AnimatePresence>
        {turnFlash && (
          <motion.div
            key={turnFlash.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 1, 0] }}
            transition={{ duration: 1.8, times: [0, 0.1, 0.4, 0.7, 1] }}
            onAnimationComplete={() => setTurnFlash(null)}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              animate={{ backgroundColor: ["rgba(59,130,246,0.3)", "rgba(59,130,246,0.05)", "rgba(59,130,246,0.3)", "rgba(59,130,246,0)"] }}
              transition={{ duration: 1.8 }}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: [0.7, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              className="relative bg-blue-500 text-white px-10 py-6 rounded-3xl font-black text-3xl shadow-2xl border-4 border-blue-300 text-center"
            >
              <div className="text-lg font-bold opacity-80 mb-1">انتهى الوقت!</div>
              <div>دور {turnFlash.teamName} ✨</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool flash animation */}
      <AnimatePresence>
        {flashTool && (() => {
          const isBlue = flashTool.color === "blue";
          const overlayColor = isBlue
            ? ["rgba(59,130,246,0.35)", "rgba(59,130,246,0.05)", "rgba(59,130,246,0.35)", "rgba(59,130,246,0)"]
            : ["rgba(239,68,68,0.35)", "rgba(239,68,68,0.05)", "rgba(239,68,68,0.35)", "rgba(239,68,68,0)"];
          const cardClass = isBlue
            ? "relative bg-blue-500 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-2xl border-4 border-blue-300"
            : "relative bg-red-500 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-2xl border-4 border-red-300";
          return (
            <motion.div
              key={flashTool.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.1, 0.4, 0.7, 1] }}
              onAnimationComplete={() => setFlashTool(null)}
              className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
            >
              <motion.div
                animate={{ backgroundColor: overlayColor }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0"
              />
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: [0.7, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className={cardClass}
              >
                {flashTool.name}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function TeamToolCard({ teamName, score, tools, usedTools, onUseTool, isCurrentTeam, isActiveTurn }: {
  teamName: string; score: number; tools: string[]; usedTools: string[];
  onUseTool: (toolId: string) => void; isCurrentTeam: boolean; isActiveTurn: boolean;
}) {
  const activeToolId = isCurrentTeam ? "double" : "rest";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-full text-center py-2 rounded-xl font-black text-white text-sm ${isCurrentTeam ? "bg-[#7B2FBE]" : "bg-[#7B2FBE]/50"}`}>
        {teamName}
      </div>
      <div className="text-4xl font-black text-foreground">{score}</div>

      <AnimatePresence>
        {isActiveTurn && (
          <motion.div
            key="turn-indicator"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{
              scale: 1, opacity: 1,
              boxShadow: [
                "0 0 10px 2px rgba(59,130,246,0.7)",
                "0 0 22px 6px rgba(59,130,246,1)",
                "0 0 10px 2px rgba(59,130,246,0.7)",
              ]
            }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ scale: { duration: 0.3 }, boxShadow: { duration: 1.4, repeat: Infinity } }}
            className="w-full bg-blue-500 rounded-2xl py-2.5 text-white font-black text-center text-base border-2 border-blue-300"
          >
            دورك ✨
          </motion.div>
        )}
      </AnimatePresence>

      {tools.length > 0 && (
        <>
          <p className="text-xs font-bold text-foreground/60">وسائل المساعدة</p>
          <div className="flex flex-row gap-3 justify-center flex-wrap">
            {tools.map((toolId) => {
              const tool = HELP_TOOLS_MAP[toolId];
              if (!tool) return null;
              const used = usedTools.includes(toolId);
              const isAvailableThisTurn = toolId === activeToolId;
              const isClickable = isAvailableThisTurn && !used;

              return (
                <div key={toolId} className="flex flex-col items-center gap-1">
                  <motion.button
                    whileHover={isClickable ? { scale: 1.1 } : {}}
                    whileTap={isClickable ? { scale: 0.92 } : {}}
                    onClick={() => isClickable && onUseTool(toolId)}
                    disabled={!isClickable}
                    title={tool.name}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${
                      used
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                        : isAvailableThisTurn
                          ? "bg-[#7B2FBE]/10 border-[#7B2FBE]/60 hover:bg-[#7B2FBE] cursor-pointer shadow-md hover:shadow-[#7B2FBE]/30 hover:shadow-lg"
                          : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="w-7 h-7 object-contain"
                      style={
                        isAvailableThisTurn && !used
                          ? { filter: "brightness(0) saturate(100%) invert(18%) sepia(89%) saturate(1200%) hue-rotate(255deg) brightness(1.15)" }
                          : { filter: "grayscale(100%) opacity(0.3)" }
                      }
                    />
                  </motion.button>
                  <span className={`text-[10px] font-bold text-center leading-tight max-w-[52px] ${
                    used ? "text-gray-300" : isAvailableThisTurn ? "text-[#7B2FBE]" : "text-gray-300"
                  }`}>
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

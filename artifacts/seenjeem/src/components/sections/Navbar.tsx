import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, LayoutDashboard, Monitor, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useViewport } from "@/context/ViewportContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { viewMode, setViewMode } = useViewport();
  const accountRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "ألعابي", href: "/history" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled
          ? "shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-3"
          : "py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 z-10">
              <img
                src="/logo-rakez.png"
                alt="ركز"
                className="h-20 md:h-24 w-auto hover:scale-105 transition-transform"
                style={{ filter: "drop-shadow(0 0 10px rgba(123, 47, 190, 0.5)) drop-shadow(0 0 22px rgba(123, 47, 190, 0.25))" }}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-12">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigate(link.href)}
                  className="text-foreground hover:text-primary font-medium transition-colors relative group text-center text-[25px]"
                >
                  {link.name}
                  <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.isAdmin && (
                  <Link href="/admin">
                    <a className="flex items-center gap-1.5 text-[#7B2FBE] font-semibold text-sm px-3 py-2 rounded-full bg-violet-50 hover:bg-violet-100 transition-colors">
                      <LayoutDashboard size={15} />
                      <span className="text-[20px]">الإدارة</span>
                    </a>
                  </Link>
                )}
                {/* Account button + dropdown */}
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountMenuOpen((o) => !o)}
                    className="flex items-center gap-2 text-foreground font-medium px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-[20px]">{user.displayName || user.username}</span>
                  </button>
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => { logout(); setAccountMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm"
                        >
                          <LogOut size={16} />
                          تسجيل الخروج
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-foreground hover:text-primary flex items-center gap-2 font-medium px-4 py-2 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <User size={20} />
                <span>تسجيل الدخول</span>
              </button>
            )}
            <button
              onClick={() => navigate("/start-game")}
              className="bg-[#7B2FBE] text-white font-bold py-2.5 px-6 rounded-full shadow-[0_0_18px_rgba(123,47,190,0.5)] hover:shadow-[0_0_28px_rgba(123,47,190,0.8)] hover:bg-[#8B35D6] hover:-translate-y-0.5 transition-all text-[20px]"
            >
              إنشاء لعبة
            </button>

            {/* Viewport size toggle */}
            <div className="flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
              <button
                onClick={() => setViewMode("desktop")}
                title="حجم كمبيوتر"
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  viewMode === "desktop"
                    ? "bg-[#7B2FBE] text-white shadow-[0_0_10px_rgba(123,47,190,0.4)]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Monitor size={17} />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                title="حجم آيفون"
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  viewMode === "mobile"
                    ? "bg-[#7B2FBE] text-white shadow-[0_0_10px_rgba(123,47,190,0.4)]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Smartphone size={17} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground z-10 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass-panel border-b border-border shadow-2xl md:hidden flex flex-col"
          >
            <div className="flex flex-col px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => { navigate(link.href); setMobileMenuOpen(false); }}
                  className="text-foreground text-xl font-bold border-b border-border pb-4 text-right"
                >
                  {link.name}
                </button>
              ))}
              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={() => { navigate("/start-game"); setMobileMenuOpen(false); }}
                  className="bg-[#7B2FBE] text-white font-bold py-3 px-6 rounded-xl w-full text-center shadow-[0_0_18px_rgba(123,47,190,0.6)]"
                >
                  إنشاء لعبة
                </button>
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-foreground/70 py-2 font-medium justify-center">
                      <User size={18} />
                      <span>{user.displayName || user.username}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 text-red-500 py-2 font-medium"
                    >
                      <LogOut size={18} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 text-foreground/70 py-3 mt-2 font-medium"
                  >
                    <User size={20} />
                    <span>تسجيل الدخول / حساب جديد</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "ألعابي", href: "#" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-panel shadow-[0_8px_32px_rgba(138,43,226,0.2)] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo - Right side in RTL */}
          <Link href="/" className="flex-shrink-0 z-10">
            <img 
              src="https://seenjeemkw.com/assets/logo-lg-WLxzaRHo.svg" 
              alt="Seen Jeem Logo" 
              className="h-10 md:h-12 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/90 hover:text-primary font-medium text-lg transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Actions - Left side in RTL */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <button className="text-white/90 hover:text-white flex items-center gap-2 font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
              <User size={20} />
              <span>تسجيل الدخول</span>
            </button>
            
            <button className="bg-[#7B2FBE] text-white font-bold py-2.5 px-6 rounded-full shadow-[0_0_18px_rgba(123,47,190,0.7)] hover:shadow-[0_0_28px_rgba(123,47,190,0.95)] hover:bg-[#8B35D6] hover:-translate-y-0.5 transition-all">
              إنشاء لعبة
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white z-10 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl md:hidden flex flex-col"
          >
            <div className="flex flex-col px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white text-xl font-bold border-b border-white/10 pb-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              <div className="flex flex-col gap-4 pt-4">
                <button className="bg-[#7B2FBE] text-white font-bold py-3 px-6 rounded-xl w-full text-center shadow-[0_0_18px_rgba(123,47,190,0.6)]">
                  إنشاء لعبة
                </button>
                <button className="flex items-center justify-center gap-2 text-white/80 py-3 mt-2 font-medium">
                  <User size={20} />
                  <span>تسجيل الدخول / حساب جديد</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

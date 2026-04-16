import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, FolderOpen, HelpCircle, Users,
  LogOut, Menu, X, ChevronLeft, Terminal, QrCode, Globe
} from "lucide-react";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: "لوحة التحكم", href: "/admin", exact: true },
  { icon: <FolderOpen size={16} />, label: "الفئات", href: "/admin/categories" },
  { icon: <HelpCircle size={16} />, label: "الأسئلة", href: "/admin/questions" },
  { icon: <Users size={16} />, label: "المستخدمون", href: "/admin/users" },
  { icon: <QrCode size={16} />, label: "قوالب QR", href: "/admin/qr-templates" },
  { icon: <Globe size={16} />, label: "الصفحات الخارجية", href: "/admin/external-pages" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? location === item.href : location.startsWith(item.href);

  return (
    <div
      className="min-h-screen flex"
      dir="rtl"
      style={{ background: "#0b0b14", color: "#e2e2f0" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-60 z-30 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} lg:sticky lg:top-0 lg:h-screen`}
        style={{
          background: "#0f0f1e",
          borderLeft: "1px solid rgba(123,47,190,0.25)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(123,47,190,0.2)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{
                background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
                boxShadow: "0 0 12px rgba(123,47,190,0.5)",
              }}
            >
              ر
            </div>
            <div>
              <p className="font-black text-sm text-white">ركّز</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Terminal size={9} className="text-[#7B2FBE]" />
                <p className="text-[10px] font-mono" style={{ color: "#7B2FBE" }}>ADMIN_PANEL v1.0</p>
              </div>
            </div>
          </div>
          <button className="lg:hidden text-gray-500 hover:text-gray-300 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href + item.label} href={item.href}>
                <a
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group"
                  style={
                    active
                      ? {
                          background: "rgba(123,47,190,0.2)",
                          color: "#c084fc",
                          border: "1px solid rgba(123,47,190,0.4)",
                          boxShadow: "0 0 12px rgba(123,47,190,0.15) inset",
                        }
                      : {
                          color: "#8888aa",
                          border: "1px solid transparent",
                        }
                  }
                >
                  {active && (
                    <span
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l"
                      style={{ background: "#7B2FBE", boxShadow: "0 0 8px #7B2FBE" }}
                    />
                  )}
                  <span style={{ color: active ? "#c084fc" : "#555577" }}>{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            );
          })}

          <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(123,47,190,0.15)" }}>
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: "#666688", border: "1px solid transparent" }}
              >
                <ChevronLeft size={16} />
                العودة للموقع
              </a>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(123,47,190,0.2)" }}>
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-lg"
            style={{ background: "rgba(123,47,190,0.08)", border: "1px solid rgba(123,47,190,0.2)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: "rgba(123,47,190,0.3)", color: "#c084fc" }}
            >
              {user?.username?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-[10px] font-mono" style={{ color: "#7B2FBE" }}>
                {user?.role?.toUpperCase()}
              </p>
            </div>
            <button
              onClick={logout}
              className="transition-colors hover:text-red-400"
              style={{ color: "#444466" }}
              title="تسجيل الخروج"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-60">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 px-6 py-3.5 flex items-center justify-between"
          style={{
            background: "rgba(11,11,20,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(123,47,190,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden transition-colors"
              style={{ color: "#666688" }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-xs font-mono" style={{ color: "#555577" }}>sys.online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono hidden sm:block" style={{ color: "#444466" }}>
              {new Date().toLocaleDateString("ar-KW", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

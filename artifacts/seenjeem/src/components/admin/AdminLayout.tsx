import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, FolderOpen, HelpCircle, Users,
  BarChart3, Settings, LogOut, Menu, X, Plus, Bell
} from "lucide-react";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "لوحة التحكم", href: "/admin" },
  { icon: <FolderOpen size={18} />, label: "الفئات", href: "/admin/categories" },
  { icon: <HelpCircle size={18} />, label: "الأسئلة", href: "/admin/questions" },
  { icon: <Users size={18} />, label: "المستخدمين", href: "/admin/users" },
  { icon: <BarChart3 size={18} />, label: "الإحصائيات", href: "/admin" },
  { icon: <Settings size={18} />, label: "الإعدادات", href: "/admin" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-100 shadow-sm z-30 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} lg:sticky lg:top-0 lg:h-screen`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7B2FBE] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">ر</span>
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">ركّز</p>
              <p className="text-xs text-gray-400">لوحة الإدارة</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                <a
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                    ${isActive(item.href)
                      ? "bg-[#7B2FBE] text-white shadow-[0_4px_14px_rgba(123,47,190,0.3)]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#7B2FBE]"}`}
                >
                  <span className={isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-[#7B2FBE]"}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">
                <span className="text-gray-400"><LayoutDashboard size={18} /></span>
                العودة للموقع
              </a>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
            <div className="w-8 h-8 bg-[#7B2FBE]/10 rounded-full flex items-center justify-center">
              <Users size={14} className="text-[#7B2FBE]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.username}</p>
              <p className="text-xs text-[#7B2FBE]">مدير</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-black text-gray-900">ركّز</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
              <Bell size={20} />
            </button>
            <Link href="/admin/categories/new">
              <a className="flex items-center gap-2 bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)] hover:shadow-[0_4px_20px_rgba(123,47,190,0.5)]">
                <Plus size={16} />
                إضافة
              </a>
            </Link>
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

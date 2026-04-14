import { useEffect, useState } from "react";
import { FolderOpen, HelpCircle, Users, Activity, ArrowLeft } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { Link } from "wouter";

interface Stats {
  categories: number;
  questions: number;
  users: number;
}

function StatCard({
  label, value, icon, accent, loading,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: "#12121f",
        border: `1px solid ${accent}33`,
        boxShadow: `0 0 20px ${accent}11`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}20`, border: `1px solid ${accent}44`, color: accent }}
        >
          {icon}
        </div>
        <Activity size={12} style={{ color: `${accent}60` }} />
      </div>
      <p
        className="text-3xl font-black font-mono mb-1"
        style={{ color: loading ? "#333355" : "white" }}
      >
        {loading ? "···" : value}
      </p>
      <p className="text-xs font-mono" style={{ color: "#555577" }}>{label}</p>
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const adminFetch = useAdminFetch();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const quickLinks = [
    { label: "إضافة فئة جديدة", href: "/admin/categories/new", accent: "#7B2FBE", prefix: "cat.new()" },
    { label: "إضافة سؤال جديد", href: "/admin/questions/new", accent: "#3b82f6", prefix: "q.new()" },
    { label: "إدارة المستخدمين", href: "/admin/users", accent: "#10b981", prefix: "usr.list()" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>~/admin $</span>
          <span className="text-xs font-mono text-gray-600">dashboard --overview</span>
        </div>
        <h2 className="text-2xl font-black text-white">لوحة التحكم</h2>
        <p className="text-sm font-mono mt-1" style={{ color: "#555577" }}>نظرة عامة · النظام يعمل بكفاءة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard label="إجمالي الفئات" value={stats?.categories ?? 0} icon={<FolderOpen size={18} />} accent="#7B2FBE" loading={loading} />
        <StatCard label="إجمالي الأسئلة" value={stats?.questions ?? 0} icon={<HelpCircle size={18} />} accent="#3b82f6" loading={loading} />
        <StatCard label="المستخدمون المسجلون" value={stats?.users ?? 0} icon={<Users size={18} />} accent="#10b981" loading={loading} />
      </div>

      {/* Quick links */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7B2FBE]" style={{ boxShadow: "0 0 6px #7B2FBE" }} />
          <h3 className="text-sm font-bold text-white">وصول سريع</h3>
          <span className="text-xs font-mono mr-auto" style={{ color: "#333355" }}>shortcuts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all group"
                style={{
                  background: `${link.accent}10`,
                  border: `1px solid ${link.accent}25`,
                }}
              >
                <div>
                  <p className="text-xs font-mono mb-0.5" style={{ color: `${link.accent}99` }}>{link.prefix}</p>
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                </div>
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" style={{ color: link.accent }} />
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

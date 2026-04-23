import { useEffect, useState } from "react";
import { FolderOpen, HelpCircle, Users, ArrowLeft } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { Link } from "wouter";

interface Stats {
  categories: number;
  questions: number;
  users: number;
}

const GRAD = "linear-gradient(135deg, #6A00F4, #7B3FF2, #8E63E6, #A07CE0, #B89AE6)";

function StatCard({
  label, value, icon, loading,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(123,63,242,0.15)",
        boxShadow: "0 4px 20px rgba(106,0,244,0.08)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: GRAD, boxShadow: "0 4px 12px rgba(106,0,244,0.3)" }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black mb-1" style={{ color: loading ? "#d1d5db" : "#1a1a2e" }}>
        {loading ? "···" : value}
      </p>
      <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>{label}</p>
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
        style={{ background: GRAD }}
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
    { label: "إضافة فئة جديدة", href: "/admin/categories/new" },
    { label: "إضافة سؤال جديد", href: "/admin/questions/new" },
    { label: "إدارة المستخدمين", href: "/admin/users" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black" style={{ color: "#1a1a2e" }}>لوحة التحكم</h2>
        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>نظرة عامة على النظام</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard label="إجمالي الفئات" value={stats?.categories ?? 0} icon={<FolderOpen size={18} />} loading={loading} />
        <StatCard label="إجمالي الأسئلة" value={stats?.questions ?? 0} icon={<HelpCircle size={18} />} loading={loading} />
        <StatCard label="المستخدمون المسجلون" value={stats?.users ?? 0} icon={<Users size={18} />} loading={loading} />
      </div>

      {/* Quick links */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#ffffff", border: "1px solid rgba(123,63,242,0.15)", boxShadow: "0 4px 20px rgba(106,0,244,0.06)" }}
      >
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1a1a2e" }}>وصول سريع</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group hover:shadow-md"
                style={{
                  background: "#f5f3ff",
                  border: "1px solid rgba(123,63,242,0.15)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "#7B3FF2" }}>{link.label}</p>
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" style={{ color: "#B89AE6" }} />
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { FolderOpen, HelpCircle, Users, TrendingUp } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Stats {
  categories: number;
  questions: number;
  users: number;
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

  const cards = [
    {
      label: "الفئات",
      value: stats?.categories ?? 0,
      icon: <FolderOpen size={22} />,
      color: "bg-violet-50 text-[#7B2FBE]",
      border: "border-violet-100",
    },
    {
      label: "الأسئلة",
      value: stats?.questions ?? 0,
      icon: <HelpCircle size={22} />,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "المستخدمون",
      value: stats?.users ?? 0,
      icon: <Users size={22} />,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "النشاط اليومي",
      value: "—",
      icon: <TrendingUp size={22} />,
      color: "bg-orange-50 text-orange-500",
      border: "border-orange-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">لوحة التحكم</h2>
        <p className="text-gray-500 mt-1 text-sm">نظرة عامة على التطبيق</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border ${card.border} p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">
              {loading ? "..." : card.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">البدء السريع</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "إضافة فئة جديدة", href: "/admin/categories/new", color: "bg-[#7B2FBE] text-white" },
            { label: "إضافة سؤال جديد", href: "/admin/questions/new", color: "bg-gray-900 text-white" },
            { label: "عرض المستخدمين", href: "/admin/users", color: "bg-gray-100 text-gray-700" },
          ].map((btn) => (
            <a
              key={btn.label}
              href={btn.href}
              className={`${btn.color} rounded-xl px-4 py-3 text-sm font-semibold text-center hover:opacity-90 transition-opacity`}
            >
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

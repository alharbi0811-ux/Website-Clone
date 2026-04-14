import { useEffect, useState } from "react";
import { Users, Crown, Shield, User, UserCheck } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useAuth } from "@/context/AuthContext";

interface UserItem {
  id: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  role: string;
  createdAt: string;
}

type Role = "superadmin" | "admin" | "moderator" | "player";

const ROLES: { value: Role; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    value: "superadmin",
    label: "مدير أول",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: <Crown size={12} />,
  },
  {
    value: "admin",
    label: "مدير",
    color: "text-[#7B2FBE]",
    bg: "bg-violet-50",
    icon: <Shield size={12} />,
  },
  {
    value: "moderator",
    label: "محرر",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: <UserCheck size={12} />,
  },
  {
    value: "player",
    label: "لاعب",
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: <User size={12} />,
  },
];

function getRoleInfo(role: string) {
  return ROLES.find((r) => r.value === role) || ROLES[3];
}

export default function AdminUsers() {
  const adminFetch = useAdminFetch();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    adminFetch("/admin/users")
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  async function changeRole(userId: number, newRole: Role) {
    setOpenDropdownId(null);
    setError("");
    setChangingId(userId);
    try {
      const updated = await adminFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role, isAdmin: updated.isAdmin } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تغيير الرتبة");
    } finally {
      setChangingId(null);
    }
  }

  const isSuperAdmin = currentUser?.role === "superadmin";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">المستخدمون</h2>
        <p className="text-gray-500 mt-1 text-sm">إدارة الحسابات والرتب — {users.length} مستخدم</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Roles Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ROLES.map((r) => (
          <div key={r.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${r.bg}`}>
            <span className={r.color}>{r.icon}</span>
            <span className={`text-xs font-semibold ${r.color}`}>{r.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                  <div className="h-2 bg-gray-100 rounded w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 hidden sm:grid grid-cols-12 gap-4">
              <div className="col-span-4 text-xs font-semibold text-gray-500">المستخدم</div>
              <div className="col-span-3 text-xs font-semibold text-gray-500">تاريخ التسجيل</div>
              <div className="col-span-3 text-xs font-semibold text-gray-500">الرتبة الحالية</div>
              <div className="col-span-2 text-xs font-semibold text-gray-500">تغيير الرتبة</div>
            </div>
            <div className="divide-y divide-gray-50">
              {users.map((u) => {
                const roleInfo = getRoleInfo(u.role);
                const isSelf = u.id === currentUser?.id;
                const isProtected = u.role === "superadmin" && !isSuperAdmin;
                return (
                  <div
                    key={u.id}
                    className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    {/* User */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${roleInfo.bg} ${roleInfo.color}`}
                      >
                        {u.username.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{u.username}</p>
                          {isSelf && (
                            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">أنت</span>
                          )}
                        </div>
                        {u.displayName && u.displayName !== u.username && (
                          <p className="text-xs text-gray-400">{u.displayName}</p>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block col-span-3">
                      <p className="text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("ar-KW")}
                      </p>
                    </div>

                    {/* Current role badge */}
                    <div className="hidden sm:block col-span-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full ${roleInfo.bg} ${roleInfo.color}`}
                      >
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    </div>

                    {/* Role dropdown */}
                    <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-end">
                      {isProtected || isSelf ? (
                        <span className="text-xs text-gray-300 italic">
                          {isSelf ? "حسابك" : "محمي"}
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                            disabled={changingId === u.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all
                              ${changingId === u.id
                                ? "opacity-50 cursor-wait border-gray-200 text-gray-400"
                                : "border-gray-200 text-gray-600 hover:border-[#7B2FBE] hover:text-[#7B2FBE] bg-white"}`}
                          >
                            {changingId === u.id ? "جاري..." : "تغيير الرتبة ▾"}
                          </button>

                          {openDropdownId === u.id && (
                            <div
                              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-40 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden"
                            >
                              {ROLES.map((role) => (
                                <button
                                  key={role.value}
                                  onClick={() => changeRole(u.id, role.value)}
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors text-right
                                    ${u.role === role.value
                                      ? `${role.bg} ${role.color}`
                                      : "hover:bg-gray-50 text-gray-700"}`}
                                >
                                  <span className={u.role === role.value ? role.color : "text-gray-400"}>
                                    {role.icon}
                                  </span>
                                  {role.label}
                                  {u.role === role.value && (
                                    <span className="mr-auto text-[10px] opacity-60">الحالية</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {openDropdownId !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdownId(null)}
        />
      )}
    </div>
  );
}

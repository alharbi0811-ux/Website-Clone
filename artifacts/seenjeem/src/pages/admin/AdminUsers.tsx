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

const ROLES: { value: Role; label: string; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
  { value: "superadmin", label: "مدير أول", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)", icon: <Crown size={11} /> },
  { value: "admin",      label: "مدير",     color: "#c084fc", bg: "rgba(123,47,190,0.15)", border: "rgba(123,47,190,0.3)",   icon: <Shield size={11} /> },
  { value: "moderator",  label: "محرر",     color: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", icon: <UserCheck size={11} /> },
  { value: "player",     label: "لاعب",     color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)", icon: <User size={11} /> },
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono" style={{ color: "#10b981" }}>~/admin/users $</span>
          <span className="text-xs font-mono text-gray-600">list --roles</span>
        </div>
        <h2 className="text-2xl font-black text-white">المستخدمون</h2>
        <p className="text-xs font-mono mt-0.5" style={{ color: "#555577" }}>
          {users.length} مستخدم مسجل · إدارة الحسابات والرتب
        </p>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm font-mono"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}
        >
          ✗ {error}
        </div>
      )}

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ROLES.map((r) => (
          <div
            key={r.value}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            style={{ background: r.bg, border: `1px solid ${r.border}` }}
          >
            <span style={{ color: r.color }}>{r.icon}</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: r.color }}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div
        className="rounded-xl overflow-visible"
        style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {loading ? (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: "#1e1e30" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 rounded w-32 animate-pulse" style={{ background: "#1e1e30" }} />
                  <div className="h-2 rounded w-20 animate-pulse" style={{ background: "#1a1a28" }} />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-14 text-center">
            <Users size={36} className="mx-auto mb-3" style={{ color: "#333355" }} />
            <p className="text-sm font-mono" style={{ color: "#555577" }}>لا يوجد مستخدمون</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="px-5 py-2.5 hidden sm:grid grid-cols-12 gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
            >
              {["المستخدم", "تاريخ التسجيل", "الرتبة", "تغيير"].map((h, i) => (
                <div
                  key={h}
                  className={`text-[10px] font-mono ${i === 0 ? "col-span-4" : i === 1 ? "col-span-3" : i === 2 ? "col-span-3" : "col-span-2"}`}
                  style={{ color: "#333355" }}
                >
                  {h}
                </div>
              ))}
            </div>

            <div>
              {users.map((u, idx) => {
                const roleInfo = getRoleInfo(u.role);
                const isSelf = u.id === currentUser?.id;
                const isProtected = u.role === "superadmin" && !isSuperAdmin;

                return (
                  <div
                    key={u.id}
                    className="px-5 py-4 grid grid-cols-12 gap-4 items-center transition-colors"
                    style={{
                      borderBottom: idx < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {/* User */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{ background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.border}` }}
                      >
                        {u.username.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{u.username}</p>
                          {isSelf && (
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#555577", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                              أنت
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#333355" }}>
                          uid:{u.id.toString().padStart(4, "0")}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block col-span-3">
                      <p className="text-xs font-mono" style={{ color: "#555577" }}>
                        {new Date(u.createdAt).toLocaleDateString("ar-KW")}
                      </p>
                    </div>

                    {/* Role badge */}
                    <div className="hidden sm:block col-span-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-md"
                        style={{ background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.border}` }}
                      >
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    </div>

                    {/* Role dropdown */}
                    <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-end">
                      {isProtected || isSelf ? (
                        <span className="text-[10px] font-mono" style={{ color: "#2a2a3a" }}>
                          {isSelf ? "حسابك" : "محمي"}
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                            disabled={changingId === u.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-50"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#8888aa",
                            }}
                          >
                            {changingId === u.id ? "···" : "تغيير ▾"}
                          </button>

                          {openDropdownId === u.id && (
                            <div
                              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-36 rounded-xl overflow-hidden z-50"
                              style={{
                                background: "#16162a",
                                border: "1px solid rgba(123,47,190,0.3)",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                              }}
                            >
                              {ROLES.map((role) => (
                                <button
                                  key={role.value}
                                  onClick={() => changeRole(u.id, role.value)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-mono font-bold transition-colors text-right"
                                  style={
                                    u.role === role.value
                                      ? { background: role.bg, color: role.color }
                                      : { color: "#555577" }
                                  }
                                >
                                  <span style={{ color: u.role === role.value ? role.color : "#333355" }}>
                                    {role.icon}
                                  </span>
                                  {role.label}
                                  {u.role === role.value && (
                                    <span className="mr-auto opacity-50 text-[8px]">✓</span>
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

      {openDropdownId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
      )}
    </div>
  );
}

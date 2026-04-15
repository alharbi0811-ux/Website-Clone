import { useEffect, useState } from "react";
import { Users, Crown, Shield, Code2, PenLine, Gamepad2, Plus, X, Lock } from "lucide-react";
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

interface RoleItem {
  id: string;
  name: string;
  label: string;
  isAdmin: boolean;
  isBuiltIn: boolean;
}

const BUILT_IN_ROLE_STYLES: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  superadmin: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  icon: <Crown size={11} /> },
  admin:      { color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)", icon: <Shield size={11} /> },
  programmer: { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: <Code2 size={11} /> },
  writer:     { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  icon: <PenLine size={11} /> },
  player:     { color: "#6b7280", bg: "rgba(107,114,128,0.1)",  border: "rgba(107,114,128,0.2)", icon: <Gamepad2 size={11} /> },
};

const CUSTOM_ROLE_STYLE = { color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)", icon: <Plus size={11} /> };

function getRoleStyle(name: string) {
  return BUILT_IN_ROLE_STYLES[name] || CUSTOM_ROLE_STYLE;
}

export default function AdminUsers() {
  const adminFetch = useAdminFetch();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  // نموذج إضافة رتبة جديدة
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleIsAdmin, setNewRoleIsAdmin] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [addRoleError, setAddRoleError] = useState("");

  const isOwner = currentUser?.role === "superadmin";

  useEffect(() => {
    Promise.all([
      adminFetch("/admin/users"),
      adminFetch("/admin/roles"),
    ])
      .then(([u, r]) => { setUsers(u); setRoles(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  async function changeRole(userId: number, newRole: string) {
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

  async function addCustomRole() {
    setAddRoleError("");
    if (!newRoleName.trim() || !newRoleLabel.trim()) {
      setAddRoleError("يرجى تعبئة جميع الحقول");
      return;
    }
    setAddingRole(true);
    try {
      const role = await adminFetch("/admin/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName.trim(), label: newRoleLabel.trim(), isAdmin: newRoleIsAdmin }),
      });
      setRoles((prev) => [...prev, role]);
      setNewRoleName("");
      setNewRoleLabel("");
      setNewRoleIsAdmin(false);
      setShowAddRole(false);
    } catch (err) {
      setAddRoleError(err instanceof Error ? err.message : "فشل إضافة الرتبة");
    } finally {
      setAddingRole(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: "#10b981" }}>~/admin/users $</span>
            <span className="text-xs font-mono text-gray-600">list --roles</span>
          </div>
          <h2 className="text-2xl font-black text-white">المستخدمون</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555577" }}>
            {users.length} مستخدم مسجل · إدارة الحسابات والرتب
          </p>
        </div>

        {/* زر إضافة رتبة — للمالك فقط */}
        {isOwner && (
          <button
            onClick={() => setShowAddRole(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}
          >
            <Plus size={12} />
            إضافة رتبة
          </button>
        )}
      </div>

      {/* نموذج إضافة رتبة */}
      {showAddRole && (
        <div
          className="mb-5 p-4 rounded-xl"
          style={{ background: "#12121f", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-white">رتبة جديدة</span>
            <button onClick={() => { setShowAddRole(false); setAddRoleError(""); }} style={{ color: "#555577" }}>
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono mb-1 block" style={{ color: "#555577" }}>الاسم بالإنجليزية (مثال: editor)</label>
                <input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="my_role"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono text-white outline-none"
                  style={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono mb-1 block" style={{ color: "#555577" }}>الاسم بالعربية</label>
                <input
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  placeholder="محرر"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono text-white outline-none"
                  style={{ background: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={newRoleIsAdmin}
                onChange={(e) => setNewRoleIsAdmin(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs font-mono" style={{ color: "#8888aa" }}>صلاحية إدارية (وصول للوحة التحكم)</span>
            </label>
            {addRoleError && (
              <p className="text-[10px] font-mono" style={{ color: "#f87171" }}>✗ {addRoleError}</p>
            )}
            <button
              onClick={addCustomRole}
              disabled={addingRole}
              className="self-start px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}
            >
              {addingRole ? "···" : "حفظ الرتبة"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm font-mono"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}
        >
          ✗ {error}
        </div>
      )}

      {/* مفتاح الرتب */}
      <div className="flex flex-wrap gap-2 mb-5">
        {roles.map((r) => {
          const style = getRoleStyle(r.name);
          return (
            <div
              key={r.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            >
              <span style={{ color: style.color }}>{style.icon}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: style.color }}>{r.label}</span>
              {!r.isBuiltIn && (
                <span className="text-[8px] font-mono opacity-50" style={{ color: style.color }}>مخصص</span>
              )}
            </div>
          );
        })}
      </div>

      {/* جدول المستخدمين */}
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
                const roleStyle = getRoleStyle(u.role);
                const roleLabel = roles.find((r) => r.name === u.role)?.label || u.role;
                const isSelf = u.id === currentUser?.id;
                const isProtected = u.role === "superadmin" && !isOwner;

                return (
                  <div
                    key={u.id}
                    className="px-5 py-4 grid grid-cols-12 gap-4 items-center transition-colors"
                    style={{
                      borderBottom: idx < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {/* المستخدم */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
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

                    {/* التاريخ */}
                    <div className="hidden sm:block col-span-3">
                      <p className="text-xs font-mono" style={{ color: "#555577" }}>
                        {new Date(u.createdAt).toLocaleDateString("ar-KW")}
                      </p>
                    </div>

                    {/* الرتبة */}
                    <div className="hidden sm:block col-span-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-md"
                        style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
                      >
                        {roleStyle.icon}
                        {roleLabel}
                      </span>
                    </div>

                    {/* تغيير الرتبة */}
                    <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-end">
                      {isProtected ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "#2a2a3a" }}>
                          <Lock size={9} /> محمي
                        </span>
                      ) : isSelf ? (
                        <span className="text-[10px] font-mono" style={{ color: "#2a2a3a" }}>حسابك</span>
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
                              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-40 rounded-xl overflow-hidden z-50"
                              style={{
                                background: "#16162a",
                                border: "1px solid rgba(123,47,190,0.3)",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                              }}
                            >
                              {roles.map((role) => {
                                const rs = getRoleStyle(role.name);
                                return (
                                  <button
                                    key={role.name}
                                    onClick={() => changeRole(u.id, role.name)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-mono font-bold transition-colors text-right"
                                    style={
                                      u.role === role.name
                                        ? { background: rs.bg, color: rs.color }
                                        : { color: "#555577" }
                                    }
                                  >
                                    <span style={{ color: u.role === role.name ? rs.color : "#333355" }}>
                                      {rs.icon}
                                    </span>
                                    {role.label}
                                    {!role.isBuiltIn && (
                                      <span className="text-[8px] opacity-40 mr-auto">مخصص</span>
                                    )}
                                    {u.role === role.name && (
                                      <span className="mr-auto opacity-50 text-[8px]">✓</span>
                                    )}
                                  </button>
                                );
                              })}
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

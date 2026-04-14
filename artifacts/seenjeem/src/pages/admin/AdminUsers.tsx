import { useEffect, useState } from "react";
import { Users, Shield, ShieldOff } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const adminFetch = useAdminFetch();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    adminFetch("/admin/users")
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  async function toggleAdmin(id: number) {
    setTogglingId(id);
    try {
      const updated = await adminFetch(`/admin/users/${id}/toggle-admin`, { method: "PATCH" });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isAdmin: updated.isAdmin } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "خطأ");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">المستخدمون</h2>
        <p className="text-gray-500 mt-1 text-sm">{users.length} مستخدم مسجل</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 grid grid-cols-12 gap-4">
              <div className="col-span-5 text-xs font-semibold text-gray-500">المستخدم</div>
              <div className="col-span-3 text-xs font-semibold text-gray-500 hidden sm:block">تاريخ التسجيل</div>
              <div className="col-span-2 text-xs font-semibold text-gray-500">الدور</div>
              <div className="col-span-2 text-xs font-semibold text-gray-500 text-left">إجراءات</div>
            </div>
            <div className="divide-y divide-gray-50">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${user.isAdmin ? "bg-[#7B2FBE]/10 text-[#7B2FBE]" : "bg-gray-100 text-gray-500"}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                      {user.displayName && user.displayName !== user.username && (
                        <p className="text-xs text-gray-400">{user.displayName}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 hidden sm:block">
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("ar-KW")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${user.isAdmin ? "bg-[#7B2FBE]/10 text-[#7B2FBE]" : "bg-gray-100 text-gray-500"}`}>
                      {user.isAdmin ? "مدير" : "مستخدم"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleAdmin(user.id)}
                        disabled={togglingId === user.id}
                        title={user.isAdmin ? "إلغاء صلاحية المدير" : "منح صلاحية المدير"}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50
                          ${user.isAdmin
                            ? "text-[#7B2FBE] hover:bg-violet-50"
                            : "text-gray-400 hover:text-[#7B2FBE] hover:bg-violet-50"}`}
                      >
                        {user.isAdmin ? <ShieldOff size={15} /> : <Shield size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

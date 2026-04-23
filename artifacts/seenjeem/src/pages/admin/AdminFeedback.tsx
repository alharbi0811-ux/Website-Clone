import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2, CheckCheck, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

interface FeedbackItem {
  id: number;
  username: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

async function fetchFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch(`${API_BASE}/admin/feedback`, { credentials: "include" });
  if (!res.ok) throw new Error("خطأ في الجلب");
  return res.json();
}

async function markRead(id: number) {
  await fetch(`${API_BASE}/admin/feedback/${id}/read`, { method: "PATCH", credentials: "include" });
}

async function deleteFeedback(id: number) {
  await fetch(`${API_BASE}/admin/feedback/${id}`, { method: "DELETE", credentials: "include" });
}

export default function AdminFeedback() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-feedback"], queryFn: fetchFeedback });
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const filtered = (data ?? []).filter(item =>
    filter === "all" ? true : filter === "unread" ? !item.isRead : item.isRead
  );
  const unreadCount = (data ?? []).filter(i => !i.isRead).length;

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7B2FBE,#5a1f8e)", boxShadow: "0 0 18px rgba(123,47,190,0.45)" }}>
          <MessageSquare size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl">صندوق الشكاوى والاقتراحات</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} رسالة غير مقروءة` : "كل الرسائل مقروءة"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "unread", "read"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={filter === f
              ? { background: "rgba(123,47,190,0.3)", color: "#c084fc", border: "1px solid rgba(123,47,190,0.5)" }
              : { background: "rgba(255,255,255,0.04)", color: "#666688", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {f === "all" ? `الكل (${data?.length ?? 0})` : f === "unread" ? `غير مقروء (${unreadCount})` : "مقروء"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-white/25">
          <MessageSquare size={40} />
          <p className="font-bold">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: item.isRead ? "rgba(255,255,255,0.03)" : "rgba(123,47,190,0.08)",
                border: item.isRead ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(123,47,190,0.35)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: "rgba(123,47,190,0.3)", color: "#c084fc" }}>
                      {item.username?.charAt(0) ?? "ز"}
                    </div>
                    <span className="text-white font-bold text-sm">{item.username}</span>
                    {!item.isRead && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(123,47,190,0.3)", color: "#c084fc" }}>
                        جديد
                      </span>
                    )}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                  <div className="flex items-center gap-1 mt-3 text-white/30 text-xs">
                    <Clock size={11} />
                    {new Date(item.createdAt).toLocaleDateString("ar-KW", {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => readMutation.mutate(item.id)}
                      title="تحديد كمقروء"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                      style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}
                    >
                      <CheckCheck size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    title="حذف"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

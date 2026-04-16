import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { QRCodeSVG } from "qrcode.react";

interface Page {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  contentText: string | null;
}

export default function ExternalPage() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug || "";
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/p/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setPage)
      .catch(() => setError("الصفحة غير موجودة"))
      .finally(() => setLoading(false));
  }, [slug]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0b0b14" }}
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono" style={{ color: "#555577" }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0b0b14" }}
        dir="rtl"
      >
        <div className="text-center">
          <p className="text-6xl font-black" style={{ color: "#333355" }}>404</p>
          <p className="text-lg font-bold text-white mt-2">الصفحة غير موجودة</p>
          <p className="text-sm font-mono mt-1" style={{ color: "#555577" }}>/p/{slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "linear-gradient(135deg, #0b0b14 0%, #12122a 100%)" }}
      dir="rtl"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono mb-4"
            style={{ background: "rgba(123,47,190,0.12)", border: "1px solid rgba(123,47,190,0.25)", color: "#9b6dff" }}
          >
            سين جيم — بدون كلام
          </div>
          <h1
            className="text-3xl font-black text-white"
            style={{ textShadow: "0 0 20px rgba(123,47,190,0.4)" }}
          >
            {page.title}
          </h1>
        </div>

        {/* Main content card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.2)", boxShadow: "0 0 40px rgba(123,47,190,0.1)" }}
        >
          {page.imageUrl && (
            <div className="w-full" style={{ maxHeight: "400px", overflow: "hidden" }}>
              <img
                src={page.imageUrl}
                alt={page.title}
                className="w-full object-cover"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          {page.contentText && (
            <div className="p-6">
              <p
                className="text-lg leading-relaxed text-white"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {page.contentText}
              </p>
            </div>
          )}

          {/* QR Code section */}
          <div
            className="flex flex-col items-center gap-4 px-6 py-6"
            style={{ borderTop: page.imageUrl || page.contentText ? "1px solid rgba(123,47,190,0.15)" : "none" }}
          >
            <div className="p-4 bg-white rounded-xl" style={{ boxShadow: "0 0 20px rgba(123,47,190,0.25)" }}>
              <QRCodeSVG value={pageUrl} size={140} />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono" style={{ color: "#555577" }}>امسح QR للوصول لهذه الصفحة</p>
              <p className="text-[10px] font-mono mt-1" style={{ color: "#333355" }}>{pageUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

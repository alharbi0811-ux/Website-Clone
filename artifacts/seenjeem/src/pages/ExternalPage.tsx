import { useEffect, useState } from "react";
import { useRoute } from "wouter";

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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/p/${slug}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPage)
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0b0b14" }} dir="rtl">
        <p className="text-4xl font-black" style={{ color: "#333355" }}>404</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0b0b14" }} dir="rtl">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0b0b14 0%, #12122a 100%)" }}
      dir="rtl"
    >
      {/* Badge top */}
      <div className="flex justify-center pt-8">
        <span
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ background: "rgba(123,47,190,0.15)", border: "1px solid rgba(123,47,190,0.3)", color: "#9b6dff" }}
        >
          بدون كلام
        </span>
      </div>

      {/* Main — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">

        {/* Image */}
        {page.imageUrl && (
          <div className="w-full max-w-xl mb-8 rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 40px rgba(123,47,190,0.2)" }}>
            <img src={page.imageUrl} alt={page.title} className="w-full object-cover" />
          </div>
        )}

        {/* Title */}
        <h1
          className="text-center font-black text-white mb-6"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)", textShadow: "0 0 30px rgba(123,47,190,0.5)", lineHeight: 1.2 }}
        >
          {page.title}
        </h1>

        {/* Content text — large and centered */}
        {page.contentText && (
          <p
            className="text-center font-black text-white"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              lineHeight: 1.3,
              maxWidth: "900px",
              textShadow: "0 0 20px rgba(255,255,255,0.1)",
              whiteSpace: "pre-wrap",
            }}
          >
            {page.contentText}
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import ExternalPageRenderer, { parseDesign } from "@/components/ExternalPageRenderer";

interface Page {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  contentText: string | null;
  designJson: string | null;
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

  const design = parseDesign(page.designJson);

  return (
    <ExternalPageRenderer
      title={page.title}
      imageUrl={page.imageUrl}
      contentText={page.contentText}
      design={design}
    />
  );
}

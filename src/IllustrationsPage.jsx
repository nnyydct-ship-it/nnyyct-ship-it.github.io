import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

const withBase = (p) => {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(p || "").replace(/^\/+/, "");
  return base.endsWith("/") ? base + clean : base + "/" + clean;
};

export default function IllustrationsPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetch(withBase("Illustrations/list.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  const hasModal = useMemo(
    () => openIndex !== null && items[openIndex],
    [openIndex, items]
  );

  const close = () => setOpenIndex(null);
  const prev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  const next = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));

  // ESC 关闭
  useEffect(() => {
    const onKey = (e) => {
      if (!hasModal) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasModal, items.length]);

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-6 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#84fab0] to-[#8fd3f4] opacity-20 blur-3xl"></div>

      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-[#8B4F58] font-bold hover:scale-105 transition border border-white/60 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> 返回大厅
      </button>

      <div className="max-w-6xl mx-auto pt-14 relative z-10">
        <h1 className="text-3xl font-black text-[#8B4F58] mb-2">插画 (Illustrations)</h1>
        <p className="text-[#C5A0A6] text-sm mb-6">这里展示妹妹的插画作品 ✨</p>

        {items.length === 0 ? (
          <div className="bg-white/60 backdrop-blur p-8 rounded-[30px] border border-white/60 text-center text-[#8B4F58] font-bold">
            这里还空空的～先去 public/Illustrations 放图片，并更新 list.json 💖
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it, idx) => (
              <button
                key={it.id || it.src || idx}
                onClick={() => setOpenIndex(idx)}
                className="group text-left bg-white/60 backdrop-blur rounded-[24px] p-3 border border-white/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
                title={it.title || it.id || "illustration"}
              >
                <img
                  src={withBase(it.src)}
                  alt={it.title || it.id || "illustration"}
                  className="w-full aspect-square object-cover rounded-[18px] bg-white"
                  loading="lazy"
                />
                <div className="mt-2 text-sm font-black text-[#8B4F58]">
                  {it.title || it.id || "Untitled"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 弹窗预览 */}
      {hasModal && (
        <div
          className="fixed inset-0 z-[100] bg-[#8B4F58]/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={close}
        >
          <div
            className="relative max-w-4xl w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute -top-4 -right-4 bg-white rounded-full shadow-lg p-2 hover:scale-105 transition"
              title="关闭"
            >
              <X />
            </button>

            <div className="bg-white/80 border border-white/70 rounded-[32px] p-4 shadow-2xl">
              <img
                src={withBase(items[openIndex].src)}
                alt={items[openIndex].title || items[openIndex].id || "preview"}
                className="w-full h-auto rounded-[24px] select-none"
              />
              <div className="mt-3 text-center font-black text-[#8B4F58]">
                {items[openIndex].title || items[openIndex].id || "Untitled"}
              </div>
            </div>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full shadow-lg p-2 hover:scale-105 transition"
              title="上一张"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-full shadow-lg p-2 hover:scale-105 transition"
              title="下一张"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

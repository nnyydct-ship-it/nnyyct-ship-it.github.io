import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const withBase = (p) => {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(p || "").replace(/^\/+/, "");
  return base.endsWith("/") ? base + clean : base + "/" + clean;
};

export default function AnimationsPage({ onBack }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(withBase("Animations/list.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-6 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#e0c3fc] to-[#8ec5fc] opacity-20 blur-3xl"></div>

      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-[#8B4F58] font-bold hover:scale-105 transition border border-white/60 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> 返回大厅
      </button>

      <div className="max-w-6xl mx-auto pt-14 relative z-10">
        <h1 className="text-3xl font-black text-[#8B4F58] mb-2">Live2D 动画 (Animations)</h1>
        <p className="text-[#C5A0A6] text-sm mb-6">
          这里放妹妹用 Live2D 做出来的 MP4 动画视频 ✨
        </p>

        {items.length === 0 ? (
          <div className="bg-white/60 backdrop-blur p-8 rounded-[30px] border border-white/60 text-center text-[#8B4F58] font-bold">
            这里还空空的～先去 public/Animations 放 mp4，并更新 list.json 💖
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((it, idx) => (
              <div
                key={it.id || it.src || idx}
                className="bg-white/60 backdrop-blur rounded-[24px] p-4 border border-white/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <div className="text-sm font-black text-[#8B4F58] mb-2">
                  {it.title || it.id || "Untitled"}
                </div>

                <video
                  src={withBase(it.src)}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full rounded-[18px] bg-white"
                />

                <a
                  href={withBase(it.src)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-xs font-bold text-[#FF5D7D] hover:underline"
                >
                  在新标签页打开视频 →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

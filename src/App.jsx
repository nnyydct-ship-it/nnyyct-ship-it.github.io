import React, { useState } from 'react';
import { 
  TrendingUp, BookOpen, Palette, Image as ImageIcon, 
  Gamepad2, Video, ArrowLeft, Heart, Sparkles, 
  Github, Maximize2
} from 'lucide-react';
import Backtest from './Backtest';

// --- 🎨 1. 配置区域 ---

// 左边栏：文学与艺术
const LEFT_COL_ITEMS = [
  { 
    id: 'novel', 
    title: '小说 (Novel)', 
    desc: '沉浸式阅读我的奇幻世界',
    icon: BookOpen, 
    color: 'from-[#a18cd1] to-[#fbc2eb]', // 梦幻紫
    btnColor: 'text-[#a18cd1]'
  },
  { 
    id: 'art', 
    title: '插画 (Art)', 
    desc: '捕捉灵感瞬间的色彩碎片',
    icon: Palette, 
    color: 'from-[#84fab0] to-[#8fd3f4]', // 清新蓝绿
    btnColor: 'text-[#84fab0]'
  },
  { 
    id: 'manga', 
    title: '漫画 (Manga)', 
    desc: '黑白线条下的趣味日常',
    icon: ImageIcon, 
    color: 'from-[#fccb90] to-[#d57eeb]', // 活力橙紫
    btnColor: 'text-[#fccb90]'
  }
];

// 右边栏：互动与金融
const RIGHT_COL_ITEMS = [
  { 
    id: 'gif', 
    title: '动图 (GIFs)', 
    desc: '让画面动起来的魔法时刻',
    icon: Video, 
    color: 'from-[#e0c3fc] to-[#8ec5fc]', // 极光蓝紫
    btnColor: 'text-[#e0c3fc]'
  },
  { 
    id: 'game', 
    title: '游戏 (Game)', 
    desc: '休息一下，来玩个游戏吧',
    icon: Gamepad2, 
    color: 'from-[#ffecd2] to-[#fcb69f]', // 温暖橘粉
    btnColor: 'text-[#fcb69f]'
  },
  { 
    id: 'invest', 
    title: '投资 (Investment)', 
    desc: '双子星回测模型 & 基金组合分析',
    icon: TrendingUp, 
    color: 'from-[#FF9A9E] to-[#FECFEF]', // 渐变粉
    btnColor: 'text-[#FF9A9E]'
  }
];

const ALL_ITEMS = [...LEFT_COL_ITEMS, ...RIGHT_COL_ITEMS];

// --- 🏠 2. 通用子页面组件 ---
const SubPage = ({ title, icon: Icon, onBack, color }) => (
  <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fade-in">
    <div className={`absolute top-0 left-0 w-full h-64 bg-gradient-to-r ${color} opacity-20 blur-3xl`}></div>
    <button 
      onClick={onBack}
      className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md text-[#8B4F58] font-bold hover:scale-105 transition flex items-center gap-2 z-50"
    >
      <ArrowLeft size={18} /> 返回大厅
    </button>
    <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] shadow-xl text-center max-w-lg border border-white">
      <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white shadow-lg mb-6 animate-bounce-slow`}>
        <Icon size={40} />
      </div>
      <h1 className="text-3xl font-black text-[#8B4F58] mb-4">{title}</h1>
      <p className="text-[#C5A0A6] mb-8">
        🚧 仙界林慕溪正在施法建设中... <br/>
        精彩内容即将降临 ✨
      </p>
      <button className="px-6 py-2 bg-white rounded-full text-[#8B4F58] font-bold shadow-sm hover:bg-[#FFF0F5] transition">
        敬请期待 💖
      </button>
    </div>
  </div>
);

// --- 🌟 3. 主程序 ---
export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [showBigAvatar, setShowBigAvatar] = useState(false);

  // 渲染单个卡片
  const renderCard = (item) => (
    <div 
      key={item.id}
      onClick={() => setActivePage(item.id)}
      className="group cursor-pointer bg-white/60 backdrop-blur-md p-5 rounded-[28px] border border-white hover:border-white/80 shadow-sm hover:shadow-[0_15px_30px_rgba(255,182,193,0.2)] transition-all duration-300 relative overflow-hidden mb-5 last:mb-0"
    >
       <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${item.color} rounded-bl-[80px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
       <div className="flex items-center gap-4 relative z-10">
         <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition duration-300 ${item.btnColor}`}>
           <item.icon size={24} />
         </div>
         <div className="flex-1">
           <h3 className="text-base font-black text-[#8B4F58] group-hover:text-[#FF5D7D] transition-colors">{item.title}</h3>
           <p className="text-[10px] text-[#C5A0A6] leading-relaxed line-clamp-1">{item.desc}</p>
         </div>
         <ArrowLeft size={16} className="rotate-180 text-[#C5A0A6] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
       </div>
    </div>
  );

  // 🔄 路由控制
  const renderContent = () => {
    if (activePage === 'invest') {
      return (
        <div className="relative animate-fade-in">
          <button 
            onClick={() => setActivePage('home')}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-[#FF8FAB] font-bold hover:scale-105 transition border border-[#FFC2D1]"
          >
            ← 返回大厅
          </button>
          <Backtest />
        </div>
      );
    }
    
    const targetItem = ALL_ITEMS.find(item => item.id === activePage);
    if (targetItem) {
      return <SubPage {...targetItem} onBack={() => setActivePage('home')} />;
    }

    // 主页
    return (
      <div className="min-h-screen bg-[#FFF0F5] font-sans selection:bg-[#FFC2D1] selection:text-[#8B4F58] pb-20 relative">
        
        {/* 背景动效 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FFDEE9] rounded-full blur-[120px] opacity-60 animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E0F7FA] rounded-full blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          
          {/* ✨ 顶部导航 (修改版：纯标题居中) ✨ */}
          <nav className="relative flex items-center justify-center mb-12 animate-slide-down">
             {/* 居中标题 */}
             <h1 className="text-3xl font-black text-[#8B4F58] tracking-widest drop-shadow-sm">
               慕溪的个人网站
             </h1>
             
             {/* GitHub 按钮 (绝对定位靠右，不影响标题居中) */}
             <a href="https://github.com/nnyydct-ship-it" target="_blank" className="absolute right-0 p-2.5 bg-white/60 hover:bg-white rounded-full text-[#FF8FAB] transition shadow-sm hover:rotate-12">
               <Github size={22} />
             </a>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 👈 左侧：名片卡 */}
            <div className="lg:col-span-4 animate-slide-up">
              <div className="sticky top-8 bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[40px] shadow-[0_20px_40px_rgba(255,182,193,0.15)] text-center hover:-translate-y-1 transition duration-500">
                
                {/* 头像区域 */}
                <div 
                  className="relative w-48 h-48 mx-auto mb-6 cursor-pointer group/avatar"
                  onClick={() => setShowBigAvatar(true)} 
                  title="点击查看高清大图"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF99A8] to-[#FECFEF] rounded-full blur-2xl opacity-60 animate-pulse"></div>
                  <img src="/avatar.jpg" alt="Avatar" className="w-full h-full rounded-full border-[6px] border-white relative z-20 object-cover bg-[#FFF0F5] shadow-xl transition group-hover/avatar:scale-105" />
                  <div className="absolute inset-0 z-30 bg-black/20 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px] border-[6px] border-transparent">
                     <Maximize2 size={32} className="drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-4 right-4 z-40 bg-white p-2 rounded-full shadow-md">
                     <Heart size={20} className="text-[#FF5D7D] fill-[#FF5D7D]" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-black text-[#8B4F58] mb-2">仙界林慕溪</h2>
                <p className="text-[#C5A0A6] text-sm font-bold tracking-widest uppercase">
                  Dreamer & Creator ✨
                </p>
              </div>
            </div>

            {/* 👉 右侧：双列布局 */}
            <div className="lg:col-span-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {/* 第一列 */}
                 <div className="flex flex-col gap-5 animate-slide-up animation-delay-200">
                    <div className="text-xs font-bold text-[#C5A0A6] pl-2 mb-[-10px] uppercase tracking-wider">Literature & Art</div>
                    {LEFT_COL_ITEMS.map(renderCard)}
                 </div>

                 {/* 第二列 */}
                 <div className="flex flex-col gap-5 animate-slide-up animation-delay-300">
                    <div className="text-xs font-bold text-[#C5A0A6] pl-2 mb-[-10px] uppercase tracking-wider">Interactive & Finance</div>
                    {RIGHT_COL_ITEMS.map(renderCard)}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 全屏大图查看器 */}
        {showBigAvatar && (
          <div 
            className="fixed inset-0 z-[100] bg-[#8B4F58]/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in cursor-zoom-out"
            onClick={() => setShowBigAvatar(false)} 
          >
            <div 
              className="relative max-w-2xl w-full animate-scale-in"
              onClick={(e) => e.stopPropagation()} 
            >
               <img src="/avatar.jpg" alt="Big Avatar" className="w-full h-auto rounded-[40px] shadow-2xl border-8 border-white/80 select-none" />
               <p className="text-white/90 text-center mt-4 font-bold text-lg tracking-widest drop-shadow-md">✨ 仙界林慕溪的美照 ✨</p>
            </div>
          </div>
        )}
        
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 10s infinite alternate; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .animate-bounce-slow { animation: bounce 3s infinite; }
          .animate-slide-up { animation: slideUp 0.6s ease-out backwards; }
          .animate-slide-down { animation: slideDown 0.6s ease-out backwards; }
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-300 { animation-delay: 0.3s; }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  };

  return renderContent();
}
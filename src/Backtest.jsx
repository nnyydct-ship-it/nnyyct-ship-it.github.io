import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Play, TrendingUp, DollarSign, 
  Calendar, Activity, Layers, Percent, X,
  Sparkles, ArrowUpRight, ShieldCheck, Flower,
  GitCompare, Snowflake, BarChart2, Scale, Zap, ArrowLeft
} from 'lucide-react';

// --- 💖 甜美粉嫩主题配置 (高级感配色) ---
const THEME = {
  colors: {
    primary: '#FF8FAB',      
    primarySoft: '#FFC2D1',
    primaryGradient: 'linear-gradient(135deg, #FF99A8 0%, #FF5D7D 100%)',
    secondary: '#89CFF0',    
    secondarySoft: '#BAE1FF',
    secondaryGradient: 'linear-gradient(135deg, #A7C5EB 0%, #6495ED 100%)',
    textMain: '#8B4F58',
    textLight: '#C5A0A6',
    bgGradient: 'linear-gradient(180deg, #FFF0F5 0%, #FFF5F7 100%)',
    glass: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 200, 210, 0.3)',
  }
};

// --- 默认配置 ---
const DEFAULT_CONFIG_A = [
  { code: '001021', weight: 20 },
  { code: '161119', weight: 20 },
  { code: '001512', weight: 20 },
  { code: '008701', weight: 10 },
  { code: '017641', weight: 7.5 },
  { code: '023917', weight: 7.5 },
  { code: '000369', weight: 7.5 },
  { code: '539003', weight: 2.5 },
  { code: '021539', weight: 2.5 },
  { code: '020712', weight: 2.5 }
];
const DEFAULT_CONFIG_B = [
  { code: '161128', weight: 20 },
  { code: '017091', weight: 20 },
  { code: '021482', weight: 20 },
  { code: '023917', weight: 20 },
  { code: '000369', weight: 20 },
];

// --- 基础函数 ---
const validateFundCode = (code) => /^\d{6}$/.test(code.trim());
const validateAmount = (amount) => !isNaN(amount) && amount >= 10;
const validateDate = (dateStr) => {
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d) && d < new Date();
};

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFDEE9] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob"></div>
    <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[#E0F7FA] rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#F8C8DC] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
  </div>
);

const ToggleGroup = ({ options, value, onChange, label }) => (
  <div className="flex flex-col gap-2 min-w-0">
    {label && <span className="text-[10px] font-bold text-[#C5A0A6] ml-1 uppercase tracking-widest">{label}</span>}
    <div className="bg-white/40 p-1 rounded-2xl flex border border-white/60 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(139,79,88,0.05)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-500 relative overflow-hidden group
            ${value === opt.value 
              ? 'text-white shadow-lg transform scale-[1.02]' 
              : 'text-[#8B4F58]/60 hover:text-[#FF8596] hover:bg-white/40'}
          `}
          style={{
            background: value === opt.value ? (opt.activeGradient || THEME.colors.primaryGradient) : 'transparent',
            boxShadow: value === opt.value ? '0 4px 12px rgba(255, 153, 168, 0.3)' : 'none'
          }}
        >
          {opt.icon && <opt.icon size={14} strokeWidth={2.5} className="relative z-10" />}
          <span className="truncate relative z-10">{opt.label}</span>
          {value === opt.value && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}
        </button>
      ))}
    </div>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calculateXIRR = (cashFlows, guess = 0.1) => {
  if (cashFlows.length < 2) return 0;
  const xnpv = (rate, flows) => {
    const t0 = new Date(flows[0].date).getTime();
    return flows.reduce((acc, cf) => {
      const days = (new Date(cf.date).getTime() - t0) / (1000 * 60 * 60 * 24);
      return acc + cf.amount / Math.pow(1 + rate, days / 365);
    }, 0);
  };
  let rate = guess, low = -0.99, high = 10.0;
  for (let i = 0; i < 100; i++) {
    const npv = xnpv(rate, cashFlows);
    if (Math.abs(npv) < 1) break;
    if (npv > 0) low = rate; else high = rate;
    rate = (low + high) / 2;
  }
  return rate * 100;
};

const calculateVolatility = (returns) => {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 252) * 100; 
};

const calculateSharpe = (returns, riskFree = 0.02) => { 
  if (returns.length < 2) return 0;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length * 252;
  const vol = calculateVolatility(returns) / 100;
  return vol > 0 ? (avgReturn - riskFree) / vol : 0;
};

// --- 主程序 (这里改成了 Backtest) ---
export default function Backtest({ onBack }) {
  const [fundsA, setFundsA] = useState(DEFAULT_CONFIG_A);
  const [fundsB, setFundsB] = useState(DEFAULT_CONFIG_B);
  
  const [params, setParams] = useState(() => {
    try {
      const saved = localStorage.getItem('backtestParams_v3');
      return saved ? JSON.parse(saved) : { startDate: '2020-01-01', initialCapital: 10000, monthlyInvestment: 3000 };
    } catch { return { startDate: '2020-01-01', initialCapital: 10000, monthlyInvestment: 3000 }; }
  });
  const [activeTab, setActiveTab] = useState('A'); 
  const [viewMode, setViewMode] = useState('compare'); 
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);
  const [rawDataMap, setRawDataMap] = useState(null); 
  const [fundNames, setFundNames] = useState({});
    
  const [strategyMode, setStrategyMode] = useState('invest');
  const [metricMode, setMetricMode] = useState('value');
  const [scaleMode, setScaleMode] = useState('linear');

  useEffect(() => {
    try { localStorage.setItem('backtestParams_v3', JSON.stringify(params)); } catch (e) {}
  }, [params]);

  const fetchOneFund = (code) => {
    return new Promise((resolve, reject) => {
      const scriptId = `script-${code}`;
      const oldScript = document.getElementById(scriptId);
      if (oldScript) oldScript.remove();
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://fund.eastmoney.com/pingzhongdata/${code}.js?t=${new Date().getTime()}`;
      
      script.onload = () => {
        if (window.Data_netWorthTrend) {
          const rawData = window.Data_netWorthTrend;
          const name = window.fS_name || "未知基金";
          let shareMultiplier = 1.0;
          const formatted = rawData.map(item => {
            const nav = Number(item.y);
            const date = new Date(item.x).toISOString().split('T')[0];
            let dividend = 0;
            if (item.unitMoney && typeof item.unitMoney === 'string') {
               const match = item.unitMoney.match(/派现金(\d+(\.\d+)?)元/);
               if (match) dividend = parseFloat(match[1]);
            }
            if (dividend > 0 && nav > 0) shareMultiplier *= (1 + dividend / nav);
            return { date, nav: nav * shareMultiplier };
          });
          window.Data_netWorthTrend = undefined;
          window.fS_name = undefined;
          document.getElementById(scriptId)?.remove();
          resolve({ data: formatted, name });
        } else {
          reject('无数据');
        }
      };
      script.onerror = () => reject('网络错误');
      document.head.appendChild(script);
    });
  };

  const runBacktest = async () => {
    if (!validateDate(params.startDate)) return setError('日期格式不对哦~');
    setLoading(true); setError(null);
    const allCodes = new Set([...fundsA, ...fundsB].filter(f => f.code && validateFundCode(f.code)).map(f => f.code));
    try {
      const fetchedData = {};
      const fetchedNames = {};
      const codes = Array.from(allCodes);
      for (let i = 0; i < codes.length; i++) {
        setProgress(`正在获取 ${codes[i]} (${i+1}/${codes.length})...`);
        try {
          const res = await fetchOneFund(codes[i]);
          fetchedData[codes[i]] = res.data;
          fetchedNames[codes[i]] = res.name;
        } catch (e) { console.warn(e); }
        await new Promise(r => setTimeout(r, 200));
      }
      setRawDataMap(fetchedData);
      setFundNames(fetchedNames);
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); setProgress(''); }
  };

  const calculatePortfolio = (portfolioConfig, rawDataMap, params) => {
    const validFunds = portfolioConfig.filter(f => rawDataMap[f.code]);
    if (validFunds.length === 0) return null;
    const validCodes = validFunds.map(f => f.code);
    let maxMinDate = new Date(params.startDate);
    validCodes.forEach(code => {
      const d = rawDataMap[code];
      if (d && d.length > 0) {
        const start = new Date(d[0].date);
        if (start > maxMinDate) maxMinDate = start;
      }
    });
    const dateSet = new Set();
    validCodes.forEach(c => rawDataMap[c].forEach(d => {
       if (new Date(d.date) >= maxMinDate) dateSet.add(d.date);
    }));
    const sortedDates = Array.from(dateSet).sort();
    const lookup = {};
    validCodes.forEach(c => {
      lookup[c] = {};
      rawDataMap[c].forEach(d => lookup[c][d.date] = d.nav);
    });
    const alignedData = [];
    const lastNavs = {};
    sortedDates.forEach(date => {
      const row = { date };
      validCodes.forEach(c => {
        if (lookup[c][date] !== undefined) lastNavs[c] = lookup[c][date];
        row[c] = lastNavs[c];
      });
      if (validCodes.every(c => row[c] !== undefined)) alignedData.push(row);
    });
    if (alignedData.length < 2) return null;
    const getFee = (code) => {
        const name = fundNames[code] || "";
        if (name.includes("C")) return 0;
        if (name.includes("债")) return 0.0008;
        return 0.0015; 
    };
    const runStrategy = (isInvestMode) => {
      let totalInvested = 0;
      let shares = {};
      validCodes.forEach(c => shares[c] = 0);
      const cashFlows = [];
      const curve = [];
      const dailyReturns = [];
      let lastMonth = -1;
      let lastValue = 0;
      const MONTHLY_AMT = 3000;
      const initialDate = alignedData[0].date;
      lastMonth = new Date(initialDate).getMonth();
      totalInvested += params.initialCapital;
      cashFlows.push({ date: initialDate, amount: -params.initialCapital });
      const totalWeight = validFunds.reduce((a,b) => a + b.weight, 0);
      validCodes.forEach(c => {
        const w = validFunds.find(f => f.code === c).weight / totalWeight;
        const amt = params.initialCapital * w;
        const net = amt / (1 + getFee(c));
        shares[c] = net / alignedData[0][c];
      });
      alignedData.forEach((row, idx) => {
        const d = new Date(row.date);
        const m = d.getMonth();
        let val = 0;
        validCodes.forEach(c => val += shares[c] * row[c]);
        if (isInvestMode && idx > 0 && m !== lastMonth) {
           totalInvested += MONTHLY_AMT;
           cashFlows.push({ date: row.date, amount: -MONTHLY_AMT });
           let weightedFee = 0;
           validCodes.forEach(c => {
             const w = validFunds.find(f => f.code === c).weight / totalWeight;
             weightedFee += w * getFee(c);
           });
           const netNew = MONTHLY_AMT / (1 + weightedFee);
           const newVal = val + netNew;
           validCodes.forEach(c => {
             const w = validFunds.find(f => f.code === c).weight / totalWeight;
             shares[c] = (newVal * w) / row[c];
           });
           val = newVal;
        }
        if (idx > 0 && lastValue > 0) dailyReturns.push((val - lastValue) / lastValue);
        lastValue = val;
        lastMonth = m;
        const ret = totalInvested > 0 ? ((val - totalInvested) / totalInvested) * 100 : 0;
        curve.push({ date: row.date, value: val, cost: totalInvested, returnRate: ret });
      });
      let maxVal = 0;
      curve.forEach(d => {
         if (d.value > maxVal) maxVal = d.value;
         d.drawdown = maxVal > 0 ? ((d.value - maxVal) / maxVal) * 100 : 0;
      });
      const finalVal = curve[curve.length-1].value;
      cashFlows.push({ date: curve[curve.length-1].date, amount: finalVal });
      let irr = isInvestMode ? calculateXIRR(cashFlows) : 0;
      if (!isInvestMode) {
          const years = (new Date(curve[curve.length-1].date) - new Date(initialDate)) / (31536000000);
          if (years > 0) irr = (Math.pow(finalVal/totalInvested, 1/years) - 1) * 100;
      }
      const volatility = calculateVolatility(dailyReturns);
      const sharpe = calculateSharpe(dailyReturns);
      const maxDrawdown = Math.min(...curve.map(d => d.drawdown));
      const totalReturn = ((finalVal - totalInvested) / totalInvested) * 100;
      return { curve, metrics: { totalReturn, maxDrawdown, irr, volatility, sharpe } };
    };
    return {
       invest: runStrategy(true),
       lumpSum: runStrategy(false),
       startDate: formatDate(maxMinDate)
    };
  };

  const results = useMemo(() => {
    if (!rawDataMap) return null;
    const resA = calculatePortfolio(fundsA, rawDataMap, params);
    const resB = calculatePortfolio(fundsB, rawDataMap, params);
    if (!resA && !resB) return null;
    const startA = resA ? new Date(resA.startDate) : new Date(0);
    const startB = resB ? new Date(resB.startDate) : new Date(0);
    const commonStart = new Date(Math.max(startA, startB));
    const dataA = resA ? (strategyMode === 'invest' ? resA.invest : resA.lumpSum) : null;
    const dataB = resB ? (strategyMode === 'invest' ? resB.invest : resB.lumpSum) : null;
    const dateMap = new Map();
    if (dataA) dataA.curve.forEach(d => {
       if (new Date(d.date) >= commonStart) dateMap.set(d.date, { date: d.date, valA: d.value, rateA: d.returnRate, ddA: d.drawdown });
    });
    if (dataB) dataB.curve.forEach(d => {
       if (new Date(d.date) >= commonStart) {
         const existing = dateMap.get(d.date) || { date: d.date };
         dateMap.set(d.date, { ...existing, valB: d.value, rateB: d.returnRate, ddB: d.drawdown });
       }
    });
    const mergedCurve = Array.from(dateMap.values()).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const chartData = mergedCurve.map(d => {
      const rawA = metricMode === 'value' ? d.valA : d.rateA;
      const rawB = metricMode === 'value' ? d.valB : d.rateB;
      const rawDDA = d.ddA;
      const rawDDB = d.ddB;
      let vMain, vSub, ddMain, ddSub;
      if (viewMode === 'B') {
        vMain = rawB; vSub = rawB; 
        ddMain = rawDDB; ddSub = rawDDB;
      } else if (viewMode === 'compare') {
        vMain = rawA; vSub = rawB;
        ddMain = rawDDA; ddSub = rawDDB;
      } else {
        vMain = rawA; vSub = rawA;
        ddMain = rawDDA; ddSub = rawDDA;
      }
      return { ...d, vMain, vSub, ddMain, ddSub };
    });
    return { resA, resB, dataA, dataB, chartData };
  }, [rawDataMap, params, fundsA, fundsB, strategyMode, viewMode, metricMode]);

  const dynamicStyles = useMemo(() => {
    let mainColor, subColor, mainOpacity, subOpacity;
    if (viewMode === 'B') {
      mainColor = THEME.colors.secondary; 
      subColor = THEME.colors.secondary;
      mainOpacity = 1; subOpacity = 0;
    } else if (viewMode === 'compare') {
      mainColor = THEME.colors.primary;   
      subColor = THEME.colors.secondary; 
      mainOpacity = 1; subOpacity = 1;
    } else {
      mainColor = THEME.colors.primary;   
      subColor = THEME.colors.primary;
      mainOpacity = 1; subOpacity = 0;
    }
    return {
      '--main-color': mainColor,
      '--sub-color': subColor,
      '--main-opacity': mainOpacity,
      '--sub-opacity': subOpacity,
    };
  }, [viewMode]);

  const glassCard = "backdrop-blur-xl rounded-[24px] border border-white/60 shadow-[0_8px_32px_rgba(255,182,193,0.1)] bg-white/60 hover:bg-white/70 transition-all duration-500 hover:shadow-[0_12px_48px_rgba(255,153,168,0.2)]";
  const glassInput = "w-full bg-white/50 border border-white rounded-xl px-4 py-2 text-sm text-[#8B4F58] outline-none focus:ring-2 focus:ring-[#FFC2D1] focus:bg-white transition-all shadow-inner";
  const activeFunds = activeTab === 'A' ? fundsA : fundsB;

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans selection:bg-[#FFC2D1] selection:text-[#8B4F58] animate-fade-in-up"
         style={{ background: THEME.colors.bgGradient, ...dynamicStyles }}>
      
      <BackgroundBlobs />

      {/* 🌟 唯一的改动：这里加了一个返回按钮 */}
      <div className="max-w-7xl mx-auto mb-4 relative z-20">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm text-[#8B4F58] font-bold hover:bg-white hover:text-[#FF8FAB] transition-all">
              <ArrowLeft size={18} /> 返回主页
          </button>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 bg-white/40 p-2 pr-6 rounded-full border border-white/60 backdrop-blur-md shadow-sm mb-4 animate-fade-in-up">
             <div className="p-2 bg-[#FFE4E9] rounded-full"><Flower size={20} className="text-[#FF8FAB]" /></div>
             <span className="text-xs font-bold text-[#8B4F58] tracking-wider">投资组合回测</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3 text-[#8B4F58] drop-shadow-sm">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8FAB] via-[#A7C5EB] to-[#89CFF0]">
               双子星
            </span>
          </h1>
          <p className="text-sm font-medium text-[#C5A0A6] flex justify-center gap-6 mt-4">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF8FAB]"></span> 细水长流 (粉)</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#89CFF0]"></span> 五等分 (冰蓝)</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
             <div className={`${glassCard} p-6`}>
               <div className="flex items-center gap-2 mb-5">
                 <div className="p-1.5 bg-[#FFF0F5] rounded-lg text-[#FF8FAB]"><Calendar size={18}/></div>
                 <h2 className="font-bold text-[#8B4F58]">回测设定</h2>
               </div>
               <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-[#C5A0A6] ml-1 mb-1 block">开始日期</label>
                    <input type="date" value={params.startDate} onChange={e=>setParams({...params, startDate:e.target.value})} className={glassInput}/>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#C5A0A6] ml-1 mb-1 block">初始本金</label>
                      <input type="number" value={params.initialCapital} onChange={e=>setParams({...params, initialCapital:Number(e.target.value)})} className={glassInput}/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#C5A0A6] ml-1 mb-1 block">每月定投</label>
                      <div className="relative">
                         <input type="number" value={3000} disabled className={`${glassInput} opacity-70 bg-gray-50/50`}/>
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">固定</span>
                      </div>
                    </div>
                 </div>
               </div>
             </div>

             <div className={`${glassCard} flex flex-col h-[520px] overflow-hidden`}>
                <div className="flex p-1 m-2 bg-white/50 rounded-xl">
                   <button onClick={() => setActiveTab('A')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab==='A'?'bg-[#FF8FAB] text-white shadow-md':'text-[#C5A0A6] hover:bg-white/50'}`}>🌸 细水长流</button>
                   <button onClick={() => setActiveTab('B')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab==='B'?'bg-[#89CFF0] text-white shadow-md':'text-[#C5A0A6] hover:bg-white/50'}`}>❄️ 五等分</button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-4">
                  {activeFunds.map((fund, idx) => {
                    const isValid = !fund.code || validateFundCode(fund.code);
                    const name = fundNames[fund.code];
                    return (
                      <div key={idx} className="group flex flex-col gap-1 bg-white/30 p-2.5 rounded-xl border border-white/50 hover:bg-white/60 transition-all">
                         <div className="flex items-center gap-2">
                           <span className={`text-[10px] w-5 font-mono font-bold ${activeTab==='A'?'text-[#FFC2D1]':'text-[#BAE1FF]'}`}>{String(idx+1).padStart(2,'0')}</span>
                           <input value={fund.code} onChange={e => {
                               const newList = activeTab==='A' ? [...fundsA] : [...fundsB];
                               newList[idx].code = e.target.value;
                               activeTab==='A' ? setFundsA(newList) : setFundsB(newList);
                           }} 
                           className={`w-16 bg-transparent text-sm font-bold text-[#8B4F58] outline-none ${!isValid && 'text-red-400'}`} placeholder="000000"/>
                           
                           <div className="flex-1">
                             <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${activeTab==='A'?'bg-[#FF8FAB]':'bg-[#89CFF0]'}`} style={{width: `${Math.min(fund.weight, 100)}%`}}></div>
                             </div>
                           </div>
                           <input type="number" value={fund.weight} onChange={e => {
                               const newList = activeTab==='A' ? [...fundsA] : [...fundsB];
                               newList[idx].weight = Number(e.target.value);
                               activeTab==='A' ? setFundsA(newList) : setFundsB(newList);
                           }} className="w-10 bg-transparent text-xs font-bold text-right outline-none text-[#8B4F58]"/>
                           <span className="text-[10px] text-[#C5A0A6]">%</span>
                           <button onClick={() => {
                               const newList = activeTab==='A' ? [...fundsA] : [...fundsB];
                               activeTab==='A' ? setFundsA(newList.filter((_,i)=>i!==idx)) : setFundsB(newList.filter((_,i)=>i!==idx));
                           }} className="opacity-0 group-hover:opacity-100 text-[#C5A0A6] hover:text-[#FF8FAB] transition-opacity"><X size={12}/></button>
                         </div>
                         {name && <div className={`text-[10px] pl-7 truncate ${activeTab==='A'?'text-[#FF8FAB]':'text-[#89CFF0]'}`}>{name}</div>}
                      </div>
                    )
                  })}
                  <button onClick={() => {
                      const newList = activeTab==='A' ? [...fundsA] : [...fundsB];
                      newList.push({code:'', weight:0});
                      activeTab==='A' ? setFundsA(newList) : setFundsB(newList);
                  }} className="w-full py-2.5 border border-dashed border-[#FFC2D1] rounded-xl text-xs text-[#FF8FAB] hover:bg-[#FFF0F5] transition-colors font-bold">+ 添加基金</button>
                </div>
             </div>

             <button onClick={runBacktest} disabled={loading}
               className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-[0_10px_20px_rgba(255,143,171,0.3)] hover:shadow-[0_15px_30px_rgba(255,143,171,0.4)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group"
               style={{background: 'linear-gradient(135deg, #FF8FAB 0%, #FFB6C1 100%)'}}>
               {loading ? <Sparkles className="animate-spin" /> : <Play fill="currentColor" size={20}/>}
               <span className="relative z-10">{loading ? progress : '开启回测之旅'}</span>
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl"></div>
             </button>
          </div>

          <div className="lg:col-span-8 space-y-6">
             {!results ? (
               <div className={`${glassCard} h-full min-h-[500px] flex flex-col items-center justify-center text-center p-10 border-dashed border-2 border-[#FFC2D1]`}>
                 <div className="relative mb-6">
                   <div className="absolute inset-0 bg-[#FF8FAB] blur-3xl opacity-20 rounded-full animate-pulse"></div>
                   <Flower size={48} className="text-[#FF8FAB] relative z-10 animate-bounce-slow"/>
                 </div>
                 <h3 className="text-xl font-bold text-[#8B4F58] mb-2">姐姐，等你的指令哦</h3>
                 <p className="text-sm text-[#C5A0A6]">左侧填好代码，点击开始，见证粉色奇迹 ✨</p>
                 {error && <div className="mt-4 px-4 py-2 bg-red-50 text-red-400 text-xs rounded-lg border border-red-100">{error}</div>}
               </div>
             ) : (
               <>
                 <div className={`${glassCard} p-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20`}>
                    <div className="flex gap-1 bg-white/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                       {[
                         { id: 'compare', label: '对比', icon: GitCompare, color: '#BFAFB2' },
                         { id: 'A', label: '细水长流', icon: Flower, color: '#FF8FAB' },
                         { id: 'B', label: '五等分', icon: Snowflake, color: '#89CFF0' }
                       ].map(mode => (
                         <button key={mode.id} onClick={()=>setViewMode(mode.id)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all
                           ${viewMode===mode.id ? 'bg-white text-[#8B4F58] shadow-sm' : 'text-[#C5A0A6] hover:bg-white/30'}`}>
                           <mode.icon size={12} color={viewMode===mode.id ? mode.color : 'currentColor'}/> {mode.label}
                         </button>
                       ))}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                       <ToggleGroup value={scaleMode} onChange={setScaleMode} options={[
                         {value:'linear', label:'线性', icon: TrendingUp, activeGradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 100%)'},
                         {value:'log', label:'对数', icon: Zap, activeGradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 100%)'}
                       ]} />
                       <div className="w-[1px] bg-white/50 mx-1"></div>
                       <ToggleGroup value={strategyMode} onChange={setStrategyMode} options={[
                         {value:'invest', label:'定投', icon: Layers},
                         {value:'lumpSum', label:'梭哈', icon: ArrowUpRight}
                       ]} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: '总资产', key: 'value', icon: DollarSign, fmt: v=>`¥${Math.round(v).toLocaleString()}` },
                      { label: '总收益率', key: 'totalReturn', icon: Percent, fmt: v=>`${v.toFixed(2)}%` },
                      { label: '年化 IRR', key: 'irr', icon: Activity, fmt: v=>`${v.toFixed(2)}%` },
                      { label: '最大回撤', key: 'maxDrawdown', icon: ShieldCheck, fmt: v=>`${v.toFixed(2)}%` },
                      { label: '年化波动', key: 'volatility', icon: BarChart2, fmt: v=>`${v.toFixed(2)}%` },
                      { label: '夏普比率', key: 'sharpe', icon: Scale, fmt: v=>v.toFixed(3) },
                    ].map((m, i) => {
                      const valA = results.dataA ? (m.key==='value' ? results.dataA.curve.at(-1).value : results.dataA.metrics[m.key]) : 0;
                      const valB = results.dataB ? (m.key==='value' ? results.dataB.curve.at(-1).value : results.dataB.metrics[m.key]) : 0;
                      return (
                        <div key={i} className={`${glassCard} p-3 flex flex-col justify-center relative overflow-hidden`}>
                           <div className="flex items-center gap-1 text-[10px] text-[#C5A0A6] font-bold uppercase mb-2 z-10">
                             <m.icon size={10} /> {m.label}
                           </div>
                           <div className="space-y-1 z-10">
                              {(viewMode==='A'||viewMode==='compare') && (
                                 <div className="flex justify-between items-baseline text-[#FF8FAB]">
                                  <span className="text-[10px] opacity-60">细水长流</span>
                                  <span className="font-bold text-sm">{m.fmt(valA)}</span>
                                 </div>
                              )}
                              {(viewMode==='B'||viewMode==='compare') && (
                                 <div className="flex justify-between items-baseline text-[#89CFF0]">
                                  <span className="text-[10px] opacity-60">五等分</span>
                                  <span className="font-bold text-sm">{m.fmt(valB)}</span>
                                 </div>
                              )}
                           </div>
                           <div className="absolute right-[-10px] bottom-[-10px] text-white/20 rotate-[-15deg] pointer-events-none">
                              <m.icon size={40} strokeWidth={1} />
                           </div>
                        </div>
                      )
                    })}
                 </div>

                 <div className={`${glassCard} p-6 h-[420px] flex flex-col`}>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#8B4F58] flex items-center gap-2">
                         <TrendingUp size={16} className="text-[#FF8FAB]"/> 净值走势
                         <span className="text-[10px] px-2 py-0.5 bg-[#FFF0F5] text-[#FF8FAB] rounded-full border border-[#FFC2D1]">
                            {scaleMode === 'log' ? '对数坐标' : '线性坐标'}
                         </span>
                      </h3>
                   </div>
                   <div className="flex-1 w-full min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={results.chartData}>
                       <defs>
                          <linearGradient id="gradMain" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--main-color)" stopOpacity={0.4} className="stop-transition"/>
                           <stop offset="95%" stopColor="#FFF0F5" stopOpacity={0} className="stop-transition"/>
                          </linearGradient>
                         <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--sub-color)" stopOpacity={0.4} className="stop-transition"/>
                           <stop offset="95%" stopColor="#F0F7FF" stopOpacity={0} className="stop-transition"/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,182,193,0.2)" />
                       <XAxis dataKey="date" tickFormatter={t=>t.slice(0,7)} tick={{fontSize:10, fill:'#C5A0A6'}} axisLine={false} tickLine={false} dy={10} minTickGap={30}/>
                       <YAxis 
                         tick={{fontSize:10, fill:'#C5A0A6'}} axisLine={false} tickLine={false} 
                         scale={scaleMode} domain={['auto', 'auto']}
                         tickFormatter={v => metricMode === 'value' ? `${(v/1000).toFixed(0)}k` : `${v}%`}
                       />
                       <Tooltip 
                         contentStyle={{
                             borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', 
                             background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)',
                             boxShadow:'0 10px 40px rgba(255,182,193,0.2)'
                         }}
                         itemStyle={{fontSize:'12px', fontWeight:'bold'}}
                         formatter={(v, name) => {
                           if (name.includes('细水')) return [metricMode==='value'?`¥${Math.round(v).toLocaleString()}`:`${v.toFixed(2)}%`, '🌸 细水长流'];
                           if (name.includes('五等分')) return [metricMode==='value'?`¥${Math.round(v).toLocaleString()}`:`${v.toFixed(2)}%`, '❄️ 五等分'];
                           return [v, name];
                         }}
                         labelStyle={{color:'#8B4F58', fontSize:'12px', marginBottom:'8px'}}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="vMain" 
                         stroke="var(--main-color)" 
                         strokeWidth={3} 
                         fill="url(#gradMain)" 
                         name={viewMode === 'B' ? '五等分' : '细水长流'}
                         animationDuration={1500}
                         className="transition-all-chart"
                       />
                       <Area 
                         type="monotone" 
                         dataKey="vSub" 
                         stroke="var(--sub-color)" 
                         strokeWidth={3} 
                         fill="url(#gradSub)" 
                         name="五等分" 
                         animationDuration={1500}
                         strokeOpacity={viewMode === 'compare' ? 1 : 0}
                         fillOpacity={viewMode === 'compare' ? 1 : 0}
                         className="transition-all-chart"
                       />
                     </ComposedChart>
                   </ResponsiveContainer>
                   </div>
                 </div>

                 <div className={`${glassCard} p-6 h-[280px] flex flex-col`}>
                   <h3 className="text-sm font-bold text-[#8B4F58] mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-[#FF8FAB]"/> 回撤深度
                   </h3>
                   <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={results.chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,182,193,0.2)" />
                       <XAxis dataKey="date" tick={false} axisLine={false} />
                       <YAxis tick={{fontSize:10, fill:'#C5A0A6'}} axisLine={false} tickLine={false} width={40}/>
                       <Tooltip 
                         contentStyle={{borderRadius:'12px', border:'none', background:'rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}
                         formatter={(v) => [`${v.toFixed(2)}%`, '回撤']}
                       />
                       <Line 
                         type="step" 
                         dataKey="ddMain" 
                         stroke="var(--main-color)" 
                         strokeWidth={2} 
                         dot={false} 
                         name="主线回撤" 
                         animationDuration={1500}
                         className="transition-all-chart"
                       />
                       <Line 
                         type="step" 
                         dataKey="ddSub" 
                         stroke="var(--sub-color)" 
                         strokeWidth={2} 
                         dot={false} 
                         name="对比回撤" 
                         animationDuration={1500}
                         strokeOpacity={viewMode === 'compare' ? 1 : 0}
                         className="transition-all-chart"
                       />
                     </LineChart>
                   </ResponsiveContainer>
                   </div>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFC2D1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .transition-all-chart path { transition: stroke 1s ease, fill 1s ease, stroke-opacity 1s ease, fill-opacity 1s ease; }
        .stop-transition { transition: stop-color 1s ease; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite alternate; }
        .animate-bounce-slow { animation: bounce 4s infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
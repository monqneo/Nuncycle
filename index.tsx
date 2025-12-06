import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  TreeDeciduous, 
  Droplets, 
  Sprout, 
  Shield, 
  Zap, 
  Coins, 
  Map, 
  Globe, 
  Trophy, 
  Users, 
  HeartHandshake,
  CheckCircle2,
  Lock,
  ArrowUp,
  Leaf,
  Cpu,
  Hexagon,
  ScanLine,
  Activity,
  Sparkles
} from 'lucide-react';

// --- TYPES & CONSTANTS ---

type TreeType = 'basic' | 'protective' | 'synergetic' | 'brand_adidas' | 'brand_google' | 'brand_patagonia';
type PlotStatus = 'locked' | 'empty' | 'planted';

interface Tree {
  type: TreeType;
  level: number;
  xp: number;
  health: number; // 0-100
  lastWatered: number;
  isDiseased: boolean;
}

interface Plot {
  id: number;
  status: PlotStatus;
  price: number;
  tree: Tree | null;
}

interface Partner {
  id: string;
  name: string;
  logo: string; 
  color: string; // Tailwind class for text color
  gradient: string; // Tailwind class for gradient bg
  description: string;
  bonus: string;
  quests: { id: number; text: string; reward: number; completed: boolean }[];
  sponsoredTreeCost: number; 
}

// Game Configuration
const LEVEL_XP_THRESHOLD = 200;
const MAX_ENERGY = 12;

const TREE_STATS: Record<TreeType, { name: string; income: number; cost: number; rarity: string }> = {
  basic: { name: 'Genesis Sapling', income: 8, cost: 50, rarity: 'Common' },
  protective: { name: 'Guardian Node', income: 6, cost: 80, rarity: 'Uncommon' },
  synergetic: { name: 'Synapse Tree', income: 12, cost: 120, rarity: 'Rare' },
  brand_adidas: { name: 'Adidas Earth Node', income: 15, cost: 200, rarity: 'Epic' },
  brand_google: { name: 'Google Cloud Root', income: 18, cost: 250, rarity: 'Legendary' },
  brand_patagonia: { name: 'Patagonia Wild', income: 14, cost: 180, rarity: 'Epic' },
};

const PARTNERS: Partner[] = [
  {
    id: 'adidas',
    name: 'Adidas Earth Fund',
    logo: '👟',
    color: 'text-blue-400',
    gradient: 'from-blue-900/60 to-blue-500/20',
    description: 'Одежда из переработанных мета-материалов.',
    bonus: 'Стиль и защита цифрового леса.',
    quests: [
      { id: 1, text: 'Подключить эко-кошелек', reward: 50, completed: false },
      { id: 2, text: 'Сминтить 5 поливов', reward: 30, completed: false }
    ],
    sponsoredTreeCost: 200
  },
  {
    id: 'google',
    name: 'Google Green DAO',
    logo: '🔍',
    color: 'text-green-400',
    gradient: 'from-green-900/60 to-green-500/20',
    description: 'Децентрализованные органические продукты.',
    bonus: 'Натуральные смарт-удобрения.',
    quests: [
      { id: 1, text: 'Посетить Google Green Hub', reward: 40, completed: false }
    ],
    sponsoredTreeCost: 250
  },
  {
    id: 'patagonia',
    name: 'Patagonia Wild',
    logo: '🏔️',
    color: 'text-purple-400',
    gradient: 'from-purple-900/60 to-purple-500/20',
    description: 'Сохранение природы через блокчейн.',
    bonus: 'Иммунитет леса.',
    quests: [
      { id: 1, text: 'Просмотреть манифест', reward: 60, completed: false }
    ],
    sponsoredTreeCost: 180
  }
];

const REAL_TREES = [
  { id: 1, name: 'Cyber Pine v1', cost: 800, co2: 250, image: '🌲', req: 'Нет требований' },
  { id: 2, name: 'Titan Oak Node', cost: 1400, co2: 500, image: '🌳', req: 'Lvl 5, 3 Nodes' }
];

const INITIAL_PLOTS: Plot[] = [
  { id: 1, status: 'empty', price: 0, tree: null }, 
  { id: 2, status: 'locked', price: 150, tree: null },
  { id: 3, status: 'locked', price: 250, tree: null },
  { id: 4, status: 'locked', price: 400, tree: null },
  { id: 5, status: 'locked', price: 600, tree: null },
  { id: 6, status: 'locked', price: 850, tree: null },
  { id: 7, status: 'locked', price: 1150, tree: null },
  { id: 8, status: 'locked', price: 1500, tree: null },
  { id: 9, status: 'locked', price: 2000, tree: null },
  { id: 10, status: 'locked', price: 2500, tree: null },
  { id: 11, status: 'locked', price: 3000, tree: null },
  { id: 12, status: 'locked', price: 4000, tree: null },
];

// --- BACKGROUND COMPONENT ---

const LiquidBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="blob w-[500px] h-[500px] bg-emerald-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-morph animate-float-organic top-[-100px] left-[-100px]"></div>
    <div className="blob w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-morph animate-float-organic top-[20%] right-[-100px] animation-delay-2000"></div>
    <div className="blob w-[300px] h-[300px] bg-cyan-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 animate-morph animate-float-organic bottom-[-50px] left-[20%] animation-delay-4000"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
  </div>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  // --- STATE ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'forest' | 'partners' | 'real' | 'impact' | 'top'>('forest');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // User Stats
  const [tokens, setTokens] = useState(100); 
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(12);
  const [co2, setCo2] = useState(0);
  const [realTreesOwned, setRealTreesOwned] = useState<number[]>([]);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);

  // Modals
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [showShop, setShowShop] = useState(false); 
  const [dailySponsor, setDailySponsor] = useState<Partner>(PARTNERS[0]);
  
  // Toasts
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info' | 'error'} | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedData = localStorage.getItem('nuncycle_save_v1');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTokens(parsed.tokens || 50);
        setXp(parsed.xp || 0);
        setLevel(parsed.level || 1);
        setPlots(parsed.plots || INITIAL_PLOTS);
        setCo2(parsed.co2 || 0);
        setRealTreesOwned(parsed.realTreesOwned || []);
        setShowOnboarding(false);
      } catch (e) {
        console.error("Save file corrupted");
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        tokens,
        xp,
        level,
        plots,
        co2,
        realTreesOwned
      };
      localStorage.setItem('nuncycle_save_v1', JSON.stringify(dataToSave));
    }
  }, [tokens, xp, level, plots, co2, realTreesOwned, isLoaded]);

  // --- EFFECTS ---
  useEffect(() => {
    const randomPartner = PARTNERS[Math.floor(Math.random() * PARTNERS.length)];
    setDailySponsor(randomPartner);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, MAX_ENERGY));
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HELPERS ---
  const addXp = (amount: number) => {
    let newXp = xp + amount;
    let newLevel = level;
    if (newXp >= LEVEL_XP_THRESHOLD) {
      newLevel += 1;
      newXp -= LEVEL_XP_THRESHOLD;
      showToast(`Level Up! Вы достигли уровня ${newLevel}`, 'success');
      setTokens(prev => prev + 50); 
    }
    setXp(newXp);
    setLevel(newLevel);
  };

  // --- ACTIONS ---
  const unlockPlot = (plot: Plot) => {
    if (tokens >= plot.price) {
      setTokens(prev => prev - plot.price);
      setPlots(prev => prev.map(p => p.id === plot.id ? { ...p, status: 'empty' } : p));
      showToast('Сектор разблокирован', 'success');
    } else {
      showToast('Недостаточно токенов NUN', 'error');
    }
  };

  const plantTree = (type: TreeType) => {
    if (!selectedPlotId) return;
    const cost = TREE_STATS[type].cost;
    
    if (tokens >= cost) {
      setTokens(prev => prev - cost);
      setPlots(prev => prev.map(p => p.id === selectedPlotId ? {
        ...p,
        status: 'planted',
        tree: {
          type,
          level: 1,
          xp: 0,
          health: 100,
          lastWatered: Date.now(),
          isDiseased: false
        }
      } : p));
      setShowShop(false);
      setSelectedPlotId(null);
      showToast('Организм инициализирован', 'success');
      addXp(15);
    } else {
      showToast('Недостаточно токенов NUN', 'error');
    }
  };

  const performAction = (action: 'water' | 'fertilize' | 'prune' | 'protect', plotId: number) => {
    if (energy < 1) {
      showToast('Энергия истощена. Ждите.', 'error');
      return;
    }

    const isSponsored = Math.random() < 0.2; 
    let cost = 3;

    if (isSponsored) {
      showToast(`Спонсор ${dailySponsor.name} оплатил!`, 'success');
      cost = 0;
    } else {
      if (tokens < cost) {
         showToast('Недостаточно токенов', 'error');
         return;
      }
      setTokens(prev => prev - cost);
    }

    setEnergy(prev => prev - 1);

    setPlots(prev => prev.map(p => {
      if (p.id === plotId && p.tree) {
        let newTreeXp = p.tree.xp + 10;
        let newTreeLevel = p.tree.level;
        if (newTreeXp >= 100) {
           newTreeLevel++;
           newTreeXp -= 100;
           setTokens(t => t + 25); 
           showToast('Мутация успешна! +25 NUN', 'success');
        }
        
        return {
          ...p,
          tree: {
            ...p.tree,
            xp: newTreeXp,
            level: newTreeLevel,
            health: Math.min(100, p.tree.health + 10)
          }
        };
      }
      return p;
    }));

    addXp(10);
  };

  const buyRealTree = (treeId: number, cost: number, co2Val: number) => {
    if (tokens >= cost) {
      setTokens(prev => prev - cost);
      setRealTreesOwned(prev => [...prev, treeId]);
      setCo2(prev => prev + co2Val);
      showToast('RWA актив приобретен.', 'success');
    } else {
      showToast('Недостаточно токенов', 'error');
    }
  };

  // --- RENDERERS ---

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-tech animate-pulse">INIT SYSTEM...</div>;

  const renderOnboarding = () => {
    const steps = [
      {
        title: "Добро пожаловать в NUNCYCLE",
        desc: "Ваш шлюз в мир эко-майнинга. Получите первый бесплатный сектор и начните цифровую регенерацию.",
        icon: <Sparkles size={64} className="text-emerald-400 mb-4 animate-float-organic" />,
        action: "Начать синхронизацию"
      },
      {
        title: "Органический Майнинг",
        desc: "Ухаживайте за био-нодами. Полив и удобрение приносят XP и токены NUN.",
        icon: <Droplets size={64} className="text-cyan-400 mb-4" />,
        action: "Принять протокол"
      },
      {
        title: "RWA Влияние",
        desc: "Конвертируйте токены NUN в РЕАЛЬНЫЕ деревья. Ваш цифровой вклад становится кислородом.",
        icon: <Globe size={64} className="text-purple-400 mb-4" />,
        action: "Запустить систему"
      }
    ];

    const current = steps[onboardingStep];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-fade-in">
        <div className="liquid-card p-8 max-w-sm w-full text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-t-2xl"></div>
          
          <div className="flex justify-center mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{current.icon}</div>
          <h2 className="text-2xl font-bold font-tech text-white mb-4">{current.title}</h2>
          <p className="text-slate-300 mb-8 font-light leading-relaxed">{current.desc}</p>
          
          <div className="flex space-x-2 justify-center mb-8">
            {steps.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-8 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-2 bg-slate-600'}`}></div>
            ))}
          </div>

          <button 
            onClick={() => {
              if (onboardingStep < steps.length - 1) {
                setOnboardingStep(prev => prev + 1);
              } else {
                setShowOnboarding(false);
              }
            }}
            className="w-full liquid-button text-white py-4 rounded-2xl font-bold font-tech text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition border-emerald-500/30"
          >
            {current.action}
          </button>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <div className="px-4 pt-4 pb-2 sticky top-0 z-20">
      <div className="liquid-card px-4 py-3 mb-4 flex justify-between items-center shadow-lg">
         <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white mr-3 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-glow">
                <TreeDeciduous size={20} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200 font-tech tracking-wider drop-shadow-sm">NUNCYCLE</h1>
                <div className="text-[9px] text-emerald-400/80 uppercase tracking-[0.2em] font-bold">Liquid Node v1.4</div>
            </div>
         </div>
      </div>

      <div className="flex space-x-3 mb-4">
        <div className="flex-1 liquid-button rounded-2xl p-2 flex items-center justify-between px-4">
          <div className="flex items-center text-yellow-300 drop-shadow-sm">
             <Coins size={16} className="mr-2" />
          </div>
          <span className="font-bold font-tech text-white text-lg drop-shadow-[0_0_10px_rgba(253,224,71,0.3)]">{tokens}</span>
        </div>
        <div className="flex-1 liquid-button rounded-2xl p-2 flex items-center justify-between px-4">
          <div className="flex items-center text-cyan-300 drop-shadow-sm">
             <Zap size={16} className="mr-2" />
          </div>
          <span className="font-bold font-tech text-white text-lg drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{energy}<span className="text-xs text-slate-400">/12</span></span>
        </div>
      </div>
      
      {/* XP Bar Liquid */}
      <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm mx-1">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] rounded-full transition-all duration-1000"
          style={{ width: `${(xp / LEVEL_XP_THRESHOLD) * 100}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/80 tracking-widest uppercase">
          LVL {level}
        </div>
      </div>

      {/* Daily Sponsor Ticker */}
      <div className="mt-4 liquid-card p-2 flex items-center overflow-hidden">
        <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${dailySponsor.gradient.replace('bg-', 'from-').split(' ')[0]} mr-3`}></div>
        <div className="text-2xl mr-3 animate-float-organic">{dailySponsor.logo}</div>
        <div className="flex-1">
             <div className="flex justify-between items-center">
                 <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Green Event</span>
                 <span className="text-[9px] text-emerald-200 font-bold px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">ACTIVE</span>
             </div>
             <div className="text-xs text-white font-medium tracking-wide">{dailySponsor.name}</div>
        </div>
      </div>
    </div>
  );

  const renderForest = () => (
    <div className="p-4 pb-28">
      <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-xl font-bold font-tech text-white drop-shadow-lg">Bio-Grid</h2>
          <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">Sector A-1</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {plots.map((plot) => (
          <div 
            key={plot.id}
            onClick={() => setSelectedPlotId(plot.id)}
            className={`
              aspect-square rounded-[2rem] flex flex-col items-center justify-center relative cursor-pointer
              transition-all duration-300 transform active:scale-95 border backdrop-blur-sm
              ${plot.status === 'locked' ? 'bg-slate-900/30 border-slate-800 text-slate-600' : ''}
              ${plot.status === 'empty' ? 'bg-slate-800/20 border-slate-700/50 border-dashed hover:border-emerald-500/50 hover:bg-slate-700/30' : ''}
              ${plot.status === 'planted' ? 'liquid-card border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}
            `}
          >
            {plot.status === 'locked' && (
              <>
                <Lock size={16} className="mb-2 opacity-50" />
                <span className="text-[10px] font-bold font-tech opacity-50">{plot.price}</span>
              </>
            )}
            {plot.status === 'empty' && (
              <div className="flex flex-col items-center opacity-40">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center mb-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
              </div>
            )}
            {plot.status === 'planted' && plot.tree && (
              <>
                <div className="text-4xl animate-float-organic drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10">
                  {plot.tree.type.includes('brand') ? '💎' : '🌿'}
                </div>
                {plot.tree.type.includes('brand') && (
                    <div className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full p-1 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                        <Users size={8} className="text-yellow-300" />
                    </div>
                )}
                {plot.tree.isDiseased && (
                    <div className="absolute top-2 left-2 bg-red-500/20 border border-red-500/50 rounded-full p-1 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                        <Activity size={8} className="text-red-400" />
                    </div>
                )}
                <div className="absolute bottom-3 w-full px-4">
                  <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_5px_cyan]" 
                      style={{ width: `${(plot.tree.xp / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPartners = () => (
    <div className="p-4 pb-28">
      <h2 className="text-xl font-bold font-tech text-white mb-2 drop-shadow-lg">Alliance Hub</h2>
      <p className="text-xs text-slate-400 mb-6 font-light">Синхронизация с корпоративными экосистемами для получения органических наград.</p>

      <div className="space-y-4">
        {PARTNERS.map(partner => (
          <div key={partner.id} className={`liquid-card p-0 group transition-transform duration-300 hover:scale-[1.02]`}>
            {/* Banner */}
            <div className={`h-20 bg-gradient-to-r ${partner.gradient} flex items-center px-6 relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <span className="text-4xl mr-4 filter drop-shadow-xl animate-float-organic">{partner.logo}</span>
                <div>
                     <h3 className="font-bold font-tech text-white tracking-wide text-lg">{partner.name}</h3>
                     <div className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 inline-block mt-1">DAO Partner</div>
                </div>
            </div>
            
            <div className="p-5">
                <p className="text-sm text-slate-300 mb-4 font-light leading-relaxed">{partner.description}</p>
                
                <div className="space-y-2 mb-5">
                  {partner.quests.map(quest => (
                    <div key={quest.id} className="flex items-center justify-between text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                      <span className={quest.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{quest.text}</span>
                      <span className="text-[9px] font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                         +{quest.reward} NUN
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                    onClick={() => {
                       if(tokens >= partner.sponsoredTreeCost) {
                           setTokens(t => t - partner.sponsoredTreeCost);
                           showToast(`Брендовое дерево ${partner.name} получено!`, 'success');
                       } else {
                           showToast('Недостаточно токенов NUN', 'error');
                       }
                    }}
                    className="w-full liquid-button text-white py-3 rounded-xl font-bold font-tech text-xs uppercase tracking-wider flex items-center justify-center transition hover:bg-white/5"
                >
                  <Sparkles size={14} className="mr-2" /> Минт Дерева ({partner.sponsoredTreeCost} NUN)
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRealTrees = () => (
    <div className="p-4 pb-28">
       <div className="liquid-card p-6 text-white mb-6 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border-emerald-500/20">
          <div className="relative z-10">
              <h2 className="text-xl font-bold font-tech mb-2">RWA Marketplace</h2>
              <p className="text-emerald-100/70 text-xs leading-relaxed max-w-[85%]">Трансформируйте цифровой капитал в живую биомассу. Гео-теггинг и NFT сертификация каждого ствола.</p>
          </div>
       </div>

       <div className="space-y-4">
          {REAL_TREES.map(tree => {
              const isOwned = realTreesOwned.includes(tree.id);
              return (
                <div key={tree.id} className="liquid-card p-0 group">
                    <div className="h-36 bg-slate-800/30 flex items-center justify-center text-7xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>
                        <div className="relative z-10 animate-float-organic drop-shadow-2xl">{tree.image}</div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-400 flex items-center border border-emerald-500/30 shadow-lg">
                            <Leaf size={10} className="mr-1"/> -{tree.co2}кг CO₂
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-white font-tech">{tree.name}</h3>
                            {isOwned && <CheckCircle2 size={20} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                        </div>
                        <div className="flex items-center space-x-2 mb-5">
                             <div className="text-[9px] bg-slate-800/50 px-2 py-1 rounded-md text-slate-400 border border-slate-700/50">NFT Asset</div>
                             <div className="text-[9px] text-slate-500">Req: {tree.req}</div>
                        </div>
                        
                        {isOwned ? (
                             <button disabled className="w-full bg-slate-800/50 text-slate-500 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center border border-slate-700/50">
                                В кошельке
                             </button>
                        ) : (
                            <button 
                                onClick={() => buyRealTree(tree.id, tree.cost, tree.co2)}
                                className="w-full liquid-button text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center hover:bg-emerald-500/10 transition"
                            >
                                Купить за {tree.cost} NUN
                            </button>
                        )}
                    </div>
                </div>
              );
          })}
       </div>
    </div>
  );

  const renderImpact = () => (
      <div className="p-4 pb-28 text-center">
          <h2 className="text-xl font-bold font-tech text-white mb-8 drop-shadow-md">Biosphere Data</h2>
          
          <div className="relative mx-auto w-64 h-64 mb-10">
              {/* Liquid Sphere */}
              <div className="absolute inset-0 rounded-full border border-slate-700/50 animate-pulse-glow"></div>
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/30 animate-spin-slow"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/20 to-emerald-900/10 backdrop-blur-md rounded-full border border-white/5 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-float-organic"></div>
                  <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Carbon Offset</span>
                  <span className="text-6xl font-black font-tech text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-2xl z-10">{co2}</span>
                  <span className="text-slate-400 text-xs font-bold mt-1 z-10">KG CO₂</span>
              </div>
          </div>

          <div className="liquid-card p-6 text-left relative overflow-hidden border-emerald-500/20">
              <div className="flex justify-between mb-4 relative z-10">
                  <span className="font-bold text-slate-300 text-sm">Next Milestone</span>
                  <span className="text-emerald-400 font-bold font-tech text-sm">1.0 TON</span>
              </div>
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden mb-2 border border-slate-700/50 relative z-10">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-[5%] shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
              </div>
              <p className="mt-6 text-xs text-slate-400 leading-relaxed relative z-10 border-t border-slate-700/50 pt-4 font-light">
                  <ScanLine size={14} className="inline mr-2 text-cyan-500" />
                  Все данные записываются в Green Ledger. Каждая тонна CO₂ генерирует Soulbound Token (SBT) "Планетарный Страж".
              </p>
          </div>
      </div>
  );

  // --- SUB-COMPONENTS ---

  const renderPlotModal = () => {
    if (!selectedPlotId) return null;
    const plot = plots.find(p => p.id === selectedPlotId);
    if (!plot) return null;

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-end sm:items-center justify-center animate-fade-in"
        onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPlotId(null);
        }}
      >
        <div className="liquid-card w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-slide-up bg-[#0f172a]/80">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50"></div>
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold font-tech text-white">Node #{plot.id}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Управление клеткой</p>
                </div>
                <button onClick={() => setSelectedPlotId(null)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition">✕</button>
            </div>

            {plot.status === 'locked' && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50 shadow-inner">
                        <Lock size={32} className="text-slate-500" />
                    </div>
                    <p className="mb-8 text-slate-400 text-sm font-light">Доступ к этому участку био-сети ограничен.</p>
                    <button 
                        onClick={() => unlockPlot(plot)}
                        className="w-full liquid-button text-white py-4 rounded-xl font-bold font-tech hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition border-emerald-500/30"
                    >
                        Разблокировать ({plot.price} NUN)
                    </button>
                </div>
            )}

            {plot.status === 'empty' && (
                 <div className="text-center py-6">
                    <p className="mb-8 text-slate-400 font-light">Почва готова к внедрению семени.</p>
                    <button 
                        onClick={() => setShowShop(true)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-4 rounded-xl font-bold font-tech flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition"
                    >
                        <Sprout size={20} className="mr-2" /> Открыть Банк Семян
                    </button>
                </div>
            )}

            {plot.status === 'planted' && plot.tree && (
                <div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex items-center mb-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
                        <div className="text-5xl mr-4 filter drop-shadow-lg animate-float-organic">{plot.tree.type.includes('brand') ? '💎' : '🌿'}</div>
                        <div className="flex-1">
                            <div className="font-bold text-white font-tech tracking-wide">{TREE_STATS[plot.tree.type].name}</div>
                            <div className="text-xs text-emerald-400 font-mono mt-1">Yield: +{TREE_STATS[plot.tree.type].income} NUN/day</div>
                            <div className="mt-2 w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(plot.tree.xp / 100) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="text-right pl-2">
                             <div className="text-[9px] text-slate-500 uppercase font-bold">Level</div>
                             <div className="font-bold text-3xl text-white font-tech">{plot.tree.level}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                            onClick={() => performAction('water', plot.id)}
                            className="liquid-button bg-blue-500/5 border-blue-500/20 text-blue-300 p-4 rounded-xl flex flex-col items-center justify-center transition group hover:bg-blue-500/10"
                        >
                            <Droplets size={24} className="mb-2 group-hover:scale-110 transition drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                            <span className="font-bold text-sm">Гидратация</span>
                            <span className="text-[10px] opacity-75 mt-1 font-mono">-3 NUN</span>
                        </button>
                        <button 
                             onClick={() => performAction('fertilize', plot.id)}
                             className="liquid-button bg-emerald-500/5 border-emerald-500/20 text-emerald-300 p-4 rounded-xl flex flex-col items-center justify-center transition group hover:bg-emerald-500/10"
                        >
                            <Leaf size={24} className="mb-2 group-hover:scale-110 transition drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            <span className="font-bold text-sm">Питание</span>
                            <span className="text-[10px] opacity-75 mt-1 font-mono">-3 NUN</span>
                        </button>
                        <button 
                             onClick={() => performAction('prune', plot.id)}
                             className="liquid-button bg-purple-500/5 border-purple-500/20 text-purple-300 p-4 rounded-xl flex flex-col items-center justify-center transition group hover:bg-purple-500/10"
                        >
                            <Zap size={24} className="mb-2 group-hover:scale-110 transition drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                            <span className="font-bold text-sm">Оптимизация</span>
                            <span className="text-[10px] opacity-75 mt-1 font-mono">-3 NUN</span>
                        </button>
                         <button 
                             onClick={() => performAction('protect', plot.id)}
                             className="liquid-button bg-amber-500/5 border-amber-500/20 text-amber-300 p-4 rounded-xl flex flex-col items-center justify-center transition group hover:bg-amber-500/10"
                        >
                            <Shield size={24} className="mb-2 group-hover:scale-110 transition drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                            <span className="font-bold text-sm">Защита</span>
                            <span className="text-[10px] opacity-75 mt-1 font-mono">-3 NUN</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderTreeShop = () => {
      if (!showShop) return null;
      return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex flex-col animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-xl font-bold font-tech text-white">Seed Bank</h2>
                <button onClick={() => setShowShop(false)} className="text-slate-400 hover:text-white">Закрыть</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
                {(Object.keys(TREE_STATS) as TreeType[]).filter(t => !t.startsWith('brand')).map(type => (
                    <div key={type} className="liquid-card p-4 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4 border border-emerald-500/30 text-2xl">
                                {type === 'basic' ? '🌱' : type === 'protective' ? '🛡️' : '🔮'}
                            </div>
                            <div>
                                <div className="font-bold text-lg text-white font-tech">{TREE_STATS[type].name}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-[9px] px-2 py-0.5 rounded border ${
                                        TREE_STATS[type].rarity === 'Common' ? 'border-slate-500 text-slate-400' : 
                                        TREE_STATS[type].rarity === 'Rare' ? 'border-cyan-500 text-cyan-400' : 
                                        'border-purple-500 text-purple-400'
                                    }`}>
                                        {TREE_STATS[type].rarity}
                                    </span>
                                    <span className="text-xs text-emerald-400">+{TREE_STATS[type].income} NUN</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => plantTree(type)}
                            className="liquid-button px-5 py-2 rounded-xl font-bold font-tech text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 transition"
                        >
                            {TREE_STATS[type].cost}
                        </button>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col font-sans text-slate-200">
      <LiquidBackground />
      
      {/* Content Container */}
      <div className="max-w-md mx-auto w-full h-full flex flex-col relative z-10 bg-slate-900/40 backdrop-blur-sm border-x border-white/5 shadow-2xl min-h-screen">
          
          {showOnboarding && renderOnboarding()}
          
          {toast && (
            <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[70] px-6 py-3 rounded-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center animate-bounce-in border font-bold backdrop-blur-xl w-[90%] max-w-sm ${
                toast.type === 'success' ? 'bg-emerald-600/80 border-emerald-400/50' : 
                toast.type === 'error' ? 'bg-red-600/80 border-red-400/50' : 'bg-slate-700/80 border-slate-500/50'
            }`}>
                {toast.msg}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar z-10">
            {renderHeader()}
            
            {activeTab === 'forest' && renderForest()}
            {activeTab === 'partners' && renderPartners()}
            {activeTab === 'real' && renderRealTrees()}
            {activeTab === 'impact' && renderImpact()}
            {activeTab === 'top' && (
                <div className="p-4 flex flex-col items-center justify-center h-[50vh] text-slate-500">
                    <Trophy size={64} className="mb-6 opacity-30 animate-pulse"/>
                    <p className="font-tech text-lg">LEADERBOARD_OFFLINE</p>
                    <p className="text-xs mt-2">Connecting to bio-mesh network...</p>
                </div>
            )}
          </div>

          {/* Liquid Bottom Navigation */}
          <div className="px-4 pb-6 pt-2 sticky bottom-0 z-30">
            <div className="liquid-card rounded-2xl flex justify-around items-center p-2 bg-slate-900/60 backdrop-blur-2xl border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={() => setActiveTab('forest')}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'forest' ? 'text-emerald-400 bg-white/5 scale-105 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Hexagon size={22} className={activeTab === 'forest' ? 'fill-emerald-500/20' : ''} />
                </button>
                <button 
                    onClick={() => setActiveTab('partners')}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'partners' ? 'text-cyan-400 bg-white/5 scale-105 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Users size={22} />
                </button>
                <button 
                    onClick={() => setActiveTab('real')}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'real' ? 'text-purple-400 bg-white/5 scale-105 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Map size={22} />
                </button>
                <button 
                    onClick={() => setActiveTab('impact')}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'impact' ? 'text-green-400 bg-white/5 scale-105 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Globe size={22} />
                </button>
            </div>
          </div>

          {/* Overlay Modals */}
          {selectedPlotId && renderPlotModal()}
          {showShop && renderTreeShop()}
      </div>

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
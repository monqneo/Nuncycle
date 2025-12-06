import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  TreeDeciduous, 
  TreePine,
  TreePalm,
  Sprout, 
  Flower2,
  Droplets, 
  Shield, 
  Zap, 
  Coins, 
  Map, 
  Globe, 
  Trophy, 
  Users, 
  CheckCircle2,
  Lock,
  Leaf,
  ScanLine,
  Activity,
  Sparkles,
  Wind,
  Sun,
  CloudRain,
  User,
  MessageCircle,
  Settings,
  Share2,
  LogOut,
  Award,
  Camera,
  Send,
  Edit2,
  Gamepad2,
  Wallet,
  ArrowRightLeft,
  ArrowUpRight,
  Copy
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
  logo: React.ReactNode; 
  color: string;
  gradient: string;
  description: string;
  quests: { id: number; text: string; reward: number; completed: boolean }[];
  sponsoredTreeCost: number; 
}

interface UserProfile {
  id: string;
  handle: string;
  name: string;
  avatar: string; // Emoji or URL
  joinDate: string;
  bio: string;
  isLoggedIn: boolean;
  walletAddress: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'planting';
  level: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  max: number;
}

const LEVEL_XP_THRESHOLD = 200;
const MAX_ENERGY = 12;

const AVATARS = ['🧑‍🌾', '🧝', '🦊', '🐻', '🐸', '🍄', '🤖', '👽'];

const TREE_STATS: Record<TreeType, { name: string; income: number; cost: number; rarity: string; color: string; icon: any }> = {
  basic: { name: 'Эко-Дуб', income: 8, cost: 50, rarity: 'Обычное', color: 'text-green-400', icon: TreeDeciduous },
  protective: { name: 'Щит-Ива', income: 6, cost: 80, rarity: 'Необычное', color: 'text-cyan-400', icon: TreePine },
  synergetic: { name: 'Нейро-Цвет', income: 12, cost: 120, rarity: 'Редкое', color: 'text-purple-400', icon: Flower2 },
  brand_adidas: { name: 'Adidas Bio-Mesh', income: 15, cost: 200, rarity: 'Эпик', color: 'text-blue-300', icon: TreePalm },
  brand_google: { name: 'Google Quantum Root', income: 18, cost: 250, rarity: 'Легендарное', color: 'text-orange-300', icon: TreeDeciduous },
  brand_patagonia: { name: 'Patagonia Wild', income: 14, cost: 180, rarity: 'Эпик', color: 'text-teal-300', icon: TreePine },
};

const PARTNERS: Partner[] = [
  {
    id: 'adidas',
    name: 'Adidas Earth Fund',
    logo: <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" className="w-8 h-8 invert opacity-80" alt="Adidas"/>,
    color: 'text-blue-400',
    gradient: 'from-blue-900/80 to-slate-900/50',
    description: 'Одежда из переработанных мета-материалов.',
    quests: [
      { id: 1, text: 'Подключить эко-кошелек', reward: 50, completed: false },
      { id: 2, text: 'Сминтить 5 поливов', reward: 30, completed: false }
    ],
    sponsoredTreeCost: 200
  },
  {
    id: 'google',
    name: 'Google Green DAO',
    logo: <span className="text-2xl font-bold font-sans tracking-tighter"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></span>,
    color: 'text-green-400',
    gradient: 'from-green-900/80 to-slate-900/50',
    description: 'Децентрализованные органические продукты.',
    quests: [
      { id: 1, text: 'Посетить Google Green Hub', reward: 40, completed: false }
    ],
    sponsoredTreeCost: 250
  },
  {
    id: 'patagonia',
    name: 'Patagonia Wild',
    logo: <span className="text-2xl">🏔️</span>,
    color: 'text-purple-400',
    gradient: 'from-purple-900/80 to-slate-900/50',
    description: 'Сохранение природы через блокчейн.',
    quests: [
      { id: 1, text: 'Просмотреть манифест', reward: 60, completed: false }
    ],
    sponsoredTreeCost: 180
  }
];

const REAL_TREES = [
  { id: 1, name: 'Кедр Сибирский', cost: 800, co2: 250, image: '🌲', req: 'Нет требований', bg: 'bg-emerald-900/50' },
  { id: 2, name: 'Дуб Черешчатый', cost: 1400, co2: 500, image: '🌳', req: 'Ур. 5, 3 Узла', bg: 'bg-amber-900/50' }
];

const INITIAL_PLOTS: Plot[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    status: i === 0 ? 'empty' : 'locked',
    price: i === 0 ? 0 : [150, 250, 400, 600, 850, 1150, 1500, 2000, 2500, 3000, 4000][i-1],
    tree: null
}));

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_tree', title: 'Первый Росток', desc: 'Посадите свое первое дерево', icon: Sprout, unlocked: false, progress: 0, max: 1 },
  { id: 'water_master', title: 'Хранитель Воды', desc: 'Полейте деревья 50 раз', icon: CloudRain, unlocked: false, progress: 0, max: 50 },
  { id: 'forest_king', title: 'Король Леса', desc: 'Достигните 10 уровня', icon: Trophy, unlocked: false, progress: 0, max: 10 },
  { id: 'real_hero', title: 'Герой Реальности', desc: 'Купите реальное дерево', icon: Globe, unlocked: false, progress: 0, max: 1 },
];

const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', name: 'EcoWarrior99', avatar: '🦸', status: 'online', level: 12 },
  { id: 'f2', name: 'GreenThumb', avatar: '🧚', status: 'planting', level: 8 },
  { id: 'f3', name: 'ForestSpirit', avatar: '👻', status: 'offline', level: 20 },
];

// --- VISUAL COMPONENTS ---

const BackgroundBubbles = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
    {/* Deep Forest Gradient Base */}
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-[#022c22] to-black opacity-80"></div>
    
    {/* Floating Orbs */}
    <div className="blob w-[600px] h-[600px] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-morph animate-float-organic top-[-200px] left-[-100px]"></div>
    <div className="blob w-[500px] h-[500px] bg-lime-600/10 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-morph animate-float-organic top-[30%] right-[-150px] animation-delay-2000"></div>
    <div className="blob w-[400px] h-[400px] bg-cyan-900/30 rounded-full mix-blend-screen filter blur-[60px] opacity-40 animate-morph animate-float-organic bottom-[-50px] left-[10%] animation-delay-4000"></div>
    
    {/* Floating Particles/Leaves */}
    <div className="absolute inset-0 opacity-20">
        {[...Array(6)].map((_, i) => (
            <Leaf key={i} size={Math.random() * 20 + 10} className="absolute text-emerald-400 animate-leaf" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100 + 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
            }}/>
        ))}
    </div>

    {/* Noise overlay for texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
  </div>
);

const TreeVisual = ({ type, level, isDiseased, animationType }: { type: TreeType, level: number, isDiseased: boolean, animationType?: 'grow' | 'fruit' | null }) => {
    const stats = TREE_STATS[type];
    
    // Growth Stages
    let VisualIcon = Sprout;
    let scale = "scale-75";
    let glow = "";
    
    if (level >= 2 && level < 5) {
        VisualIcon = type === 'synergetic' ? Flower2 : Sprout; // Sapling
        scale = "scale-90";
    } else if (level >= 5) {
        VisualIcon = stats.icon; // Mature
        scale = "scale-100";
        glow = `drop-shadow-[0_0_15px_rgba(${type === 'basic' ? '74,222,128' : type === 'protective' ? '34,211,238' : '192,132,252'},0.5)]`;
    }

    // Apply interactive animation override
    if (animationType === 'grow') {
        scale = "scale-110";
        glow = `drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]`;
    }

    // Colors
    const colorClass = stats.color;
    const animationClass = animationType === 'grow' ? 'animate-tree-pop' : 'transition-all duration-1000';

    return (
        <div className={`relative flex items-center justify-center ${animationClass} ${scale}`}>
            {/* Aura for high level */}
            {level >= 5 && <div className={`absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse`}></div>}
            
            {/* The Tree Icon */}
            <VisualIcon 
                size={level < 2 ? 32 : level < 5 ? 48 : 64} 
                className={`${colorClass} ${glow} filter transition-all duration-500`} 
                strokeWidth={level < 5 ? 2 : 1.5}
            />

            {/* Disease Overlay */}
            {isDiseased && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="text-red-500 animate-pulse drop-shadow-md" size={24} />
                </div>
            )}

            {/* Level Badge (Visual leaves) */}
            {level >= 2 && (
                <div className="absolute -bottom-2 w-full flex justify-center space-x-1">
                    {[...Array(Math.min(3, Math.floor(level/2)))].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`}></div>
                    ))}
                </div>
            )}

            {/* Fruits Animation */}
            {animationType === 'fruit' && (
                <>
                    <div className="absolute -top-4 -left-4 animate-fruit-drop text-yellow-300">
                        <Coins size={16} fill="currentColor" />
                    </div>
                    <div className="absolute -top-6 right-0 animate-fruit-drop text-emerald-300" style={{ animationDelay: '0.2s' }}>
                        <Sparkles size={16} fill="currentColor" />
                    </div>
                    <div className="absolute -top-2 -right-4 animate-fruit-drop text-lime-300" style={{ animationDelay: '0.4s' }}>
                        <Leaf size={14} fill="currentColor" />
                    </div>
                </>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // --- STATE ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'forest' | 'partners' | 'real' | 'impact' | 'profile'>('forest');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // User Stats & Profile
  const [user, setUser] = useState<UserProfile>({ 
    id: 'guest', 
    handle: '@guest', 
    name: 'Guest', 
    avatar: '🧑‍🌾', 
    joinDate: new Date().toLocaleDateString(), 
    bio: 'Начинающий хранитель леса', 
    isLoggedIn: false,
    walletAddress: '0x71C...9A23'
  });
  const [tokens, setTokens] = useState(100); 
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(12);
  const [co2, setCo2] = useState(0);
  const [realTreesOwned, setRealTreesOwned] = useState<number[]>([]);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  
  // Social & Achievements
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({}); // userId -> messages
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Modals & UI
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [showShop, setShowShop] = useState(false); 
  const [dailySponsor, setDailySponsor] = useState<Partner>(PARTNERS[0]);
  const [animationEffect, setAnimationEffect] = useState<{ id: number, type: 'grow' | 'fruit' } | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  
  // Toasts
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info' | 'error'} | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedData = localStorage.getItem('nuncycle_save_v3');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTokens(parsed.tokens || 100);
        setXp(parsed.xp || 0);
        setLevel(parsed.level || 1);
        setPlots(parsed.plots || INITIAL_PLOTS);
        setCo2(parsed.co2 || 0);
        setRealTreesOwned(parsed.realTreesOwned || []);
        if (parsed.user) setUser(prev => ({...prev, ...parsed.user}));
        if (parsed.achievements) setAchievements(parsed.achievements);
      } catch (e) {
        console.error("Save file corrupted");
      }
    } 
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nuncycle_save_v3', JSON.stringify({
        tokens, xp, level, plots, co2, realTreesOwned, user, achievements
      }));
    }
  }, [tokens, xp, level, plots, co2, realTreesOwned, user, achievements, isLoaded]);

  // --- GAME LOOPS ---
  useEffect(() => {
    setDailySponsor(PARTNERS[Math.floor(Math.random() * PARTNERS.length)]);
    
    // Energy Regen
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, MAX_ENERGY));
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  // Update Achievement Progress
  useEffect(() => {
    if (!isLoaded) return;
    const planted = plots.filter(p => p.status === 'planted').length;
    
    setAchievements(prev => prev.map(a => {
        let newProgress = a.progress;
        if (a.id === 'first_tree') newProgress = planted;
        if (a.id === 'forest_king') newProgress = level;
        if (a.id === 'real_hero') newProgress = realTreesOwned.length;
        
        const unlocked = newProgress >= a.max;
        if (unlocked && !a.unlocked) {
             showToast(`Достижение разблокировано: ${a.title}`, 'success');
        }
        return { ...a, progress: newProgress, unlocked: unlocked || a.unlocked };
    }));

  }, [plots, level, realTreesOwned]);

  // --- HELPERS ---

  const triggerAnimation = (id: number, type: 'grow' | 'fruit') => {
    setAnimationEffect({ id, type });
    setTimeout(() => {
        setAnimationEffect(null);
    }, type === 'fruit' ? 1500 : 500);
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast('Адрес скопирован', 'info');
  };

  // --- ACTIONS ---

  const handleLogin = (provider: 'google' | 'apple') => {
    // Simulated Login
    setUser({
        id: 'user_123',
        handle: '@eco_hero_' + Math.floor(Math.random() * 1000),
        name: provider === 'google' ? 'Google User' : 'Apple User',
        avatar: '🦊',
        joinDate: new Date().toLocaleDateString(),
        bio: 'Люблю природу и технологии!',
        isLoggedIn: true,
        walletAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase().slice(0, 8) + '...' + Math.floor(Math.random()*1000)
    });
    setShowOnboarding(true);
  };

  const sendMessage = (friendId: string, text: string) => {
    const msg: Message = { id: Date.now().toString(), senderId: user.id, text, timestamp: Date.now() };
    setMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), msg]
    }));

    // Simulate Reply
    setTimeout(() => {
        const reply: Message = { 
            id: (Date.now() + 1).toString(), 
            senderId: friendId, 
            text: ['Круто! 🌲', 'Спасибо за помощь!', 'Как твой лес?', 'Полей мое дерево плз!'][Math.floor(Math.random() * 4)], 
            timestamp: Date.now() 
        };
        setMessages(prev => ({
            ...prev,
            [friendId]: [...(prev[friendId] || []), reply]
        }));
        showToast('Новое сообщение!', 'info');
    }, 3000);
  };

  const addXp = (amount: number) => {
    let newXp = xp + amount;
    let newLevel = level;
    if (newXp >= LEVEL_XP_THRESHOLD) {
      newLevel += 1;
      newXp -= LEVEL_XP_THRESHOLD;
      showToast(`Уровень леса повышен: ${newLevel}!`, 'success');
      setTokens(prev => prev + 50); 
    }
    setXp(newXp);
    setLevel(newLevel);
  };

  const unlockPlot = (plot: Plot) => {
    if (tokens >= plot.price) {
      setTokens(prev => prev - plot.price);
      setPlots(prev => prev.map(p => p.id === plot.id ? { ...p, status: 'empty' } : p));
      showToast('Участок очищен и готов', 'success');
    } else {
      showToast(`Нужно ${plot.price} NUN`, 'error');
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
      
      triggerAnimation(selectedPlotId, 'grow');
      setShowShop(false);
      showToast('Росток посажен!', 'success');
      addXp(15);
    } else {
      showToast('Недостаточно токенов', 'error');
    }
  };

  const performAction = (action: string, plotId: number) => {
    if (energy < 1) {
      showToast('Нет энергии. Отдохните.', 'error');
      return;
    }
    const isSponsored = Math.random() < 0.2; 
    let cost = 3;

    if (isSponsored) {
      showToast(`Оплачено ${dailySponsor.name}!`, 'success');
      cost = 0;
    } else {
      if (tokens < cost) {
         showToast('Нужно 3 NUN', 'error');
         return;
      }
      setTokens(prev => prev - cost);
    }

    triggerAnimation(plotId, 'fruit');

    setEnergy(prev => prev - 1);
    
    // Achievement check
    setAchievements(prev => prev.map(a => a.id === 'water_master' ? { ...a, progress: a.progress + 1 } : a));

    setPlots(prev => prev.map(p => {
      if (p.id === plotId && p.tree) {
        let newTreeXp = p.tree.xp + 25; 
        let newTreeLevel = p.tree.level;
        if (newTreeXp >= 100) {
           newTreeLevel++;
           newTreeXp -= 100;
           setTokens(t => t + 25); 
           showToast(`Дерево выросло до ур. ${newTreeLevel}!`, 'success');
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

  // --- RENDERERS ---

  if (!isLoaded) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-tech animate-pulse">БИО-СИНХРОНИЗАЦИЯ...</div>;

  const renderAuth = () => (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
          <BackgroundBubbles />
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-float-organic">
                  <Leaf size={48} className="text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold font-tech text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 mb-2">NUNCYCLE</h1>
              <p className="text-slate-400 mb-12 text-center text-sm">Ваш карманный метаверс для реальной планеты.</p>

              <div className="w-full space-y-4">
                  <button 
                      onClick={() => handleLogin('apple')}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] transition shadow-lg"
                  >
                      <span className="mr-3 text-xl"></span> Войти через Apple
                  </button>
                  <button 
                      onClick={() => handleLogin('google')}
                      className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center border border-slate-700 hover:bg-slate-700 transition hover:scale-[1.02] shadow-lg"
                  >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                      Войти через Google
                  </button>
              </div>
              <p className="mt-8 text-xs text-slate-500">Продолжая, вы соглашаетесь с условиями Эко-Конституции.</p>
          </div>
      </div>
  );

  if (!user.isLoggedIn) return renderAuth();

  const renderHeader = () => (
    <div className="px-4 pt-4 pb-2 sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-emerald-900/50">
      <div className="flex justify-between items-center mb-3">
         <div className="flex items-center">
             {/* Profile Avatar Trigger */}
            <div onClick={() => setActiveTab('profile')} className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl mr-3 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-105 transition">
                {user.avatar}
            </div>
            <div>
                <h1 className="text-xl font-bold text-white font-tech tracking-wide drop-shadow-md">NUNCYCLE</h1>
                <div className="text-[10px] text-emerald-400/80 font-bold tracking-widest uppercase">{user.name}</div>
            </div>
         </div>
         {/* User Level */}
         <div className="bg-slate-800/50 rounded-full px-3 py-1 flex items-center border border-slate-700/50">
            <Trophy size={14} className="text-yellow-400 mr-2" />
            <span className="text-xs font-bold text-slate-200">Lvl {level}</span>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="liquid-button rounded-2xl p-2 flex items-center justify-between px-3">
          <div className="flex items-center text-yellow-300">
             <div className="p-1.5 bg-yellow-500/20 rounded-lg mr-2"><Coins size={14} /></div>
             <span className="text-[10px] text-yellow-200/70 uppercase font-bold tracking-wider">Токены</span>
          </div>
          <span className="font-bold font-tech text-white text-lg">{tokens}</span>
        </div>
        <div className="liquid-button rounded-2xl p-2 flex items-center justify-between px-3">
          <div className="flex items-center text-cyan-300">
             <div className="p-1.5 bg-cyan-500/20 rounded-lg mr-2"><Zap size={14} /></div>
             <span className="text-[10px] text-cyan-200/70 uppercase font-bold tracking-wider">Энергия</span>
          </div>
          <span className="font-bold font-tech text-white text-lg">{energy}<span className="text-xs text-slate-400 opacity-60">/12</span></span>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
      <div className="p-4 pb-32">
          {/* Profile Card */}
          <div className="liquid-card p-6 mb-6 relative overflow-visible">
              <div className="absolute top-4 right-4 text-slate-400 cursor-pointer hover:text-white" onClick={() => setShowAvatarEdit(true)}>
                  <Edit2 size={16} />
              </div>
              <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px] shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-3 relative group">
                      <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center text-5xl relative z-10">
                         {user.avatar}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-[#020617] z-20 cursor-pointer" onClick={() => setShowAvatarEdit(true)}>
                          <Camera size={12} className="text-white"/>
                      </div>
                  </div>
                  <h2 className="text-2xl font-bold font-tech text-white">{user.name}</h2>
                  <p className="text-emerald-400 font-mono text-xs mb-2 bg-emerald-900/30 px-2 py-1 rounded">{user.handle}</p>
                  <p className="text-slate-400 text-sm text-center max-w-[80%] mb-4 italic">"{user.bio}"</p>
                  
                  <div className="grid grid-cols-3 gap-4 w-full mt-2 border-t border-white/10 pt-4">
                      <div className="text-center">
                          <div className="text-lg font-bold text-white font-tech">{plots.filter(p => p.status === 'planted').length}</div>
                          <div className="text-[9px] uppercase text-slate-500 font-bold">Деревьев</div>
                      </div>
                      <div className="text-center border-x border-white/10">
                          <div className="text-lg font-bold text-white font-tech">{realTreesOwned.length}</div>
                          <div className="text-[9px] uppercase text-slate-500 font-bold">Реальных</div>
                      </div>
                      <div className="text-center">
                          <div className="text-lg font-bold text-white font-tech">{level}</div>
                          <div className="text-[9px] uppercase text-slate-500 font-bold">Уровень</div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Wallet Section */}
          <div className="liquid-card p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold font-tech text-white flex items-center">
                      <Wallet size={18} className="mr-2 text-emerald-400" />
                      Кошелек
                  </h3>
                  <div className="text-xs bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50 flex items-center text-slate-400">
                      {user.walletAddress.slice(0,6)}...{user.walletAddress.slice(-4)}
                      <Copy size={12} className="ml-2 cursor-pointer hover:text-white" onClick={() => copyToClipboard(user.walletAddress)} />
                  </div>
              </div>
              
              <div className="text-center mb-6">
                   <div className="text-3xl font-bold font-tech text-white">{tokens} NUN</div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Текущий Баланс</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                      <button disabled className="w-full bg-slate-800/50 text-slate-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center border border-slate-700/50 cursor-not-allowed">
                          <ArrowRightLeft size={16} className="mr-2" /> Обмен
                      </button>
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg">СКОРО</div>
                  </div>
                   <div className="relative group">
                      <button disabled className="w-full bg-slate-800/50 text-slate-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center border border-slate-700/50 cursor-not-allowed">
                          <ArrowUpRight size={16} className="mr-2" /> Вывод
                      </button>
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg">СКОРО</div>
                  </div>
              </div>
              <div className="text-[10px] text-center text-slate-500 mt-3 opacity-60">Функции доступны после листинга на бирже</div>
          </div>

          {/* Tabs inside Profile */}
          <div className="space-y-6">
              
              {/* Friends Section */}
              <div>
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold font-tech text-white">Друзья <span className="text-slate-500 text-xs ml-1">{friends.length}</span></h3>
                      <button className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition">+ Добавить</button>
                  </div>
                  <div className="space-y-2">
                      {friends.map(friend => (
                          <div key={friend.id} onClick={() => setActiveChatId(friend.id)} className="liquid-card p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition">
                              <div className="flex items-center">
                                  <div className="relative mr-3">
                                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl">{friend.avatar}</div>
                                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#020617] ${friend.status === 'online' ? 'bg-emerald-500' : friend.status === 'planting' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                  </div>
                                  <div>
                                      <div className="font-bold text-sm text-white">{friend.name}</div>
                                      <div className="text-[10px] text-slate-400">{friend.status === 'online' ? 'В сети' : friend.status === 'planting' ? 'Сажает дерево...' : 'Был недавно'}</div>
                                  </div>
                              </div>
                              <MessageCircle size={18} className="text-emerald-500/50" />
                          </div>
                      ))}
                  </div>
              </div>

              {/* Achievements Section */}
              <div>
                  <h3 className="font-bold font-tech text-white mb-3">Достижения</h3>
                  <div className="grid grid-cols-2 gap-3">
                      {achievements.map(ach => {
                          const Icon = ach.icon;
                          return (
                          <div key={ach.id} className={`liquid-card p-3 flex flex-col items-center text-center ${ach.unlocked ? 'border-emerald-500/30 bg-emerald-900/10' : 'opacity-60 grayscale'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${ach.unlocked ? 'bg-gradient-to-tr from-emerald-500 to-lime-500 shadow-lg text-white' : 'bg-slate-800 text-slate-500'}`}>
                                  <Icon size={18} />
                              </div>
                              <div className="font-bold text-xs text-white mb-1">{ach.title}</div>
                              <div className="text-[9px] text-slate-400 mb-2 leading-tight">{ach.desc}</div>
                              
                              <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden mt-auto">
                                  <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, (ach.progress / ach.max) * 100)}%` }}></div>
                              </div>
                              <div className="text-[8px] text-right w-full mt-1 text-slate-500">{ach.progress}/{ach.max}</div>
                          </div>
                      )})}
                  </div>
              </div>

              {/* Settings */}
               <div className="liquid-button p-4 flex items-center justify-between text-slate-300">
                  <div className="flex items-center"><Settings size={18} className="mr-3"/> Настройки</div>
               </div>
               <div className="liquid-button p-4 flex items-center justify-between text-red-300 border-red-500/20 bg-red-900/10" onClick={() => setUser(prev => ({...prev, isLoggedIn: false}))}>
                  <div className="flex items-center"><LogOut size={18} className="mr-3"/> Выйти</div>
               </div>
          </div>
      </div>
  );

  const renderChat = () => {
      if (!activeChatId) return null;
      const friend = friends.find(f => f.id === activeChatId);
      if (!friend) return null;
      const chatMsgs = messages[activeChatId] || [];

      return (
          <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col animate-slide-up">
              <div className="p-4 bg-slate-900/50 backdrop-blur-md border-b border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center">
                      <button onClick={() => setActiveChatId(null)} className="mr-3 p-2 hover:bg-white/5 rounded-full"><span className="text-xl">←</span></button>
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-2">{friend.avatar}</div>
                      <div>
                          <div className="font-bold text-white">{friend.name}</div>
                          <div className="text-[10px] text-emerald-400">{friend.status}</div>
                      </div>
                  </div>
                  <Settings size={18} className="text-slate-500" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#020617]">
                  {chatMsgs.length === 0 && (
                      <div className="text-center text-slate-500 text-xs mt-10">Начните общение с {friend.name}</div>
                  )}
                  {chatMsgs.map(msg => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
              </div>

              <div className="p-4 bg-slate-900/80 border-t border-white/5">
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const input = (e.currentTarget.elements[0] as HTMLInputElement);
                      if(input.value.trim()) {
                          sendMessage(activeChatId, input.value);
                          input.value = '';
                      }
                  }} className="flex items-center gap-2">
                      <input type="text" placeholder="Сообщение..." className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm" />
                      <button type="submit" className="p-3 bg-emerald-500 rounded-xl text-white hover:scale-105 transition shadow-lg shadow-emerald-900/50"><Send size={18} /></button>
                  </form>
              </div>
          </div>
      );
  };

  const renderAvatarSelection = () => {
    if(!showAvatarEdit) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setShowAvatarEdit(false)}}>
            <div className="liquid-card w-full max-w-sm p-6 bg-[#020617] animate-scale-in">
                <h3 className="text-xl font-bold font-tech text-white mb-4">Изменить Профиль</h3>
                
                <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-1 block">Уникальный ID</label>
                    <div className="flex bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <input 
                            type="text" 
                            defaultValue={user.handle} 
                            className="flex-1 bg-transparent px-3 py-2 text-emerald-400 font-mono text-sm focus:outline-none"
                            onChange={(e) => setUser(prev => ({...prev, handle: e.target.value}))}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="text-xs text-slate-400 mb-2 block">Выберите Аватар</label>
                    <div className="grid grid-cols-4 gap-3">
                        {AVATARS.map(av => (
                            <button 
                                key={av} 
                                onClick={() => setUser(prev => ({...prev, avatar: av}))}
                                className={`text-2xl p-3 rounded-xl transition ${user.avatar === av ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-slate-800/50 border border-transparent hover:bg-slate-700'}`}
                            >
                                {av}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={() => setShowAvatarEdit(false)} className="w-full liquid-button py-3 rounded-xl text-white font-bold">Сохранить</button>
            </div>
        </div>
    );
  };

  const renderForest = () => (
    <div className="flex-1 flex flex-col relative min-h-[500px]">
      {/* Background Image for Glade/Clearing Effect */}
      <div className="absolute inset-0 z-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover filter brightness-50" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50"></div>
      </div>

      <div className="p-4 relative z-10 flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-6 px-1">
              <h2 className="text-lg font-bold font-tech text-white flex items-center drop-shadow-md">
                <Map size={18} className="mr-2 text-emerald-400" />
                Ваша Поляна
              </h2>
              <span className="text-[10px] text-emerald-300 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                 {plots.filter(p => p.status === 'planted').length} / {plots.length} Посажено
              </span>
          </div>
          
          {/* Forest Clearing Grid */}
          <div className="grid grid-cols-3 gap-6 auto-rows-fr pb-24">
            {plots.map((plot) => (
              <div 
                key={plot.id}
                onClick={() => {
                    setSelectedPlotId(plot.id);
                    if (plot.tree) triggerAnimation(plot.id, 'grow');
                }}
                className="relative flex items-center justify-center aspect-square"
              >
                 {/* Visual Ground Spot/Mound */}
                <div className={`absolute inset-0 rounded-full transform scale-x-110 scale-y-75 translate-y-4 shadow-2xl transition-all duration-300
                    ${plot.status === 'locked' ? 'bg-[#0f172a]/80 border border-slate-700/30' : 
                      plot.status === 'empty' ? 'bg-[#3f2e18]/60 border border-[#5d4037]/50 hover:bg-[#3f2e18]/80 cursor-pointer' :
                      'bg-emerald-900/40 border border-emerald-500/20 blur-[2px]'
                    }
                `}></div>

                {/* Content above the ground patch */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full transform -translate-y-2">
                    {plot.status === 'locked' && (
                        <div className="flex flex-col items-center opacity-40">
                            <Lock size={16} className="mb-1 text-slate-400" />
                            <span className="text-[8px] font-bold font-tech tracking-wider bg-black/50 px-1 rounded">{plot.price}</span>
                        </div>
                    )}
                    
                    {plot.status === 'empty' && (
                        <div className="flex flex-col items-center opacity-40 group hover:opacity-100 transition animate-pulse cursor-pointer">
                            <Sprout size={20} className="text-emerald-500/60 mb-1" />
                            <div className="w-4 h-1 bg-black/50 rounded-full blur-[1px]"></div>
                        </div>
                    )}

                    {plot.status === 'planted' && plot.tree && (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <TreeVisual 
                                type={plot.tree.type} 
                                level={plot.tree.level} 
                                isDiseased={plot.tree.isDiseased}
                                animationType={animationEffect?.id === plot.id ? animationEffect.type : null}
                            />
                             {/* Growth Ring */}
                             <div className="absolute -bottom-2 w-12 h-1 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full bg-${TREE_STATS[plot.tree.type].color.split('-')[1]}-400`} 
                                    style={{ width: `${(plot.tree.xp / 100) * 100}%` }}
                                />
                             </div>
                             
                             {/* Floating Level */}
                             <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition text-[8px] bg-black/60 px-1.5 rounded backdrop-blur text-white">
                                Lvl {plot.tree.level}
                             </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );

  const renderPartners = () => (
    <div className="p-4 pb-32">
      <h2 className="text-xl font-bold font-tech text-white mb-2">Корпоративные Леса</h2>
      <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">Взаимодействуйте с брендами, чтобы получить уникальные саженцы и NFT.</p>

      <div className="space-y-4">
        {PARTNERS.map(partner => (
          <div key={partner.id} className="liquid-card p-0 group overflow-hidden">
            <div className={`h-24 bg-gradient-to-r ${partner.gradient} flex items-center px-6 relative`}>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                {/* Floating organic circles decoration */}
                <div className="absolute top-2 right-10 w-4 h-4 rounded-full bg-white/20 animate-float-organic"></div>
                <div className="absolute bottom-2 right-20 w-2 h-2 rounded-full bg-white/20 animate-float-organic animation-delay-2000"></div>

                <div className="z-10 bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 mr-4 shadow-lg">
                    <div className="w-8 h-8 flex items-center justify-center">{partner.logo}</div>
                </div>
                <div className="z-10">
                     <h3 className="font-bold font-tech text-white tracking-wide text-lg drop-shadow-md">{partner.name}</h3>
                     <span className="text-[10px] text-white/80 font-medium bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-1">Официальный Партнер</span>
                </div>
            </div>
            
            <div className="p-5 bg-slate-900/40 backdrop-blur-sm">
                <p className="text-sm text-slate-300 mb-5 font-light leading-relaxed">{partner.description}</p>
                
                <div className="space-y-3 mb-6">
                  {partner.quests.map(quest => (
                    <div key={quest.id} className="flex items-center justify-between text-xs bg-[#020617]/50 p-3 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition">
                      <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${quest.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                              {quest.completed && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          <span className={quest.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{quest.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-md">
                         +{quest.reward}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                    onClick={() => {
                       if(tokens >= partner.sponsoredTreeCost) {
                           setTokens(t => t - partner.sponsoredTreeCost);
                           showToast(`${partner.name} добавлен в инвентарь!`, 'success');
                       } else {
                           showToast('Недостаточно токенов NUN', 'error');
                       }
                    }}
                    className="w-full liquid-button text-white py-3.5 rounded-xl font-bold font-tech text-xs uppercase tracking-wider flex items-center justify-center group"
                >
                  <span className="mr-2 group-hover:animate-pulse">✨</span> 
                  Минт Дерева ({partner.sponsoredTreeCost} NUN)
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRealTrees = () => (
    <div className="p-4 pb-32">
       <div className="liquid-card p-6 text-white mb-6 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80')] bg-cover bg-center relative overflow-hidden border-none shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-transparent"></div>
          <div className="relative z-10 max-w-[70%]">
              <h2 className="text-2xl font-bold font-tech mb-2 leading-tight">Посади Реальный Лес</h2>
              <p className="text-emerald-100/80 text-xs font-medium leading-relaxed mb-4">
                  Ваши токены финансируют посадку настоящих деревьев. Мы предоставляем фото-отчеты и GPS координаты каждого саженца.
              </p>
              <button className="px-4 py-2 bg-white text-emerald-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition">Узнать больше</button>
          </div>
       </div>

       <div className="space-y-4">
          {REAL_TREES.map(tree => {
              const isOwned = realTreesOwned.includes(tree.id);
              return (
                <div key={tree.id} className="liquid-card p-0 group overflow-hidden border-slate-700/30">
                    <div className={`h-40 ${tree.bg} flex items-center justify-center text-8xl relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        {/* Parallax effect placeholder */}
                        <div className="relative z-10 animate-float-organic drop-shadow-2xl scale-110 transition-transform duration-700 group-hover:scale-125">{tree.image}</div>
                        
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center border border-white/20 shadow-lg">
                            <Leaf size={10} className="mr-1 text-emerald-300"/> -{tree.co2}кг CO₂
                        </div>
                    </div>
                    <div className="p-5 bg-[#020617]/40 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-white font-tech">{tree.name}</h3>
                                <div className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider mt-0.5">RWA NFT Asset</div>
                            </div>
                            {isOwned && <div className="bg-emerald-500/20 p-1.5 rounded-full"><CheckCircle2 size={16} className="text-emerald-400" /></div>}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-5 mt-3">
                             <div className="text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                                Требование: {tree.req}
                             </div>
                        </div>
                        
                        {isOwned ? (
                             <button disabled className="w-full bg-slate-800/30 text-emerald-500/50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-emerald-900/30">
                                Уже в вашем лесу
                             </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    if(tokens >= tree.cost) {
                                        setTokens(t => t - tree.cost);
                                        setRealTreesOwned(prev => [...prev, tree.id]);
                                        setCo2(c => c + tree.co2);
                                        showToast('Вы изменили реальный мир!', 'success');
                                    } else {
                                        showToast('Копите токены', 'error');
                                    }
                                }}
                                className="w-full liquid-button text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition flex justify-center items-center gap-2"
                            >
                                <span>Купить за {tree.cost}</span>
                                <Coins size={14} className="text-yellow-300" />
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
      <div className="p-4 pb-32 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative w-64 h-64 mb-8">
              {/* Animated Rings */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping opacity-20"></div>
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-500/20 animate-spin-slow"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/20 to-slate-900/40 backdrop-blur-xl rounded-full border border-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <Globe size={48} className="text-emerald-500/50 mb-2 animate-pulse" strokeWidth={1} />
                  <span className="text-6xl font-black font-tech text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200 tracking-tighter drop-shadow-xl">{co2}</span>
                  <span className="text-emerald-400/60 text-xs font-bold mt-1 tracking-widest uppercase">КГ CO₂ Убрано</span>
              </div>
          </div>

          <div className="w-full max-w-sm liquid-card p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2 font-tech">Глобальная Цель</h3>
              <p className="text-xs text-slate-400 mb-4">До следующего уровня планетарного хранителя</p>
              <div className="h-4 bg-slate-900/60 rounded-full overflow-hidden border border-slate-700/50 relative">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500 w-[5%] shadow-[0_0_15px_rgba(132,204,22,0.5)] animate-shimmer bg-[length:200%_100%]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase">
                  <span>Новичок</span>
                  <span>1 Тонна</span>
              </div>
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in"
        onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPlotId(null);
        }}
      >
        <div className="liquid-card w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-slide-up bg-[#020617] border-emerald-500/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold font-tech text-white">Участок #{plot.id}</h3>
                    <p className="text-xs text-emerald-400/60 uppercase tracking-widest mt-1">Панель управления био-узлом</p>
                </div>
                <button onClick={() => setSelectedPlotId(null)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition hover:bg-white/10">✕</button>
            </div>

            {plot.status === 'locked' && (
                <div className="text-center py-10">
                    <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50 shadow-inner">
                        <Lock size={40} className="text-slate-600" />
                    </div>
                    <button 
                        onClick={() => unlockPlot(plot)}
                        className="w-full liquid-button text-white py-4 rounded-xl font-bold font-tech text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition border-emerald-500/30"
                    >
                        Разблокировать <span className="text-emerald-300 ml-2">{plot.price} NUN</span>
                    </button>
                </div>
            )}

            {plot.status === 'empty' && (
                 <div className="text-center py-8">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
                            <Sprout size={40} className="text-emerald-500" />
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowShop(true)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-4 rounded-xl font-bold font-tech flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition"
                    >
                        Выбрать Семя
                    </button>
                </div>
            )}

            {plot.status === 'planted' && plot.tree && (
                <div className="space-y-6">
                    {/* Tree Status Card */}
                    <div className="bg-gradient-to-br from-slate-900/50 to-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 flex items-center relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent"></div>
                        
                        <div className="mr-5 relative">
                             <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
                             <TreeVisual 
                                type={plot.tree.type} 
                                level={plot.tree.level} 
                                isDiseased={plot.tree.isDiseased} 
                                animationType={animationEffect?.id === plot.id ? animationEffect.type : null}
                             />
                        </div>
                        
                        <div className="flex-1 relative z-10">
                            <div className="font-bold text-xl text-white font-tech tracking-wide">{TREE_STATS[plot.tree.type].name}</div>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Lvl {plot.tree.level}</span>
                                <span className="text-xs text-slate-400">+{TREE_STATS[plot.tree.type].income}/день</span>
                            </div>
                            
                            <div className="mt-3 relative pt-1">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                                    <span>XP</span>
                                    <span>{plot.tree.xp}/100</span>
                                </div>
                                <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500" style={{ width: `${(plot.tree.xp / 100) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => performAction('water', plot.id)}
                            className="liquid-button bg-cyan-900/20 border-cyan-500/20 text-cyan-200 p-4 rounded-xl flex flex-col items-center justify-center transition hover:bg-cyan-500/10 group"
                        >
                            <CloudRain size={24} className="mb-2 group-hover:scale-110 transition text-cyan-400" />
                            <span className="font-bold text-sm">Полив</span>
                            <span className="text-[10px] opacity-60 mt-1">-3 NUN</span>
                        </button>
                        <button 
                             onClick={() => performAction('fertilize', plot.id)}
                             className="liquid-button bg-lime-900/20 border-lime-500/20 text-lime-200 p-4 rounded-xl flex flex-col items-center justify-center transition hover:bg-lime-500/10 group"
                        >
                            <Sparkles size={24} className="mb-2 group-hover:scale-110 transition text-lime-400" />
                            <span className="font-bold text-sm">Удобрение</span>
                            <span className="text-[10px] opacity-60 mt-1">-3 NUN</span>
                        </button>
                        <button 
                             onClick={() => performAction('prune', plot.id)}
                             className="liquid-button bg-amber-900/20 border-amber-500/20 text-amber-200 p-4 rounded-xl flex flex-col items-center justify-center transition hover:bg-amber-500/10 group"
                        >
                            <Sun size={24} className="mb-2 group-hover:scale-110 transition text-amber-400" />
                            <span className="font-bold text-sm">Свет</span>
                            <span className="text-[10px] opacity-60 mt-1">-3 NUN</span>
                        </button>
                         <button 
                             onClick={() => performAction('protect', plot.id)}
                             className="liquid-button bg-purple-900/20 border-purple-500/20 text-purple-200 p-4 rounded-xl flex flex-col items-center justify-center transition hover:bg-purple-500/10 group"
                        >
                            <Shield size={24} className="mb-2 group-hover:scale-110 transition text-purple-400" />
                            <span className="font-bold text-sm">Защита</span>
                            <span className="text-[10px] opacity-60 mt-1">-3 NUN</span>
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
        <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-xl flex flex-col animate-fade-in">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h2 className="text-xl font-bold font-tech text-white">Банк Семян</h2>
                <button onClick={() => setShowShop(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                {(Object.keys(TREE_STATS) as TreeType[]).filter(t => !t.startsWith('brand')).map(type => {
                    const stats = TREE_STATS[type];
                    const Icon = stats.icon;
                    return (
                    <div key={type} className="liquid-card p-4 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition border-slate-700/50 hover:border-emerald-500/50">
                        <div className="flex items-center">
                            <div className={`w-14 h-14 ${stats.color.replace('text-', 'bg-')}/10 rounded-2xl flex items-center justify-center mr-4 border border-white/5`}>
                                <Icon size={28} className={stats.color} />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-white font-tech">{stats.name}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border bg-black/20 ${
                                        stats.rarity === 'Обычное' ? 'border-emerald-500/30 text-emerald-400' : 
                                        stats.rarity === 'Необычное' ? 'border-cyan-500/30 text-cyan-400' : 
                                        'border-purple-500/30 text-purple-400'
                                    }`}>
                                        {stats.rarity}
                                    </span>
                                    <span className="text-xs text-slate-400">+{stats.income} / день</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => plantTree(type)}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50"
                        >
                            {stats.cost} T
                        </button>
                    </div>
                )})}
            </div>
        </div>
      );
  };

  const renderOnboarding = () => {
    const steps = [
      {
        title: "Добро пожаловать в NUNCYCLE",
        desc: "Ваш путь к зеленому будущему начинается здесь. Получите первый бесплатный участок и начните восстанавливать планету.",
        icon: <Leaf size={64} className="text-emerald-400 mb-6 animate-float-organic" />,
        action: "Начать Путь"
      },
      {
        title: "Выращивайте Жизнь",
        desc: "Ухаживайте за деревьями, наблюдайте их рост и получайте токены. Каждое дерево уникально и реагирует на вашу заботу.",
        icon: <Sprout size={64} className="text-lime-400 mb-6" />,
        action: "Далее"
      },
      {
        title: "Реальное Влияние",
        desc: "Ваш прогресс превращается в настоящие деревья. Мы высаживаем их в реальном мире, когда вы достигаете целей.",
        icon: <Globe size={64} className="text-cyan-400 mb-6" />,
        action: "В Игру"
      }
    ];

    const current = steps[onboardingStep];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-fade-in">
        <div className="w-full max-w-sm text-center relative">
          <div className="flex justify-center mb-8 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">{current.icon}</div>
          <h2 className="text-3xl font-bold font-tech text-white mb-4 leading-tight">{current.title}</h2>
          <p className="text-slate-400 mb-10 font-light leading-relaxed text-sm">{current.desc}</p>
          
          <div className="flex space-x-2 justify-center mb-10">
            {steps.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-8 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-2 bg-slate-700'}`}></div>
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
            className="w-full liquid-button bg-emerald-600 text-white py-4 rounded-2xl font-bold font-tech text-lg shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/50 transition border-none"
          >
            {current.action}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col font-sans text-slate-200">
      <BackgroundBubbles />
      
      {showOnboarding && renderOnboarding()}
      {renderChat()}
      {renderAvatarSelection()}
      
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[80] px-6 py-3 rounded-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center animate-bounce-in border font-bold backdrop-blur-xl w-[90%] max-w-sm text-sm ${
            toast.type === 'success' ? 'bg-emerald-600/90 border-emerald-400/50' : 
            toast.type === 'error' ? 'bg-red-600/90 border-red-400/50' : 'bg-slate-700/90 border-slate-500/50'
        }`}>
            {toast.msg}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-md mx-auto w-full h-full flex flex-col relative z-10 bg-slate-900/30 backdrop-blur-[2px] min-h-screen border-x border-white/5 shadow-2xl">
          <div className="flex-1 overflow-y-auto hide-scrollbar z-10">
            {renderHeader()}
            
            {activeTab === 'forest' && renderForest()}
            {activeTab === 'partners' && renderPartners()}
            {activeTab === 'real' && renderRealTrees()}
            {activeTab === 'impact' && renderImpact()}
            {activeTab === 'profile' && renderProfile()}
          </div>

          {/* Navigation */}
          <div className="px-4 pb-6 pt-2 sticky bottom-0 z-30 pointer-events-none">
            <div className="liquid-card rounded-2xl flex justify-around items-center p-2 bg-[#020617]/80 backdrop-blur-2xl border-emerald-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
                <button onClick={() => setActiveTab('forest')} className={`p-3 rounded-xl transition ${activeTab === 'forest' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'}`}><Leaf size={24} className={activeTab === 'forest' ? 'fill-emerald-500/20' : ''}/></button>
                <button onClick={() => setActiveTab('partners')} className={`p-3 rounded-xl transition ${activeTab === 'partners' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500'}`}><Gamepad2 size={24} /></button>
                <button onClick={() => setActiveTab('real')} className={`p-3 rounded-xl transition ${activeTab === 'real' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500'}`}><Map size={24} /></button>
                <button onClick={() => setActiveTab('impact')} className={`p-3 rounded-xl transition ${activeTab === 'impact' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'}`}><Globe size={24} /></button>
                <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl transition ${activeTab === 'profile' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500'}`}><User size={24} /></button>
            </div>
          </div>

          {selectedPlotId && renderPlotModal()}
          {showShop && renderTreeShop()}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
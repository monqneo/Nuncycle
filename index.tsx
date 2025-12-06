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
  ArrowDownLeft,
  Copy,
  Calendar,
  Gift,
  Search,
  Filter,
  Link,
  Twitter,
  Facebook,
  Instagram,
  Check,
  X,
  QrCode,
  Smartphone,
  Download,
  HeartHandshake,
  Eye,
  Handshake,
  Car,
  Plane,
  ThermometerSun
} from 'lucide-react';

// --- TYPES & CONSTANTS ---

type TreeType = 
  | 'basic' | 'protective' | 'synergetic' 
  | 'crystal_spruce' | 'magma_pine' | 'neon_cactus' | 'void_willow' | 'quantum_maple' | 'cyber_bonsai'
  | 'brand_adidas' | 'brand_google' | 'brand_patagonia' | 'brand_yandex' | 'brand_kaspi' | 'brand_amazon' | 'brand_meta' | 'brand_samsung';

type PlotStatus = 'locked' | 'empty' | 'planted';
type BonusType = 'xp_boost' | 'token_discount' | 'lucky_chance';

interface GreenDayEvent {
  partnerId: string;
  type: BonusType;
  value: number;
  label: string;
}

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
  dailyGiftAvailable: boolean;
}

interface UserProfile {
  id: string;
  handle: string;
  name: string;
  avatar: string; // Emoji or URL
  joinDate: string;
  bio: string;
  isLoggedIn: boolean;
  tonAddress: string | null;
  tonBalance: number; // New: Balance in TON
  referralCode: string;
  invitedCount: number;
}

interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'online' | 'offline' | 'planting';
  level: number;
  plots: Plot[]; // Mocked forest for visiting
}

interface Message {
  id: string;
  senderId: string; // 'me' or friend.id
  text: string;
  type: 'text' | 'help_request';
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
  rewardXP: number;
}

interface DailyTask {
  id: string;
  text: string;
  max: number;
  current: number;
  reward: number;
  completed: boolean;
}

const LEVEL_XP_THRESHOLD = 200;
const MAX_ENERGY = 9999; // Unlimited for test user

const TREE_STATS: Record<TreeType, { name: string; income: number; cost: number; rarity: string; color: string; icon: any; desc?: string }> = {
  // Starters
  basic: { name: 'Эко-Дуб', income: 8, cost: 50, rarity: 'Обычное', color: 'text-green-400', icon: TreeDeciduous, desc: 'Классическое дерево для старта.' },
  protective: { name: 'Щит-Ива', income: 6, cost: 80, rarity: 'Необычное', color: 'text-cyan-400', icon: TreePine, desc: 'Защищает соседние деревья.' },
  synergetic: { name: 'Нейро-Цвет', income: 12, cost: 120, rarity: 'Редкое', color: 'text-purple-400', icon: Flower2, desc: 'Усиливает добычу токенов.' },
  
  // Advanced Virtual Trees
  neon_cactus: { name: 'Неон-Кактус', income: 14, cost: 160, rarity: 'Редкое', color: 'text-pink-400', icon: TreePine, desc: 'Светится ночью, требует мало воды.' },
  crystal_spruce: { name: 'Кристальная Ель', income: 18, cost: 220, rarity: 'Эпик', color: 'text-blue-300', icon: TreePine, desc: 'Кристаллы резонируют с блокчейном.' },
  magma_pine: { name: 'Магма-Пальма', income: 22, cost: 300, rarity: 'Эпик', color: 'text-orange-500', icon: TreePalm, desc: 'Генерирует тепло и энергию.' },
  cyber_bonsai: { name: 'Кибер-Бонсай', income: 25, cost: 400, rarity: 'Легендарное', color: 'text-emerald-300', icon: Sprout, desc: 'Идеальный баланс кода и природы.' },
  void_willow: { name: 'Ива Пустоты', income: 30, cost: 550, rarity: 'Мифическое', color: 'text-indigo-400', icon: TreeDeciduous, desc: 'Поглощает энтропию.' },
  quantum_maple: { name: 'Квантовый Клен', income: 40, cost: 800, rarity: 'Мифическое', color: 'text-violet-400', icon: TreeDeciduous, desc: 'Существует в двух состояниях.' },

  // Branded Trees
  brand_adidas: { name: 'Adidas Bio-Mesh', income: 15, cost: 200, rarity: 'Бренд', color: 'text-blue-300', icon: TreePalm },
  brand_google: { name: 'Google Quantum Root', income: 18, cost: 250, rarity: 'Бренд', color: 'text-orange-300', icon: TreeDeciduous },
  brand_patagonia: { name: 'Patagonia Wild', income: 14, cost: 180, rarity: 'Бренд', color: 'text-teal-300', icon: TreePine },
  brand_yandex: { name: 'Yandex Neuro-Birch', income: 16, cost: 220, rarity: 'Бренд', color: 'text-red-400', icon: TreeDeciduous },
  brand_kaspi: { name: 'Kaspi Gold Tree', income: 20, cost: 300, rarity: 'Бренд', color: 'text-yellow-500', icon: TreePalm },
  brand_amazon: { name: 'Amazon Prime Palm', income: 17, cost: 240, rarity: 'Бренд', color: 'text-yellow-400', icon: TreePalm },
  brand_meta: { name: 'Metaverse Willow', income: 19, cost: 260, rarity: 'Бренд', color: 'text-blue-500', icon: TreePine },
  brand_samsung: { name: 'Samsung Galaxy Sprout', income: 18, cost: 250, rarity: 'Бренд', color: 'text-indigo-400', icon: Flower2 },
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
    sponsoredTreeCost: 200,
    dailyGiftAvailable: true
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
    sponsoredTreeCost: 250,
    dailyGiftAvailable: true
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
    sponsoredTreeCost: 180,
    dailyGiftAvailable: true
  },
  {
    id: 'yandex',
    name: 'Yandex Eco',
    logo: <span className="text-2xl font-bold"><span className="text-red-500">Я</span>ндекс</span>,
    color: 'text-red-400',
    gradient: 'from-red-900/80 to-yellow-900/50',
    description: 'Технологии для чистых городов.',
    quests: [{ id: 1, text: 'Найти редкий вид в поиске', reward: 45, completed: false }],
    sponsoredTreeCost: 220,
    dailyGiftAvailable: true
  },
  {
    id: 'kaspi',
    name: 'Kaspi Green',
    logo: <span className="text-2xl font-bold text-yellow-500 italic">Kaspi.kz</span>,
    color: 'text-red-500',
    gradient: 'from-red-900/90 to-slate-900/50',
    description: 'Платежи без углеродного следа.',
    quests: [{ id: 1, text: 'Оплатить уход бонусами', reward: 70, completed: false }],
    sponsoredTreeCost: 300,
    dailyGiftAvailable: true
  },
  {
    id: 'amazon',
    name: 'Amazon Rainforest',
    logo: <span className="text-2xl font-bold text-white flex items-center">amazon<span className="text-yellow-500 ml-1">→</span></span>,
    color: 'text-yellow-400',
    gradient: 'from-slate-800 to-orange-900/50',
    description: 'Восстановление лесов Амазонии.',
    quests: [{ id: 1, text: 'Prime доставка удобрений', reward: 55, completed: false }],
    sponsoredTreeCost: 240,
    dailyGiftAvailable: true
  },
  {
    id: 'meta',
    name: 'Meta Nature',
    logo: <span className="text-2xl text-blue-500">♾️</span>,
    color: 'text-blue-500',
    gradient: 'from-blue-900/80 to-cyan-900/50',
    description: 'Виртуальная реальность, чистая природа.',
    quests: [{ id: 1, text: 'Поделиться в Instagram', reward: 80, completed: false }],
    sponsoredTreeCost: 260,
    dailyGiftAvailable: true
  },
  {
    id: 'samsung',
    name: 'Samsung Eco Life',
    logo: <span className="text-xl font-bold text-blue-100 bg-blue-600 px-2 rounded">SAMSUNG</span>,
    color: 'text-indigo-400',
    gradient: 'from-indigo-900/80 to-blue-900/50',
    description: 'Устойчивые инновации для всех.',
    quests: [{ id: 1, text: 'Синхронизация SmartThings', reward: 50, completed: false }],
    sponsoredTreeCost: 250,
    dailyGiftAvailable: true
  }
];

const REAL_TREES = [
  { id: 1, name: 'Сосна Обыкновенная', cost: 500, co2: 250, image: '🌲', req: 'Нет требований', bg: 'bg-emerald-900/50', isSponsored: false },
  { id: 2, name: 'Береза Повислая', cost: 600, co2: 300, image: '🌳', req: 'Ур. 2', bg: 'bg-lime-900/50', isSponsored: false },
  { id: 3, name: 'Ель Европейская', cost: 700, co2: 350, image: '🌲', req: 'Ур. 3', bg: 'bg-emerald-800/50', isSponsored: false },
  { id: 4, name: 'Клен Остролистный', cost: 800, co2: 400, image: '🍁', req: 'Ур. 4', bg: 'bg-orange-900/50', isSponsored: false },
  { id: 5, name: 'Липа Сердцевидная', cost: 900, co2: 420, image: '🍃', req: 'Ур. 4', bg: 'bg-yellow-900/50', isSponsored: false },
  { id: 6, name: 'Яблоня Лесная', cost: 1000, co2: 380, image: '🍎', req: 'Ур. 5', bg: 'bg-red-900/40', isSponsored: false },
  { id: 7, name: 'Груша Дикая', cost: 1100, co2: 390, image: '🍐', req: 'Ур. 5', bg: 'bg-lime-800/40', isSponsored: false },
  { id: 8, name: 'Рябина', cost: 1200, co2: 410, image: '🍒', req: 'Ур. 6', bg: 'bg-orange-800/40', isSponsored: false },
  { id: 9, name: 'Дуб Черешчатый', cost: 1400, co2: 500, image: '🌳', req: 'Ур. 7, 3 Узла', bg: 'bg-amber-900/50', isSponsored: false },
  { id: 10, name: 'Кедр Сибирский', cost: 1600, co2: 550, image: '🌲', req: 'Ур. 8', bg: 'bg-emerald-950/50', isSponsored: false },
  { id: 11, name: 'Лиственница', cost: 1800, co2: 580, image: '🌲', req: 'Ур. 9', bg: 'bg-yellow-800/40', isSponsored: false },
  { id: 12, name: 'Ясень', cost: 2000, co2: 600, image: '🌿', req: 'Ур. 10', bg: 'bg-green-900/40', isSponsored: false },
  { id: 13, name: 'Бук Лесной', cost: 2200, co2: 650, image: '🌳', req: 'Ур. 11', bg: 'bg-stone-800/50', isSponsored: false },
  { id: 14, name: 'Вяз Гладкий', cost: 2500, co2: 700, image: '🌳', req: 'Ур. 12', bg: 'bg-stone-900/50', isSponsored: false },
  { id: 15, name: 'Пихта', cost: 2800, co2: 750, image: '🌲', req: 'Ур. 13', bg: 'bg-emerald-900/60', isSponsored: false },
  { id: 16, name: 'Каштан', cost: 3000, co2: 800, image: '🌰', req: 'Ур. 14', bg: 'bg-amber-950/50', isSponsored: false },
  { id: 17, name: 'Орех Грецкий', cost: 3500, co2: 850, image: '🥜', req: 'Ур. 15', bg: 'bg-stone-800/60', isSponsored: false },
  { id: 18, name: 'Мангровое Дерево', cost: 4000, co2: 1200, image: '🌊', req: 'Ур. 16, Спонсор', bg: 'bg-blue-900/50', isSponsored: true },
  { id: 19, name: 'Секвойя', cost: 5000, co2: 2000, image: '🌲', req: 'Ур. 18', bg: 'bg-red-950/60', isSponsored: false },
  { id: 20, name: 'Баобаб', cost: 7000, co2: 2500, image: '🌳', req: 'Ур. 20', bg: 'bg-yellow-950/60', isSponsored: false },
  { id: 21, name: 'Adidas Ocean Mangrove', cost: 4500, co2: 1300, image: '👟', req: 'Adidas Quest', bg: 'bg-blue-900/80', isSponsored: true },
  { id: 22, name: 'Google Carbon Oak', cost: 6000, co2: 1800, image: '🌐', req: 'Google Quest', bg: 'bg-green-900/80', isSponsored: true }
];

const INITIAL_PLOTS: Plot[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    status: i === 0 ? 'empty' : 'locked',
    price: i === 0 ? 0 : [150, 250, 400, 600, 850, 1150, 1500, 2000, 2500, 3000, 4000][i-1],
    tree: null
}));

// Generates achievements for up to Level 50 and 100 Real Trees
const generateAchievements = (): Achievement[] => {
    const list: Achievement[] = [
        { id: 'first_tree', title: 'Первый Росток', desc: 'Посадите 1 дерево', icon: Sprout, unlocked: false, progress: 0, max: 1, rewardXP: 50 },
        { id: 'water_master', title: 'Хранитель Воды', desc: 'Полейте деревья 50 раз', icon: CloudRain, unlocked: false, progress: 0, max: 50, rewardXP: 100 },
    ];

    // Level Milestones
    [5, 10, 20, 30, 40, 50].forEach(lvl => {
        list.push({
            id: `level_${lvl}`,
            title: `Хранитель Уровня ${lvl}`,
            desc: `Достигните ${lvl} уровня игрока`,
            icon: Trophy,
            unlocked: false,
            progress: 0,
            max: lvl,
            rewardXP: lvl * 100
        });
    });

    // Real Tree Milestones
    [1, 5, 10, 25, 50, 100].forEach(count => {
        list.push({
            id: `real_tree_${count}`,
            title: count === 100 ? 'Легенда Планеты' : `Владелец ${count} Деревьев`,
            desc: count === 100 ? 'Владейте 100 реальными деревьями' : `Купите ${count} реальных деревьев`,
            icon: Globe,
            unlocked: false,
            progress: 0,
            max: count,
            rewardXP: count * 200
        });
    });

    // Virtual Forest Milestones
    [10, 50, 100, 500].forEach(count => {
        list.push({
            id: `planted_${count}`,
            title: `Садовник ${count}`,
            desc: `Посадите ${count} виртуальных деревьев`,
            icon: TreeDeciduous,
            unlocked: false,
            progress: 0,
            max: count,
            rewardXP: count * 10
        });
    });

    return list;
};

const INITIAL_ACHIEVEMENTS: Achievement[] = generateAchievements();

const INITIAL_DAILY_TASKS: DailyTask[] = [
    { id: 'water_5', text: 'Полить деревья 5 раз', max: 5, current: 0, reward: 50, completed: false },
    { id: 'login', text: 'Посетить лес', max: 1, current: 1, reward: 20, completed: true },
    { id: 'invite', text: 'Пригласить друга', max: 1, current: 0, reward: 100, completed: false },
];

const generateMockPlots = (): Plot[] => {
    return Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        status: i < 6 ? 'planted' : i < 9 ? 'empty' : 'locked',
        price: 0,
        tree: i < 6 ? {
            type: Object.keys(TREE_STATS)[Math.floor(Math.random() * 8)] as TreeType,
            level: Math.floor(Math.random() * 5) + 1,
            xp: 0, health: 100, lastWatered: Date.now(), isDiseased: false
        } : null
    }));
};

const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', name: 'EcoWarrior99', handle: '@eco_warrior', avatar: '🦸', status: 'online', level: 12, plots: generateMockPlots() },
  { id: 'f2', name: 'GreenThumb', handle: '@green_thumb', avatar: '🧚', status: 'planting', level: 8, plots: generateMockPlots() },
  { id: 'f3', name: 'ForestSpirit', handle: '@spirit_of_forest', avatar: '👻', status: 'offline', level: 20, plots: generateMockPlots() },
];

// --- VISUAL COMPONENTS ---

const BackgroundBubbles = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
    {/* Deep Forest Gradient Base */}
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-[#022c22] to-black opacity-80"></div>
    
    {/* Floating Orbs */}
    <div className="blob w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] absolute -top-20 -left-20 animate-pulse"></div>
    <div className="blob w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] absolute bottom-0 right-0 animate-grow"></div>
    <div className="blob w-[300px] h-[300px] bg-lime-500/10 rounded-full blur-[80px] absolute top-1/2 left-1/3 animate-pulse delay-1000"></div>

    {/* Floating Leaves Effect */}
    <div className="absolute inset-0 z-0 opacity-20">
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className="animate-leaf absolute text-emerald-300" 
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${Math.random() * 20 + 10}px`
          }}
        >
          <Leaf />
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  // Game State
  const [activeTab, setActiveTab] = useState<'forest' | 'sponsors' | 'real' | 'impact' | 'profile'>('forest');
  const [tokens, setTokens] = useState(10000000); // 10 Million NUN (Test User)
  const [energy, setEnergy] = useState(MAX_ENERGY); 
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [realTreesOwned, setRealTreesOwned] = useState<number[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [notifications, setNotifications] = useState<{id: number, text: string, type: 'success' | 'info'}[]>([]);
  const [greenDayEvent, setGreenDayEvent] = useState<GreenDayEvent | null>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  
  // Profile & Social State
  const [user, setUser] = useState<UserProfile>({
    id: 'u1', handle: '@tester_god', name: 'Tester God', avatar: '🤖', joinDate: '2023-10-27', bio: 'Save the planet!', 
    isLoggedIn: false, tonAddress: null, tonBalance: 0, referralCode: 'NUN-777', invitedCount: 0
  });
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'f1', text: 'Привет! Как твой лес?', type: 'text', timestamp: Date.now() - 100000 },
  ]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Modals
  const [showShop, setShowShop] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showStoryGen, setShowStoryGen] = useState(false);
  const [showTonConnect, setShowTonConnect] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState<Friend | null>(null);
  const [animationEffect, setAnimationEffect] = useState<{ plotId: number, type: 'grow' | 'fruit' } | null>(null);
  const [visitMode, setVisitMode] = useState<Friend | null>(null);

  // Effects
  useEffect(() => {
    const saved = localStorage.getItem('nuncycle_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore essential state if needed, skipping for dev to keep "God Mode"
        // setTokens(parsed.tokens); 
      } catch (e) { console.error("Save load error", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nuncycle_state', JSON.stringify({ tokens, energy, xp, level, plots, user }));
  }, [tokens, energy, xp, level, plots, user]);

  useEffect(() => {
    // Green Day Event Logic
    const randomPartner = PARTNERS[Math.floor(Math.random() * PARTNERS.length)];
    setGreenDayEvent({
      partnerId: randomPartner.id,
      type: 'token_discount',
      value: 0.8, // 20% off
      label: `Скидка 20% от ${randomPartner.name}`
    });
  }, []);

  useEffect(() => {
    // Check level up
    const newLevel = Math.floor(xp / LEVEL_XP_THRESHOLD) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      addNotification(`Новый уровень: ${newLevel}! +50 Токенов`, 'success');
      setTokens(prev => prev + 50);
      
      // Update achievement
      updateAchievement('level', newLevel);
    }
  }, [xp]);

  const addNotification = (text: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const updateAchievement = (type: string, amount: number) => {
    setAchievements(prev => prev.map(a => {
        if (a.id.includes(type) && !a.unlocked) {
            const newProgress = amount;
            if (newProgress >= a.max) {
                addNotification(`Достижение: ${a.title}`, 'success');
                setXP(x => x + a.rewardXP);
                return { ...a, progress: a.max, unlocked: true };
            }
            return { ...a, progress: newProgress };
        }
        return a;
    }));
  };

  // --- ACTIONS ---

  const handleBuyPlot = (id: number, price: number) => {
    if (tokens >= price) {
      setTokens(prev => prev - price);
      setPlots(prev => prev.map(p => p.id === id ? { ...p, status: 'empty' } : p));
      addNotification('Участок куплен!', 'success');
      
      // Unlock next
      const nextId = id + 1;
      if (nextId <= 12) {
         setPlots(prev => prev.map(p => p.id === nextId ? { ...p, status: 'locked' } : p));
      }
    } else {
      addNotification('Недостаточно токенов', 'info');
    }
  };

  const handlePlant = (type: TreeType) => {
    if (!selectedPlot) return;
    const treeStat = TREE_STATS[type];
    if (tokens >= treeStat.cost) {
      setTokens(prev => prev - treeStat.cost);
      setPlots(prev => prev.map(p => p.id === selectedPlot.id ? { 
        ...p, 
        status: 'planted', 
        tree: { type, level: 1, xp: 0, health: 100, lastWatered: Date.now(), isDiseased: false } 
      } : p));
      addNotification(`${treeStat.name} посажено!`, 'success');
      setSelectedPlot(null);
      setShowShop(false);
      updateAchievement('first_tree', 1);
      updateAchievement('planted', plots.filter(p => p.status === 'planted').length + 1);
      
      // Animation
      setAnimationEffect({ plotId: selectedPlot.id, type: 'grow' });
      setTimeout(() => setAnimationEffect(null), 1000);
    } else {
      addNotification('Недостаточно токенов', 'info');
    }
  };

  const handleCare = (action: 'water' | 'fertilize' | 'protect' | 'prune') => {
    if (!selectedPlot?.tree) return;
    if (energy < 1) {
        addNotification('Нет энергии! Попроси друзей.', 'info');
        return;
    }

    setEnergy(prev => prev - 1);
    setXP(prev => prev + 10);
    
    // Animation
    setAnimationEffect({ plotId: selectedPlot.id, type: 'fruit' });
    setTimeout(() => setAnimationEffect(null), 1500);

    // Update Tree
    setPlots(prev => prev.map(p => {
      if (p.id === selectedPlot.id && p.tree) {
        let newXp = p.tree.xp + 20;
        let newLevel = p.tree.level;
        if (newXp >= 100) {
            newLevel++;
            newXp = 0;
            addNotification('Дерево выросло!', 'success');
        }
        return { ...p, tree: { ...p.tree, xp: newXp, level: newLevel, health: 100 } };
      }
      return p;
    }));
    
    addNotification('Уход выполнен! +10 XP', 'success');
    if (action === 'water') updateAchievement('water_master', achievements.find(a=>a.id === 'water_master')?.progress! + 1);
    
    // Daily Task Update
    setDailyTasks(prev => prev.map(t => t.id === 'water_5' && !t.completed ? { ...t, current: t.current + 1, completed: t.current + 1 >= t.max } : t));
  };

  const handleBuyRealTree = (treeId: number, cost: number) => {
    if (tokens >= cost) {
        setTokens(prev => prev - cost);
        setRealTreesOwned(prev => [...prev, treeId]);
        addNotification('Поздравляем! Вы внесли вклад в планету.', 'success');
        updateAchievement('real_tree', realTreesOwned.length + 1);
    } else {
        addNotification('Недостаточно токенов', 'info');
    }
  };

  // --- TON CONNECT LOGIC ---
  const handleTonConnect = () => {
      // Simulate connection
      setTimeout(() => {
          setUser(prev => ({ ...prev, tonAddress: 'EQCt...8B2x', tonBalance: 15.5 }));
          setShowTonConnect(false);
          addNotification('Кошелек TON подключен!', 'success');
      }, 1500);
  };
  
  const handleDepositTon = () => {
      if(user.tonAddress) {
          // Simulate deposit
          addNotification('Транзакция отправлена...', 'info');
          setTimeout(() => {
              setTokens(prev => prev + 5000);
              addNotification('Баланс пополнен! +5000 NUN', 'success');
          }, 2000);
      }
  };

  // --- RENDER HELPERS ---

  const renderOnboarding = () => {
    const steps = [
      { title: 'Начало пути', text: 'Вы получили свой первый участок и дерево! Давайте позаботимся о нем.', icon: Sprout },
      { title: 'Забота о природе', text: 'Нажмите на дерево, чтобы полить или удобрить его. Это стоит энергии, но дает опыт.', icon: Droplets },
      { title: 'Становитесь сильнее', text: 'Опыт повышает уровень дерева (больше дохода) и уровень игрока (награды).', icon: Trophy },
      { title: 'Главная цель', text: 'Копите токены, чтобы купить РЕАЛЬНЫЕ деревья. Они будут посажены в настоящем мире!', icon: Globe },
    ];
    
    const current = steps[onboardingStep];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div className="liquid-card w-full max-w-sm p-8 text-center animate-grow">
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <current.icon className="w-10 h-10 text-emerald-400" />
             </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">{current.title}</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">{current.text}</p>
          <button 
            onClick={() => {
                if (onboardingStep < steps.length - 1) setOnboardingStep(s => s + 1);
                else {
                    setUser(u => ({ ...u, isLoggedIn: true }));
                    setOnboardingStep(0);
                }
            }}
            className="liquid-button w-full py-4 rounded-xl text-white font-bold text-lg"
          >
            {onboardingStep === steps.length - 1 ? 'Начать приключение' : 'Далее'}
          </button>
        </div>
      </div>
    );
  };

  const renderAuth = () => (
     <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] p-6 text-center">
        <BackgroundBubbles />
        <div className="relative z-10 w-full max-w-sm">
            <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">NUNCYCLE</h1>
            <p className="text-gray-400 mb-12 text-lg">Eco Metaverse & Web3 Game</p>
            
            <div className="space-y-4">
                <button onClick={() => setUser(u => ({ ...u, isLoggedIn: true }))} className="liquid-button w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg group">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold">G</span></div>
                    Войти через Google
                </button>
                <button onClick={() => setUser(u => ({ ...u, isLoggedIn: true }))} className="liquid-button w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg">
                     <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold"></span></div>
                    Войти через Apple
                </button>
            </div>
            <p className="mt-8 text-xs text-gray-500">By playing, you agree to plant real trees.</p>
        </div>
     </div>
  );

  // --- TAB RENDERERS ---

  const renderForest = () => (
    <div className="pb-24 pt-4 px-4 relative">
       {/* Green Day Banner */}
       {greenDayEvent && (
         <div className="mb-6 liquid-card p-4 flex items-center justify-between border-l-4 border-l-yellow-400 animate-pulse">
            <div>
                <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-1">🔥 Green Day Event</div>
                <div className="text-white font-bold">{greenDayEvent.label}</div>
            </div>
            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Zap className="text-yellow-400 w-5 h-5" />
            </div>
         </div>
       )}

       {/* Quick Actions */}
       <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
             <button onClick={() => setShowTasks(true)} className="liquid-button w-12 h-12 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={20}/></button>
             <button onClick={() => setShowShop(true)} className="liquid-button w-12 h-12 rounded-full flex items-center justify-center text-white"><Search size={20}/></button>
          </div>
          <div className="text-right">
              <div className="text-xs text-gray-400">Ваш Лес</div>
              <div className="text-emerald-400 font-bold">День 12</div>
          </div>
       </div>

       {/* Forest Grid - "Clearing" Style */}
       <div className="grid grid-cols-3 gap-4 mb-8">
         {visitMode ? visitMode.plots.map(renderPlot) : plots.map(renderPlot)}
       </div>

       {visitMode && (
           <div className="fixed bottom-24 left-4 right-4 z-40">
               <div className="liquid-card p-4 bg-indigo-900/80 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                       <span className="text-2xl">{visitMode.avatar}</span>
                       <div>
                           <div className="font-bold text-white">{visitMode.name}</div>
                           <div className="text-xs text-indigo-300">В гостях</div>
                       </div>
                   </div>
                   <button onClick={() => setVisitMode(null)} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/50">
                       <LogOut size={16} className="inline mr-2"/>Выйти
                   </button>
               </div>
           </div>
       )}
    </div>
  );

  const renderPlot = (plot: Plot) => {
      const isLocked = plot.status === 'locked';
      const isEmpty = plot.status === 'empty';
      const isSelected = selectedPlot?.id === plot.id;
      const isAnimating = animationEffect?.plotId === plot.id;
      
      return (
        <div 
          key={plot.id}
          onClick={() => {
              if (visitMode) {
                  // If visiting, maybe simple interact animation
                  if (plot.tree) setAnimationEffect({ plotId: plot.id, type: 'grow' });
              } else {
                  if (!isLocked) setSelectedPlot(plot);
                  if (isLocked) handleBuyPlot(plot.id, plot.price);
              }
          }}
          className={`
            aspect-square relative rounded-[30px] flex items-center justify-center transition-all duration-300
            ${isLocked ? 'bg-black/30 border border-white/5' : 'bg-[#0f2e23] border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'}
            ${isSelected ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 z-10' : ''}
            ${isAnimating && animationEffect?.type === 'grow' ? 'animate-tree-pop' : ''}
          `}
        >
            {/* Soil Texture */}
            {!isLocked && <div className="absolute inset-2 rounded-[25px] bg-[#1a4032] opacity-50"></div>}

            {/* Content */}
            {isLocked ? (
                <div className="text-center">
                    <Lock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-gray-500">{plot.price} T</span>
                </div>
            ) : isEmpty ? (
                <div className="text-emerald-500/30 animate-pulse cursor-pointer">
                    <div className="w-12 h-12 border-2 border-dashed border-emerald-500/30 rounded-full flex items-center justify-center">
                        <span className="text-2xl">+</span>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center">
                    {/* Falling Fruit Animation */}
                    {isAnimating && animationEffect?.type === 'fruit' && (
                        <>
                            <div className="absolute top-0 left-0 text-yellow-400 animate-fruit-drop">✨</div>
                            <div className="absolute top-0 right-0 text-yellow-400 animate-fruit-drop" style={{animationDelay: '0.2s'}}>✨</div>
                        </>
                    )}
                    
                    {/* Tree Icon */}
                    <div className={`${TREE_STATS[plot.tree!.type].color} drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] transform transition-transform duration-500`}>
                        {React.createElement(TREE_STATS[plot.tree!.type].icon, { 
                            size: 32 + (plot.tree!.level * 2), // Grows visually
                            strokeWidth: 1.5 
                        })}
                    </div>

                    {/* Level Badge */}
                    <div className="absolute -bottom-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold text-white">Lvl {plot.tree!.level}</span>
                    </div>
                </div>
            )}
        </div>
      );
  };

  const renderSponsors = () => (
      <div className="p-4 pb-24">
          <h2 className="text-2xl font-bold text-white mb-6">Спонсоры Экосистемы</h2>
          
          {/* Daily Gift Banner */}
          <div className="liquid-card p-6 mb-8 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-purple-500/30">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-xl font-bold text-white mb-1">Ежедневный Дар</h3>
                      <p className="text-purple-200 text-sm">Спонсор сегодня: Yandex</p>
                  </div>
                  <Gift className="text-purple-400 w-8 h-8 animate-bounce" />
              </div>
              <button onClick={() => { setEnergy(e => e + 50); addNotification('Получено 50 Энергии!', 'success'); }} className="liquid-button w-full py-3 rounded-xl text-white font-bold">
                  Забрать награду
              </button>
          </div>

          <div className="grid gap-4">
              {partners.map(partner => (
                  <div key={partner.id} className={`liquid-card p-5 relative overflow-hidden group`}>
                      <div className={`absolute inset-0 bg-gradient-to-r ${partner.gradient} opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                      <div className="relative z-10 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                 {partner.logo}
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg text-white">{partner.name}</h3>
                                 <p className="text-xs text-gray-400">{partner.description}</p>
                             </div>
                         </div>
                         <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                             <ArrowUpRight size={20} className="text-gray-300" />
                         </button>
                      </div>
                      <div className="mt-4 space-y-2 relative z-10">
                          {partner.quests.map(q => (
                              <div key={q.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                  <span className="text-sm text-gray-300">{q.text}</span>
                                  <span className="text-xs font-bold text-yellow-400">+{q.reward} NUN</span>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderRealTrees = () => (
      <div className="p-4 pb-24">
         <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-white">Банк Семян (NFT)</h2>
             <div className="flex gap-2 text-xs">
                 <button className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/50">Все</button>
                 <button className="px-3 py-1 bg-black/30 text-gray-400 rounded-full">RWA</button>
             </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
             {REAL_TREES.map(tree => (
                 <div key={tree.id} className={`liquid-card p-0 flex flex-col h-full group`}>
                     <div className={`h-24 ${tree.bg} flex items-center justify-center text-4xl relative overflow-hidden`}>
                         <span className="relative z-10 group-hover:scale-110 transition-transform">{tree.image}</span>
                         {tree.isSponsored && <span className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-300 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30">Sponsored</span>}
                     </div>
                     <div className="p-3 flex-1 flex flex-col">
                         <h3 className="font-bold text-sm text-white leading-tight mb-1">{tree.name}</h3>
                         <div className="flex items-center gap-1 mb-2">
                             <Leaf size={10} className="text-emerald-400"/>
                             <span className="text-xs text-emerald-400">-{tree.co2} кг CO₂</span>
                         </div>
                         <div className="text-[10px] text-gray-400 mb-3">{tree.req}</div>
                         <button 
                             onClick={() => handleBuyRealTree(tree.id, tree.cost)}
                             className="mt-auto liquid-button w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1"
                         >
                             <span>{tree.cost}</span>
                             <span className="opacity-70">NUN</span>
                         </button>
                     </div>
                 </div>
             ))}
         </div>
      </div>
  );

  const renderImpact = () => (
      <div className="p-4 pb-24">
          <h2 className="text-2xl font-bold text-white mb-6">Ваш Вклад</h2>
          
          {/* Main Counter */}
          <div className="liquid-card p-6 mb-8 text-center bg-gradient-to-br from-emerald-900/40 to-black/40">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Общий офсет CO₂</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {realTreesOwned.reduce((acc, id) => acc + (REAL_TREES.find(t=>t.id===id)?.co2 || 0), 0)} кг
              </div>
              <div className="mt-4 flex justify-center gap-2">
                 <div className="h-2 w-full max-w-[200px] bg-gray-700 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[10%]"></div>
                 </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Цель: 1 Тонна</div>
          </div>

          {/* Equivalents */}
          <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="liquid-card p-4 flex flex-col items-center text-center">
                  <Car className="text-orange-400 mb-2" />
                  <div className="text-xl font-bold text-white">120</div>
                  <div className="text-xs text-gray-400">Км на авто</div>
              </div>
              <div className="liquid-card p-4 flex flex-col items-center text-center">
                  <Plane className="text-blue-400 mb-2" />
                  <div className="text-xl font-bold text-white">0.5</div>
                  <div className="text-xs text-gray-400">Часов полета</div>
              </div>
          </div>

          {/* How It Works Timeline */}
          <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Путь вашего дерева</h3>
              <div className="space-y-6 relative pl-4 border-l border-gray-700 ml-2">
                  <div className="relative pl-6">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#020617]"></div>
                      <h4 className="font-bold text-emerald-400">Покупка в Игре</h4>
                      <p className="text-xs text-gray-400">Вы покупаете NFT дерево за токены NUN.</p>
                  </div>
                  <div className="relative pl-6">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-gray-700 border-4 border-[#020617]"></div>
                      <h4 className="font-bold text-gray-300">Посадка Партнером</h4>
                      <p className="text-xs text-gray-400">Наш партнер сажает реальный саженец в выбранной зоне.</p>
                  </div>
                  <div className="relative pl-6">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-gray-700 border-4 border-[#020617]"></div>
                      <h4 className="font-bold text-gray-300">Верификация</h4>
                      <p className="text-xs text-gray-400">Фото, координаты и данные заносятся в блокчейн.</p>
                  </div>
              </div>
          </div>

          {/* Active Projects */}
          <h3 className="text-lg font-bold text-white mb-4">Активные Проекты</h3>
          <div className="space-y-3">
              <div className="liquid-card p-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-cover bg-center rounded-lg" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&q=80&w=100)'}}></div>
                  <div>
                      <div className="font-bold text-white">Восстановление Сибири</div>
                      <div className="text-xs text-gray-400">Россия • Хвойные леса</div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderProfile = () => (
      <div className="p-4 pb-24">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Профиль</h2>
              <Settings className="text-gray-400" />
          </div>

          {/* User Card */}
          <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 relative">
                  <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center text-4xl">
                      {user.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#020617] flex items-center justify-center text-[10px] font-bold">
                      {level}
                  </div>
              </div>
              <div className="flex-1">
                  <div className="text-white font-bold text-xl">{user.name}</div>
                  <div className="text-gray-400 text-sm">{user.handle}</div>
                  <div className="flex gap-2 mt-2">
                      <button onClick={() => setShowWallet(true)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <Wallet size={12}/> Кошелек
                      </button>
                      <button onClick={() => setShowReferral(true)} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                          Invite
                      </button>
                  </div>
              </div>
          </div>

          {/* TON Connect Status */}
          <div className="liquid-card p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                      <span className="font-bold text-xs">TON</span>
                  </div>
                  <div>
                      <div className="text-white font-bold text-sm">TON Connect</div>
                      <div className="text-xs text-gray-400">{user.tonAddress ? `${user.tonAddress.slice(0,4)}...${user.tonAddress.slice(-4)}` : 'Не подключен'}</div>
                  </div>
              </div>
              <button 
                onClick={() => user.tonAddress ? setShowWallet(true) : setShowTonConnect(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold ${user.tonAddress ? 'bg-gray-700/50 text-gray-300' : 'bg-blue-600 text-white'}`}
              >
                  {user.tonAddress ? 'Открыть' : 'Connect'}
              </button>
          </div>

          {/* Social Hub */}
          <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => setShowChat(true)} className="liquid-card p-4 flex flex-col items-center gap-2 hover:bg-white/5">
                  <MessageCircle className="text-cyan-400" />
                  <span className="text-sm font-bold text-white">Чат</span>
                  {messages.length > 0 && <span className="text-[10px] text-gray-400">{messages.length} сообщений</span>}
              </button>
              <button className="liquid-card p-4 flex flex-col items-center gap-2 hover:bg-white/5">
                  <Users className="text-purple-400" />
                  <span className="text-sm font-bold text-white">Друзья</span>
                  <span className="text-[10px] text-gray-400">{friends.length} друзей</span>
              </button>
          </div>

          {/* Friends List (Preview) */}
          <h3 className="text-lg font-bold text-white mb-4">Друзья</h3>
          <div className="space-y-3 mb-8">
              {friends.map(friend => (
                  <div key={friend.id} onClick={() => setShowFriendProfile(friend)} className="liquid-card p-3 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
                      <div className="flex items-center gap-3">
                          <span className="text-2xl">{friend.avatar}</span>
                          <div>
                              <div className="text-white font-bold text-sm">{friend.name}</div>
                              <div className="text-[10px] text-gray-400">{friend.status} • Lvl {friend.level}</div>
                          </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setVisitMode(friend); setActiveTab('forest'); }}
                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg"
                      >
                          Посетить
                      </button>
                  </div>
              ))}
          </div>

          {/* Achievements List */}
          <h3 className="text-lg font-bold text-white mb-4">Достижения</h3>
          <div className="space-y-3">
              {achievements.map(ach => (
                  <div key={ach.id} className={`liquid-card p-3 flex gap-4 ${!ach.unlocked && 'opacity-60 grayscale'}`}>
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ach.unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                           <ach.icon size={20} />
                       </div>
                       <div className="flex-1">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-bold text-white">{ach.title}</span>
                               <span className="text-[10px] text-emerald-400">+{ach.rewardXP} XP</span>
                           </div>
                           <div className="text-[10px] text-gray-400 mb-2">{ach.desc}</div>
                           <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500" style={{width: `${(ach.progress / ach.max) * 100}%`}}></div>
                           </div>
                       </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // --- MODALS ---

  const renderModals = () => (
      <>
        {/* Plot Interaction Modal */}
        {selectedPlot && !visitMode && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedPlot(null)}></div>
              <div className="liquid-card w-full max-w-sm m-4 p-6 pointer-events-auto animate-grow">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-emerald-900/40 flex items-center justify-center text-4xl border border-emerald-500/30 ${TREE_STATS[selectedPlot.tree!.type].color}`}>
                             {React.createElement(TREE_STATS[selectedPlot.tree!.type].icon)}
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white">{TREE_STATS[selectedPlot.tree!.type].name}</h3>
                              <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                  <span>Lvl {selectedPlot.tree!.level}</span>
                                  <span>•</span>
                                  <span className={TREE_STATS[selectedPlot.tree!.type].color}>{TREE_STATS[selectedPlot.tree!.type].rarity}</span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedPlot(null)} className="text-gray-400"><X /></button>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      <button onClick={() => handleCare('water')} className="liquid-button p-4 rounded-xl flex flex-col items-center gap-2 group">
                          <CloudRain className="text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-white">Полить</span>
                          <span className="text-[10px] text-gray-400">-1 Энергии</span>
                      </button>
                      <button onClick={() => handleCare('fertilize')} className="liquid-button p-4 rounded-xl flex flex-col items-center gap-2 group">
                          <Sparkles className="text-yellow-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-white">Удобрить</span>
                          <span className="text-[10px] text-gray-400">-1 Энергии</span>
                      </button>
                      <button onClick={() => handleCare('prune')} className="liquid-button p-4 rounded-xl flex flex-col items-center gap-2 group">
                          <Edit2 className="text-orange-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-white">Обрезать</span>
                          <span className="text-[10px] text-gray-400">-1 Энергии</span>
                      </button>
                      <button onClick={() => handleCare('protect')} className="liquid-button p-4 rounded-xl flex flex-col items-center gap-2 group">
                          <Shield className="text-purple-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-white">Защитить</span>
                          <span className="text-[10px] text-gray-400">-1 Энергии</span>
                      </button>
                  </div>
              </div>
           </div>
        )}

        {/* Shop Modal */}
        {showShop && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="liquid-card w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Магазин Саженцев</h2>
                        <button onClick={() => setShowShop(false)}><X className="text-gray-400"/></button>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-3 custom-scroll">
                        {(Object.entries(TREE_STATS) as [TreeType, any][]).filter(([k]) => !k.startsWith('brand')).map(([key, stat]) => (
                            <div key={key} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{stat.name}</div>
                                        <div className="text-[10px] text-gray-400">{stat.rarity} • +{stat.income} NUN/день</div>
                                    </div>
                                </div>
                                <button 
                                  onClick={() => { setSelectedPlot(plots.find(p=>p.status==='empty') || null); if(selectedPlot) handlePlant(key); else { setShowShop(false); addNotification('Выберите пустой участок', 'info'); } }}
                                  className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg"
                                >
                                    {stat.cost} T
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Tasks Modal */}
        {showTasks && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="liquid-card w-full max-w-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Ежедневные Задания</h2>
                        <button onClick={() => setShowTasks(false)}><X className="text-gray-400"/></button>
                    </div>
                    <div className="space-y-3">
                        {dailyTasks.map(task => (
                            <div key={task.id} className="bg-white/5 p-3 rounded-xl">
                                <div className="flex justify-between text-sm text-white mb-2">
                                    <span>{task.text}</span>
                                    <span className="text-yellow-400">+{task.reward} T</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${(task.current / task.max) * 100}%`}}></div>
                                </div>
                                {task.completed && (
                                    <div className="text-right mt-1">
                                        <span className="text-[10px] text-green-400 uppercase font-bold">Выполнено</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* TON Wallet Modal */}
        {showTonConnect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div className="liquid-card w-full max-w-sm p-6 text-center">
                    <div className="w-16 h-16 bg-blue-500 mx-auto rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Wallet className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Connect TON Wallet</h2>
                    <p className="text-gray-400 text-sm mb-6">Сканируйте QR код через Tonkeeper или выберите кошелек.</p>
                    
                    <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-48 h-48 flex items-center justify-center">
                        <QrCode className="w-40 h-40 text-black" />
                    </div>
                    
                    <button onClick={handleTonConnect} className="liquid-button w-full py-3 rounded-xl text-white font-bold mb-3">
                        Проверить подключение
                    </button>
                    <button onClick={() => setShowTonConnect(false)} className="text-gray-400 text-sm">Отмена</button>
                </div>
            </div>
        )}

        {/* Wallet Dashboard Modal */}
        {showWallet && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="liquid-card w-full max-w-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Кошелек</h2>
                        <button onClick={() => setShowWallet(false)}><X className="text-gray-400"/></button>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                         <div className="bg-emerald-900/30 p-3 rounded-xl border border-emerald-500/20">
                             <div className="text-xs text-gray-400 mb-1">Баланс NUN</div>
                             <div className="text-lg font-bold text-emerald-400">{tokens.toLocaleString()}</div>
                         </div>
                         <div className="bg-blue-900/30 p-3 rounded-xl border border-blue-500/20">
                             <div className="text-xs text-gray-400 mb-1">Баланс TON</div>
                             <div className="text-lg font-bold text-blue-400">{user.tonBalance} TON</div>
                         </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button onClick={handleDepositTon} className="liquid-button w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold">
                            <ArrowDownLeft size={18} /> Пополнить TON
                        </button>
                        <button disabled className="w-full py-3 rounded-xl bg-gray-800 text-gray-500 font-bold flex items-center justify-center gap-2 border border-gray-700 cursor-not-allowed">
                             <ArrowUpRight size={18} /> Вывод NUN
                             <span className="text-[10px] bg-red-500/20 text-red-400 px-2 rounded-full">Coming Soon</span>
                        </button>
                        <button disabled className="w-full py-3 rounded-xl bg-gray-800 text-gray-500 font-bold flex items-center justify-center gap-2 border border-gray-700 cursor-not-allowed">
                             <ArrowRightLeft size={18} /> Обмен (Swap)
                             <span className="text-[10px] bg-red-500/20 text-red-400 px-2 rounded-full">Listing</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Social Share / Story Generator */}
        {showSocialShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div className="liquid-card w-full max-w-sm p-6 text-center">
                    <h2 className="text-xl font-bold text-white mb-6">Поделиться Достижением</h2>
                    
                    {/* Story Preview */}
                    <div className="aspect-[9/16] bg-gradient-to-br from-emerald-900 to-[#020617] rounded-xl border border-emerald-500/30 p-6 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="z-10 text-center">
                            <div className="text-4xl mb-4">{user.avatar}</div>
                            <h3 className="text-2xl font-black text-white mb-1">NUNCYCLE</h3>
                            <p className="text-emerald-400 font-bold text-lg mb-4">Уровень {level}</p>
                            <div className="text-5xl font-black text-white mb-4">{realTreesOwned.length}</div>
                            <p className="text-gray-300 text-xs uppercase tracking-widest mb-8">Реальных Деревьев</p>
                            <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Join: {user.referralCode}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <button className="flex flex-col items-center gap-1 text-xs text-gray-400"><div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white"><Instagram /></div> Stories</button>
                        <button className="flex flex-col items-center gap-1 text-xs text-gray-400"><div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white"><Send /></div> Telegram</button>
                        <button className="flex flex-col items-center gap-1 text-xs text-gray-400"><div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white"><Twitter /></div> Twitter</button>
                        <button className="flex flex-col items-center gap-1 text-xs text-gray-400"><div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white"><Copy /></div> Copy</button>
                    </div>
                    
                    <button onClick={() => setShowSocialShare(false)} className="mt-6 text-gray-400 text-sm">Закрыть</button>
                </div>
            </div>
        )}
        
        {/* Chat Modal */}
        {showChat && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="liquid-card w-full max-w-sm h-[80vh] flex flex-col">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h2 className="text-lg font-bold text-white">Чат Лесников</h2>
                        <button onClick={() => setShowChat(false)}><X className="text-gray-400"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-black/10">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.senderId === 'me' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                    {msg.text}
                                    {msg.type === 'help_request' && (
                                        <button className="mt-2 w-full py-1 bg-white/20 rounded text-xs font-bold">Помочь (+10 XP)</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-white/10 flex gap-2">
                        <input type="text" placeholder="Сообщение..." className="flex-1 bg-black/30 border border-white/10 rounded-full px-4 text-white text-sm focus:outline-none focus:border-emerald-500" />
                        <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Send size={18}/></button>
                    </div>
                </div>
            </div>
        )}
      </>
  );

  if (!user.isLoggedIn) return renderAuth();
  // Fix: Commented out unreachable code that causes a TypeScript error due to unintentional comparison of boolean types.
  // if (onboardingStep < 4 && !user.isLoggedIn) return renderOnboarding(); // Only shows if manually triggered, currently auth skips it for simplicity, fixed logic:
  // Fix for onboarding logic: show onboarding if logged in but new? For now just show App content

  return (
    <div className="min-h-screen pb-safe-area font-nunito text-gray-100 relative selection:bg-emerald-500/30">
      <BackgroundBubbles />
      
      {/* Top Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-[#020617]/80 backdrop-blur-md flex justify-between items-center border-b border-white/5">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 text-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                 {user.avatar}
             </div>
             <div>
                 <div className="text-xs text-gray-400">Уровень {level}</div>
                 <div className="h-1.5 w-20 bg-gray-700 rounded-full mt-1 overflow-hidden">
                     <div className="h-full bg-emerald-400 transition-all duration-500" style={{width: `${(xp % LEVEL_XP_THRESHOLD) / LEVEL_XP_THRESHOLD * 100}%`}}></div>
                 </div>
             </div>
         </div>
         <div className="flex items-center gap-3">
             <div className="bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30 flex items-center gap-2">
                 <Coins className="text-yellow-400 w-4 h-4" />
                 <span className="font-bold text-sm text-yellow-100">{tokens.toLocaleString()}</span>
             </div>
             <div onClick={() => energy < 5 && addNotification('Попросить помощи в чате?', 'info')} className="bg-black/40 px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-2 cursor-pointer">
                 <Zap className="text-blue-400 w-4 h-4" />
                 <span className="font-bold text-sm text-blue-100">{energy}</span>
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-md mx-auto min-h-[calc(100vh-140px)]">
         {onboardingStep < 4 && user.isLoggedIn === false && renderOnboarding()} 
         {/* Fix for onboarding logic: show onboarding if logged in but new? For now just show App content */}
         
         {activeTab === 'forest' && renderForest()}
         {activeTab === 'sponsors' && renderSponsors()}
         {activeTab === 'real' && renderRealTrees()}
         {activeTab === 'impact' && renderImpact()}
         {activeTab === 'profile' && renderProfile()}
      </div>

      {/* Notifications Toast */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className="bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg border-l-4 border-emerald-500 animate-in fade-in slide-in-from-top-4 flex items-center gap-3">
                  {n.type === 'success' ? <CheckCircle2 className="text-emerald-500" size={20}/> : <Activity className="text-blue-500" size={20}/>}
                  <span className="text-sm font-medium">{n.text}</span>
              </div>
          ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center p-2 max-w-md mx-auto">
          <button 
            onClick={() => { setActiveTab('forest'); setVisitMode(null); }} 
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${activeTab === 'forest' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500'}`}
          >
            <TreeDeciduous size={24} strokeWidth={activeTab === 'forest' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Лес</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('sponsors')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${activeTab === 'sponsors' ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500'}`}
          >
            <Handshake size={24} strokeWidth={activeTab === 'sponsors' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Спонсоры</span>
          </button>

          <button 
            onClick={() => setActiveTab('real')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${activeTab === 'real' ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-500'}`}
          >
            <div className={`relative ${activeTab === 'real' ? 'scale-110' : ''}`}>
                <div className="absolute -inset-2 bg-yellow-500/20 blur-lg rounded-full"></div>
                <Globe size={24} className="relative z-10" strokeWidth={activeTab === 'real' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold mt-1">Real</span>
          </button>

          <button 
            onClick={() => setActiveTab('impact')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${activeTab === 'impact' ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500'}`}
          >
            <Activity size={24} strokeWidth={activeTab === 'impact' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Вклад</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 ${activeTab === 'profile' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500'}`}
          >
            <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Профиль</span>
          </button>
        </div>
      </div>

      {/* Render All Modals */}
      {renderModals()}

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
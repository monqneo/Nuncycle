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
  ThermometerSun,
  ShoppingBag,
  MapPin,
  Info,
  Clock,
  Camera as CameraIcon,
  Scissors as ScissorsIcon
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

interface RealTreeSpecies {
  id: string;
  name: string;
  cost: number;
  co2: number;
  image: string;
  region: string;
  desc: string;
  bg: string;
}

interface MyRealTreeInstance {
  id: string;
  speciesId: string;
  customName: string;
  purchaseDate: string;
  gps: string;
  history: { date: string; title: string; desc: string; icon: any }[];
}

const LEVEL_XP_THRESHOLD = 200;
const MAX_ENERGY = 9999; // Unlimited for test user

const TREE_STATS: Record<TreeType, { name: string; income: number; cost: number; rarity: string; color: string; icon: any; desc: string }> = {
  // Starters
  basic: { name: 'Эко-Дуб', income: 8, cost: 50, rarity: 'Обычное', color: 'text-green-400', icon: TreeDeciduous, desc: 'Базовое дерево. Стабильный доход токенов.' },
  protective: { name: 'Щит-Ива', income: 6, cost: 80, rarity: 'Необычное', color: 'text-cyan-400', icon: TreePine, desc: 'Увеличивает защиту соседних участков.' },
  synergetic: { name: 'Нейро-Цвет', income: 12, cost: 120, rarity: 'Редкое', color: 'text-purple-400', icon: Flower2, desc: 'Синергия с другими деревьями, бонус к XP.' },
  
  // Advanced Virtual Trees
  neon_cactus: { name: 'Неон-Кактус', income: 14, cost: 160, rarity: 'Редкое', color: 'text-pink-400', icon: TreePine, desc: 'Накапливает энергию днем, светится ночью.' },
  crystal_spruce: { name: 'Кристальная Ель', income: 18, cost: 220, rarity: 'Эпик', color: 'text-blue-300', icon: TreePine, desc: 'Генерирует токены через резонанс блокчейна.' },
  magma_pine: { name: 'Магма-Пальма', income: 22, cost: 300, rarity: 'Эпик', color: 'text-orange-500', icon: TreePalm, desc: 'Редкий вид, растущий на вулканической почве.' },
  cyber_bonsai: { name: 'Кибер-Бонсай', income: 25, cost: 400, rarity: 'Легендарное', color: 'text-emerald-300', icon: Sprout, desc: 'Идеальный баланс цифрового кода и природы.' },
  void_willow: { name: 'Ива Пустоты', income: 30, cost: 550, rarity: 'Мифическое', color: 'text-indigo-400', icon: TreeDeciduous, desc: 'Поглощает цифровой шум, превращая в токены.' },
  quantum_maple: { name: 'Квантовый Клен', income: 40, cost: 800, rarity: 'Мифическое', color: 'text-violet-400', icon: TreeDeciduous, desc: 'Существует одновременно в двух состояниях.' },

  // Branded Trees
  brand_adidas: { name: 'Adidas Bio-Mesh', income: 15, cost: 200, rarity: 'Бренд', color: 'text-blue-300', icon: TreePalm, desc: 'Лимитированная серия от Adidas Earth Fund.' },
  brand_google: { name: 'Google Quantum Root', income: 18, cost: 250, rarity: 'Бренд', color: 'text-orange-300', icon: TreeDeciduous, desc: 'Оптимизирует рост через ML алгоритмы.' },
  brand_patagonia: { name: 'Patagonia Wild', income: 14, cost: 180, rarity: 'Бренд', color: 'text-teal-300', icon: TreePine, desc: 'Символ дикой природы.' },
  brand_yandex: { name: 'Yandex Neuro-Birch', income: 16, cost: 220, rarity: 'Бренд', color: 'text-red-400', icon: TreeDeciduous, desc: 'Локализованный вид, устойчив к холоду.' },
  brand_kaspi: { name: 'Kaspi Gold Tree', income: 20, cost: 300, rarity: 'Бренд', color: 'text-yellow-500', icon: TreePalm, desc: 'Приносит золотые плоды.' },
  brand_amazon: { name: 'Amazon Prime Palm', income: 17, cost: 240, rarity: 'Бренд', color: 'text-yellow-400', icon: TreePalm, desc: 'Быстрый рост и доставка кислорода.' },
  brand_meta: { name: 'Metaverse Willow', income: 19, cost: 260, rarity: 'Бренд', color: 'text-blue-500', icon: TreePine, desc: 'Дерево из виртуальной реальности.' },
  brand_samsung: { name: 'Samsung Galaxy Sprout', income: 18, cost: 250, rarity: 'Бренд', color: 'text-indigo-400', icon: Flower2, desc: 'Технологичное цветение.' },
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

// REAL WORLD TREES - Requested 5 Species
const REAL_TREES_SPECIES: RealTreeSpecies[] = [
  { 
    id: 'poplar', 
    name: 'Тополь', 
    cost: 500, 
    co2: 150, 
    image: '🌳', 
    region: 'Городские парки, СНГ', 
    desc: 'Быстрорастущее дерево, отличный фильтр воздуха.', 
    bg: 'bg-emerald-900/50' 
  },
  { 
    id: 'birch', 
    name: 'Береза', 
    cost: 800, 
    co2: 250, 
    image: '🌿', 
    region: 'Средняя полоса, Лесничества', 
    desc: 'Символ русской природы, неприхотлива к почве.', 
    bg: 'bg-lime-900/50' 
  },
  { 
    id: 'apple', 
    name: 'Яблоня', 
    cost: 1200, 
    co2: 180, 
    image: '🍎', 
    region: 'Фруктовые сады, Юг', 
    desc: 'Приносит плоды и красиво цветет весной.', 
    bg: 'bg-red-900/40' 
  },
  { 
    id: 'thuja', 
    name: 'Туя', 
    cost: 1500, 
    co2: 120, 
    image: '🌲', 
    region: 'Декоративные зоны, Аллеи', 
    desc: 'Вечнозеленое растение, очищает воздух от микробов.', 
    bg: 'bg-emerald-800/50' 
  },
  { 
    id: 'spruce', 
    name: 'Ель', 
    cost: 2000, 
    co2: 350, 
    image: '🌲', 
    region: 'Тайга, Северные регионы', 
    desc: 'Мощный производитель кислорода круглый год.', 
    bg: 'bg-teal-900/50' 
  }
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
  const [activeTab, setActiveTab] = useState<'forest' | 'shop' | 'sponsors' | 'real' | 'impact' | 'profile'>('forest');
  const [tokens, setTokens] = useState(10000000); // 10 Million NUN (Test User)
  const [energy, setEnergy] = useState(MAX_ENERGY); 
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [myRealTrees, setMyRealTrees] = useState<MyRealTreeInstance[]>([]);
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
  const [showTasks, setShowTasks] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showStoryGen, setShowStoryGen] = useState(false);
  const [showTonConnect, setShowTonConnect] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); // NEW: Edit Profile
  const [showFriendProfile, setShowFriendProfile] = useState<Friend | null>(null);
  const [plantingPlotId, setPlantingPlotId] = useState<number | null>(null);
  const [animationEffect, setAnimationEffect] = useState<{ plotId: number, type: 'grow' | 'fruit' } | null>(null);
  const [visitMode, setVisitMode] = useState<Friend | null>(null);
  const [viewingRealTree, setViewingRealTree] = useState<MyRealTreeInstance | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Edit Profile Temp State
  const [tempName, setTempName] = useState(user.name);
  const [tempHandle, setTempHandle] = useState(user.handle);
  const [tempAvatar, setTempAvatar] = useState(user.avatar);

  // Effects
  useEffect(() => {
    const saved = localStorage.getItem('nuncycle_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tokens !== undefined) setTokens(parsed.tokens);
        if (parsed.energy !== undefined) setEnergy(parsed.energy);
        if (parsed.xp !== undefined) setXP(parsed.xp);
        if (parsed.level !== undefined) setLevel(parsed.level);
        if (parsed.plots !== undefined) setPlots(parsed.plots);
        if (parsed.user !== undefined) setUser(parsed.user);
        if (parsed.myRealTrees !== undefined) setMyRealTrees(parsed.myRealTrees);
        if (parsed.achievements !== undefined) setAchievements(parsed.achievements);
        if (parsed.dailyTasks !== undefined) setDailyTasks(parsed.dailyTasks);
      } catch (e) { console.error("Save load error", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nuncycle_state', JSON.stringify({ 
        tokens, energy, xp, level, plots, user, myRealTrees, achievements, dailyTasks 
    }));
  }, [tokens, energy, xp, level, plots, user, myRealTrees, achievements, dailyTasks]);

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

  const saveProfile = () => {
    setUser(prev => ({ ...prev, name: tempName, handle: tempHandle, avatar: tempAvatar }));
    setShowEditProfile(false);
    addNotification('Профиль обновлен', 'success');
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

  const handlePlant = (type: TreeType, targetPlotId?: number | null) => {
    // Auto select first empty plot if none selected
    let plotToPlant: Plot | undefined | null = null;
    
    if (targetPlotId) {
        plotToPlant = plots.find(p => p.id === targetPlotId);
    } else if (selectedPlot) {
        plotToPlant = selectedPlot;
    } else {
        plotToPlant = plots.find(p => p.status === 'empty');
    }

    if (!plotToPlant) {
        addNotification('Нет свободных участков!', 'info');
        setActiveTab('forest');
        return;
    }

    const treeStat = TREE_STATS[type];
    if (tokens >= treeStat.cost) {
      setTokens(prev => prev - treeStat.cost);
      setPlots(prev => prev.map(p => p.id === plotToPlant!.id ? { 
        ...p, 
        status: 'planted', 
        tree: { type, level: 1, xp: 0, health: 100, lastWatered: Date.now(), isDiseased: false } 
      } : p));
      
      addNotification(`${treeStat.name} посажено!`, 'success');
      setSelectedPlot(null);
      setPlantingPlotId(null); // Close selection modal
      setActiveTab('forest'); 
      updateAchievement('first_tree', 1);
      updateAchievement('planted', plots.filter(p => p.status === 'planted').length + 1);
      
      // Animation
      setTimeout(() => {
          setAnimationEffect({ plotId: plotToPlant!.id, type: 'grow' });
          setTimeout(() => setAnimationEffect(null), 1000);
      }, 500);

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

  const handleBuyRealTree = (speciesId: string, cost: number) => {
    if (tokens >= cost) {
        setTokens(prev => prev - cost);
        
        const species = REAL_TREES_SPECIES.find(s => s.id === speciesId)!;
        const newTree: MyRealTreeInstance = {
            id: `rt_${Date.now()}`,
            speciesId,
            customName: species.name,
            purchaseDate: new Date().toLocaleDateString(),
            gps: `${(Math.random() * 100).toFixed(4)}, ${(Math.random() * 100).toFixed(4)}`, // Mock coords
            history: [
                { date: new Date().toLocaleDateString(), title: 'Заказ оформлен', desc: 'Дерево зарезервировано в питомнике.', icon: CheckCircle2 }
            ]
        };

        setMyRealTrees(prev => [...prev, newTree]);
        addNotification('Поздравляем! Дерево куплено.', 'success');
        updateAchievement('real_tree', myRealTrees.length + 1);
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

  const handleSendMessage = () => {
      if (!chatInput.trim()) return;
      const newMsg: Message = { id: `m_${Date.now()}`, senderId: 'me', text: chatInput, type: 'text', timestamp: Date.now() };
      setMessages(prev => [...prev, newMsg]);
      setChatInput('');
      
      // Auto reply simulation
      setTimeout(() => {
          const reply: Message = { 
              id: `m_${Date.now()+1}`, 
              senderId: 'f1', 
              text: 'Отлично! Заходи ко мне на поляну, помоги с поливом 🌿', 
              type: 'text', 
              timestamp: Date.now() 
          };
          setMessages(prev => [...prev, reply]);
      }, 2000);
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
                    setOnboardingStep(steps.length);
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
          </div>
          <div className="text-right">
              <div className="text-xs text-gray-400">Ваш Лес</div>
              <div className="text-emerald-400 font-bold">День 12</div>
          </div>
       </div>

       {/* Info Tip */}
       <div className="mb-4 flex items-center gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded-lg">
           <Info size={14} className="text-emerald-400" />
           <span>Сажайте деревья в пустые слоты (+) и ухаживайте за ними.</span>
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
      const isPlanted = plot.status === 'planted' && plot.tree !== null; // Strict check
      const isSelected = selectedPlot?.id === plot.id;
      const isAnimating = animationEffect?.plotId === plot.id;
      
      return (
        <div 
          key={plot.id}
          onClick={() => {
              if (visitMode) {
                  // If visiting, maybe simple interact animation
                  if (plot.tree) {
                      setAnimationEffect({ plotId: plot.id, type: 'grow' });
                      setTimeout(() => setAnimationEffect(null), 500);
                  }
              } else {
                  if (!isLocked) {
                      if (isPlanted) {
                          setAnimationEffect({ plotId: plot.id, type: 'grow' });
                          setTimeout(() => setAnimationEffect(null), 500);
                          setSelectedPlot(plot);
                      }
                      
                      if (isEmpty) {
                          setPlantingPlotId(plot.id); // Open selection modal
                      }
                  }
                  if (isLocked) handleBuyPlot(plot.id, plot.price);
              }
          }}
          className={`
            aspect-square relative rounded-[30px] flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer active:scale-95
            ${isLocked ? 'bg-black/30 border border-white/5' : 'bg-[#0f2e23] border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'}
            ${isSelected ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 z-10' : ''}
            ${isAnimating && animationEffect?.type === 'grow' ? 'animate-tree-pop' : ''}
          `}
        >
            {/* Soil Texture */}
            {!isLocked && <div className="absolute inset-0 bg-[#1a4032] opacity-50"></div>}
            
            {/* Growth Stage Background Effect (Liquid Fill) */}
             {isPlanted && plot.tree && (
                 <div 
                    className="absolute inset-0 bg-emerald-500/10 transition-all duration-700 ease-in-out pointer-events-none" 
                    style={{ height: `${plot.tree.xp}%`, top: 'auto', bottom: 0 }}
                 ></div>
             )}

            {/* Content */}
            {isLocked ? (
                <div className="text-center relative z-10">
                    <Lock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-gray-500">{plot.price} T</span>
                </div>
            ) : isEmpty ? (
                <div className="text-emerald-500/30 animate-pulse cursor-pointer relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 border-2 border-dashed border-emerald-500/30 rounded-full flex items-center justify-center mb-1">
                        <span className="text-xl">+</span>
                    </div>
                    <span className="text-[10px] font-bold">Сажать</span>
                </div>
            ) : isPlanted && plot.tree ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                    {/* SVG Progress Ring */}
                     <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <circle 
                            cx="50" cy="50" r="44" 
                            fill="none" 
                            stroke="url(#progress-gradient)" 
                            strokeWidth="4" 
                            strokeDasharray="276" 
                            strokeDashoffset={276 - (276 * plot.tree.xp / 100)} 
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                        />
                         <defs>
                            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                         </defs>
                     </svg>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Falling Fruit Animation */}
                        {isAnimating && animationEffect?.type === 'fruit' && (
                            <>
                                <div className="absolute top-0 left-0 text-yellow-400 animate-fruit-drop">✨</div>
                                <div className="absolute top-0 right-0 text-yellow-400 animate-fruit-drop" style={{animationDelay: '0.2s'}}>✨</div>
                            </>
                        )}
                        
                        {/* Tree Icon with Selected Glow Animation */}
                        {TREE_STATS[plot.tree.type] ? (
                            <div className={`${TREE_STATS[plot.tree.type].color} drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ${isSelected ? 'animate-selected-glow' : ''}`}>
                                {React.createElement(TREE_STATS[plot.tree.type].icon, { 
                                    size: 32 + (plot.tree.level * 2), // Grows visually
                                    strokeWidth: 1.5 
                                })}
                            </div>
                        ) : <div>?</div>}

                        {/* Level Badge */}
                        <div className="absolute -bottom-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold text-white">Lvl {plot.tree.level}</span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
      );
  };

  const renderShop = () => (
      <div className="p-4 pb-24">
          <h2 className="text-2xl font-bold text-white mb-2">Банк Семян (Магазин)</h2>
          <p className="text-gray-400 text-sm mb-6">Приобретайте семена для вашего виртуального леса. Каждое дерево имеет уникальные бонусы.</p>

          <div className="grid grid-cols-2 gap-3">
              {(Object.entries(TREE_STATS) as [TreeType, any][]).filter(([k]) => !k.startsWith('brand')).map(([key, stat]) => (
                  <div key={key} className="liquid-card p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                          <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${stat.color}`}>
                              <stat.icon size={20} />
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300 border border-white/5">{stat.rarity}</span>
                      </div>
                      
                      <div className="mb-2">
                          <div className="font-bold text-white text-sm leading-tight">{stat.name}</div>
                          <div className="text-[10px] text-emerald-400 mt-0.5">+{stat.income} NUN/день</div>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 leading-tight mb-3 line-clamp-2 h-8">{stat.desc}</p>

                      <button 
                          onClick={() => handlePlant(key)}
                          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-colors flex items-center justify-center gap-1 active:scale-95"
                      >
                          <span>Купить</span>
                          <span className="bg-emerald-500/20 px-1 rounded text-[10px]">{stat.cost} T</span>
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSponsors = () => (
      <div className="p-4 pb-24">
          <h2 className="text-2xl font-bold text-white mb-2">Спонсоры</h2>
          <p className="text-gray-400 text-sm mb-6">Выполняйте квесты брендов и получайте уникальные награды.</p>
          
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
         <div className="mb-6">
             <h2 className="text-2xl font-bold text-white mb-2">Real World Assets (RWA)</h2>
             <p className="text-gray-400 text-sm">Покупайте настоящие деревья за токены. Мы сажаем их в реальном мире, присваиваем GPS и следим за ростом.</p>
         </div>

         {/* My Real Trees Section */}
         {myRealTrees.length > 0 && (
             <div className="mb-8">
                 <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                     <Leaf size={16}/> Мои Деревья ({myRealTrees.length})
                 </h3>
                 <div className="space-y-3">
                     {myRealTrees.map(tree => {
                         const species = REAL_TREES_SPECIES.find(s => s.id === tree.speciesId)!;
                         return (
                             <div key={tree.id} onClick={() => setViewingRealTree(tree)} className="liquid-card p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
                                 <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-full ${species.bg} flex items-center justify-center text-2xl`}>
                                         {species.image}
                                     </div>
                                     <div>
                                         <div className="font-bold text-white text-sm">{tree.customName}</div>
                                         <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                             <MapPin size={10}/> {tree.gps}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                                         Active
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             </div>
         )}

         <h3 className="text-lg font-bold text-white mb-4">Доступные участки</h3>
         <div className="grid grid-cols-1 gap-4">
             {REAL_TREES_SPECIES.map(tree => (
                 <div key={tree.id} className={`liquid-card p-0 flex flex-row overflow-hidden group h-32`}>
                     <div className={`w-28 ${tree.bg} flex items-center justify-center text-5xl relative`}>
                         <span className="relative z-10">{tree.image}</span>
                     </div>
                     <div className="p-4 flex-1 flex flex-col justify-between">
                         <div>
                             <div className="flex justify-between items-start">
                                 <h3 className="font-bold text-lg text-white leading-tight">{tree.name}</h3>
                                 <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                                     <Leaf size={10} />
                                     <span>-{tree.co2} кг CO₂</span>
                                 </div>
                             </div>
                             <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                 <MapPin size={10}/> {tree.region}
                             </div>
                             <p className="text-xs text-gray-500 mt-2 line-clamp-2">{tree.desc}</p>
                         </div>
                         
                         <button 
                             onClick={() => handleBuyRealTree(tree.id, tree.cost)}
                             className="mt-2 liquid-button w-full py-2 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-1"
                         >
                             <span>Купить за {tree.cost}</span>
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
          <h2 className="text-2xl font-bold text-white mb-2">Ваш Вклад</h2>
          <p className="text-gray-400 text-sm mb-6">Как ваши игровые действия влияют на реальный мир.</p>
          
          {/* Main Counter */}
          <div className="liquid-card p-6 mb-8 text-center bg-gradient-to-br from-emerald-900/40 to-black/40">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Общий офсет CO₂</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {myRealTrees.reduce((acc, t) => acc + (REAL_TREES_SPECIES.find(s=>s.id===t.speciesId)?.co2 || 0), 0)} кг
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
                      <p className="text-xs text-gray-400">Вы покупаете RWA дерево за токены NUN.</p>
                  </div>
                  <div className="relative pl-6">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-gray-700 border-4 border-[#020617]"></div>
                      <h4 className="font-bold text-gray-300">Посадка Партнером</h4>
                      <p className="text-xs text-gray-400">Наш эко-партнер сажает дерево в выбранной зоне.</p>
                  </div>
                  <div className="relative pl-6">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-gray-700 border-4 border-[#020617]"></div>
                      <h4 className="font-bold text-gray-300">GPS & Фотоотчет</h4>
                      <p className="text-xs text-gray-400">Вы получаете координаты и NFT паспорт дерева.</p>
                  </div>
              </div>
          </div>

           {/* Active Projects */}
           <div>
               <h3 className="text-lg font-bold text-white mb-4">Активные Эко-Проекты</h3>
               <div className="grid grid-cols-1 gap-3">
                   {['Леса Сибири', 'Восстановление Амазонии', 'Зеленый Казахстан'].map((p, i) => (
                       <div key={i} className="liquid-card p-3 flex items-center justify-between">
                           <span className="text-sm font-bold text-gray-300">{p}</span>
                           <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">Активен</span>
                       </div>
                   ))}
               </div>
           </div>
      </div>
  );

  const renderProfile = () => (
      <div className="p-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      {user.avatar}
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-white">{user.name}</h2>
                      <div className="text-sm text-emerald-400 font-mono">{user.handle}</div>
                      <div className="text-xs text-gray-400">В игре с {user.joinDate}</div>
                  </div>
              </div>
              <button 
                onClick={() => {
                   setTempName(user.name);
                   setTempHandle(user.handle);
                   setTempAvatar(user.avatar);
                   setShowEditProfile(true);
                }} 
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                  <Edit2 size={16} />
              </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="liquid-card p-4">
                   <div className="text-gray-400 text-xs mb-1">Уровень</div>
                   <div className="text-2xl font-bold text-white">{level}</div>
               </div>
               <div className="liquid-card p-4">
                   <div className="text-gray-400 text-xs mb-1">Приглашено</div>
                   <div className="text-2xl font-bold text-white">{user.invitedCount}</div>
               </div>
          </div>

          {/* Wallet Section */}
          <div className="liquid-card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                      <Wallet className="text-blue-400" />
                      <span className="font-bold text-white">TON Wallet</span>
                  </div>
                  {user.tonAddress ? (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">{user.tonAddress}</span>
                  ) : (
                      <span className="text-xs text-gray-500">Не подключен</span>
                  )}
              </div>
              
              {!user.tonAddress ? (
                  <button onClick={() => setShowTonConnect(true)} className="liquid-button w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold">
                      <Zap size={16} /> Подключить TON
                  </button>
              ) : (
                  <div className="space-y-2">
                      <div className="text-2xl font-bold text-white text-center mb-2">{user.tonBalance} TON</div>
                      <div className="grid grid-cols-2 gap-2">
                          <button onClick={handleDepositTon} className="py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 font-bold hover:bg-blue-500/30">
                              Пополнить
                          </button>
                          <button disabled className="py-2 bg-gray-800 text-gray-500 rounded-lg border border-gray-700 cursor-not-allowed flex items-center justify-center gap-1">
                              Вывести <span className="text-[8px] bg-gray-700 px-1 rounded">SOON</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>

          {/* Socials */}
          <div className="mb-6">
              <h3 className="font-bold text-white mb-3">Социальное</h3>
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowReferral(true)} className="liquid-button py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2">
                      <Users size={18} /> Рефералы
                  </button>
                  <button onClick={() => setShowSocialShare(true)} className="liquid-button py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2">
                      <Share2 size={18} /> Поделиться
                  </button>
              </div>
          </div>
          
          <div className="mb-6">
              <button onClick={() => setShowChat(true)} className="w-full py-4 bg-indigo-600/20 border border-indigo-500/50 rounded-xl text-indigo-300 font-bold flex items-center justify-center gap-2">
                  <MessageCircle /> Чат с друзьями
              </button>
          </div>

          {/* Achievements */}
          <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Trophy size={16} className="text-yellow-400"/> Достижения</h3>
              <div className="space-y-3">
                  {achievements.map(ach => (
                      <div key={ach.id} className={`liquid-card p-3 flex items-center gap-4 ${ach.unlocked ? 'border-yellow-500/30' : 'opacity-70 grayscale'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>
                              <ach.icon size={20} />
                          </div>
                          <div className="flex-1">
                              <div className="text-sm font-bold text-white">{ach.title}</div>
                              <div className="text-xs text-gray-400">{ach.desc}</div>
                              <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-yellow-400" style={{ width: `${(ach.progress / ach.max) * 100}%` }}></div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
        {[
            { id: 'forest', icon: TreeDeciduous, label: 'Лес' },
            { id: 'shop', icon: ShoppingBag, label: 'Магазин' },
            { id: 'real', icon: Globe, label: 'Real' },
            { id: 'sponsors', icon: HeartHandshake, label: 'Спонсоры' },
            { id: 'impact', icon: Activity, label: 'Вклад' },
            { id: 'profile', icon: User, label: 'Профиль' }
        ].map(item => (
            <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.id ? 'text-emerald-400 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
            </button>
        ))}
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col font-sans text-gray-100 selection:bg-emerald-500/30 relative">
      <BackgroundBubbles />

      {!user.isLoggedIn && onboardingStep < 4 && renderOnboarding()}
      {!user.isLoggedIn && onboardingStep === 4 && renderAuth()}
      
      {/* Top Bar */}
      {user.isLoggedIn && (
          <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-lg px-4 py-3 border-b border-white/5 flex justify-between items-center shadow-lg shrink-0">
              <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Баланс</span>
                      <div className="flex items-center gap-1.5">
                          <Coins size={16} className="text-yellow-400" />
                          <span className="font-tech font-bold text-lg tracking-wide">{tokens.toLocaleString()}</span>
                      </div>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Энергия</span>
                       <div className="flex items-center gap-1.5">
                           <Zap size={16} className="text-blue-400" />
                           <span className="font-tech font-bold text-lg tracking-wide">{energy}/{MAX_ENERGY}</span>
                       </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  <div className="bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2">
                       <span className="text-xs font-bold text-emerald-400">Lvl {level}</span>
                       <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400" style={{ width: `${(xp % LEVEL_XP_THRESHOLD) / LEVEL_XP_THRESHOLD * 100}%` }}></div>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Scrollable Area */}
      {user.isLoggedIn && (
        <main className="flex-1 overflow-y-auto max-w-md mx-auto w-full animate-fade-in relative z-10 custom-scroll">
            {activeTab === 'forest' && renderForest()}
            {activeTab === 'shop' && renderShop()}
            {activeTab === 'sponsors' && renderSponsors()}
            {activeTab === 'real' && renderRealTrees()}
            {activeTab === 'impact' && renderImpact()}
            {activeTab === 'profile' && renderProfile()}
        </main>
      )}

      {user.isLoggedIn && renderBottomNav()}

      {/* --- MODALS --- */}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="liquid-card w-full max-w-sm p-6">
                <h3 className="text-xl font-bold text-white mb-4">Редактировать Профиль</h3>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Имя</label>
                        <input 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full bg-black/20 border border-emerald-500/30 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Уникальный ID</label>
                        <input 
                            value={tempHandle} 
                            onChange={(e) => setTempHandle(e.target.value)}
                            className="w-full bg-black/20 border border-emerald-500/30 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                         <label className="text-xs text-gray-400 mb-2 block">Аватар</label>
                         <div className="flex gap-2 justify-between">
                             {['🤖', '🦸', '🧚', '🦊', '🐯'].map(emo => (
                                 <button 
                                    key={emo} 
                                    onClick={() => setTempAvatar(emo)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/5 border ${tempAvatar === emo ? 'border-emerald-500 bg-emerald-500/20' : 'border-transparent'}`}
                                 >
                                     {emo}
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowEditProfile(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400">Отмена</button>
                    <button onClick={saveProfile} className="flex-1 liquid-button rounded-xl text-white font-bold">Сохранить</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Planting Modal - Seed Selection */}
      {plantingPlotId && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom-10">
              <div className="liquid-card w-full max-w-sm max-h-[80vh] overflow-y-auto custom-scroll p-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl text-white">Выберите семя</h3>
                      <button onClick={() => setPlantingPlotId(null)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      {(Object.entries(TREE_STATS) as [TreeType, any][]).filter(([k]) => !k.startsWith('brand')).map(([key, stat]) => (
                          <button 
                             key={key}
                             onClick={() => handlePlant(key, plantingPlotId)}
                             disabled={tokens < stat.cost}
                             className={`p-3 rounded-xl border flex items-center justify-between transition-all ${tokens >= stat.cost ? 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/40' : 'bg-gray-800/50 border-gray-700 opacity-50'}`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black/30 ${stat.color}`}>
                                      <stat.icon size={20} />
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-sm text-white">{stat.name}</div>
                                      <div className="text-xs text-emerald-400">+{stat.income} NUN/день</div>
                                  </div>
                              </div>
                              <div className="font-bold text-sm">{stat.cost} T</div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Selected Plot Actions Modal */}
      {selectedPlot && selectedPlot.tree && TREE_STATS[selectedPlot.tree.type] && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4">
          <div className="liquid-card w-full max-w-sm p-6 animate-slide-up">
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center ${TREE_STATS[selectedPlot.tree.type].color}`}>
                        {React.createElement(TREE_STATS[selectedPlot.tree.type].icon, { size: 32 })}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{TREE_STATS[selectedPlot.tree.type].name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                             <span>Lvl {selectedPlot.tree.level}</span>
                             <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                             <span>{selectedPlot.tree.xp}/100 XP</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setSelectedPlot(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={20} /></button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                 {[
                     { id: 'water', label: 'Полить', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                     { id: 'fertilize', label: 'Удобрить', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                     { id: 'prune', label: 'Обрезать', icon: ScissorsIcon, color: 'text-orange-400', bg: 'bg-orange-500/20' },
                     { id: 'protect', label: 'Защитить', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
                 ].map(action => (
                     <button 
                        key={action.id}
                        onClick={() => handleCare(action.id as any)}
                        className={`liquid-button p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95`}
                     >
                         <action.icon className={action.color} size={24} />
                         <span className="font-bold text-sm text-gray-200">{action.label}</span>
                         <span className="text-[10px] text-gray-500">-1 Энергии</span>
                     </button>
                 ))}
             </div>
          </div>
        </div>
      )}

      {/* Real Tree Passport Modal */}
      {viewingRealTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="liquid-card w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scroll p-0 relative">
                  <div className="h-40 bg-emerald-900/50 relative">
                       <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] to-transparent"></div>
                       <button onClick={() => setViewingRealTree(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 -mt-10 relative z-10">
                      <h2 className="text-2xl font-bold text-white mb-1">{viewingRealTree.customName}</h2>
                      <div className="flex items-center gap-2 text-emerald-400 text-sm mb-6">
                          <MapPin size={14} />
                          <span className="font-mono">{viewingRealTree.gps}</span>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Хронология Жизни</h3>
                              <div className="space-y-4 pl-4 border-l border-emerald-500/30 ml-2">
                                  {viewingRealTree.history.map((item, i) => (
                                      <div key={i} className="relative pl-6">
                                          <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#020617] flex items-center justify-center">
                                              {/* Icon */}
                                          </div>
                                          <div className="text-xs text-gray-400 mb-1">{item.date}</div>
                                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                          <p className="text-xs text-gray-500">{item.desc}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                              <h3 className="text-xs font-bold text-emerald-400 mb-2">Команда Nuncycle</h3>
                              <p className="text-xs text-gray-400 italic">"Мы регулярно посещаем питомник. Следующий отчет через 14 дней."</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Daily Tasks Modal */}
      {showTasks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="liquid-card w-full max-w-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl text-white">Ежедневные задания</h3>
                      <button onClick={() => setShowTasks(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-3">
                      {dailyTasks.map(task => (
                          <div key={task.id} className="bg-black/20 p-3 rounded-xl border border-white/5">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-200">{task.text}</span>
                                  <span className="text-xs font-bold text-yellow-400">+{task.reward} T</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (task.current / task.max) * 100)}%` }}></div>
                                  </div>
                                  <span className="text-xs text-gray-400">{task.current}/{task.max}</span>
                              </div>
                              {task.current >= task.max && !task.completed && (
                                  <button className="mt-2 w-full py-2 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30">Забрать</button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Referral Modal */}
      {showReferral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="liquid-card w-full max-w-sm p-6 text-center">
                   <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                       <Users className="text-emerald-400 w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Пригласите друга</h3>
                   <p className="text-sm text-gray-400 mb-6">Получите 1000 NUN за каждого друга!</p>
                   
                   <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center justify-between mb-4">
                       <code className="text-emerald-400 font-bold tracking-widest">{user.referralCode}</code>
                       <button onClick={() => addNotification('Код скопирован!', 'success')}><Copy size={16} className="text-gray-400"/></button>
                   </div>
                   <button onClick={() => setShowReferral(false)} className="liquid-button w-full py-3 rounded-xl text-white font-bold">Закрыть</button>
              </div>
          </div>
      )}

      {/* Social Share Modal */}
      {showSocialShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="liquid-card w-full max-w-sm p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Поделиться</h3>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                      <button onClick={() => setShowStoryGen(true)} className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl flex items-center justify-center text-white"><Instagram/></div>
                          <span className="text-[10px] text-gray-400">Stories</span>
                      </button>
                      <button className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center text-white"><Twitter/></div>
                          <span className="text-[10px] text-gray-400">Twitter</span>
                      </button>
                      <button className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Facebook/></div>
                          <span className="text-[10px] text-gray-400">Facebook</span>
                      </button>
                      <button className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white"><Send/></div>
                          <span className="text-[10px] text-gray-400">Telegram</span>
                      </button>
                  </div>
                  <button onClick={() => setShowSocialShare(false)} className="w-full py-3 bg-white/10 rounded-xl text-white text-sm">Отмена</button>
              </div>
          </div>
      )}

      {/* Chat Modal */}
      {showChat && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="liquid-card w-full max-w-sm h-[80vh] flex flex-col p-0 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <div className="font-bold text-white">Чат Лесников</div>
                      <button onClick={() => setShowChat(false)}><X size={20} className="text-gray-400"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === 'me' ? 'bg-emerald-600/30 text-white rounded-tr-sm border border-emerald-500/20' : 'bg-gray-800/50 text-gray-200 rounded-tl-sm'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
                      <input 
                          value={chatInput} 
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Сообщение..." 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                      <button onClick={handleSendMessage} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30"><Send size={20}/></button>
                  </div>
              </div>
          </div>
      )}

      {/* TON Connect Modal */}
      {showTonConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="liquid-card w-full max-w-sm p-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-6">Подключение TON</h3>
                  <div className="w-48 h-48 bg-white mx-auto rounded-xl flex items-center justify-center mb-6">
                      <QrCode size={120} className="text-black"/>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">Сканируйте QR-код через Tonkeeper или выберите кошелек ниже.</p>
                  <button onClick={handleTonConnect} className="liquid-button w-full py-3 rounded-xl text-white font-bold mb-3">
                      Tonkeeper
                  </button>
                  <button onClick={() => setShowTonConnect(false)} className="text-sm text-gray-500">Отмена</button>
              </div>
          </div>
      )}
      
      {/* Story Generator Modal (Instagram) */}
      {showStoryGen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
              <div className="w-full max-w-[300px] aspect-[9/16] bg-gradient-to-b from-[#022c22] to-black relative rounded-2xl border border-emerald-500/30 overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-emerald-500/10 blur-[50px]"></div>
                   <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-tech mb-2">NUNCYCLE</h2>
                   <div className="text-6xl mb-4">{user.avatar}</div>
                   <div className="text-2xl font-bold text-white mb-1">{user.name}</div>
                   <div className="text-emerald-400 font-mono mb-6">Lvl {level} Guardian</div>
                   
                   <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 w-full mb-6">
                       <div className="text-gray-400 text-xs uppercase">Мой Вклад</div>
                       <div className="text-2xl font-bold text-white">125 кг CO₂</div>
                   </div>
                   
                   <div className="text-sm text-gray-400">Присоединяйся ко мне!</div>
                   <div className="text-xs text-emerald-500 mt-1 font-mono">CODE: {user.referralCode}</div>

                   <button onClick={() => { addNotification('История опубликована!', 'success'); setShowStoryGen(false); setShowSocialShare(false); }} className="mt-8 px-6 py-2 bg-blue-500 rounded-full text-white font-bold text-sm shadow-lg">
                       Поделиться в Story
                   </button>
                   
                   <button onClick={() => setShowStoryGen(false)} className="absolute top-4 right-4 text-white/50"><X size={24}/></button>
              </div>
          </div>
      )}

      {/* Notifications Toast Container */}
      <div className="fixed top-4 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
          {notifications.map(n => (
              <div key={n.id} className={`liquid-card px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-5 max-w-sm w-full backdrop-blur-xl ${n.type === 'success' ? 'border-emerald-500/50 bg-emerald-900/80' : 'border-blue-500/50 bg-blue-900/80'}`}>
                  {n.type === 'success' ? <CheckCircle2 className="text-emerald-400 shrink-0" size={20}/> : <Info className="text-blue-400 shrink-0" size={20}/>}
                  <span className="text-sm font-bold text-white">{n.text}</span>
              </div>
          ))}
      </div>

    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
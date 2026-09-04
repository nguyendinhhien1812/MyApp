// ─── Dữ liệu kỹ năng — trích từ CV Nguyễn Đình Hiến ─────────────────────────
// Senior React Native / Frontend Engineer · 5 năm kinh nghiệm · MWG
// Nội dung mô tả song ngữ (vi/en) chọn theo useLanguage().lang

import type { Lang } from '../../i18n/translations';

export type SkillCategory = 'frontend' | 'language' | 'architecture' | 'tools';
export type SkillLevel = 'expert' | 'proficient' | 'good' | 'learning';

export type SkillProject = {
  name: string;
  tech: string;
  icon: string; // ionicon
  iconBg: string;
  iconColor: string;
};

export type SkillItem = {
  id: string;
  name: string;
  keywords: string; // subtitle trung lập ngôn ngữ
  category: SkillCategory;
  level: SkillLevel;
  percent: number; // 0–100
  years: number;
  icon: string; // ionicon
  iconBg: string;
  iconColor: string;
  highlights: Record<Lang, string[]>;
  projects: SkillProject[];
};

export const GITHUB_URL = 'https://github.com/nguyendinhhien1812';

// ─── Dự án dùng chung giữa các kỹ năng ──────────────────────────────────────
const PRJ_MWGWORK: SkillProject = {
  name: 'MWGWork — Internal Super App',
  tech: 'React Native · re.pack · WebSocket · Mapbox',
  icon: 'briefcase-outline',
  iconBg: '#fdf3e7',
  iconColor: '#b36a1a',
};
const PRJ_MWGPOS: SkillProject = {
  name: 'MWGPOS — Vận hành bán lẻ',
  tech: 'TypeScript · Formik · JSON Schema · Offline-first',
  icon: 'storefront-outline',
  iconBg: '#e8f0f8',
  iconColor: '#1a4a7a',
};
const PRJ_VIP: SkillProject = {
  name: 'App Quà Tặng VIP',
  tech: 'React Native · ReactJS (web admin)',
  icon: 'gift-outline',
  iconBg: '#f5f0ff',
  iconColor: '#6c3fc4',
};
const PRJ_MYAPP: SkillProject = {
  name: 'MyApp (demo)',
  tech: 'React Native · Re.Pack · Claude AI',
  icon: 'phone-portrait-outline',
  iconBg: '#e8f8f0',
  iconColor: '#1a7a40',
};
const PRJ_ANDROID: SkillProject = {
  name: 'App đọc sách & App du lịch',
  tech: 'Java · Kotlin · Android SDK · MongoDB',
  icon: 'book-outline',
  iconBg: '#e8f8f0',
  iconColor: '#1a7a40',
};

// ─── Danh sách kỹ năng ──────────────────────────────────────────────────────
export const SKILLS: SkillItem[] = [
  {
    id: 'react-native',
    name: 'React Native',
    keywords: 'Hooks · Navigation · re.pack',
    category: 'frontend',
    level: 'expert',
    percent: 95,
    years: 5,
    icon: 'logo-react',
    iconBg: '#e8f0f8',
    iconColor: '#1a4a7a',
    highlights: {
      vi: [
        'Thiết kế kiến trúc micro frontend cho super-app MWGWork: 10+ mini-app độc lập, đóng góp ~70% codebase production.',
        'Tối ưu hiệu năng: giảm re-render, tối ưu FlatList, lazy loading và memory management.',
        'Tích hợp third-party SDK: Mapbox định vị/điều hướng, Push Notification realtime.',
      ],
      en: [
        'Designed micro frontend architecture for MWGWork super-app: 10+ independent mini-apps, ~70% of production codebase.',
        'Performance tuning: reduced re-renders, optimized FlatList, lazy loading and memory management.',
        'Integrated third-party SDKs: Mapbox navigation, realtime Push Notification.',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_MWGPOS, PRJ_VIP, PRJ_MYAPP],
  },
  {
    id: 'javascript',
    name: 'JavaScript (ES6+)',
    keywords: 'Async · Concurrency · DOM',
    category: 'language',
    level: 'expert',
    percent: 95,
    years: 5,
    icon: 'logo-javascript',
    iconBg: '#fdf3e7',
    iconColor: '#b36a1a',
    highlights: {
      vi: [
        'Xử lý dữ liệu bất đồng bộ và concurrency nhiều luồng realtime (REST + WebSocket).',
        '5 năm làm việc hằng ngày trên cả mobile lẫn web.',
      ],
      en: [
        'Async data handling and multi-stream realtime concurrency (REST + WebSocket).',
        '5 years of daily work across mobile and web.',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_VIP],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    keywords: 'Type-safety · Generics · Migration',
    category: 'language',
    level: 'proficient',
    percent: 90,
    years: 4,
    icon: 'code-slash-outline',
    iconBg: '#e8f0f8',
    iconColor: '#1a4a7a',
    highlights: {
      vi: [
        'Dẫn dắt migrate các module MWGPOS từ JavaScript sang TypeScript, tăng type-safety và giảm lỗi runtime.',
        'Chuẩn hóa type cho luồng dữ liệu dùng chung giữa nhiều mini-app.',
      ],
      en: [
        'Led migration of MWGPOS modules from JavaScript to TypeScript, improving type-safety and reducing runtime errors.',
        'Standardized types for shared data flows across mini-apps.',
      ],
    },
    projects: [PRJ_MWGPOS, PRJ_MWGWORK],
  },
  {
    id: 'reactjs',
    name: 'ReactJS',
    keywords: 'SPA · Web admin',
    category: 'frontend',
    level: 'proficient',
    percent: 88,
    years: 4,
    icon: 'logo-react',
    iconBg: '#e6f4f8',
    iconColor: '#0e6a8a',
    highlights: {
      vi: [
        'Xây dựng giao diện web admin cho App Quà Tặng VIP — phát triển đồng thời cả mobile và web.',
      ],
      en: [
        'Built the web admin UI for the VIP Gift App — developing mobile and web in parallel.',
      ],
    },
    projects: [PRJ_VIP],
  },
  {
    id: 'state-management',
    name: 'Redux & State Management',
    keywords: 'Redux · Context API · Hooks',
    category: 'frontend',
    level: 'proficient',
    percent: 90,
    years: 4,
    icon: 'layers-outline',
    iconBg: '#f5f0ff',
    iconColor: '#6c3fc4',
    highlights: {
      vi: [
        'Quản lý state quy mô lớn bằng Redux kết hợp Context API/Hooks cho 10+ mini-app.',
        'Chuẩn hóa cấu trúc và luồng dữ liệu dùng chung giữa các mini-app.',
      ],
      en: [
        'Managed large-scale state with Redux combined with Context API/Hooks across 10+ mini-apps.',
        'Standardized shared data structures and flows between mini-apps.',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_MWGPOS],
  },
  {
    id: 'micro-frontend',
    name: 'Micro Frontend (re.pack)',
    keywords: 'Module Federation · Scalable FE',
    category: 'architecture',
    level: 'proficient',
    percent: 85,
    years: 3,
    icon: 'apps-outline',
    iconBg: '#fdf3e7',
    iconColor: '#b36a1a',
    highlights: {
      vi: [
        'Tách super-app MWGWork thành 10+ mini-app độc lập bằng Webpack Module Federation (re.pack).',
        'Chính là kiến trúc đang chạy trong app demo này (Re.Pack host + miniApp remote).',
      ],
      en: [
        'Split the MWGWork super-app into 10+ independent mini-apps using Webpack Module Federation (re.pack).',
        'The very architecture running in this demo app (Re.Pack host + miniApp remote).',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_MYAPP],
  },
  {
    id: 'integration',
    name: 'REST & WebSocket',
    keywords: 'Axios · Realtime · Push Notification',
    category: 'architecture',
    level: 'proficient',
    percent: 85,
    years: 4,
    icon: 'swap-horizontal-outline',
    iconBg: '#e8f8f0',
    iconColor: '#1a7a40',
    highlights: {
      vi: [
        'Tích hợp REST API & WebSocket, xử lý realtime nhiều luồng cho nghiệp vụ CSKH, kế toán, POS.',
        'Triển khai offline-first storage & đồng bộ dữ liệu khi mất kết nối (MWGPOS).',
      ],
      en: [
        'Integrated REST APIs & WebSocket, handling multi-stream realtime for CS, accounting and POS flows.',
        'Implemented offline-first storage & data sync for unstable connections (MWGPOS).',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_MWGPOS],
  },
  {
    id: 'android-native',
    name: 'Java / Kotlin',
    keywords: 'Android SDK · OOP',
    category: 'language',
    level: 'good',
    percent: 60,
    years: 2,
    icon: 'logo-android',
    iconBg: '#e8f8f0',
    iconColor: '#1a7a40',
    highlights: {
      vi: [
        'Khởi đầu sự nghiệp với Android native: app đọc sách & app du lịch (2019–2020).',
        'Nền tảng OOP & Design Patterns (Factory, Observer, Singleton) áp dụng đến hiện tại.',
      ],
      en: [
        'Started my career with native Android: book reader & travel apps (2019–2020).',
        'OOP & Design Patterns foundation (Factory, Observer, Singleton) still applied today.',
      ],
    },
    projects: [PRJ_ANDROID],
  },
  {
    id: 'swift',
    name: 'Swift',
    keywords: 'iOS · Native module',
    category: 'language',
    level: 'learning',
    percent: 40,
    years: 1,
    icon: 'logo-apple',
    iconBg: '#f0f0f5',
    iconColor: '#444',
    highlights: {
      vi: ['Đang học để tự viết native module iOS cho React Native.'],
      en: ['Currently learning to write iOS native modules for React Native.'],
    },
    projects: [PRJ_MYAPP],
  },
  {
    id: 'cicd',
    name: 'CI/CD & Git',
    keywords: 'Webpack · Metro · Pipeline',
    category: 'tools',
    level: 'proficient',
    percent: 80,
    years: 4,
    icon: 'git-branch-outline',
    iconBg: '#fdecea',
    iconColor: '#c0392b',
    highlights: {
      vi: [
        'Tham gia CI/CD pipeline, tự động hóa build & deploy cho hệ thống app nội bộ MWG.',
        'Code review & mentoring, làm việc theo Agile/Scrum, Kanban.',
      ],
      en: [
        'Contributed to CI/CD pipelines, automating build & deploy for MWG internal apps.',
        'Code review & mentoring, working in Agile/Scrum and Kanban.',
      ],
    },
    projects: [PRJ_MWGWORK, PRJ_MWGPOS],
  },
  {
    id: 'figma',
    name: 'Figma',
    keywords: 'UI handoff · Prototype',
    category: 'tools',
    level: 'good',
    percent: 65,
    years: 3,
    icon: 'color-palette-outline',
    iconBg: '#f5f0ff',
    iconColor: '#6c3fc4',
    highlights: {
      vi: ['Đọc design, handoff và phối hợp chặt với designer trong quy trình Agile.'],
      en: ['Design reading, handoff and close collaboration with designers in Agile.'],
    },
    projects: [PRJ_MWGWORK],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
export const TOTAL_YEARS = 5;
export const TOTAL_PROJECTS = 6;

export const getSkillById = (id: string): SkillItem | undefined =>
  SKILLS.find(s => s.id === id);

// Badge màu theo level — dùng chung cho Home, list và detail
export const LEVEL_BADGE: Record<SkillLevel, { bg: string; color: string }> = {
  expert: { bg: '#f5f0ff', color: '#6c3fc4' },
  proficient: { bg: '#e8f8f0', color: '#1a7a40' },
  good: { bg: '#e8f0f8', color: '#1a4a7a' },
  learning: { bg: '#fdf3e7', color: '#b36a1a' },
};

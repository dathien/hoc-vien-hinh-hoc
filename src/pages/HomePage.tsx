import React, { useMemo } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  Flame,
  GraduationCap,
  HelpCircle,
  Play,
  Ruler,
  Star,
  Swords,
  Trophy,
} from 'lucide-react';
import { ALL_CHALLENGES, getChallengeById } from '../challenges';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import { MathText } from '../components/math/MathText';
import { HISTORY_CARDS } from '../data/knowledge';
import { BADGE_DEFINITIONS, RANK_TIERS } from '../data/ranksAndBadges';
import {
  getThptInventoryStats,
  THPT_GRADE_META,
  type ThptGrade,
} from '../data/thptCurriculum';
import { getChallenge3DById } from '../geometry3d/challenges3d';
import { getTemplate3DById } from '../geometry3d/templates3d';
import { useApp } from '../store/AppContext';

export const HomePage: React.FC = () => {
  const {
    setPage,
    setActiveChallengeId,
    setLabSubView,
    setCampaignDimension,
    openChallenge,
    openChallenge3D,
    openGradeTrack,
    progressMap,
    progress3DMap,
    stats,
    stats3D,
    settings,
  } = useApp();

  const inventory = useMemo(() => getThptInventoryStats(), []);
  const nextChallenge = getChallengeById(stats.nextRecommendedChallengeId) ?? ALL_CHALLENGES[0];

  const oxyzPreviewScene = useMemo(() => {
    const tpl = getTemplate3DById('T3D_33');
    return tpl ? tpl.buildScene() : undefined;
  }, []);

  const featuredByGrade = useMemo(() => {
    const c10 = getChallengeById('L01_C01') ?? ALL_CHALLENGES[0];
    const c11 = getChallenge3DById('S3D_L01_C01');
    const c12 = getChallenge3DById('S3D_L14_C01');
    return { c10, c11, c12 };
  }, []);

  const totalCompletedAll = stats.completedCount + stats3D.completedCount;
  const totalChallengesAll = stats.totalChallenges + stats3D.totalChallenges;
  const totalStarsAll = stats.totalStars + stats3D.totalStars;
  const totalMaxStarsAll = stats.maxStars + stats3D.maxStars;

  const handleOpenGradeLab = (grade: ThptGrade) => {
    openGradeTrack(grade, 'lab');
    setLabSubView(grade === '10' ? '2d' : '3d');
  };

  const handleOpenGradeCampaign = (grade: ThptGrade) => {
    openGradeTrack(grade, 'campaign');
    setCampaignDimension(grade === '10' ? '2d' : '3d');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="bg-geo-grid px-6 sm:px-10 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 min-w-0 space-y-6">
            <div className="text-sm font-bold text-teal-700 dark:text-teal-400 tracking-wide uppercase leading-snug break-words">
              KHÔNG GIAN HÌNH HỌC TƯƠNG TÁC THPT 10 – 11 – 12
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Học Viện Hình Học Smart
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Không gian học tập và thực hành hình học tương tác dành cho giáo viên và học sinh
                THPT lớp 10, 11 và 12. Khám phá hình học phẳng, hình học không gian, phương pháp
                tọa độ thông qua các công cụ dựng hình 2D – 3D, thư viện hình mẫu, thử thách và
                hoạt động học tập tương tác.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openGradeTrack('10', 'grades')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Khám phá theo lớp THPT
              </button>
              <button
                type="button"
                onClick={() => {
                  setLabSubView('hub');
                  setPage('lab');
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white font-semibold text-base hover:bg-sky-700 shadow-sm transition-colors"
              >
                <Ruler className="w-4 h-4" />
                Phòng thực hành 2D &amp; 3D
              </button>
              <button
                type="button"
                onClick={() => openChallenge(nextChallenge.id)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Compass className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                Tiếp tục thử thách
              </button>
              <button
                type="button"
                onClick={() => setPage('guide')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Hướng dẫn
              </button>
            </div>

            <div className="text-[15px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-2.5 gap-y-1">
              <span>Khám phá – Dựng hình – Chinh phục</span>
              <span>·</span>
              <span>SGK Kết nối tri thức (GDPT 2018)</span>
              <span>·</span>
              <span>Hoạt động ngoại tuyến</span>
            </div>
          </div>

          {/* Dual 2D + Live Animated 3D Geometric Visual */}
          <div className="lg:col-span-6 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {/* 2D Figure Card */}
            <div className="min-w-0 h-full rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-950/90 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="h-44 flex items-center justify-center">
                <svg
                  viewBox="0 0 360 250"
                  className="w-full h-full"
                  role="img"
                  aria-label="Sơ đồ dựng hình phẳng và tọa độ 2D minh họa"
                >
                  <defs>
                    <linearGradient id="heroTri" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0F766E" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.10" />
                    </linearGradient>
                  </defs>
                  <circle cx="130" cy="175" r="100" fill="none" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.65" />
                  <circle cx="230" cy="175" r="100" fill="none" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.65" />
                  <circle cx="180" cy="146.1" r="57.7" fill="none" stroke="#7C3AED" strokeWidth="1.5" opacity="0.6" />
                  <line x1="180" y1="26" x2="180" y2="232" stroke="#D97706" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                  <polygon points="130,175 230,175 180,88.4" fill="url(#heroTri)" stroke="#0F766E" strokeWidth="2.6" />
                  <rect x="180" y="164" width="11" height="11" fill="none" stroke="#D97706" strokeWidth="1.6" />
                  <circle cx="130" cy="175" r="5.5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="230" cy="175" r="5.5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="180" cy="88.4" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="180" cy="146.1" r="4.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.8" />
                  <circle cx="180" cy="175" r="4.2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.8" />
                  <text x="112" y="192" fontSize="14" fontWeight="700" fill="currentColor" className="text-slate-800 dark:text-slate-100">A</text>
                  <text x="239" y="192" fontSize="14" fontWeight="700" fill="currentColor" className="text-slate-800 dark:text-slate-100">B</text>
                  <text x="188" y="82" fontSize="14" fontWeight="700" fill="#D97706">C</text>
                  <text x="188" y="144" fontSize="12" fontWeight="700" fill="#7C3AED">O</text>
                  <text x="186" y="192" fontSize="12" fontWeight="700" fill="#0284C7">M</text>
                </svg>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[13.5px] leading-snug text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-teal-700 dark:text-teal-400 min-w-0">
                  Hình học phẳng 2D &amp; Oxy
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenGradeLab('10')}
                  className="ml-auto inline-flex items-center gap-1 py-0.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:underline whitespace-nowrap shrink-0"
                >
                  Mở 2D →
                </button>
              </div>
            </div>

            {/* Live Code-Driven 3D Figure Card */}
            <div className="min-w-0 h-full rounded-2xl border border-sky-200/90 dark:border-sky-800/70 bg-white/95 dark:bg-slate-950/90 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="h-44 flex items-center justify-center">
                <LiveGeo3DPreview
                  variant="hero_pyramid"
                  width={320}
                  height={210}
                  animate={true}
                  reducedMotion={settings.reducedMotion}
                />
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[13.5px] leading-snug text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-sky-700 dark:text-sky-400 min-w-0">
                  Không gian 3D &amp; Oxyz
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenGradeLab('11')}
                  className="ml-auto inline-flex items-center gap-1 py-0.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 hover:underline whitespace-nowrap shrink-0"
                >
                  Mở 3D →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Balanced 3-Grade THPT Curriculum Showcase (Equal Size & Priority) */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Chương trình GDPT 2018 · SGK Kết nối tri thức với cuộc sống
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Lộ trình Hình học THPT theo ba khối lớp
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setPage('grades')}
            className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            Xem đầy đủ theo lớp
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Card 1: Toán 10 */}
          {(() => {
            const meta = THPT_GRADE_META['10'];
            const stat = inventory.byGrade['10'];
            return (
              <article className="rounded-2xl border border-teal-200/90 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-teal-500 transition-colors">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Hình học 2D &amp; Oxy
                    </span>
                  </div>

                  {/* Dedicated 2D Oxy + Triangle + Circumcircle + Vector Visual */}
                  <div className="h-40 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                    <svg
                      viewBox="0 0 320 180"
                      className="w-full h-full"
                      role="img"
                      aria-label="Minh họa Hình học phẳng và tọa độ Oxy Toán 10"
                    >
                      {/* Coordinate axes Oxy */}
                      <line x1="28" y1="148" x2="296" y2="148" stroke="#94A3B8" strokeWidth="1.2" />
                      <line x1="62" y1="166" x2="62" y2="16" stroke="#94A3B8" strokeWidth="1.2" />
                      <text x="292" y="142" fontSize="11" fontWeight="700" fill="#64748B">x</text>
                      <text x="68" y="24" fontSize="11" fontWeight="700" fill="#64748B">y</text>
                      <text x="48" y="162" fontSize="11" fontWeight="700" fill="#64748B">O</text>
                      {/* Circumcircle & Ellipse arc */}
                      <circle cx="176" cy="96" r="56" fill="none" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                      {/* Triangle ABC */}
                      <polygon points="122,118 228,124 166,42" fill="#0F766E" fillOpacity="0.12" stroke="#0F766E" strokeWidth="2.2" />
                      {/* Vector arrow AB */}
                      <line x1="122" y1="118" x2="220" y2="123" stroke="#D97706" strokeWidth="2.4" />
                      <polygon points="228,124 216,118 216,129" fill="#D97706" />
                      {/* Altitude & Points */}
                      <line x1="166" y1="42" x2="163" y2="120" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="3 3" />
                      <circle cx="122" cy="118" r="4.5" fill="#0F766E" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="228" cy="124" r="4.5" fill="#0F766E" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="166" cy="42" r="4.5" fill="#D97706" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="176" cy="96" r="3.5" fill="#7C3AED" />
                      <text x="108" y="122" fontSize="12" fontWeight="700" fill="currentColor" className="text-slate-800 dark:text-slate-100">A</text>
                      <text x="234" y="128" fontSize="12" fontWeight="700" fill="currentColor" className="text-slate-800 dark:text-slate-100">B</text>
                      <text x="172" y="38" fontSize="12" fontWeight="700" fill="#D97706">C</text>
                      <text x="182" y="96" fontSize="11" fontWeight="700" fill="#7C3AED">I</text>
                    </svg>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {meta.title}
                    </h3>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular pt-1">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.chaptersCount}</strong> chương · <strong>{stat.lessonsCount}</strong> bài học
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.templatesTotal}</strong> hình mẫu · <strong>{stat.challengesTotal}</strong> thử thách
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openGradeTrack('10', 'library')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                  >
                    Học Toán 10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeLab('10')}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Thực hành 2D
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeCampaign('10')}
                    className="px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800 text-sm font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                  >
                    Thử thách
                  </button>
                </div>
              </article>
            );
          })()}

          {/* Card 2: Toán 11 */}
          {(() => {
            const meta = THPT_GRADE_META['11'];
            const stat = inventory.byGrade['11'];
            return (
              <article className="rounded-2xl border border-sky-200/90 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-sky-500 transition-colors">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Hình học không gian 3D
                    </span>
                  </div>

                  <div className="h-40 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                    <LiveGeo3DPreview
                      variant="lab_cube_section"
                      width={290}
                      height={152}
                      animate={true}
                      reducedMotion={settings.reducedMotion}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {meta.title}
                    </h3>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular pt-1">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.chaptersCount}</strong> chương · <strong>{stat.lessonsCount}</strong> bài học
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.templatesTotal}</strong> hình mẫu · <strong>{stat.challengesTotal}</strong> thử thách
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openGradeTrack('11', 'library')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800"
                  >
                    Học Toán 11
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeLab('11')}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Thực hành 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeCampaign('11')}
                    className="px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800 text-sm font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                  >
                    Thử thách
                  </button>
                </div>
              </article>
            );
          })()}

          {/* Card 3: Toán 12 */}
          {(() => {
            const meta = THPT_GRADE_META['12'];
            const stat = inventory.byGrade['12'];
            return (
              <article className="rounded-2xl border border-violet-200/90 dark:border-violet-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-violet-500 transition-colors">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Hệ trục tọa độ Oxyz
                    </span>
                  </div>

                  <div className="h-40 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                    <LiveGeo3DPreview
                      scene={oxyzPreviewScene}
                      variant="hero_pyramid"
                      width={290}
                      height={152}
                      animate={false}
                      reducedMotion={settings.reducedMotion}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {meta.title}
                    </h3>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular pt-1">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.chaptersCount}</strong> chương · <strong>{stat.lessonsCount}</strong> bài học
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 text-slate-700 dark:text-slate-200">
                      <strong>{stat.templatesTotal}</strong> hình mẫu · <strong>{stat.challengesTotal}</strong> thử thách
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openGradeTrack('12', 'library')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-700 text-white text-sm font-semibold hover:bg-violet-800"
                  >
                    Học Toán 12
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeLab('12')}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Thực hành Oxyz
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGradeCampaign('12')}
                    className="px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-sm font-semibold text-violet-800 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                  >
                    Thử thách
                  </button>
                </div>
              </article>
            );
          })()}
        </div>
      </section>

      {/* Real-time Learning Overview Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Tiến trình thử thách</div>
          <div className="text-2xl font-extrabold font-mono-tabular text-slate-900 dark:text-white">
            {totalCompletedAll}
            <span className="text-base font-medium text-slate-400"> / {totalChallengesAll}</span>
          </div>
          <div className="text-xs text-teal-700 dark:text-teal-400 font-medium">
            2D: {stats.completedCount}/{stats.totalChallenges} · 3D: {stats3D.completedCount}/{stats3D.totalChallenges}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Tổng số sao</div>
          <div className="text-2xl font-extrabold font-mono-tabular text-amber-600 dark:text-amber-400">
            ★ {totalStarsAll}
            <span className="text-base font-medium text-slate-400"> / {totalMaxStarsAll}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.threeStarCount + stats3D.threeStarCount} bài đạt tối ưu 3 sao
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Danh hiệu hiện tại</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {stats.rank.current.title}
          </div>
          <div className="text-xs text-violet-700 dark:text-violet-400 font-medium">
            {stats.unlockedBadgesCount}/{BADGE_DEFINITIONS.length} huy hiệu đã mở
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Chuỗi rèn luyện</div>
          <div className="text-2xl font-extrabold font-mono-tabular text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-amber-500" />
            {settings.streakDays} ngày
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Học viên: {settings.displayName}
          </div>
        </div>
      </section>

      {/* Continue Journey + Quick Learning Modes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-teal-200 dark:border-teal-800/70 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/30 dark:to-slate-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              Tiếp tục hành trình · Cấp độ {nextChallenge.levelId} · Bài {nextChallenge.order}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {nextChallenge.title}
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
              <MathText text={nextChallenge.description} />
            </p>
            <div className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {nextChallenge.curriculumCategory} · Mục tiêu {nextChallenge.targetL}L / {nextChallenge.targetE}E
            </div>
          </div>
          <button
            type="button"
            onClick={() => openChallenge(nextChallenge.id)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 whitespace-nowrap shrink-0"
          >
            Vào dựng hình
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPage('arena')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-amber-400 transition-colors space-y-2"
          >
            <Swords className="w-6 h-6 text-amber-600" />
            <div className="font-bold text-slate-900 dark:text-white">Đấu trường Toán học</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {inventory.totals.arenaQuizAll} bài thi THPT 10–11–12, mã QR &amp; trình chiếu LED.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPage('library')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-sky-400 transition-colors space-y-2"
          >
            <BookOpen className="w-6 h-6 text-sky-600" />
            <div className="font-bold text-slate-900 dark:text-white">Thư viện kiến thức</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {inventory.totals.lessons} bài học SGK THPT &amp; {HISTORY_CARDS.length} nhà toán học.
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setLabSubView('templates');
              setPage('lab');
            }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-teal-400 transition-colors space-y-2"
          >
            <Trophy className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <div className="font-bold text-slate-900 dark:text-white">Thư viện hình mẫu</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {inventory.totals.templatesAll} hình mẫu tương tác 2D &amp; 3D theo khối lớp.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPage('achievements')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-violet-400 transition-colors space-y-2"
          >
            <Award className="w-6 h-6 text-violet-600" />
            <div className="font-bold text-slate-900 dark:text-white">Thành tích &amp; Chứng nhận</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {RANK_TIERS.length} danh hiệu, {BADGE_DEFINITIONS.length} huy hiệu &amp; giấy chứng nhận A4.
            </p>
          </button>
        </div>
      </section>

      {/* Balanced Featured Challenges (1 per Grade: Toán 10, Toán 11, Toán 12) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Thử thách tiêu biểu theo khối lớp
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1">
              Mỗi khối lớp đều có hệ thống thử thách thực hành và kiểm chứng hình học tự động.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveChallengeId(null);
              setPage('campaign');
            }}
            className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            Mở toàn bộ lộ trình thử thách
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toán 10 Featured 2D */}
          {featuredByGrade.c10 && (
            <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    Toán 10 · Dựng hình 2D · {featuredByGrade.c10.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (progressMap[featuredByGrade.c10.id]?.stars ?? 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {featuredByGrade.c10.title}
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  <MathText text={featuredByGrade.c10.description} />
                </p>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono-tabular text-slate-500">
                  Mục tiêu {featuredByGrade.c10.targetL}L · {featuredByGrade.c10.targetE}E
                </span>
                <button
                  type="button"
                  onClick={() => openChallenge(featuredByGrade.c10.id)}
                  className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Mở thử thách →
                </button>
              </div>
            </div>
          )}

          {/* Toán 11 Featured 3D */}
          {featuredByGrade.c11 && (
            <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3 hover:border-sky-500 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-700 dark:text-sky-400">
                    Toán 11 · Không gian 3D · {featuredByGrade.c11.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (progress3DMap[featuredByGrade.c11!.id]?.stars ?? 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {featuredByGrade.c11.title}
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  <MathText text={featuredByGrade.c11.description} />
                </p>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono-tabular text-slate-500">
                  Mục tiêu ≤ {featuredByGrade.c11.targetSteps} bước
                </span>
                <button
                  type="button"
                  onClick={() => openChallenge3D(featuredByGrade.c11!.id)}
                  className="text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Mở thử thách →
                </button>
              </div>
            </div>
          )}

          {/* Toán 12 Featured 3D Oxyz */}
          {featuredByGrade.c12 && (
            <div className="rounded-2xl border border-violet-200/80 dark:border-violet-800/70 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3 hover:border-violet-500 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-700 dark:text-violet-400">
                    Toán 12 · Tọa độ Oxyz · {featuredByGrade.c12.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (progress3DMap[featuredByGrade.c12!.id]?.stars ?? 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {featuredByGrade.c12.title}
                </h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  <MathText text={featuredByGrade.c12.description} />
                </p>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono-tabular text-slate-500">
                  Mục tiêu ≤ {featuredByGrade.c12.targetSteps} bước
                </span>
                <button
                  type="button"
                  onClick={() => openChallenge3D(featuredByGrade.c12!.id)}
                  className="text-sm font-semibold text-violet-700 dark:text-violet-400 hover:underline"
                >
                  Mở thử thách →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

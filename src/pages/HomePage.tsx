import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  Flame,
  HelpCircle,
  Lock,
  Play,
  Ruler,
  Star,
  Swords,
  Trophy,
} from 'lucide-react';
import {
  ALL_CHALLENGES,
  getChallengeById,
  getChallengesByLevel,
  isLevelUnlocked,
  LEVELS,
} from '../challenges';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import { MathText } from '../components/math/MathText';
import { useApp } from '../store/AppContext';

const FEATURED_IDS = ['L01_C01', 'L03_C01', 'L07_C09', 'L10_C01', 'L15_C01', 'L18_C03'];

export const HomePage: React.FC = () => {
  const {
    setPage,
    setActiveLevelId,
    setActiveChallengeId,
    setLabSubView,
    setCampaignDimension,
    openChallenge,
    progressMap,
    teacherPreviewMode,
    stats,
    stats3D,
    settings,
  } = useApp();

  const nextChallenge = getChallengeById(stats.nextRecommendedChallengeId) ?? ALL_CHALLENGES[0];
  const featured = FEATURED_IDS.map((id) => getChallengeById(id)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="bg-geo-grid px-6 sm:px-10 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-sm font-semibold text-teal-700 dark:text-teal-400 tracking-wide uppercase leading-snug break-words">
              Không gian hình học tương tác 2D &amp; 3D
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Học Viện Hình Học Smart
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                <strong>Khám phá – Dựng hình – Chinh phục.</strong> Phát triển tư duy hình học, kỹ
                năng dựng hình và năng lực lập luận toán học thông qua 180 thử thách hình học phẳng,
                không gian dựng hình 2D – 3D, thư viện kiến thức và các hoạt động học tập tương tác.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openChallenge('L01_C01')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 shadow-sm transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Bắt đầu học
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
                Thực hành 2D &amp; 3D
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
                Hướng dẫn sử dụng
              </button>
            </div>

            <div className="text-[15px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-2.5 gap-y-1">
              <span>Miễn phí</span>
              <span>·</span>
              <span>Không cần đăng nhập để thực hành</span>
              <span>·</span>
              <span>Hỗ trợ sử dụng ngoại tuyến</span>
              <span>·</span>
              <span>2D &amp; 3D tương tác</span>
            </div>
          </div>

          {/* Dual 2D + Live Animated 3D Geometric Visual */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
            {/* 2D Figure Card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-950/90 p-3.5 shadow-sm flex flex-col justify-between">
              <svg viewBox="0 0 360 250" className="w-full h-44" role="img" aria-label="Sơ đồ dựng hình tam giác đều 2D minh họa">
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
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-teal-700 dark:text-teal-400">Hình học phẳng 2D</span>
                <button
                  type="button"
                  onClick={() => {
                    setLabSubView('2d');
                    setPage('lab');
                  }}
                  className="font-semibold hover:text-teal-700 hover:underline"
                >
                  Mở 2D →
                </button>
              </div>
            </div>

            {/* Live Code-Driven 3D Figure Card (Zero Three.js on Homepage) */}
            <div className="rounded-2xl border border-sky-200/90 dark:border-sky-800/70 bg-white/95 dark:bg-slate-950/90 p-3.5 shadow-sm flex flex-col justify-between">
              <div className="h-44">
                <LiveGeo3DPreview
                  variant="hero_pyramid"
                  width={320}
                  height={210}
                  animate={true}
                  reducedMotion={settings.reducedMotion}
                />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-sky-700 dark:text-sky-400">Không gian 3D &amp; Oxyz</span>
                <button
                  type="button"
                  onClick={() => {
                    setLabSubView('3d');
                    setPage('lab');
                  }}
                  className="font-semibold hover:text-sky-700 hover:underline"
                >
                  Mở 3D →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Learning Overview Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Tiến trình thử thách</div>
          <div className="text-2xl font-extrabold font-mono-tabular text-slate-900 dark:text-white">
            {stats.completedCount}
            <span className="text-base font-medium text-slate-400"> / {stats.totalChallenges}</span>
          </div>
          <div className="text-xs text-teal-700 dark:text-teal-400 font-medium">
            18 cấp độ từ cơ bản đến Olympic
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Tổng số sao</div>
          <div className="text-2xl font-extrabold font-mono-tabular text-amber-600 dark:text-amber-400">
            ★ {stats.totalStars}
            <span className="text-base font-medium text-slate-400"> / {stats.maxStars}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.threeStarCount} bài đạt tối ưu 3 sao
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">Danh hiệu hiện tại</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {stats.rank.current.title}
          </div>
          <div className="text-xs text-violet-700 dark:text-violet-400 font-medium">
            {stats.unlockedBadgesCount}/12 huy hiệu đã mở
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

      {/* Continue Journey + Quick Modes */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-teal-200 dark:border-teal-800/70 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/30 dark:to-slate-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              Tiếp tục hành trình · Cấp độ {nextChallenge.levelId} · Bài {nextChallenge.order}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {nextChallenge.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
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
              Phòng thi lớp học, mã QR &amp; chế độ trình chiếu LED.
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
              18 chủ đề hình học động &amp; 10 nhà toán học kinh điển.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPage('grades')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-teal-400 transition-colors space-y-2"
          >
            <Trophy className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <div className="font-bold text-slate-900 dark:text-white">Theo lớp &amp; Chương trình</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Phân loại Kiến thức nền tảng, Toán 10–12, Mở rộng và Olympic.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPage('achievements')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-violet-400 transition-colors space-y-2"
          >
            <Award className="w-6 h-6 text-violet-600" />
            <div className="font-bold text-slate-900 dark:text-white">Thành tích &amp; Chứng nhận</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              8 danh hiệu, 12 huy hiệu &amp; giấy chứng nhận khổ A4.
            </p>
          </button>
        </div>
      </section>

      {/* 3D Spatial Geometry Quick Access Strip */}
      <section className="rounded-2xl border border-sky-200/90 dark:border-sky-800/70 bg-gradient-to-r from-sky-50/80 via-white to-teal-50/70 dark:from-slate-900 dark:to-slate-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Không gian Hình học 3D &amp; Hệ tọa độ Oxyz · Toán 11 &amp; Toán 12
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Dựng hình không gian 3D, 40 hình mẫu &amp; 180 thử thách không gian
          </h2>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            Khám phá 18 hình khối chuẩn SGK, cắt thiết diện động, đo góc – khoảng cách và luyện tập riêng ({stats3D.completedCount}/{stats3D.totalChallenges} bài 3D · ★ {stats3D.totalStars}/{stats3D.maxStars}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLabSubView('3d');
              setPage('lab');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-[15px] font-semibold hover:bg-sky-700"
          >
            Dựng hình 3D ngay
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setLabSubView('templates');
              setPage('lab');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50"
          >
            40 hình mẫu 3D
          </button>
          <button
            type="button"
            onClick={() => {
              setCampaignDimension('3d');
              setPage('campaign');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-950/40 text-[15px] font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100"
          >
            180 thử thách 3D
          </button>
        </div>
      </section>

      {/* 18-Level Campaign Roadmap */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lộ trình 18 Cấp độ – 180 Thử thách
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1">
              Hoàn thành các thử thách để mở khóa tuần tự từ Dựng hình cơ bản đến Hình học Olympic.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveChallengeId(null);
              setPage('campaign');
            }}
            className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            Mở bản đồ đầy đủ
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((lvl) => {
            const list = getChallengesByLevel(lvl.id);
            const completed = list.filter((c) => (progressMap[c.id]?.stars ?? 0) >= 1).length;
            const stars = list.reduce((sum, c) => sum + (progressMap[c.id]?.stars ?? 0), 0);
            const unlocked = isLevelUnlocked(lvl.id, progressMap, teacherPreviewMode);

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => {
                  setActiveLevelId(lvl.id);
                  setActiveChallengeId(null);
                  setPage('campaign');
                }}
                className={`group text-left rounded-2xl border p-4 transition-all flex gap-4 items-center ${
                  unlocked
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 hover:shadow-md'
                    : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/50 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="w-24 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <GeoThumbnailSVG kind={lvl.thumbnailKind} accentColor={lvl.accentColor} className="w-full h-20" />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: lvl.accentColor }}>
                      Cấp {lvl.roman} · {lvl.curriculumCategory}
                    </span>
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    {lvl.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {lvl.subtitle}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono-tabular pt-1">
                    <span className="text-slate-600 dark:text-slate-300">{completed}/10 bài</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      ★ {stars}/30
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thử thách tiêu biểu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((ch) => {
            const rec = progressMap[ch.id];
            const earned = rec?.stars ?? 0;
            return (
              <div
                key={ch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      Cấp {ch.levelId} · Bài {ch.order} · {ch.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= earned ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                      ))}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{ch.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    <MathText text={ch.description} />
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono-tabular text-slate-500">
                    Mục tiêu {ch.targetL}L · {ch.targetE}E
                  </span>
                  <button
                    type="button"
                    onClick={() => openChallenge(ch.id)}
                    className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    Mở thử thách →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

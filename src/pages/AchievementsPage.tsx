import React, { useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  Crown,
  Download,
  Flame,
  Layers,
  Lock,
  PenTool,
  Printer,
  Ruler,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import { BADGE_DEFINITIONS, RANK_TIERS } from '../data/ranksAndBadges';
import { ALL_CHALLENGES_3D, calcProgressPercent, LEVELS_3D } from '../geometry3d/challenges3d';
import { useApp } from '../store/AppContext';

const ICON_MAP = {
  Compass,
  Sparkles,
  Star,
  Trophy,
  Award,
  Target,
  Ruler,
  Flame,
  PenTool,
  Crown,
  Layers,
  CheckCircle2,
};

function downloadCertificatePng(params: {
  learnerName: string;
  rankTitle: string;
  totalStars: number;
  maxStars: number;
  completedCount: number;
  totalChallenges: number;
  unlockedBadges: number;
  dateStr: string;
}) {
  const canvas = document.createElement('canvas');
  // Landscape A4 proportion (1754 x 1240)
  canvas.width = 1754;
  canvas.height = 1240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Soft ivory background
  ctx.fillStyle = '#FCFDFB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle geometric grid
  ctx.strokeStyle = 'rgba(15, 118, 110, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Outer & Inner ceremonial frames
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = 14;
  ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(78, 78, canvas.width - 156, canvas.height - 156);

  // Geometric watermark compass circles
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(877, 620, 340, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(707, 620, 340, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1047, 620, 340, 0, Math.PI * 2);
  ctx.stroke();

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F766E';
  ctx.font = 'bold 34px "Be Vietnam Pro", sans-serif';
  ctx.fillText('HỌC VIỆN HÌNH HỌC SMART · GEOMETRY SMART ACADEMY', 877, 185);

  ctx.fillStyle = '#172033';
  ctx.font = '800 66px "Be Vietnam Pro", sans-serif';
  ctx.fillText('GIẤY CHỨNG NHẬN THÀNH TÍCH', 877, 295);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 28px "Be Vietnam Pro", sans-serif';
  ctx.fillText('Ghi nhận tinh thần khám phá, dựng hình và chinh phục Toán học của học viên:', 877, 375);

  // Learner Name
  ctx.fillStyle = '#0F766E';
  ctx.font = '800 72px "Be Vietnam Pro", sans-serif';
  ctx.fillText(params.learnerName, 877, 485);

  // Gold divider
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(540, 520);
  ctx.lineTo(1214, 520);
  ctx.stroke();

  // Rank Badge Line
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 40px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`Danh hiệu đạt được: ${params.rankTitle}`, 877, 600);

  // Stats boxes
  const boxes = [
    { label: 'THỬ THÁCH HOÀN THÀNH', value: `${params.completedCount} / ${params.totalChallenges}` },
    { label: 'TỔNG SỐ SAO TỐI ƯU', value: `★ ${params.totalStars} / ${params.maxStars}` },
    { label: 'HUY HIỆU CHINH PHỤC', value: `${params.unlockedBadges} / 12` },
  ];
  boxes.forEach((b, idx) => {
    const bx = 260 + idx * 430;
    const by = 670;
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, 370, 150);
    ctx.strokeRect(bx, by, 370, 150);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
    ctx.fillText(b.label, bx + 185, by + 50);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 44px "Be Vietnam Pro", sans-serif';
    ctx.fillText(b.value, bx + 185, by + 112);
  });

  // Date & Signature
  ctx.fillStyle = '#334155';
  ctx.font = '600 26px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`Ngày cấp: ${params.dateStr}`, 460, 960);
  ctx.fillText('Khám phá – Dựng hình – Chinh phục', 1290, 960);

  // Explicit required academic disclaimer
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 20px "Be Vietnam Pro", sans-serif';
  ctx.fillText(
    'Chứng nhận thành tích trong ứng dụng Học Viện Hình Học Smart – phục vụ mục đích học tập và khích lệ tinh thần,',
    877,
    1075
  );
  ctx.fillText(
    'không có giá trị thay thế văn bằng/chứng chỉ nhà nước.',
    877,
    1108
  );

  const link = document.createElement('a');
  link.download = `chung-nhan-hinh-hoc-smart-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export const AchievementsPage: React.FC = () => {
  const { stats, stats3D, progressMap, progress3DMap, settings, updateSettings, drawings, arenaRooms, setCampaignDimension, setPage } = useApp();

  const badgeContext = useMemo(
    () => ({
      progressMap,
      totalStars: stats.totalStars,
      completedCount: stats.completedCount,
      threeStarCount: stats.threeStarCount,
      streakDays: settings.streakDays,
      drawingsCount: drawings.length,
      arenaParticipations: arenaRooms.reduce((sum, r) => sum + r.results.length, 0),
    }),
    [progressMap, stats, settings.streakDays, drawings.length, arenaRooms]
  );

  const evaluatedBadges = useMemo(
    () =>
      BADGE_DEFINITIONS.map((b) => ({
        ...b,
        status: b.evaluate(badgeContext),
      })),
    [badgeContext]
  );

  const todayStr = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-1.5 no-print">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Award className="w-8 h-8 text-amber-500" />
          Thành tích, Danh hiệu &amp; Giấy chứng nhận
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Mọi hạng danh hiệu và huy hiệu đều được tính tự động từ kết quả dựng hình thực tế vượt qua kiểm chứng kéo điểm.
        </p>
      </div>

      {/* Rank Progression Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              Hệ thống 8 hạng danh hiệu Học viện
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Hạng {stats.rank.current.level}/8: {stats.rank.current.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {stats.rank.current.description}
            </p>
          </div>
          <div className="text-right font-mono-tabular">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              ★ {stats.totalStars}
              <span className="text-lg font-medium text-slate-400"> / {stats.maxStars}</span>
            </div>
            {stats.rank.next ? (
              <div className="text-xs text-slate-500 mt-0.5">
                Cần thêm {Math.max(0, stats.rank.next.minStars - stats.totalStars)} sao để đạt{' '}
                <strong>{stats.rank.next.title}</strong>
              </div>
            ) : (
              <div className="text-xs text-emerald-600 font-semibold">Đã đạt danh hiệu cao nhất!</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 via-sky-500 to-amber-500 transition-all"
            style={{ width: `${stats.rank.progressPercent}%` }}
          />
        </div>

        {/* 8 Rank Tiers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {RANK_TIERS.map((tier) => {
            const reached = stats.totalStars >= tier.minStars;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-3 text-sm ${
                  reached
                    ? 'border-teal-300 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="font-bold text-slate-500">Hạng {tier.level}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    ≥ {tier.minStars}★
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {tier.title}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Separate 3D Spatial Progress & Achievements (never merged into 540-star 2D system) */}
      <section className="rounded-2xl border border-sky-200 dark:border-sky-800/70 bg-gradient-to-br from-sky-50/60 to-white dark:from-slate-900 dark:to-slate-900 p-6 space-y-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400">
              Tiến độ Hình học Không gian 3D (Hệ thống riêng, không gộp vào 540 sao 2D)
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Chinh phục Không gian 3D &amp; Oxyz
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1">
              Hoàn thành {stats3D.completedCount}/{stats3D.totalChallenges} thử thách không gian · {stats3D.drawingsCount} bản dựng 3D đã lưu.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right font-mono-tabular">
              <div className="text-3xl font-black text-sky-700 dark:text-sky-400">
                ★ {stats3D.totalStars}
                <span className="text-lg font-medium text-slate-400"> / {stats3D.maxStars}</span>
              </div>
              <div className="text-xs text-slate-500">Sao hình học không gian 3D</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCampaignDimension('3d');
                setPage('campaign');
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
            >
              Mở thử thách 3D
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVELS_3D.map((lvl) => {
            const list = ALL_CHALLENGES_3D.filter((c) => c.levelId === lvl.id);
            const done = list.filter((c) => (progress3DMap[c.id]?.stars ?? 0) >= 1).length;
            const st = list.reduce((s, c) => s + Math.min(3, Math.max(0, progress3DMap[c.id]?.stars ?? 0)), 0);
            const pct = calcProgressPercent(done, list.length);
            return (
              <div key={lvl.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-sky-700 dark:text-sky-400">Cấp {lvl.roman} · {lvl.curriculumTag}</span>
                  <span className="text-amber-600">★ {st}/{list.length * 3}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{lvl.title}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono-tabular text-slate-500">{done}/{list.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12 Real Condition-Gated Badges */}
      <section className="space-y-4 no-print">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Bộ 12 Huy hiệu Chinh phục ({stats.unlockedBadgesCount}/12 đã mở)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluatedBadges.map((b) => {
            const Icon = ICON_MAP[b.iconName];
            const pct = Math.round((b.status.progress / Math.max(1, b.status.target)) * 100);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  b.status.unlocked
                    ? 'border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: b.status.unlocked ? `${b.accentColor}1A` : '#E2E8F0',
                      color: b.status.unlocked ? b.accentColor : '#64748B',
                    }}
                  >
                    {b.status.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-500">{b.category}</div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{b.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono-tabular">
                    <span className="text-slate-500">{b.criteriaText}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {b.status.progress}/{b.status.target}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.status.unlocked ? b.accentColor : '#94A3B8',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* A4 Achievement Certificate */}
      <section id="certificate-section" className="space-y-4 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Giấy chứng nhận thành tích (Khổ A4)
            </h2>
            <p className="text-[15px] text-slate-500">
              Cập nhật họ tên học viên rồi tải ảnh PNG chất lượng cao hoặc in trực tiếp thành PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
              placeholder="Họ tên trên giấy chứng nhận..."
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() =>
                downloadCertificatePng({
                  learnerName: settings.displayName || 'Học viên Hình học',
                  rankTitle: stats.rank.current.title,
                  totalStars: stats.totalStars,
                  maxStars: stats.maxStars,
                  completedCount: stats.completedCount,
                  totalChallenges: stats.totalChallenges,
                  unlockedBadges: stats.unlockedBadgesCount,
                  dateStr: todayStr,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
            >
              <Download className="w-4 h-4" />
              Tải ảnh PNG (A4)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" />
              In / Lưu PDF
            </button>
          </div>
        </div>

        {/* Printable A4 Visual Preview */}
        <div className="rounded-2xl border-8 border-double border-teal-700 bg-[#FCFDFB] text-slate-900 p-8 sm:p-12 shadow-md text-center space-y-6 relative overflow-hidden">
          <div className="text-sm font-bold tracking-[0.2em] uppercase text-teal-700">
            Học Viện Hình Học Smart · Geometry Smart Academy
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            GIẤY CHỨNG NHẬN THÀNH TÍCH
          </h3>
          <p className="text-base text-slate-600">
            Ghi nhận tinh thần khám phá, dựng hình và chinh phục Toán học của học viên:
          </p>
          <div className="text-3xl sm:text-5xl font-black text-teal-800 py-2 border-b-2 border-amber-400 max-w-xl mx-auto">
            {settings.displayName || 'Học viên Hình học'}
          </div>
          <div className="text-xl font-bold text-violet-700">
            Danh hiệu hiện tại: {stats.rank.current.title}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Thử thách hoàn thành</div>
              <div className="text-2xl font-extrabold font-mono-tabular text-slate-900 mt-1">
                {stats.completedCount} / {stats.totalChallenges}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Tổng số sao</div>
              <div className="text-2xl font-extrabold font-mono-tabular text-amber-600 mt-1">
                ★ {stats.totalStars} / {stats.maxStars}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">Huy hiệu đạt được</div>
              <div className="text-2xl font-extrabold font-mono-tabular text-teal-700 mt-1">
                {stats.unlockedBadgesCount} / 12
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 max-w-2xl mx-auto pt-4 text-sm text-slate-600">
            <span>Ngày ghi nhận: <strong>{todayStr}</strong></span>
            <span>Khẩu hiệu: <strong>Khám phá – Dựng hình – Chinh phục</strong></span>
          </div>

          <p className="text-xs italic text-slate-500 max-w-2xl mx-auto pt-3 border-t border-slate-200">
            Chứng nhận thành tích trong ứng dụng Học Viện Hình Học Smart – phục vụ mục đích học tập và khích lệ tinh thần, không có giá trị thay thế văn bằng/chứng chỉ nhà nước.
          </p>
        </div>
      </section>
    </div>
  );
};

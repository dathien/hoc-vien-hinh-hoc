import React, { useMemo, useState } from 'react';
import { Info, Lock, Search, Star } from 'lucide-react';
import {
  ALL_CHALLENGES,
  getChallengeProgramLabel,
  isChallengeUnlocked,
  PROGRAM_LABELS,
} from '../challenges';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { MathText } from '../components/math/MathText';
import { CHALLENGES_3D } from '../geometry3d/challenges3d';
import { useApp } from '../store/AppContext';
import type { CognitiveLevel, Difficulty, ProgramLabel } from '../validators/types';

type QuickTrackFilter =
  | 'Tất cả'
  | 'Kiến thức nền tảng'
  | 'Lớp 10'
  | 'Lớp 11'
  | 'Lớp 12'
  | 'Mở rộng và Olympic';

const QUICK_TRACK_OPTIONS: QuickTrackFilter[] = [
  'Tất cả',
  'Kiến thức nền tảng',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
  'Mở rộng và Olympic',
];

const DIFFICULTY_OPTIONS: Array<Difficulty | 'Tất cả'> = [
  'Tất cả',
  'Cơ bản',
  'Trung bình',
  'Khá',
  'Nâng cao',
  'Olympic',
];

const COGNITIVE_OPTIONS: Array<CognitiveLevel | 'Tất cả'> = [
  'Tất cả',
  'Kiến thức nền tảng',
  'Nhận biết',
  'Thông hiểu',
  'Vận dụng',
  'Nâng cao',
];

export const GradesPage: React.FC = () => {
  const { progressMap, progress3DMap, teacherPreviewMode, openChallenge, openChallenge3D } = useApp();
  const [quickTrack, setQuickTrack] = useState<QuickTrackFilter>('Tất cả');
  const [programFilter, setProgramFilter] = useState<ProgramLabel | 'Tất cả'>('Tất cả');
  const [difficulty, setDifficulty] = useState<Difficulty | 'Tất cả'>('Tất cả');
  const [cognitive, setCognitive] = useState<CognitiveLevel | 'Tất cả'>('Tất cả');
  const [query, setQuery] = useState('');

  const filtered3D = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHALLENGES_3D.filter((ch) => {
      if (quickTrack === 'Kiến thức nền tảng' || quickTrack === 'Lớp 10') return false;
      if (quickTrack === 'Lớp 11' && ch.curriculumTag !== 'Toán 11') return false;
      if (quickTrack === 'Lớp 12' && ch.curriculumTag !== 'Toán 12') return false;
      if (quickTrack === 'Mở rộng và Olympic' && ch.curriculumTag !== 'Kiến thức mở rộng') return false;
      if (programFilter !== 'Tất cả' && ch.curriculumTag !== programFilter) return false;
      if (difficulty !== 'Tất cả' && ch.difficulty !== difficulty) return false;
      if (q && !ch.title.toLowerCase().includes(q) && !ch.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [quickTrack, programFilter, difficulty, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CHALLENGES.filter((ch) => {
      const label = getChallengeProgramLabel(ch);

      if (quickTrack === 'Kiến thức nền tảng' && label !== 'Kiến thức nền tảng') return false;
      if (quickTrack === 'Lớp 10' && label !== 'Toán 10') return false;
      if (quickTrack === 'Lớp 11' && label !== 'Toán 11') return false;
      if (quickTrack === 'Lớp 12' && label !== 'Toán 12') return false;
      if (
        quickTrack === 'Mở rộng và Olympic' &&
        label !== 'Kiến thức mở rộng' &&
        label !== 'Hình học Olympic'
      ) {
        return false;
      }

      if (programFilter !== 'Tất cả' && label !== programFilter) return false;
      if (difficulty !== 'Tất cả' && ch.difficulty !== difficulty) return false;
      if (cognitive !== 'Tất cả' && ch.cognitiveLevel !== cognitive) return false;
      if (
        q &&
        !ch.title.toLowerCase().includes(q) &&
        !ch.description.toLowerCase().includes(q) &&
        !ch.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [quickTrack, programFilter, difficulty, cognitive, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Phân loại Thử thách Theo lớp &amp; Chương trình
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Phân biệt khoa học giữa Kiến thức nền tảng hình học phẳng, các nội dung liên hệ Toán 10 – 11 theo Chương trình GDPT 2018 với nhóm Kiến thức mở rộng và Hình học Olympic.
        </p>
      </div>

      {/* Required Quick Track Selector */}
      <div className="flex flex-wrap gap-2">
        {QUICK_TRACK_OPTIONS.map((track) => (
          <button
            key={track}
            type="button"
            onClick={() => setQuickTrack(track)}
            className={`px-4 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
              quickTrack === track
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
            }`}
          >
            {track}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="relative block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Tìm theo tên bài</span>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: Trung trực, Thalès, Tiếp tuyến..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Nhãn phân loại kiến thức</span>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value as ProgramLabel | 'Tất cả')}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white"
          >
            <option value="Tất cả">Tất cả nhãn</option>
            {PROGRAM_LABELS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Độ khó</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | 'Tất cả')}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white"
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Mức độ nhận thức</span>
          <select
            value={cognitive}
            onChange={(e) => setCognitive(e.target.value as CognitiveLevel | 'Tất cả')}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white"
          >
            {COGNITIVE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-[15px] text-slate-600 dark:text-slate-400">
        <span>
          Hiển thị <strong className="text-slate-900 dark:text-white font-mono-tabular">{filtered.length}</strong> / 180 thử thách phù hợp
        </span>
        {(quickTrack !== 'Tất cả' ||
          programFilter !== 'Tất cả' ||
          difficulty !== 'Tất cả' ||
          cognitive !== 'Tất cả' ||
          query) && (
          <button
            type="button"
            onClick={() => {
              setQuickTrack('Tất cả');
              setProgramFilter('Tất cả');
              setDifficulty('Tất cả');
              setCognitive('Tất cả');
              setQuery('');
            }}
            className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Filtered 3D Spatial & Oxyz Section (Toán 11 & Toán 12) */}
      {filtered3D.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hình học Không gian 3D &amp; Hệ tọa độ Oxyz ({filtered3D.length} thử thách)
            </h2>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
              Chương trình Toán 11 &amp; Toán 12 (GDPT 2018)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered3D.map((ch) => {
              const stars = progress3DMap[ch.id]?.stars ?? 0;
              return (
                <div
                  key={ch.id}
                  className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-sky-500 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                      <span>3D · Cấp {ch.levelId} · Bài {ch.order} · {ch.curriculumTag}</span>
                      <span>{ch.difficulty}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{ch.title}</h3>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      <MathText text={ch.description} />
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openChallenge3D(ch.id)}
                      className="text-[15px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      Mở dựng 3D →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtered 2D Challenge Grid or Honest Grade 12 Academic Note */}
      {filtered.length === 0 ? (
        quickTrack === 'Lớp 12' || programFilter === 'Toán 12' ? (
          <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base text-sky-900 dark:text-sky-200">
              <Info className="w-5 h-5 shrink-0" />
              Ghi chú chương trình Toán 12 (GDPT 2018)
            </div>
            <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
              Chương trình Toán 12 tập trung vào Hình học tọa độ trong không gian Oxyz (được hiển thị ở mục Hình học Không gian 3D phía trên), không có chuyên đề dựng hình phẳng bằng thước và compa.
            </p>
          </div>
        ) : filtered3D.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-[15px] text-slate-500">
            Không tìm thấy thử thách nào khớp bộ lọc hiện tại.
          </div>
        ) : null
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ch) => {
            const unlocked = isChallengeUnlocked(ch, progressMap, teacherPreviewMode);
            const stars = progressMap[ch.id]?.stars ?? 0;
            const programLabel = getChallengeProgramLabel(ch);

            return (
              <div
                key={ch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-20 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <GeoThumbnailSVG kind={ch.thumbnailKind} className="w-full h-16" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      Cấp {ch.levelId} · Bài {ch.order} · {programLabel}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mt-0.5">
                      {ch.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {ch.difficulty} · {ch.cognitiveLevel}
                    </div>
                  </div>
                </div>

                <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  <MathText text={ch.description} />
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs font-mono-tabular text-slate-500">
                      {ch.targetL}L / {ch.targetE}E
                    </span>
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => openChallenge(ch.id)}
                      className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Thực hành →
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      Mở theo lộ trình
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Box, Compass, Lock, Ruler, Search, Star } from 'lucide-react';
import {
  ALL_CHALLENGES,
  getChallengeProgramLabel,
  isChallengeUnlocked,
} from '../challenges';
import { ThptGradeFilterBar } from '../components/common/ThptGradeFilterBar';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { MathText } from '../components/math/MathText';
import {
  getChaptersByGrade,
  getLessonsByGrade,
  getThptInventoryStats,
  template2DMatchesGrade,
  template3DMatchesGrade,
  THPT_GRADE_META,
} from '../data/thptCurriculum';
import { TEMPLATES_2D } from '../geometry/templates2d';
import { ALL_CHALLENGES_3D } from '../geometry3d/challenges3d';
import { TEMPLATES_3D } from '../geometry3d/templates3d';
import { useApp } from '../store/AppContext';
import type { Difficulty } from '../validators/types';

const DIFFICULTY_OPTIONS: Array<Difficulty | 'Tất cả'> = [
  'Tất cả',
  'Cơ bản',
  'Trung bình',
  'Khá',
  'Nâng cao',
  'Olympic',
];

export const GradesPage: React.FC = () => {
  const {
    activeGradeFilter,
    setActiveGradeFilter,
    progressMap,
    progress3DMap,
    teacherPreviewMode,
    openChallenge,
    openChallenge3D,
    openLabWithScene,
    openLab3DWithScene,
    setPage,
  } = useApp();

  const inventory = useMemo(() => getThptInventoryStats(), []);
  const [includeExtension, setIncludeExtension] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | 'Tất cả'>('Tất cả');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const chapters = useMemo(() => getChaptersByGrade(activeGradeFilter), [activeGradeFilter]);

  const lessons = useMemo(() => {
    return getLessonsByGrade(activeGradeFilter).filter((l) => {
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.chapterTitle.toLowerCase().includes(q)
      );
    });
  }, [activeGradeFilter, q]);

  const templates2D = useMemo(() => {
    return TEMPLATES_2D.filter((t) => {
      const matchGrade =
        template2DMatchesGrade(t.curriculumTag, activeGradeFilter) ||
        (includeExtension && t.curriculumTag === 'Mở rộng');
      if (!matchGrade) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [activeGradeFilter, includeExtension, q]);

  const templates3D = useMemo(() => {
    return TEMPLATES_3D.filter((t) => {
      if (!template3DMatchesGrade(t.curriculumTag, activeGradeFilter)) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [activeGradeFilter, q]);

  const filtered2DChallenges = useMemo(() => {
    return ALL_CHALLENGES.filter((ch) => {
      const lbl = getChallengeProgramLabel(ch);
      if (activeGradeFilter === '10' && lbl !== 'Toán 10') return false;
      if (activeGradeFilter === '11' && lbl !== 'Toán 11') return false;
      if (activeGradeFilter === '12') return false;
      if (
        activeGradeFilter === 'all' &&
        !includeExtension &&
        (lbl === 'Kiến thức mở rộng' || lbl === 'Hình học Olympic')
      ) {
        return false;
      }
      if (difficulty !== 'Tất cả' && ch.difficulty !== difficulty) return false;
      if (q && !ch.title.toLowerCase().includes(q) && !ch.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [activeGradeFilter, includeExtension, difficulty, q]);

  const filtered3DChallenges = useMemo(() => {
    return ALL_CHALLENGES_3D.filter((ch) => {
      if (activeGradeFilter === '10') return false;
      if (activeGradeFilter === '11' && ch.curriculumTag !== 'Toán 11') return false;
      if (activeGradeFilter === '12' && ch.curriculumTag !== 'Toán 12') return false;
      if (difficulty !== 'Tất cả' && ch.difficulty !== difficulty) return false;
      if (q && !ch.title.toLowerCase().includes(q) && !ch.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [activeGradeFilter, difficulty, q]);

  const activeGradeSummary = useMemo(() => {
    if (activeGradeFilter === 'all') {
      return {
        title: 'Chương trình Hình học THPT (Lớp 10 – 11 – 12)',
        subtitle: 'SGK Kết nối tri thức với cuộc sống (GDPT 2018) — tích hợp bài học, hình mẫu 2D–3D và thử thách tương tác.',
        chapters: inventory.totals.chapters,
        lessons: inventory.totals.lessons,
        templates: inventory.totals.templatesAll,
        challenges: inventory.totals.challengesAll,
      };
    }
    const meta = THPT_GRADE_META[activeGradeFilter];
    const stat = inventory.byGrade[activeGradeFilter];
    return {
      title: meta.title,
      subtitle: meta.textbook,
      chapters: stat.chaptersCount,
      lessons: stat.lessonsCount,
      templates: stat.templatesTotal,
      challenges: stat.challengesTotal,
    };
  }, [activeGradeFilter, inventory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Học Hình học theo Lớp THPT
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Tra cứu đồng bộ bài học SGK Kết nối tri thức, hình mẫu tương tác 2D – 3D và thử thách thực hành theo từng khối lớp 10, 11 và 12.
        </p>
      </div>

      {/* Unified THPT Grade Filter Bar + Search + Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ThptGradeFilterBar
          value={activeGradeFilter}
          onChange={setActiveGradeFilter}
          counts={{
            all: inventory.totals.lessons,
            '10': inventory.byGrade['10'].lessonsCount,
            '11': inventory.byGrade['11'].lessonsCount,
            '12': inventory.byGrade['12'].lessonsCount,
          }}
        />
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={includeExtension}
            onChange={(e) => setIncludeExtension(e.target.checked)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Hiển thị thêm Mở rộng &amp; Olympic ({inventory.extensionChallenges2D} bài)
        </label>
      </div>

      {/* Active Grade Summary Strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeGradeSummary.title}
          </h2>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            {activeGradeSummary.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono-tabular">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold">
            {activeGradeSummary.chapters} chương
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold">
            {activeGradeSummary.lessons} bài học SGK
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold">
            {activeGradeSummary.templates} hình mẫu
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 font-semibold">
            {activeGradeSummary.challenges} thử thách
          </span>
        </div>
      </div>

      {/* Search & Difficulty Filter */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="sm:col-span-2 block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Tìm theo tên bài học, hình mẫu hoặc thử thách</span>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: Vectơ, Đường tròn, Thiết diện, Khoảng cách, Mặt cầu Oxyz..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-500 block mb-1">Độ khó thử thách</span>
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
      </div>

      {/* Section 1: Chapters & SGK Lessons */}
      {lessons.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Bài học SGK Kết nối tri thức ({lessons.length} bài · {chapters.length} chương)
            </h2>
            <button
              type="button"
              onClick={() => setPage('library')}
              className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              Mở Thư viện chi tiết
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const meta = THPT_GRADE_META[lesson.grade];
              return (
                <article
                  key={lesson.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                      <span style={{ color: meta.accentHex }}>
                        {meta.label} · Bài {lesson.lessonNumber}
                      </span>
                      <span className="text-slate-400 uppercase">{lesson.dimension}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lesson.chapterTitle}</p>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      <MathText text={lesson.summary} />
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGradeFilter(lesson.grade);
                        setPage('library');
                      }}
                      className="text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:underline"
                    >
                      Xem bài học
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        lesson.dimension === '2d'
                          ? openChallenge(lesson.challengeId)
                          : openChallenge3D(lesson.challengeId)
                      }
                      className="text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      Thử thách →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: Interactive Templates (2D & 3D) */}
      {(templates2D.length > 0 || templates3D.length > 0) && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-5 h-5 text-sky-600" />
              Hình mẫu tương tác ({templates2D.length + templates3D.length} hình)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates2D.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl border border-teal-200/80 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-700 dark:text-teal-400">
                    <span>2D · {tpl.curriculumTag}</span>
                    <span>{tpl.topic}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{tpl.title}</h3>
                  <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    <MathText text={tpl.summary} />
                  </p>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openLabWithScene(tpl.buildScene(), tpl.title)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    Mở trong Phòng 2D →
                  </button>
                </div>
              </div>
            ))}

            {templates3D.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-sky-500 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                    <span>3D · {tpl.curriculumTag}</span>
                    <span>{tpl.group}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{tpl.title}</h3>
                  <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    <MathText text={tpl.summary} />
                  </p>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openLab3DWithScene(tpl.buildScene(), tpl.title)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    <Box className="w-3.5 h-3.5" />
                    Mở trong Phòng 3D →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Challenges (2D & 3D with Dynamic Totals) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[15px] text-slate-600 dark:text-slate-400">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-600" />
            Thử thách tương tác ({filtered2DChallenges.length + filtered3DChallenges.length} bài phù hợp)
          </h2>
          <span className="text-sm font-mono-tabular">
            2D: {filtered2DChallenges.length}/{ALL_CHALLENGES.length} · 3D: {filtered3DChallenges.length}/{ALL_CHALLENGES_3D.length}
          </span>
        </div>

        {/* 2D Challenges */}
        {filtered2DChallenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered2DChallenges.map((ch) => {
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
                        2D · Cấp {ch.levelId} · Bài {ch.order} · {programLabel}
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

        {/* 3D Challenges */}
        {filtered3DChallenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered3DChallenges.map((ch) => {
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
        )}

        {filtered2DChallenges.length === 0 && filtered3DChallenges.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-[15px] text-slate-500">
            Không tìm thấy thử thách nào khớp bộ lọc hiện tại.
          </div>
        )}
      </section>
    </div>
  );
};

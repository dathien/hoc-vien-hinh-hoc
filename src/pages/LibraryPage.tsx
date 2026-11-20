import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Box, Compass, History, Ruler } from 'lucide-react';
import { ThptGradeFilterBar } from '../components/common/ThptGradeFilterBar';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import { MathText } from '../components/math/MathText';
import { HISTORY_CARDS, KNOWLEDGE_TOPICS, type KnowledgeTopic } from '../data/knowledge';
import {
  getLessonsByGrade,
  getThptInventoryStats,
  THPT_GRADE_META,
  THPT_LESSONS,
  type LessonContentCategory,
  type ThptLesson,
} from '../data/thptCurriculum';
import { addGeoObject, createEmptyScene } from '../geometry/engine';
import { getTemplate2DById } from '../geometry/templates2d';
import type { GeoScene } from '../geometry/types';
import { getTemplate3DById } from '../geometry3d/templates3d';
import { useApp } from '../store/AppContext';
import type { InitialGeoSpec } from '../validators/types';

type LibraryTab = 'sgk' | 'topics' | 'history';

const LESSON_CATEGORIES: Array<'Tất cả' | LessonContentCategory> = [
  'Tất cả',
  'Khái niệm và định nghĩa',
  'Tính chất hình học',
  'Định lí và hệ quả',
  'Phương pháp dựng hình',
];

function buildInteractiveSceneFromSpecs(specs: InitialGeoSpec[]): GeoScene {
  let sc = createEmptyScene();
  for (const sp of specs) {
    sc = addGeoObject(sc, {
      id: sp.id,
      kind: sp.kind,
      rule: sp.rule,
      parents: sp.parents,
      params: sp.params,
      label: sp.label,
      x: sp.x,
      y: sp.y,
      style: sp.style,
      skipLog: true,
    }).scene;
  }
  return sc;
}

function buildLesson2DScene(lesson: ThptLesson): GeoScene {
  const tpl = getTemplate2DById(lesson.templateId);
  return tpl ? tpl.buildScene() : createEmptyScene();
}

export const LibraryPage: React.FC = () => {
  const {
    activeGradeFilter,
    setActiveGradeFilter,
    openChallenge,
    openChallenge3D,
    openLabWithScene,
    openLab3DWithScene,
    settings,
  } = useApp();

  const inventory = useMemo(() => getThptInventoryStats(), []);
  const [tab, setTab] = useState<LibraryTab>('sgk');
  const [categoryFilter, setCategoryFilter] = useState<'Tất cả' | LessonContentCategory>('Tất cả');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(THPT_LESSONS[0].id);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(KNOWLEDGE_TOPICS[0].id);

  // Filtered SGK THPT lessons
  const visibleLessons = useMemo(() => {
    const byGrade = getLessonsByGrade(activeGradeFilter);
    if (categoryFilter === 'Tất cả') return byGrade;
    return byGrade.filter((l) => l.categories.includes(categoryFilter));
  }, [activeGradeFilter, categoryFilter]);

  const selectedLesson = useMemo(() => {
    return visibleLessons.find((l) => l.id === selectedLessonId) ?? visibleLessons[0] ?? THPT_LESSONS[0];
  }, [visibleLessons, selectedLessonId]);

  const [lesson2DScene, setLesson2DScene] = useState<GeoScene>(() =>
    selectedLesson.dimension === '2d' ? buildLesson2DScene(selectedLesson) : createEmptyScene()
  );

  useEffect(() => {
    if (selectedLesson.dimension === '2d') {
      setLesson2DScene(buildLesson2DScene(selectedLesson));
    }
  }, [selectedLesson]);

  const lesson3DScene = useMemo(() => {
    if (selectedLesson.dimension !== '3d') return undefined;
    return getTemplate3DById(selectedLesson.templateId)?.buildScene();
  }, [selectedLesson]);

  // Filtered extension topics
  const selectedTopic: KnowledgeTopic = useMemo(() => {
    return KNOWLEDGE_TOPICS.find((t) => t.id === selectedTopicId) ?? KNOWLEDGE_TOPICS[0];
  }, [selectedTopicId]);

  const [topicDemoScene, setTopicDemoScene] = useState<GeoScene>(() =>
    buildInteractiveSceneFromSpecs(selectedTopic.interactiveSpecs)
  );

  useEffect(() => {
    setTopicDemoScene(buildInteractiveSceneFromSpecs(selectedTopic.interactiveSpecs));
  }, [selectedTopic]);

  const gradeCounts = useMemo(
    () => ({
      all: inventory.totals.lessons,
      '10': inventory.byGrade['10'].lessonsCount,
      '11': inventory.byGrade['11'].lessonsCount,
      '12': inventory.byGrade['12'].lessonsCount,
    }),
    [inventory]
  );

  const handleOpenLessonInLab = (lesson: ThptLesson) => {
    if (lesson.dimension === '2d') {
      openLabWithScene(lesson2DScene, `Toán ${lesson.grade} · ${lesson.title}`);
    } else if (lesson3DScene) {
      openLab3DWithScene(lesson3DScene, `Toán ${lesson.grade} · ${lesson.title}`);
    }
  };

  const handleOpenLessonChallenge = (lesson: ThptLesson) => {
    if (lesson.dimension === '2d') {
      openChallenge(lesson.challengeId);
    } else {
      openChallenge3D(lesson.challengeId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-sky-600" />
          Thư viện Kiến thức Hình học THPT
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Hệ thống {inventory.totals.lessons} bài học bám sát SGK Kết nối tri thức với cuộc sống (Toán 10, Toán 11, Toán 12), cùng {KNOWLEDGE_TOPICS.length} chuyên đề dựng hình mở rộng và {HISTORY_CARDS.length} chân dung lịch sử Toán học.
        </p>
      </div>

      {/* Top View Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setTab('sgk')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
            tab === 'sgk'
              ? 'bg-teal-700 text-white border-teal-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Bài học SGK THPT ({inventory.totals.lessons})
        </button>
        <button
          type="button"
          onClick={() => setTab('topics')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
            tab === 'topics'
              ? 'bg-teal-700 text-white border-teal-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          Chuyên đề dựng hình mở rộng ({KNOWLEDGE_TOPICS.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
            tab === 'history'
              ? 'bg-teal-700 text-white border-teal-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <History className="w-4 h-4" />
          Lịch sử Toán học ({HISTORY_CARDS.length})
        </button>
      </div>

      {/* TAB 1: Official SGK KNTT THPT 10-11-12 Lessons */}
      {tab === 'sgk' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ThptGradeFilterBar
              value={activeGradeFilter}
              onChange={setActiveGradeFilter}
              counts={gradeCounts}
            />
            <div className="flex flex-wrap gap-1.5">
              {LESSON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Lesson Index */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-bold text-[15px] text-slate-800 dark:text-slate-100">
                Danh mục bài học ({visibleLessons.length})
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[760px] overflow-y-auto">
                {visibleLessons.map((lesson) => {
                  const active = lesson.id === selectedLesson.id;
                  const meta = THPT_GRADE_META[lesson.grade];
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        active
                          ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span style={{ color: meta.accentHex }}>{meta.label} · Bài {lesson.lessonNumber}</span>
                        <span className="text-slate-400 uppercase">{lesson.dimension}</span>
                      </div>
                      <div className="font-bold text-[15px] mt-0.5 leading-snug">{lesson.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {lesson.chapterTitle}
                      </div>
                    </button>
                  );
                })}
                {visibleLessons.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Không có bài học khớp bộ lọc hiện tại.
                  </div>
                )}
              </div>
            </div>

            {/* Right Interactive Lesson Panel */}
            <div className="lg:col-span-8 space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                      <span className={`px-2.5 py-0.5 rounded-md border ${THPT_GRADE_META[selectedLesson.grade].badgeClass}`}>
                        {THPT_GRADE_META[selectedLesson.grade].label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {selectedLesson.chapterTitle}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Bài {selectedLesson.lessonNumber}. {selectedLesson.title}
                    </h2>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <MathText text={selectedLesson.summary} />
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLessonInLab(selectedLesson)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {selectedLesson.dimension === '2d' ? (
                        <Ruler className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Box className="w-4 h-4 text-sky-600" />
                      )}
                      Mở trong Phòng thực hành {selectedLesson.dimension.toUpperCase()}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenLessonChallenge(selectedLesson)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
                    >
                      Thử thách liên quan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Interactive Diagram (2D Canvas or 3D Projection Preview) */}
                <div className="space-y-2">
                  {selectedLesson.dimension === '2d' ? (
                    <GeometryCanvas
                      scene={lesson2DScene}
                      onSceneChange={(next) => setLesson2DScene(next)}
                      interactiveDragOnly
                      compactToolbar
                      heightClass="h-[340px]"
                      darkTheme={settings.theme === 'dark'}
                    />
                  ) : (
                    <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/70 bg-slate-50/90 dark:bg-slate-950/90 p-4 flex flex-col items-center justify-center gap-3">
                      <div className="w-full h-[290px] flex items-center justify-center">
                        <LiveGeo3DPreview
                          scene={lesson3DScene}
                          variant="hero_pyramid"
                          width={520}
                          height={280}
                          animate={false}
                          reducedMotion={settings.reducedMotion}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenLessonInLab(selectedLesson)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800"
                      >
                        <Box className="w-4 h-4" />
                        Xoay &amp; tương tác toàn màn hình trong Phòng thực hành 3D
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <strong>Hình minh họa tương tác:</strong> {selectedLesson.interactiveNote}
                  </p>
                </div>

                {/* Key Formulas */}
                {selectedLesson.keyFormulas.length > 0 && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Công thức &amp; hệ thức trọng tâm
                    </div>
                    <ul className="space-y-1.5 text-[15px] text-slate-800 dark:text-slate-100">
                      {selectedLesson.keyFormulas.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <MathText text={f} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Structured Academic Content */}
                <div className="space-y-4 text-[15px] sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                  <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300 mb-1">
                      Nội dung kiến thức &amp; Phát biểu chính xác
                    </div>
                    <MathText text={selectedLesson.theorem} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">
                        Điều kiện áp dụng (Giả thiết)
                      </div>
                      <MathText text={selectedLesson.hypothesis} />
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white mb-1">
                        Kết luận hình học
                      </div>
                      <MathText text={selectedLesson.conclusion} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Phương pháp thực hành &amp; lập luận
                    </h3>
                    <p className="leading-relaxed">
                      <MathText text={selectedLesson.method} />
                    </p>
                  </div>

                  <div className="text-[15px] text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5">
                    <strong>Ví dụ minh họa: </strong>
                    <MathText text={selectedLesson.example} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Extension 2D Construction Topics */}
      {tab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-bold text-[15px] text-slate-800 dark:text-slate-100">
              Chuyên đề dựng hình mở rộng ({KNOWLEDGE_TOPICS.length})
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[700px] overflow-y-auto">
              {KNOWLEDGE_TOPICS.map((t) => {
                const active = t.id === selectedTopic.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      active
                        ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      Chuyên đề {t.levelId} · {t.curriculumCategory}
                    </div>
                    <div className="font-bold text-[15px] mt-0.5">{t.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                    Chuyên đề {selectedTopic.levelId}/{KNOWLEDGE_TOPICS.length} · {selectedTopic.curriculumCategory}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedTopic.title}
                  </h2>
                  <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <MathText text={selectedTopic.subtitle} />
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openLabWithScene(topicDemoScene, selectedTopic.title)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Ruler className="w-4 h-4 text-sky-600" />
                    Mở trong Phòng thực hành 2D
                  </button>
                  <button
                    type="button"
                    onClick={() => openChallenge(selectedTopic.challengeId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
                  >
                    Thử thách liên quan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <GeometryCanvas
                  scene={topicDemoScene}
                  onSceneChange={(next) => setTopicDemoScene(next)}
                  interactiveDragOnly
                  compactToolbar
                  heightClass="h-[340px]"
                  darkTheme={settings.theme === 'dark'}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <strong>Hình minh họa động:</strong> {selectedTopic.interactiveNote}
                </p>
              </div>

              <div className="space-y-4 text-[15px] sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/70 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300 mb-1">
                    Phát biểu chính xác
                  </div>
                  <MathText text={selectedTopic.theorem} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">Điều kiện áp dụng (Giả thiết)</div>
                    <MathText text={selectedTopic.hypothesis} />
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">Kết luận hình học</div>
                    <MathText text={selectedTopic.conclusion} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">Phương pháp dựng hình</h3>
                  <p className="leading-relaxed">
                    <MathText text={selectedTopic.explanation} />
                  </p>
                </div>

                <div className="space-y-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Giải thích và chứng minh</h3>
                  <p className="leading-relaxed">
                    <MathText text={selectedTopic.proof} />
                  </p>
                </div>

                <div className="text-[15px] text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5">
                  <strong>Ví dụ minh họa &amp; Lưu ý: </strong>
                  <MathText text={selectedTopic.example} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: History of Geometry */}
      {tab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HISTORY_CARDS.map((card) => (
            <article
              key={card.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-teal-400 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-24 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden h-20">
                  <GeoThumbnailSVG kind={card.thumbnailKind} className="w-full h-20" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    {card.period} · {card.origin}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {card.name}
                  </h3>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {card.title}
                  </div>
                </div>
              </div>

              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.contribution}
              </p>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 text-[15px] text-slate-800 dark:text-slate-200">
                <strong className="text-teal-800 dark:text-teal-300">Đóng góp hình học: </strong>
                <MathText text={card.keyTheorem} />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openChallenge(card.relatedChallengeId)}
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Thử thách liên quan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

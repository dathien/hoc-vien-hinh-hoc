import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, History, Ruler } from 'lucide-react';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { MathText } from '../components/math/MathText';
import { HISTORY_CARDS, KNOWLEDGE_TOPICS, type KnowledgeTopic } from '../data/knowledge';
import { addGeoObject, createEmptyScene } from '../geometry/engine';
import type { GeoScene } from '../geometry/types';
import { useApp } from '../store/AppContext';
import type { InitialGeoSpec } from '../validators/types';

type LibrarySectionFilter =
  | 'Tất cả'
  | 'Khái niệm và định nghĩa'
  | 'Tính chất hình học'
  | 'Định lí và hệ quả'
  | 'Phương pháp dựng hình'
  | 'Ví dụ minh họa'
  | 'Kiến thức mở rộng'
  | 'Lịch sử Toán học';

const LIBRARY_SECTIONS: LibrarySectionFilter[] = [
  'Tất cả',
  'Khái niệm và định nghĩa',
  'Tính chất hình học',
  'Định lí và hệ quả',
  'Phương pháp dựng hình',
  'Ví dụ minh họa',
  'Kiến thức mở rộng',
  'Lịch sử Toán học',
];

function getTopicGroups(t: KnowledgeTopic): LibrarySectionFilter[] {
  const groups: LibrarySectionFilter[] = ['Phương pháp dựng hình', 'Ví dụ minh họa'];
  if ([1, 2, 3, 4].includes(t.levelId)) groups.push('Khái niệm và định nghĩa');
  if ([2, 3, 5, 7, 8, 11].includes(t.levelId)) groups.push('Tính chất hình học');
  if ([4, 6, 7, 9, 11, 13, 15, 16, 17].includes(t.levelId)) groups.push('Định lí và hệ quả');
  if ([10, 12, 13, 14, 15, 16, 17, 18].includes(t.levelId)) groups.push('Kiến thức mở rộng');
  return groups;
}

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

export const LibraryPage: React.FC = () => {
  const { openChallenge, openLabWithScene, settings } = useApp();
  const [section, setSection] = useState<LibrarySectionFilter>('Tất cả');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(KNOWLEDGE_TOPICS[0].id);

  const visibleTopics = useMemo(() => {
    if (section === 'Tất cả' || section === 'Lịch sử Toán học') return KNOWLEDGE_TOPICS;
    return KNOWLEDGE_TOPICS.filter((t) => getTopicGroups(t).includes(section));
  }, [section]);

  const selectedTopic = useMemo(() => {
    return visibleTopics.find((t) => t.id === selectedTopicId) ?? visibleTopics[0] ?? KNOWLEDGE_TOPICS[0];
  }, [visibleTopics, selectedTopicId]);

  const [demoScene, setDemoScene] = useState<GeoScene>(() =>
    buildInteractiveSceneFromSpecs(selectedTopic.interactiveSpecs)
  );

  useEffect(() => {
    setDemoScene(buildInteractiveSceneFromSpecs(selectedTopic.interactiveSpecs));
  }, [selectedTopic]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-sky-600" />
          Thư viện Kiến thức Hình học
        </h1>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Hệ thống 18 chuyên đề hình học động tương tác trực tiếp kèm phát biểu định lí, điều kiện áp dụng, phương pháp dựng hình, chứng minh và lịch sử Toán học.
        </p>
      </div>

      {/* 7 Structured Content Categories + All */}
      <div className="flex flex-wrap gap-2">
        {LIBRARY_SECTIONS.map((sec) => {
          const active = section === sec;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setSection(sec)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[15px] font-semibold border transition-colors ${
                active
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
              }`}
            >
              {sec === 'Lịch sử Toán học' && <History className="w-4 h-4" />}
              {sec}
            </button>
          );
        })}
      </div>

      {section !== 'Lịch sử Toán học' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left topic index */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-bold text-[15px] text-slate-800 dark:text-slate-100">
              Danh mục chuyên đề ({visibleTopics.length})
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[700px] overflow-y-auto">
              {visibleTopics.map((t) => {
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

          {/* Right interactive theorem & live diagram */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                    Chuyên đề {selectedTopic.levelId}/18 · {selectedTopic.curriculumCategory}
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
                    onClick={() => openLabWithScene(demoScene, selectedTopic.title)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Ruler className="w-4 h-4 text-sky-600" />
                    Mở trong Phòng thực hành
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

              {/* Live Draggable Dynamic Diagram */}
              <div className="space-y-2">
                <GeometryCanvas
                  scene={demoScene}
                  onSceneChange={(next) => setDemoScene(next)}
                  interactiveDragOnly
                  compactToolbar
                  heightClass="h-[340px]"
                  darkTheme={settings.theme === 'dark'}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <strong>Hình minh họa động:</strong> {selectedTopic.interactiveNote}
                </p>
              </div>

              {/* Structured Academic Content */}
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
      ) : (
        /* Historical Mathematicians & Sangaku Cards */
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

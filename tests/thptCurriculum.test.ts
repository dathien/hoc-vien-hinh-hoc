import { describe, expect, it } from 'vitest';
import { ALL_CHALLENGES, LEVELS, getChallengeProgramLabel } from '../src/challenges';
import { ARENA_THPT_PROBLEMS, getArenaProblemsByGrade } from '../src/data/arenaProblems';
import { KNOWLEDGE_TOPICS } from '../src/data/knowledge';
import {
  THPT_CHAPTERS,
  THPT_GRADE_ORDER,
  THPT_LESSONS,
  getChaptersByGrade,
  getLessonsByGrade,
  getThptInventoryStats,
  template2DMatchesGrade,
  template3DMatchesGrade,
} from '../src/data/thptCurriculum';
import { TEMPLATES_2D, getTemplate2DById } from '../src/geometry/templates2d';
import { ALL_CHALLENGES_3D } from '../src/geometry3d/challenges3d';
import { TEMPLATES_3D, getTemplate3DById } from '../src/geometry3d/templates3d';

const FORBIDDEN_THCS_TAGS = new Set(['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9']);

describe('THPT 10 – 11 – 12 Curriculum & Content Standardization', () => {
  it('balances chapters and lessons across Toán 10, Toán 11, and Toán 12', () => {
    expect(THPT_GRADE_ORDER).toEqual(['10', '11', '12']);

    expect(getChaptersByGrade('10')).toHaveLength(3);
    expect(getChaptersByGrade('11')).toHaveLength(2);
    expect(getChaptersByGrade('12')).toHaveLength(2);
    expect(getChaptersByGrade('all')).toHaveLength(7);

    expect(getLessonsByGrade('10')).toHaveLength(11);
    expect(getLessonsByGrade('11')).toHaveLength(11);
    expect(getLessonsByGrade('12')).toHaveLength(7);
    expect(getLessonsByGrade('all')).toHaveLength(29);
  });

  it('resolves every SGK lesson templateId and challengeId to real interactive data', () => {
    const ch2dIds = new Set(ALL_CHALLENGES.map((c) => c.id));
    const ch3dIds = new Set(ALL_CHALLENGES_3D.map((c) => c.id));

    for (const lesson of THPT_LESSONS) {
      expect(lesson.title.length).toBeGreaterThan(5);
      expect(lesson.keyFormulas.length).toBeGreaterThan(0);

      if (lesson.dimension === '2d') {
        expect(getTemplate2DById(lesson.templateId), `Missing 2D template ${lesson.templateId} for ${lesson.id}`).toBeDefined();
        expect(ch2dIds.has(lesson.challengeId), `Missing 2D challenge ${lesson.challengeId} for ${lesson.id}`).toBe(true);
      } else {
        expect(getTemplate3DById(lesson.templateId), `Missing 3D template ${lesson.templateId} for ${lesson.id}`).toBeDefined();
        expect(ch3dIds.has(lesson.challengeId), `Missing 3D challenge ${lesson.challengeId} for ${lesson.id}`).toBe(true);
      }
    }
  });

  it('builds every 2D template (15 total: 13 Toán 10 + 2 Mở rộng) with 100% valid finite geometry objects', () => {
    expect(TEMPLATES_2D).toHaveLength(15);
    expect(TEMPLATES_2D.filter((t) => template2DMatchesGrade(t.curriculumTag, '10'))).toHaveLength(13);
    expect(TEMPLATES_2D.filter((t) => t.curriculumTag === 'Mở rộng')).toHaveLength(2);

    for (const tpl of TEMPLATES_2D) {
      const scene = tpl.buildScene();
      expect(scene.order.length, `Template ${tpl.id} produced empty scene`).toBeGreaterThan(0);
      for (const id of scene.order) {
        const obj = scene.objects[id];
        expect(obj, `Missing object ${id} in ${tpl.id}`).toBeDefined();
        expect(obj.valid, `Invalid object ${id} (${obj.kind}/${obj.rule}) in ${tpl.id}`).toBe(true);
        if (obj.kind === 'point') {
          expect(Number.isFinite(obj.x), `Non-finite x on ${id} in ${tpl.id}`).toBe(true);
          expect(Number.isFinite(obj.y), `Non-finite y on ${id} in ${tpl.id}`).toBe(true);
        }
      }
    }
  });

  it('maintains valid 3D templates partitioned across Toán 11 and Toán 12', () => {
    const t11 = TEMPLATES_3D.filter((t) => template3DMatchesGrade(t.curriculumTag, '11'));
    const t12 = TEMPLATES_3D.filter((t) => template3DMatchesGrade(t.curriculumTag, '12'));
    expect(t11.length).toBeGreaterThanOrEqual(25);
    expect(t12.length).toBeGreaterThanOrEqual(8);
    expect(t11.length + t12.length).toBe(TEMPLATES_3D.length);
  });

  it('provides balanced THPT Arena problems (10 Toán 10, 10 Toán 11, 10 Toán 12) with valid answers and templates', () => {
    expect(ARENA_THPT_PROBLEMS).toHaveLength(30);
    expect(getArenaProblemsByGrade('10')).toHaveLength(10);
    expect(getArenaProblemsByGrade('11')).toHaveLength(10);
    expect(getArenaProblemsByGrade('12')).toHaveLength(10);
    expect(getArenaProblemsByGrade('all')).toHaveLength(30);

    for (const p of ARENA_THPT_PROBLEMS) {
      expect(p.options).toHaveLength(4);
      expect(p.correctIndex).toBeGreaterThanOrEqual(0);
      expect(p.correctIndex).toBeLessThanOrEqual(3);
      expect(p.hint.trim().length).toBeGreaterThan(5);
      expect(p.solution.trim().length).toBeGreaterThan(10);

      if (p.dimension === '2d') {
        expect(getTemplate2DById(p.templateId), `Missing 2D template ${p.templateId} for ${p.id}`).toBeDefined();
      } else {
        expect(getTemplate3DById(p.templateId), `Missing 3D template ${p.templateId} for ${p.id}`).toBeDefined();
      }
    }
  });

  it('computes dynamic THPT inventory stats matching live arrays identically', () => {
    const stats = getThptInventoryStats();

    expect(stats.totals.chapters).toBe(THPT_CHAPTERS.length);
    expect(stats.totals.lessons).toBe(THPT_LESSONS.length);
    expect(stats.totals.templates2D).toBe(TEMPLATES_2D.length);
    expect(stats.totals.templates3D).toBe(TEMPLATES_3D.length);
    expect(stats.totals.templatesAll).toBe(TEMPLATES_2D.length + TEMPLATES_3D.length);
    expect(stats.totals.challenges2D).toBe(ALL_CHALLENGES.length);
    expect(stats.totals.challenges3D).toBe(ALL_CHALLENGES_3D.length);
    expect(stats.totals.challengesAll).toBe(ALL_CHALLENGES.length + ALL_CHALLENGES_3D.length);
    expect(stats.totals.arenaQuizAll).toBe(ARENA_THPT_PROBLEMS.length);

    expect(stats.byGrade['10'].challenges2DCount).toBe(90);
    expect(stats.byGrade['11'].challenges2DCount).toBe(10);
    expect(stats.byGrade['11'].challenges3DCount).toBe(130);
    expect(stats.byGrade['12'].challenges3DCount).toBe(50);
    expect(stats.extensionChallenges2D).toBe(80);
    expect(
      stats.byGrade['10'].challenges2DCount +
        stats.byGrade['11'].challenges2DCount +
        stats.byGrade['12'].challenges2DCount +
        stats.extensionChallenges2D
    ).toBe(ALL_CHALLENGES.length);
  });

  it('contains zero legacy THCS grade tags (Lớp 6–9) across levels, challenges, and knowledge topics', () => {
    for (const lvl of LEVELS) {
      for (const tag of lvl.gradeTags) {
        expect(FORBIDDEN_THCS_TAGS.has(tag), `Legacy THCS tag "${tag}" in level ${lvl.id}`).toBe(false);
      }
    }
    for (const ch of ALL_CHALLENGES) {
      for (const tag of ch.gradeTags) {
        expect(FORBIDDEN_THCS_TAGS.has(tag), `Legacy THCS tag "${tag}" in challenge ${ch.id}`).toBe(false);
      }
      const prog = getChallengeProgramLabel(ch);
      expect(['Toán 10', 'Toán 11', 'Toán 12', 'Kiến thức mở rộng', 'Hình học Olympic']).toContain(prog);
    }
    for (const topic of KNOWLEDGE_TOPICS) {
      for (const tag of topic.gradeTags) {
        expect(FORBIDDEN_THCS_TAGS.has(tag), `Legacy THCS tag "${tag}" in topic ${topic.id}`).toBe(false);
      }
    }
  });
});

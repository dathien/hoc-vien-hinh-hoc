import { describe, expect, it } from 'vitest';
import { ALL_CHALLENGES, LEVELS, getChallengesByLevel } from '../src/challenges';
import {
  buildInitialScene,
  buildSolutionScene,
  validateChallengeConstruction,
} from '../src/validators/validator';

describe('18 Levels – 180 Challenges Integrity & Mathematical Verification', () => {
  it('contains exactly 18 levels and 180 unique challenges (10 per level, 540 max stars)', () => {
    expect(LEVELS.length).toBe(18);
    expect(ALL_CHALLENGES.length).toBe(180);

    const ids = new Set<string>();
    for (let lvl = 1; lvl <= 18; lvl++) {
      const list = getChallengesByLevel(lvl);
      expect(list.length).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(list[i].order).toBe(i + 1);
        expect(ids.has(list[i].id)).toBe(false);
        ids.add(list[i].id);
        expect(list[i].title.length).toBeGreaterThan(3);
        expect(list[i].hints.length).toBe(3);
        expect(list[i].solutionSteps.length).toBeGreaterThan(0);
      }
    }
    expect(ALL_CHALLENGES.length * 3).toBe(540);
  });

  it('enforces compass-only rules in Level XV and straightedge-only rules in Level XVI', () => {
    const lvl15 = getChallengesByLevel(15);
    for (const c of lvl15) {
      expect(c.forbiddenTools).toContain('line');
      expect(c.forbiddenTools).toContain('segment');
      expect(c.forbiddenTools).toContain('ray');
    }

    const lvl16 = getChallengesByLevel(16);
    for (const c of lvl16) {
      expect(c.forbiddenTools).toContain('circle_cp');
      expect(c.forbiddenTools).toContain('compass');
    }
  });

  it('validates canonical solution of EVERY SINGLE ONE of the 180 challenges across perturbations', () => {
    const failures: string[] = [];

    for (const ch of ALL_CHALLENGES) {
      const init = buildInitialScene(ch);
      for (const id of init.order) {
        if (!init.objects[id].valid) {
          failures.push(`${ch.id} (${ch.title}): invalid initial object ${id}`);
        }
      }

      const solved = buildSolutionScene(ch);
      const report = validateChallengeConstruction(solved, ch, 12);
      if (!report.valid) {
        failures.push(
          `${ch.id} (${ch.title}): FAILED validation — ${report.summary} | ${report.diagnostics
            .filter((d) => !d.passed)
            .map((d) => d.detail)
            .join('; ')}`
        );
      }
    }

    if (failures.length > 0) {
      console.error(`Failed challenges (${failures.length}):\n` + failures.join('\n'));
    }
    expect(failures).toEqual([]);
  });
});

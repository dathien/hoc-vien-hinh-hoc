import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_CHALLENGES, getChallengeById } from '../challenges';
import { BADGE_DEFINITIONS, computeRank, TOTAL_POSSIBLE_STARS } from '../data/ranksAndBadges';
import type { GeoScene } from '../geometry/types';
import { CHALLENGES_3D, getChallenge3DById } from '../geometry3d/challenges3d';
import type { Challenge3DProgressRecord, Geo3DScene, SavedDrawing3D } from '../geometry3d/types3d';
import { audioService } from '../services/audioService';
import {
  type AppSettings,
  type ArenaRoomRecord,
  type BackupPayload,
  type ChallengeProgressRecord,
  type ClassroomRecord,
  DEFAULT_SETTINGS,
  exportFullBackup,
  loadSettings,
  restoreFullBackup,
  type SavedDrawing,
  saveSettings,
  storageService,
  type StudyHistoryItem,
} from '../services/storageService';
import type { ChallengeDefinition } from '../validators/types';

export type LabSubView = 'hub' | '2d' | '3d' | 'templates' | 'saved';
export type CampaignDimension = '2d' | '3d';

export type PageId =
  | 'home'
  | 'lab'
  | 'campaign'
  | 'grades'
  | 'arena'
  | 'library'
  | 'teacher'
  | 'achievements'
  | 'guide'
  | 'settings';

export interface AppContextValue {
  page: PageId;
  setPage: (p: PageId) => void;
  hydrated: boolean;

  // Navigation helpers
  activeLevelId: number;
  setActiveLevelId: (levelId: number) => void;
  activeChallengeId: string | null;
  setActiveChallengeId: (challengeId: string | null) => void;
  teacherPreviewMode: boolean;
  setTeacherPreviewMode: (v: boolean) => void;
  openChallenge: (challengeId: string, opts?: { teacherPreview?: boolean }) => void;

  // Lab transfer (2D & 3D)
  labSubView: LabSubView;
  setLabSubView: (v: LabSubView) => void;
  labInitialScene: GeoScene | null;
  labInitialTitle: string | null;
  openLabWithScene: (scene?: GeoScene, title?: string) => void;
  clearLabInitialScene: () => void;

  lab3DInitialScene: Geo3DScene | null;
  lab3DInitialTitle: string | null;
  openLab3DWithScene: (scene?: Geo3DScene, title?: string) => void;
  clearLab3DInitialScene: () => void;

  // 3D Campaign navigation (separate from 2D 540-star system)
  campaignDimension: CampaignDimension;
  setCampaignDimension: (d: CampaignDimension) => void;
  active3DLevelId: number;
  setActive3DLevelId: (levelId: number) => void;
  activeChallenge3DId: string | null;
  setActiveChallenge3DId: (id: string | null) => void;
  openChallenge3D: (challengeId: string) => void;

  // Settings & Tour
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  tourOpen: boolean;
  setTourOpen: (open: boolean) => void;

  // Persisted data (2D)
  progressMap: Record<string, ChallengeProgressRecord>;
  recordChallengeAttempt: (params: {
    challengeId: string;
    stars: 0 | 1 | 2 | 3;
    usedL: number;
    usedE: number;
    elapsedSec: number;
    viewedSolution: boolean;
  }) => Promise<void>;

  drawings: SavedDrawing[];
  saveDrawing: (d: SavedDrawing) => Promise<void>;
  deleteDrawing: (id: string) => Promise<void>;

  // Persisted data (3D - strictly separate)
  progress3DMap: Record<string, Challenge3DProgressRecord>;
  recordChallenge3DAttempt: (params: {
    challengeId: string;
    stars: 0 | 1 | 2 | 3;
    usedSteps: number;
    elapsedSec: number;
    viewedSolution: boolean;
  }) => Promise<void>;

  drawings3D: SavedDrawing3D[];
  saveDrawing3D: (d: SavedDrawing3D) => Promise<void>;
  deleteDrawing3D: (id: string) => Promise<void>;

  customChallenges: ChallengeDefinition[];
  saveCustomChallenge: (c: ChallengeDefinition) => Promise<void>;
  deleteCustomChallenge: (id: string) => Promise<void>;

  arenaRooms: ArenaRoomRecord[];
  saveArenaRoom: (room: ArenaRoomRecord) => Promise<void>;
  deleteArenaRoom: (id: string) => Promise<void>;

  classes: ClassroomRecord[];
  saveClass: (cls: ClassroomRecord) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  studyHistory: StudyHistoryItem[];
  logStudyEvent: (item: Omit<StudyHistoryItem, 'id' | 'timestamp'>) => Promise<void>;

  // Backup / Restore / Reset
  createBackupPayload: () => Promise<BackupPayload>;
  applyBackupPayload: (payload: BackupPayload, mode: 'merge' | 'replace') => Promise<void>;
  resetAllProgress: () => Promise<void>;

  // Computed stats (2D — 180 challenges / 540 stars strictly preserved)
  stats: {
    totalChallenges: number;
    maxStars: number;
    completedCount: number;
    totalStars: number;
    threeStarCount: number;
    rank: ReturnType<typeof computeRank>;
    unlockedBadgesCount: number;
    nextRecommendedChallengeId: string;
  };

  // Computed stats (3D — 60 spatial challenges / 180 stars, strictly separate)
  stats3D: {
    totalChallenges: number;
    maxStars: number;
    completedCount: number;
    totalStars: number;
    threeStarCount: number;
    drawingsCount: number;
    nextRecommendedChallengeId: string;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

function computeUpdatedStreak(settings: AppSettings): Partial<AppSettings> | null {
  const today = new Date().toISOString().slice(0, 10);
  if (settings.lastActiveDate === today) return null;
  const lastMs = Date.parse(`${settings.lastActiveDate}T00:00:00Z`);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const diffDays = Number.isFinite(lastMs) ? Math.round((todayMs - lastMs) / 86400000) : 0;
  return {
    lastActiveDate: today,
    streakDays: diffDays === 1 ? settings.streakDays + 1 : 1,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<PageId>('home');
  const [hydrated, setHydrated] = useState(false);

  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [teacherPreviewMode, setTeacherPreviewMode] = useState(false);

  const [labSubView, setLabSubView] = useState<LabSubView>('hub');
  const [labInitialScene, setLabInitialScene] = useState<GeoScene | null>(null);
  const [labInitialTitle, setLabInitialTitle] = useState<string | null>(null);
  const [lab3DInitialScene, setLab3DInitialScene] = useState<Geo3DScene | null>(null);
  const [lab3DInitialTitle, setLab3DInitialTitle] = useState<string | null>(null);

  const [campaignDimension, setCampaignDimension] = useState<CampaignDimension>('2d');
  const [active3DLevelId, setActive3DLevelId] = useState<number>(1);
  const [activeChallenge3DId, setActiveChallenge3DId] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadSettings();
    const streakPatch = computeUpdatedStreak(loaded);
    const merged = streakPatch ? { ...loaded, ...streakPatch } : loaded;
    if (streakPatch) saveSettings(merged);
    return merged;
  });

  const [tourOpen, setTourOpen] = useState(false);

  const [progressMap, setProgressMap] = useState<Record<string, ChallengeProgressRecord>>({});
  const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
  const [progress3DMap, setProgress3DMap] = useState<Record<string, Challenge3DProgressRecord>>({});
  const [drawings3D, setDrawings3D] = useState<SavedDrawing3D[]>([]);
  const [customChallenges, setCustomChallenges] = useState<ChallengeDefinition[]>([]);
  const [arenaRooms, setArenaRooms] = useState<ArenaRoomRecord[]>([]);
  const [classes, setClasses] = useState<ClassroomRecord[]>([]);
  const [studyHistory, setStudyHistory] = useState<StudyHistoryItem[]>([]);

  const hydrateFromDB = useCallback(async () => {
    const [progList, drawingList, prog3DList, drawing3DList, teacherList, roomList, classList, histList] =
      await Promise.all([
        storageService.getAllProgress(),
        storageService.getAllDrawings(),
        storageService.getAllProgress3D(),
        storageService.getAllDrawings3D(),
        storageService.getAllTeacherChallenges(),
        storageService.getArenaRooms(),
        storageService.getClasses(),
        storageService.getStudyHistory(),
      ]);

    const pMap: Record<string, ChallengeProgressRecord> = {};
    for (const rec of progList) {
      pMap[rec.challengeId] = rec;
    }

    const p3Map: Record<string, Challenge3DProgressRecord> = {};
    for (const rec of prog3DList) {
      p3Map[rec.challengeId] = rec;
    }

    setProgressMap(pMap);
    setDrawings(drawingList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setProgress3DMap(p3Map);
    setDrawings3D(drawing3DList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setCustomChallenges(teacherList);
    setArenaRooms(roomList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setClasses(classList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setStudyHistory(histList.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 60));
    setHydrated(true);
  }, []);

  useEffect(() => {
    void hydrateFromDB();
  }, [hydrateFromDB]);

  // Sync HTML classes & audio service with settings
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.classList.toggle('presentation-mode', settings.presentationMode);
    root.classList.toggle('reduced-motion', settings.reducedMotion);

    audioService.configure({
      sfxEnabled: settings.sfxEnabled,
      sfxVolume: settings.sfxVolume,
      musicEnabled: settings.musicEnabled,
      musicVolume: settings.musicVolume,
    });
  }, [settings]);

  // Open first-time onboarding tour once hydrated if never completed
  useEffect(() => {
    if (hydrated && !settings.tourCompleted) {
      const t = window.setTimeout(() => setTourOpen(true), 450);
      return () => window.clearTimeout(t);
    }
  }, [hydrated, settings.tourCompleted]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const logStudyEvent = useCallback(async (item: Omit<StudyHistoryItem, 'id' | 'timestamp'>) => {
    const full: StudyHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    await storageService.addStudyHistory(full);
    setStudyHistory((prev) => [full, ...prev].slice(0, 60));
  }, []);

  const recordChallengeAttempt = useCallback(
    async (params: {
      challengeId: string;
      stars: 0 | 1 | 2 | 3;
      usedL: number;
      usedE: number;
      elapsedSec: number;
      viewedSolution: boolean;
    }) => {
      // Teacher Preview Mode never mutates student progression or grants stars
      if (teacherPreviewMode) return;

      const effectiveStars: 0 | 1 | 2 | 3 = params.viewedSolution ? 0 : params.stars;

      setProgressMap((prev) => {
        const existing = prev[params.challengeId];
        const nextStars = Math.max(existing?.stars ?? 0, effectiveStars) as 0 | 1 | 2 | 3;
        const nextBestL =
          effectiveStars >= 1
            ? existing?.bestL != null
              ? Math.min(existing.bestL, params.usedL)
              : params.usedL
            : (existing?.bestL ?? null);
        const nextBestE =
          effectiveStars >= 1
            ? existing?.bestE != null
              ? Math.min(existing.bestE, params.usedE)
              : params.usedE
            : (existing?.bestE ?? null);
        const nextBestTime =
          effectiveStars >= 1
            ? existing?.bestTimeSec != null
              ? Math.min(existing.bestTimeSec, params.elapsedSec)
              : params.elapsedSec
            : (existing?.bestTimeSec ?? null);

        const updated: ChallengeProgressRecord = {
          challengeId: params.challengeId,
          stars: nextStars,
          bestL: nextBestL,
          bestE: nextBestE,
          attempts: (existing?.attempts ?? 0) + 1,
          bestTimeSec: nextBestTime,
          completedAt: effectiveStars >= 1 ? new Date().toISOString() : (existing?.completedAt ?? ''),
          viewedSolution: existing ? existing.viewedSolution && params.viewedSolution : params.viewedSolution,
        };

        void storageService.saveProgress(updated);
        return { ...prev, [params.challengeId]: updated };
      });

      const ch =
        getChallengeById(params.challengeId) ??
        customChallenges.find((c) => c.id === params.challengeId);
      if (ch && effectiveStars >= 1) {
        await logStudyEvent({
          type: 'challenge',
          refId: ch.id,
          title: ch.title,
          detail: `Đạt ${effectiveStars}/3 sao (${params.usedL}L, ${params.usedE}E)`,
        });
      }
    },
    [teacherPreviewMode, customChallenges, logStudyEvent]
  );

  const saveDrawing = useCallback(async (d: SavedDrawing) => {
    await storageService.saveDrawing(d);
    setDrawings((prev) => {
      const filtered = prev.filter((item) => item.id !== d.id);
      return [d, ...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const deleteDrawing = useCallback(async (id: string) => {
    await storageService.deleteDrawing(id);
    setDrawings((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const recordChallenge3DAttempt = useCallback(
    async (params: {
      challengeId: string;
      stars: 0 | 1 | 2 | 3;
      usedSteps: number;
      elapsedSec: number;
      viewedSolution: boolean;
    }) => {
      if (teacherPreviewMode) return;
      const effectiveStars: 0 | 1 | 2 | 3 = params.viewedSolution ? 0 : params.stars;

      setProgress3DMap((prev) => {
        const existing = prev[params.challengeId];
        const nextStars = Math.max(existing?.stars ?? 0, effectiveStars) as 0 | 1 | 2 | 3;
        const nextBestSteps =
          effectiveStars >= 1
            ? existing?.bestSteps != null
              ? Math.min(existing.bestSteps, params.usedSteps)
              : params.usedSteps
            : (existing?.bestSteps ?? null);
        const nextBestTime =
          effectiveStars >= 1
            ? existing?.bestTimeSec != null
              ? Math.min(existing.bestTimeSec, params.elapsedSec)
              : params.elapsedSec
            : (existing?.bestTimeSec ?? null);

        const updated: Challenge3DProgressRecord = {
          challengeId: params.challengeId,
          stars: nextStars,
          completed: nextStars >= 1 || Boolean(existing?.completed),
          bestSteps: nextBestSteps,
          attempts: (existing?.attempts ?? 0) + 1,
          bestTimeSec: nextBestTime,
          completedAt: effectiveStars >= 1 ? new Date().toISOString() : (existing?.completedAt ?? ''),
          viewedSolution: existing ? existing.viewedSolution && params.viewedSolution : params.viewedSolution,
        };

        void storageService.saveProgress3D(updated);
        return { ...prev, [params.challengeId]: updated };
      });

      const ch = getChallenge3DById(params.challengeId);
      if (ch && effectiveStars >= 1) {
        await logStudyEvent({
          type: 'challenge',
          refId: ch.id,
          title: `[3D] ${ch.title}`,
          detail: `Đạt ${effectiveStars}/3 sao không gian (${params.usedSteps} bước)`,
        });
      }
    },
    [teacherPreviewMode, logStudyEvent]
  );

  const saveDrawing3D = useCallback(async (d: SavedDrawing3D) => {
    await storageService.saveDrawing3D(d);
    setDrawings3D((prev) => {
      const filtered = prev.filter((item) => item.id !== d.id);
      return [d, ...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const deleteDrawing3D = useCallback(async (id: string) => {
    await storageService.deleteDrawing3D(id);
    setDrawings3D((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveCustomChallenge = useCallback(async (c: ChallengeDefinition) => {
    await storageService.saveTeacherChallenge(c);
    setCustomChallenges((prev) => {
      const filtered = prev.filter((item) => item.id !== c.id);
      return [c, ...filtered];
    });
  }, []);

  const deleteCustomChallenge = useCallback(async (id: string) => {
    await storageService.deleteTeacherChallenge(id);
    setCustomChallenges((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveArenaRoom = useCallback(async (room: ArenaRoomRecord) => {
    await storageService.saveArenaRoom(room);
    setArenaRooms((prev) => {
      const filtered = prev.filter((item) => item.id !== room.id);
      return [room, ...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  }, []);

  const deleteArenaRoom = useCallback(async (id: string) => {
    await storageService.deleteArenaRoom(id);
    setArenaRooms((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const saveClass = useCallback(async (cls: ClassroomRecord) => {
    await storageService.saveClass(cls);
    setClasses((prev) => {
      const filtered = prev.filter((item) => item.id !== cls.id);
      return [cls, ...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    await storageService.deleteClass(id);
    setClasses((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openChallenge = useCallback(
    (challengeId: string, opts?: { teacherPreview?: boolean }) => {
      const ch =
        getChallengeById(challengeId) ?? customChallenges.find((c) => c.id === challengeId);
      if (ch) {
        setActiveLevelId(ch.levelId);
      }
      if (opts?.teacherPreview !== undefined) {
        setTeacherPreviewMode(opts.teacherPreview);
      }
      setCampaignDimension('2d');
      setActiveChallengeId(challengeId);
      setPage('campaign');
    },
    [customChallenges]
  );

  const openChallenge3D = useCallback((challengeId: string) => {
    const ch = getChallenge3DById(challengeId);
    if (ch) {
      setActive3DLevelId(ch.levelId);
    }
    setCampaignDimension('3d');
    setActiveChallenge3DId(challengeId);
    setPage('campaign');
  }, []);

  const openLabWithScene = useCallback((scene?: GeoScene, title?: string) => {
    setLabInitialScene(scene ?? null);
    setLabInitialTitle(title ?? null);
    setLabSubView('2d');
    setPage('lab');
  }, []);

  const clearLabInitialScene = useCallback(() => {
    setLabInitialScene(null);
    setLabInitialTitle(null);
  }, []);

  const openLab3DWithScene = useCallback((scene?: Geo3DScene, title?: string) => {
    setLab3DInitialScene(scene ?? null);
    setLab3DInitialTitle(title ?? null);
    setLabSubView('3d');
    setPage('lab');
  }, []);

  const clearLab3DInitialScene = useCallback(() => {
    setLab3DInitialScene(null);
    setLab3DInitialTitle(null);
  }, []);

  const createBackupPayload = useCallback(async () => {
    return exportFullBackup(settings);
  }, [settings]);

  const applyBackupPayload = useCallback(
    async (payload: BackupPayload, mode: 'merge' | 'replace') => {
      await restoreFullBackup(payload, mode);
      if (mode === 'replace') {
        const refreshed = loadSettings();
        setSettings(refreshed);
      }
      await hydrateFromDB();
    },
    [hydrateFromDB]
  );

  const resetAllProgress = useCallback(async () => {
    await Promise.all([storageService.clearProgress(), storageService.clearProgress3D()]);
    setProgressMap({});
    setProgress3DMap({});
    updateSettings({ streakDays: 1, lastActiveDate: new Date().toISOString().slice(0, 10) });
  }, [updateSettings]);

  const stats = useMemo(() => {
    let completedCount = 0;
    let totalStars = 0;
    let threeStarCount = 0;

    // Count strictly over canonical 180 challenges to prevent double counting
    for (const ch of ALL_CHALLENGES) {
      const rec = progressMap[ch.id];
      if (!rec) continue;
      const clampedStars = Math.min(3, Math.max(0, rec.stars));
      if (clampedStars >= 1) completedCount += 1;
      if (clampedStars === 3) threeStarCount += 1;
      totalStars += clampedStars;
    }

    const rank = computeRank(totalStars);
    const badgeCtx = {
      progressMap,
      totalStars,
      completedCount,
      threeStarCount,
      streakDays: settings.streakDays,
      drawingsCount: drawings.length,
      arenaParticipations: arenaRooms.reduce((sum, r) => sum + r.results.length, 0),
    };
    const unlockedBadgesCount = BADGE_DEFINITIONS.filter((b) => b.evaluate(badgeCtx).unlocked).length;

    const firstUnfinished = ALL_CHALLENGES.find((c) => (progressMap[c.id]?.stars ?? 0) < 1);
    const nextRecommendedChallengeId = firstUnfinished?.id ?? ALL_CHALLENGES[0].id;

    return {
      totalChallenges: ALL_CHALLENGES.length,
      maxStars: TOTAL_POSSIBLE_STARS,
      completedCount,
      totalStars,
      threeStarCount,
      rank,
      unlockedBadgesCount,
      nextRecommendedChallengeId,
    };
  }, [progressMap, settings.streakDays, drawings.length, arenaRooms]);

  const stats3D = useMemo(() => {
    let completedCount = 0;
    let totalStars = 0;
    let threeStarCount = 0;
    for (const ch of CHALLENGES_3D) {
      const rec = progress3DMap[ch.id];
      if (!rec) continue;
      const clamped = Math.min(3, Math.max(0, rec.stars));
      if (clamped >= 1) completedCount += 1;
      if (clamped === 3) threeStarCount += 1;
      totalStars += clamped;
    }
    const firstUnfinished = CHALLENGES_3D.find((c) => (progress3DMap[c.id]?.stars ?? 0) < 1);
    return {
      totalChallenges: CHALLENGES_3D.length,
      maxStars: CHALLENGES_3D.length * 3,
      completedCount,
      totalStars,
      threeStarCount,
      drawingsCount: drawings3D.length,
      nextRecommendedChallengeId: firstUnfinished?.id ?? CHALLENGES_3D[0].id,
    };
  }, [progress3DMap, drawings3D.length]);

  const value: AppContextValue = {
    page,
    setPage,
    hydrated,
    activeLevelId,
    setActiveLevelId,
    activeChallengeId,
    setActiveChallengeId,
    teacherPreviewMode,
    setTeacherPreviewMode,
    openChallenge,
    labSubView,
    setLabSubView,
    labInitialScene,
    labInitialTitle,
    openLabWithScene,
    clearLabInitialScene,
    lab3DInitialScene,
    lab3DInitialTitle,
    openLab3DWithScene,
    clearLab3DInitialScene,
    campaignDimension,
    setCampaignDimension,
    active3DLevelId,
    setActive3DLevelId,
    activeChallenge3DId,
    setActiveChallenge3DId,
    openChallenge3D,
    settings,
    updateSettings,
    tourOpen,
    setTourOpen,
    progressMap,
    recordChallengeAttempt,
    drawings,
    saveDrawing,
    deleteDrawing,
    progress3DMap,
    recordChallenge3DAttempt,
    drawings3D,
    saveDrawing3D,
    deleteDrawing3D,
    customChallenges,
    saveCustomChallenge,
    deleteCustomChallenge,
    arenaRooms,
    saveArenaRoom,
    deleteArenaRoom,
    classes,
    saveClass,
    deleteClass,
    studyHistory,
    logStudyEvent,
    createBackupPayload,
    applyBackupPayload,
    resetAllProgress,
    stats,
    stats3D,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp phải được dùng bên trong AppProvider');
  }
  return ctx;
}

export { DEFAULT_SETTINGS };

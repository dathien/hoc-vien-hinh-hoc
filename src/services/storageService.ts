import type { GeoScene } from '../geometry/types';
import type { ChallengeDefinition } from '../validators/types';

export interface ChallengeProgressRecord {
  challengeId: string;
  stars: 0 | 1 | 2 | 3;
  bestL: number | null;
  bestE: number | null;
  attempts: number;
  bestTimeSec: number | null;
  completedAt: string;
  viewedSolution: boolean;
}

export interface SavedDrawing {
  id: string;
  title: string;
  description?: string;
  scene: GeoScene;
  updatedAt: string;
  createdAt: string;
}

export interface StudyHistoryItem {
  id: string;
  type: 'challenge' | 'lab' | 'library' | 'arena';
  refId: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface ArenaParticipantResult {
  id: string;
  name: string;
  correctCount: number;
  totalStars: number;
  totalL: number;
  totalE: number;
  totalTimeSec: number;
  completedAt: string;
}

export interface ArenaRoomRecord {
  id: string;
  code: string;
  title: string;
  mode: 'individual' | '1v1' | 'group' | 'class' | 'multi_round' | 'timed';
  challengeIds: string[];
  timeLimitSec: number;
  allowHints: boolean;
  allowSolution: boolean;
  createdAt: string;
  results: ArenaParticipantResult[];
}

export interface ClassStudent {
  id: string;
  name: string;
  completedCount: number;
  stars: number;
  notes?: string;
}

export interface ClassroomRecord {
  id: string;
  name: string;
  grade: string;
  schoolYear: string;
  assignedChallengeIds: string[];
  students: ClassStudent[];
  createdAt: string;
}

export interface AppSettings {
  displayName: string;
  theme: 'light' | 'dark';
  presentationMode: boolean;
  sfxEnabled: boolean;
  sfxVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  animationSpeed: 0.5 | 1 | 1.5 | 2;
  reducedMotion: boolean;
  inputMode: 'quick' | 'virtual_tools';
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  tourCompleted: boolean;
  streakDays: number;
  lastActiveDate: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: 'Học viên Hình học',
  theme: 'light',
  presentationMode: false,
  sfxEnabled: true,
  sfxVolume: 0.65,
  musicEnabled: false,
  musicVolume: 0.25,
  animationSpeed: 1,
  reducedMotion: false,
  inputMode: 'quick',
  showGrid: true,
  showAxes: false,
  showLabels: true,
  tourCompleted: false,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

const SETTINGS_KEY = 'hhs_settings_v1';
const DB_NAME = 'hinh_hoc_smart_db';
const DB_VERSION = 1;

const STORES = [
  'progress',
  'drawings',
  'teacherChallenges',
  'studyHistory',
  'arenaRooms',
  'classes',
] as const;

type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB không khả dụng trên môi trường hiện tại.'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'challengeId' });
        }
        if (!db.objectStoreNames.contains('drawings')) {
          db.createObjectStore('drawings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('teacherChallenges')) {
          db.createObjectStore('teacherChallenges', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('studyHistory')) {
          db.createObjectStore('studyHistory', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('arenaRooms')) {
          db.createObjectStore('arenaRooms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('classes')) {
          db.createObjectStore('classes', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Không thể mở IndexedDB'));
    });
  }
  return dbPromise;
}

async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDB();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function idbPut<T>(storeName: StoreName, value: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful degradation if storage quota exceeded
  }
}

async function idbDelete(storeName: StoreName, key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

async function idbClear(storeName: StoreName): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export const storageService = {
  // Progress
  getAllProgress: () => idbGetAll<ChallengeProgressRecord>('progress'),
  saveProgress: (rec: ChallengeProgressRecord) => idbPut('progress', rec),
  clearProgress: () => idbClear('progress'),

  // Saved Drawings
  getAllDrawings: () => idbGetAll<SavedDrawing>('drawings'),
  saveDrawing: (d: SavedDrawing) => idbPut('drawings', d),
  deleteDrawing: (id: string) => idbDelete('drawings', id),

  // Custom Teacher Challenges
  getAllTeacherChallenges: () => idbGetAll<ChallengeDefinition>('teacherChallenges'),
  saveTeacherChallenge: (c: ChallengeDefinition) => idbPut('teacherChallenges', c),
  deleteTeacherChallenge: (id: string) => idbDelete('teacherChallenges', id),

  // Study History
  getStudyHistory: () => idbGetAll<StudyHistoryItem>('studyHistory'),
  addStudyHistory: (item: StudyHistoryItem) => idbPut('studyHistory', item),

  // Arena Rooms
  getArenaRooms: () => idbGetAll<ArenaRoomRecord>('arenaRooms'),
  saveArenaRoom: (room: ArenaRoomRecord) => idbPut('arenaRooms', room),
  deleteArenaRoom: (id: string) => idbDelete('arenaRooms', id),

  // Classes
  getClasses: () => idbGetAll<ClassroomRecord>('classes'),
  saveClass: (cls: ClassroomRecord) => idbPut('classes', cls),
  deleteClass: (id: string) => idbDelete('classes', id),
};

export interface BackupPayload {
  schemaVersion: 1;
  appName: 'HỌC VIỆN HÌNH HỌC SMART';
  exportedAt: string;
  settings: AppSettings;
  progress: ChallengeProgressRecord[];
  drawings: SavedDrawing[];
  teacherChallenges: ChallengeDefinition[];
  studyHistory: StudyHistoryItem[];
  arenaRooms: ArenaRoomRecord[];
  classes: ClassroomRecord[];
}

export async function exportFullBackup(settings: AppSettings): Promise<BackupPayload> {
  const [progress, drawings, teacherChallenges, studyHistory, arenaRooms, classes] =
    await Promise.all([
      storageService.getAllProgress(),
      storageService.getAllDrawings(),
      storageService.getAllTeacherChallenges(),
      storageService.getStudyHistory(),
      storageService.getArenaRooms(),
      storageService.getClasses(),
    ]);

  return {
    schemaVersion: 1,
    appName: 'HỌC VIỆN HÌNH HỌC SMART',
    exportedAt: new Date().toISOString(),
    settings,
    progress,
    drawings,
    teacherChallenges,
    studyHistory,
    arenaRooms,
    classes,
  };
}

export function validateBackupJson(rawText: string): {
  valid: boolean;
  error?: string;
  payload?: BackupPayload;
  summary?: {
    exportedAt: string;
    completedCount: number;
    totalStars: number;
    drawingsCount: number;
    teacherChallengesCount: number;
    classesCount: number;
  };
} {
  try {
    const data = JSON.parse(rawText) as Partial<BackupPayload>;
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Tệp JSON không phải đối tượng dữ liệu hợp lệ.' };
    }
    if (data.schemaVersion !== 1 || data.appName !== 'HỌC VIỆN HÌNH HỌC SMART') {
      return {
        valid: false,
        error: 'Tệp không đúng định dạng sao lưu của Học Viện Hình Học Smart (schemaVersion 1).',
      };
    }
    if (!Array.isArray(data.progress) || !Array.isArray(data.drawings)) {
      return { valid: false, error: 'Thiếu trường dữ liệu tiến trình hoặc hình vẽ.' };
    }

    const totalStars = data.progress.reduce((sum, p) => sum + (Number(p.stars) || 0), 0);
    return {
      valid: true,
      payload: data as BackupPayload,
      summary: {
        exportedAt: data.exportedAt ?? '',
        completedCount: data.progress.filter((p) => p.stars >= 1).length,
        totalStars,
        drawingsCount: data.drawings.length,
        teacherChallengesCount: Array.isArray(data.teacherChallenges)
          ? data.teacherChallenges.length
          : 0,
        classesCount: Array.isArray(data.classes) ? data.classes.length : 0,
      },
    };
  } catch {
    return { valid: false, error: 'Không thể phân tích cú pháp JSON. Vui lòng kiểm tra lại tệp.' };
  }
}

export function mergeProgressRecord(
  a: ChallengeProgressRecord,
  b: ChallengeProgressRecord
): ChallengeProgressRecord {
  const bestStars = Math.max(a.stars, b.stars) as 0 | 1 | 2 | 3;
  const bestL =
    a.bestL != null && b.bestL != null
      ? Math.min(a.bestL, b.bestL)
      : (a.bestL ?? b.bestL);
  const bestE =
    a.bestE != null && b.bestE != null
      ? Math.min(a.bestE, b.bestE)
      : (a.bestE ?? b.bestE);
  const bestTimeSec =
    a.bestTimeSec != null && b.bestTimeSec != null
      ? Math.min(a.bestTimeSec, b.bestTimeSec)
      : (a.bestTimeSec ?? b.bestTimeSec);

  return {
    challengeId: a.challengeId,
    stars: bestStars,
    bestL,
    bestE,
    attempts: Math.max(a.attempts, b.attempts),
    bestTimeSec,
    completedAt: a.completedAt > b.completedAt ? a.completedAt : b.completedAt,
    viewedSolution: a.viewedSolution && b.viewedSolution,
  };
}

export async function restoreFullBackup(
  payload: BackupPayload,
  mode: 'merge' | 'replace'
): Promise<void> {
  if (mode === 'replace') {
    await Promise.all(STORES.map((s) => idbClear(s)));
    saveSettings({ ...DEFAULT_SETTINGS, ...(payload.settings ?? {}) });
    for (const p of payload.progress) await storageService.saveProgress(p);
    for (const d of payload.drawings) await storageService.saveDrawing(d);
    for (const c of payload.teacherChallenges ?? []) await storageService.saveTeacherChallenge(c);
    for (const h of payload.studyHistory ?? []) await storageService.addStudyHistory(h);
    for (const r of payload.arenaRooms ?? []) await storageService.saveArenaRoom(r);
    for (const cl of payload.classes ?? []) await storageService.saveClass(cl);
    return;
  }

  // Merge mode: preserve best scores without double-counting stars
  const existing = await storageService.getAllProgress();
  const map = new Map<string, ChallengeProgressRecord>(existing.map((p) => [p.challengeId, p]));
  for (const incoming of payload.progress) {
    const prev = map.get(incoming.challengeId);
    const merged = prev ? mergeProgressRecord(prev, incoming) : incoming;
    await storageService.saveProgress(merged);
  }
  for (const d of payload.drawings) await storageService.saveDrawing(d);
  for (const c of payload.teacherChallenges ?? []) await storageService.saveTeacherChallenge(c);
  for (const h of payload.studyHistory ?? []) await storageService.addStudyHistory(h);
  for (const r of payload.arenaRooms ?? []) await storageService.saveArenaRoom(r);
  for (const cl of payload.classes ?? []) await storageService.saveClass(cl);
}

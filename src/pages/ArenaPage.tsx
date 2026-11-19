import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Clock,
  Crown,
  Monitor,
  Play,
  Plus,
  QrCode,
  ShieldCheck,
  Swords,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { ALL_CHALLENGES, getChallengeById, getChallengesByLevel, LEVELS } from '../challenges';
import { ConfettiBurst } from '../components/common/ConfettiBurst';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { ToolPalette } from '../components/geometry/ToolPalette';
import { MathText } from '../components/math/MathText';
import { computeSceneCosts, deleteObjectWithDependents } from '../geometry/engine';
import type { GeoScene, ToolId } from '../geometry/types';
import { audioService } from '../services/audioService';
import type { ArenaParticipantResult, ArenaRoomRecord } from '../services/storageService';
import { useApp } from '../store/AppContext';
import { buildInitialScene, validateChallengeConstruction } from '../validators/validator';

const ARENA_MODES: Array<{
  id: ArenaRoomRecord['mode'];
  title: string;
  desc: string;
}> = [
  { id: 'individual', title: 'Luyện tập cá nhân', desc: 'Tự luyện tốc độ và tối ưu số bước dựng trên bộ thử thách tự chọn.' },
  { id: '1v1', title: 'Thi đấu cá nhân (1v1)', desc: 'Hai học sinh lần lượt tranh tài trực tiếp trên cùng bộ đề.' },
  { id: 'group', title: 'Thi đấu theo đội', desc: 'Các đội thảo luận chiến lược dựng hình tối ưu ít bước nhất.' },
  { id: 'class', title: 'Thi đấu trong lớp học', desc: 'Giáo viên tổ chức thi trên lớp với mã QR và bảng xếp hạng trình chiếu.' },
  { id: 'multi_round', title: 'Thi đấu nhiều vòng', desc: 'Vượt qua liên tiếp từ 3 đến 10 thử thách tăng dần độ khó.' },
  { id: 'timed', title: 'Chạy đua thời gian', desc: 'Giới hạn thời gian nghiêm ngặt, khóa gợi ý và lời giải.' },
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Thứ tự xét kết quả thi đấu chuẩn:
 * 1. Hoàn thành phép dựng hợp lệ (nhiều bài đúng nhất)
 * 2. Số bước dựng ít nhất (L)
 * 3. Số phép dựng cơ bản ít nhất (E)
 * 4. Thời gian hoàn thành nhanh nhất
 */
function sortLeaderboard(results: ArenaParticipantResult[]): ArenaParticipantResult[] {
  return [...results].sort((a, b) => {
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    if (a.totalL !== b.totalL) return a.totalL - b.totalL;
    if (a.totalE !== b.totalE) return a.totalE - b.totalE;
    return a.totalTimeSec - b.totalTimeSec;
  });
}

export const ArenaPage: React.FC = () => {
  const { arenaRooms, saveArenaRoom, deleteArenaRoom, settings, updateSettings, logStudyEvent } = useApp();

  // Create room form state
  const [selectedMode, setSelectedMode] = useState<ArenaRoomRecord['mode']>('class');
  const [roomTitle, setRoomTitle] = useState('Đấu trường Hình học Lớp 8A');
  const [timeLimitSec, setTimeLimitSec] = useState(300);
  const [allowHints, setAllowHints] = useState(false);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([
    'L01_C01',
    'L02_C01',
    'L03_C01',
  ]);
  const [pickerLevelId, setPickerLevelId] = useState<number>(0);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Active room & LED presentation
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [ledMode, setLedMode] = useState(false);

  // Active participant playing session
  const [playing, setPlaying] = useState(false);
  const [playerName, setPlayerName] = useState(settings.displayName);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingSec, setRemainingSec] = useState(300);
  const [scene, setScene] = useState<GeoScene | null>(null);
  const [history, setHistory] = useState<GeoScene[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('circle_cp');
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, stars: 0, totalL: 0, totalE: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const activeRoom = useMemo(
    () => arenaRooms.find((r) => r.id === activeRoomId) ?? null,
    [arenaRooms, activeRoomId]
  );

  // Generate real QR code whenever activeRoom changes
  useEffect(() => {
    if (!activeRoom) {
      setQrDataUrl('');
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?arena=${activeRoom.code}`;
    void QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [activeRoom]);

  // Countdown timer when playing
  useEffect(() => {
    if (!playing) return;
    if (remainingSec <= 0) {
      void finishParticipantRun(sessionStats.correct, sessionStats.stars, sessionStats.totalL, sessionStats.totalE);
      return;
    }
    const t = window.setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 11 && s > 1) audioService.play('countdown');
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [playing, remainingSec]);

  const handleCreateRoom = async () => {
    if (selectedChallengeIds.length === 0) return;
    const room: ArenaRoomRecord = {
      id: `room_${Date.now()}`,
      code: generateRoomCode(),
      title: roomTitle.trim() || 'Phòng thi Hình học Smart',
      mode: selectedMode,
      challengeIds: selectedChallengeIds,
      timeLimitSec,
      allowHints,
      allowSolution: false,
      createdAt: new Date().toISOString(),
      results: [],
    };
    await saveArenaRoom(room);
    setActiveRoomId(room.id);
    audioService.play('unlock');
  };

  const handleJoinByCode = () => {
    const code = joinCodeInput.trim().toUpperCase();
    const found = arenaRooms.find((r) => r.code.toUpperCase() === code);
    if (found) {
      setActiveRoomId(found.id);
      setJoinCodeInput('');
    } else {
      setFeedback(`Không tìm thấy phòng có mã "${code}" trên thiết bị này.`);
      window.setTimeout(() => setFeedback(null), 3000);
    }
  };

  const startParticipantRun = () => {
    if (!activeRoom) return;
    const firstCh = getChallengeById(activeRoom.challengeIds[0]);
    if (!firstCh) return;
    setCurrentIdx(0);
    setRemainingSec(activeRoom.timeLimitSec);
    setSessionStats({ correct: 0, stars: 0, totalL: 0, totalE: 0 });
    setScene(buildInitialScene(firstCh));
    setHistory([]);
    setSelectedObjId(null);
    setFeedback(null);
    setActiveTool(
      firstCh.allowedTools.find((t) => t === 'circle_cp' || t === 'line' || t === 'segment') ?? 'select'
    );
    setPlaying(true);
  };

  const finishParticipantRun = async (
    correctCount: number,
    totalStars: number,
    totalL: number,
    totalE: number
  ) => {
    if (!activeRoom) return;
    setPlaying(false);
    const elapsed = Math.max(1, activeRoom.timeLimitSec - remainingSec);
    const entry: ArenaParticipantResult = {
      id: `res_${Date.now()}`,
      name: playerName.trim() || 'Thí sinh',
      correctCount,
      totalStars,
      totalL,
      totalE,
      totalTimeSec: elapsed,
      completedAt: new Date().toISOString(),
    };
    const updatedRoom: ArenaRoomRecord = {
      ...activeRoom,
      results: sortLeaderboard([...activeRoom.results, entry]),
    };
    await saveArenaRoom(updatedRoom);
    await logStudyEvent({
      type: 'arena',
      refId: activeRoom.id,
      title: activeRoom.title,
      detail: `${entry.name}: ${correctCount}/${activeRoom.challengeIds.length} bài · ★${totalStars} · ${elapsed}s`,
    });
    if (correctCount > 0) {
      audioService.play('complete');
      setConfettiTrigger((n) => n + 1);
    }
  };

  const submitCurrentChallenge = () => {
    if (!activeRoom || !scene) return;
    const chId = activeRoom.challengeIds[currentIdx];
    const ch = getChallengeById(chId);
    if (!ch) return;

    const report = validateChallengeConstruction(scene, ch, 18);
    if (!report.valid) {
      audioService.play('error');
      setFeedback(`Chưa đạt yêu cầu: ${report.summary}`);
      return;
    }

    audioService.play('star');
    const nextCorrect = sessionStats.correct + 1;
    const nextStars = sessionStats.stars + report.stars;
    const nextL = sessionStats.totalL + report.usedL;
    const nextE = sessionStats.totalE + report.usedE;

    setSessionStats({ correct: nextCorrect, stars: nextStars, totalL: nextL, totalE: nextE });
    setFeedback(`Chính xác! Đạt ${report.stars}/3 sao (${report.usedL}L · ${report.usedE}E).`);

    if (currentIdx + 1 >= activeRoom.challengeIds.length) {
      void finishParticipantRun(nextCorrect, nextStars, nextL, nextE);
    } else {
      const nextCh = getChallengeById(activeRoom.challengeIds[currentIdx + 1]);
      if (nextCh) {
        setCurrentIdx((i) => i + 1);
        setScene(buildInitialScene(nextCh));
        setHistory([]);
        setSelectedObjId(null);
      }
    }
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // LED FULLSCREEN PRESENTATION MODE
  if (ledMode && activeRoom) {
    const sorted = sortLeaderboard(activeRoom.results);
    return (
      <div className="fixed inset-0 z-50 bg-[#0B1221] text-white p-6 sm:p-10 overflow-y-auto flex flex-col justify-between gap-8">
        <ConfettiBurst trigger={confettiTrigger} />
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-teal-400">
              CHẾ ĐỘ TRÌNH CHIẾU LED · HỌC VIỆN HÌNH HỌC SMART
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold mt-1">{activeRoom.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-800 border border-slate-700 px-6 py-3 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400">Mã phòng</div>
              <div className="text-3xl sm:text-4xl font-mono-tabular font-black tracking-widest text-amber-400">
                {activeRoom.code}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLedMode(false)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
              aria-label="Thoát trình chiếu LED"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          {/* QR & Room info */}
          <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-700 p-6 flex flex-col items-center text-center space-y-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`Mã QR phòng ${activeRoom.code}`}
                className="w-56 h-56 rounded-2xl bg-white p-3"
              />
            )}
            <div className="text-xl font-bold text-teal-300">
              {activeRoom.challengeIds.length} thử thách · Giới hạn {formatClock(activeRoom.timeLimitSec)}
            </div>
            <p className="text-sm text-slate-400">
              Thứ tự xét kết quả: 1. Hoàn thành phép dựng hợp lệ → 2. Số bước dựng (L) → 3. Số phép dựng cơ bản (E) → 4. Thời gian hoàn thành.
            </p>
          </div>

          {/* Live Leaderboard + Top 3 Podium */}
          <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                Bảng xếp hạng trực tiếp
              </h2>
              <span className="text-lg font-mono-tabular text-slate-400">
                {sorted.length} lượt thi
              </span>
            </div>

            {sorted.length === 0 ? (
              <div className="py-16 text-center text-xl text-slate-400">
                Chưa có kết quả nộp bài. Nhấn thoát trình chiếu để bắt đầu lượt thi cho thí sinh đầu tiên!
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.slice(0, 10).map((r, idx) => (
                  <div
                    key={r.id}
                    className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${
                      idx === 0
                        ? 'bg-amber-500/20 border-2 border-amber-400'
                        : idx === 1
                        ? 'bg-slate-800 border border-slate-600'
                        : idx === 2
                        ? 'bg-orange-950/40 border border-orange-700'
                        : 'bg-slate-800/60 border border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-slate-950/60 flex items-center justify-center font-mono-tabular font-black text-xl text-amber-400 shrink-0">
                        {idx === 0 ? <Crown className="w-6 h-6" /> : `#${idx + 1}`}
                      </span>
                      <span className="text-2xl font-bold truncate">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-5 font-mono-tabular text-lg shrink-0">
                      <span className="text-emerald-400 font-bold">
                        {r.correctCount}/{activeRoom.challengeIds.length} đúng
                      </span>
                      <span className="text-amber-400 font-bold">★ {r.totalStars}</span>
                      <span className="text-sky-300 hidden sm:inline">
                        {r.totalL}L · {r.totalE}E
                      </span>
                      <span className="text-slate-300">{r.totalTimeSec}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PLAYING SESSION VIEW
  if (playing && activeRoom && scene) {
    const ch = getChallengeById(activeRoom.challengeIds[currentIdx]);
    if (!ch) return null;
    const costs = computeSceneCosts(scene);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3.5">
          <div>
            <div className="text-xs text-teal-300 font-semibold uppercase">
              {activeRoom.title} · Thí sinh: {playerName} · Bài {currentIdx + 1}/{activeRoom.challengeIds.length}
            </div>
            <div className="text-lg font-bold">{ch.title}</div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono-tabular font-bold text-lg ${
                remainingSec <= 30 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-amber-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatClock(remainingSec)}
            </div>
            <button
              type="button"
              onClick={submitCurrentChallenge}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[15px]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              Nộp bài &amp; Kiểm chứng
            </button>
            <button
              type="button"
              onClick={() =>
                void finishParticipantRun(
                  sessionStats.correct,
                  sessionStats.stars,
                  sessionStats.totalL,
                  sessionStats.totalE
                )
              }
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Kết thúc sớm
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>
            <strong className="text-teal-700 dark:text-teal-400">Đề bài: </strong>
            <MathText text={ch.description} />
          </div>
          <span className="font-mono-tabular text-xs font-semibold text-slate-500">
            Hiện tại: {costs.totalL}/{ch.targetL}L · {costs.totalE}/{ch.targetE}E
          </span>
        </div>

        {feedback && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 text-sm text-amber-900 dark:text-amber-200">
            {feedback}
          </div>
        )}

        <ToolPalette
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          allowedTools={ch.allowedTools}
          forbiddenTools={ch.forbiddenTools}
          inputMode={settings.inputMode}
          onToggleInputMode={() =>
            updateSettings({ inputMode: settings.inputMode === 'quick' ? 'virtual_tools' : 'quick' })
          }
          canUndo={history.length > 0}
          canRedo={false}
          onUndo={() => {
            if (history.length === 0) return;
            setScene(history[history.length - 1]);
            setHistory((h) => h.slice(0, -1));
          }}
          onRedo={() => {}}
          onClearUserObjects={() => {
            setScene(buildInitialScene(ch));
            setHistory([]);
          }}
          selectedObjectId={selectedObjId}
          onDeleteSelected={() => {
            if (!selectedObjId) return;
            setHistory((h) => [...h, scene]);
            setScene(deleteObjectWithDependents(scene, selectedObjId));
            setSelectedObjId(null);
          }}
          compact
        />

        <GeometryCanvas
          scene={scene}
          onSceneChange={(next, rec) => {
            if (rec) setHistory((h) => [...h.slice(-25), scene]);
            setScene(next);
          }}
          activeTool={activeTool}
          inputMode={settings.inputMode}
          selectedObjectId={selectedObjId}
          onSelectObject={setSelectedObjId}
          heightClass="h-[520px]"
          darkTheme={settings.theme === 'dark'}
        />
      </div>
    );
  }

  // MAIN ARENA LOBBY & ROOM MANAGEMENT
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <ConfettiBurst trigger={confettiTrigger} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Swords className="w-7 h-7 text-amber-600" />
            Đấu trường Toán học
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1">
            Luyện tập cá nhân, thi đấu cá nhân, theo đội và trong lớp học ngay trên thiết bị (hoạt động ngoại tuyến, không cần đăng nhập) kèm mã QR và trình chiếu bảng xếp hạng.
          </p>
        </div>

        {/* Join by room code */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="Nhập mã phòng 6 ký tự..."
            maxLength={6}
            className="w-48 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono-tabular uppercase text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleJoinByCode}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
          >
            Vào phòng
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 text-sm text-amber-900 dark:text-amber-200">
          {feedback}
        </div>
      )}

      {/* Active Room Detail Card */}
      {activeRoom && (
        <div className="rounded-2xl border-2 border-teal-500/60 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Phòng thi đang mở · Mã phòng: <span className="font-mono-tabular text-base text-amber-600 dark:text-amber-400">{activeRoom.code}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeRoom.title}</h2>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {activeRoom.challengeIds.length} thử thách · Thời gian {formatClock(activeRoom.timeLimitSec)} · {activeRoom.allowHints ? 'Cho phép gợi ý' : 'Khóa gợi ý & lời giải'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLedMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold text-sm hover:opacity-90"
              >
                <Monitor className="w-4 h-4" />
                Trình chiếu LED
              </button>
              <button
                type="button"
                onClick={() => setActiveRoomId(null)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300"
              >
                Đóng phòng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Start Participant Run + QR */}
            <div className="lg:col-span-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
              <div className="flex items-center gap-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR phòng thi"
                    className="w-28 h-28 rounded-xl bg-white p-1.5 border border-slate-200 shrink-0"
                  />
                )}
                <div className="space-y-1.5 text-sm">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-teal-700" />
                    Bắt đầu lượt thi đấu
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nhập tên thí sinh hoặc tên nhóm rồi bấm Bắt đầu để giải bộ đề trong thời gian quy định.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tên thí sinh / Nhóm..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={startParticipantRun}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Bắt đầu thi
                </button>
              </div>
            </div>

            {/* Room Leaderboard */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Bảng xếp hạng ({activeRoom.results.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Xếp hạng: Hợp lệ → Bước dựng (L) → Cơ bản (E) → Thời gian
                </span>
              </div>

              {activeRoom.results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500">
                  Chưa có lượt hoàn thành nào. Hãy cho thí sinh đầu tiên bắt đầu!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {sortLeaderboard(activeRoom.results).map((r, i) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono-tabular font-bold text-amber-600 w-6">#{i + 1}</span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono-tabular text-xs shrink-0">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {r.correctCount}/{activeRoom.challengeIds.length} bài
                        </span>
                        <span className="text-amber-600 font-bold">★{r.totalStars}</span>
                        <span className="text-slate-500">{r.totalL}L/{r.totalE}E</span>
                        <span className="text-slate-500">{r.totalTimeSec}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6 Modes + Room Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-700" />
            Tạo phòng đấu trường mới
          </h2>

          {/* Mode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ARENA_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selectedMode === m.id
                    ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Tên phòng thi</span>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Thời gian (giây)</span>
              <select
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={180}>3 phút (180s)</option>
                <option value={300}>5 phút (300s)</option>
                <option value={600}>10 phút (600s)</option>
                <option value={900}>15 phút (900s)</option>
              </select>
            </label>
          </div>

          {/* Ranking Criteria Explanation Before Starting */}
          <div className="rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 px-3.5 py-2.5 text-sm text-sky-950 dark:text-sky-200">
            <strong>Tiêu chí xét kết quả thi đấu:</strong> 1. Hoàn thành phép dựng hợp lệ → 2. Số bước dựng ít nhất (L) → 3. Số phép dựng cơ bản ít nhất (E) → 4. Thời gian hoàn thành nhanh nhất.
          </div>

          {/* Challenge Multi-picker (1–10 challenges across all 18 levels) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Chọn bộ thử thách (đã chọn {selectedChallengeIds.length}/10)
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={pickerLevelId}
                  onChange={(e) => setPickerLevelId(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value={0}>Tất cả 18 cấp độ</option>
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      Cấp {l.roman}: {l.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedChallengeIds(['L01_C01', 'L02_C01', 'L03_C01', 'L04_C01', 'L07_C09'])}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Chọn 5 bài mẫu
                </button>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {(pickerLevelId === 0 ? ALL_CHALLENGES : getChallengesByLevel(pickerLevelId)).map((ch) => {
                const checked = selectedChallengeIds.includes(ch.id);
                return (
                  <label
                    key={ch.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedChallengeIds.length < 10) {
                              setSelectedChallengeIds([...selectedChallengeIds, ch.id]);
                            }
                          } else {
                            setSelectedChallengeIds(selectedChallengeIds.filter((id) => id !== ch.id));
                          }
                        }}
                        className="rounded text-teal-700"
                      />
                      <span className="truncate text-slate-800 dark:text-slate-200">
                        <strong className="font-mono-tabular text-xs text-slate-400 mr-1.5">
                          C{ch.levelId}.{ch.order}
                        </strong>
                        {ch.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono-tabular text-slate-400 shrink-0">
                      {ch.targetL}L/{ch.targetE}E
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={allowHints}
                onChange={(e) => setAllowHints(e.target.checked)}
                className="rounded text-teal-700"
              />
              Cho phép dùng gợi ý trong phòng thi
            </label>
            <button
              type="button"
              onClick={() => void handleCreateRoom()}
              disabled={selectedChallengeIds.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 disabled:opacity-45"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tạo phòng &amp; Sinh mã QR
            </button>
          </div>
        </div>

        {/* Saved Rooms List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Danh sách phòng thi đã tạo ({arenaRooms.length})
          </h2>

          {arenaRooms.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có phòng thi nào. Hãy tạo phòng mới ở bên trái để lấy mã QR và mở bảng xếp hạng lớp học.
            </p>
          ) : (
            <div className="space-y-2.5">
              {arenaRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex items-center justify-between gap-3 hover:border-teal-400 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveRoomId(room.id)}
                    className="text-left min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-xs font-bold text-amber-700 dark:text-amber-400">
                        {room.code}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {room.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {room.challengeIds.length} bài · {room.results.length} lượt thi · {formatClock(room.timeLimitSec)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteArenaRoom(room.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Xóa phòng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Gợi ý tổ chức lớp học:</strong> Các phòng thi và bảng xếp hạng được lưu trực tiếp trên thiết bị (hoạt động cả khi không có mạng), rất thuận tiện để tổ chức thi đấu trên bảng tương tác, máy chiếu hoặc màn hình LED lớp học.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle2, Compass, GraduationCap, Swords, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const TOUR_STEPS = [
  {
    icon: Compass,
    title: 'Chào mừng đến với Học Viện Hình Học Smart',
    body: 'Không gian học tập và thực hành hình học tương tác dành cho giáo viên và học sinh THPT lớp 10, 11 và 12 — miễn phí, không cần đăng nhập và hỗ trợ sử dụng ngoại tuyến.',
  },
  {
    icon: CheckCircle2,
    title: 'Thử thách Hình học 2D & 3D theo Chương trình THPT',
    body: 'Luyện tập dựng hình phẳng (Toán 10), hình học không gian (Toán 11) và tọa độ Oxyz (Toán 12) với cơ chế kiểm chứng hình học động và hệ thống chấm sao minh bạch.',
  },
  {
    icon: BookOpen,
    title: 'Phòng thực hành 2D – 3D & Thư viện SGK Kết nối tri thức',
    body: 'Khám phá trực tiếp các bài học theo từng khối lớp, xoay mô hình 3D 360°, cắt thiết diện động, lưu bản vẽ trên thiết bị và xuất hình ảnh PNG/SVG sắc nét.',
  },
  {
    icon: Swords,
    title: 'Đấu trường Toán học THPT & Trình chiếu lớp học',
    body: 'Tổ chức luyện tập cá nhân, thi đấu theo đội hoặc trong lớp học theo từng khối Toán 10, Toán 11, Toán 12 với mã phòng 6 ký tự, mã QR và bảng xếp hạng trực tiếp.',
  },
  {
    icon: GraduationCap,
    title: 'Công cụ giáo viên & Giấy chứng nhận thành tích',
    body: 'Giáo viên có thể bật chế độ xem trước bài học để giảng dạy, tạo bài tập dựng hình trực quan và quản lý lớp; học sinh nhận danh hiệu, huy hiệu và giấy chứng nhận khổ A4.',
  },
];

export const OnboardingTour: React.FC = () => {
  const { tourOpen, setTourOpen, updateSettings, openChallenge } = useApp();
  const [step, setStep] = useState(0);

  if (!tourOpen) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  const finish = () => {
    updateSettings({ tourCompleted: true });
    setTourOpen(false);
    setStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                Hướng dẫn nhanh · Bước {step + 1}/{TOUR_STEPS.length}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Bỏ qua hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {current.body}
        </p>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === step
                  ? 'w-8 bg-teal-700'
                  : idx < step
                  ? 'w-3 bg-teal-300 dark:bg-teal-700'
                  : 'w-3 bg-slate-200 dark:bg-slate-700'
              }`}
              aria-label={`Bước ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={finish}
            className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Bỏ qua
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Quay lại
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  finish();
                  openChallenge('L01_C01');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                <Award className="w-4 h-4" />
                Thử thách đầu tiên
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

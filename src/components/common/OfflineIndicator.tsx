import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 no-print">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        Đang ở chế độ ngoại tuyến (Offline) — toàn bộ 180 thử thách, phòng thực hành và tiến trình lưu cục bộ vẫn hoạt động bình thường.
      </span>
    </div>
  );
};

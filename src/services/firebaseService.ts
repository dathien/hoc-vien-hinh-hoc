/**
 * Firebase Spark integration status & optional sync layer.
 * Runs 100% cleanly in standalone offline mode when VITE_FIREBASE_* variables are not configured.
 * Never fakes online connectivity or asks end-users for API keys.
 */

export interface FirebaseConfigStatus {
  configured: boolean;
  projectId: string | null;
  mode: 'offline_standalone' | 'cloud_ready';
  message: string;
}

export function getFirebaseStatus(): FirebaseConfigStatus {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;

  const configured = Boolean(
    apiKey &&
      projectId &&
      authDomain &&
      apiKey !== 'YOUR_FIREBASE_API_KEY' &&
      projectId !== 'YOUR_FIREBASE_PROJECT_ID'
  );

  if (!configured) {
    return {
      configured: false,
      projectId: null,
      mode: 'offline_standalone',
      message:
        'Ứng dụng đang hoạt động ở chế độ độc lập cục bộ (IndexedDB + LocalStorage). Mọi thử thách, phòng thực hành, đấu trường trình chiếu và sao lưu JSON đều hoạt động đầy đủ không cần đăng nhập.',
    };
  }

  return {
    configured: true,
    projectId: projectId ?? null,
    mode: 'cloud_ready',
    message: `Đã cấu hình dự án Firebase "${projectId}". Sẵn sàng đồng bộ tiến trình khi đăng nhập.`,
  };
}

export function registerServiceWorker(onUpdateAvailable?: () => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              onUpdateAvailable?.();
            }
          });
        });
      })
      .catch(() => {
        // Silent in dev or restricted iframe environments
      });
  });
}

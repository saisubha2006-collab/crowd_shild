// Service Worker Registration and Offline Sync Bridge

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  hasUpdate: boolean;
}

export function registerServiceWorker(onUpdateFound?: () => void): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported in current environment.');
    return Promise.resolve(null);
  }

  // Register sw.js
  return navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('[SW] CrowdShield Service Worker registered successfully with scope:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New safety cache update available.');
              if (onUpdateFound) onUpdateFound();
            }
          });
        }
      });

      return registration;
    })
    .catch((error) => {
      console.warn('[SW] Service Worker registration failed (normal in sandboxed frames):', error);
      return null;
    });
}

/**
 * Triggers background sync for offline SOS if available
 */
export function requestOfflineSync(tag: string = 'sync-offline-sos'): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg: any) => {
      if (reg.sync) {
        reg.sync.register(tag).catch((err: any) => {
          console.warn('[SW] SyncManager register failed:', err);
        });
      }
    });
  }
}

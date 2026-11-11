import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveAssetUrl } from './asset';

export interface VersionInfo {
  version: string;
  buildTime: number;
  buildDate?: string;
  features?: string[];
}

export interface AppUpdateState {
  hasUpdate: boolean;
  isChecking: boolean;
  currentVersion: string;
  currentBuildTime: number;
  latestVersion: VersionInfo | null;
  checkStatus: 'idle' | 'checking' | 'updated' | 'up-to-date' | 'error';
  lastCheckedTime: number | null;
  checkForUpdates: (manual?: boolean) => Promise<boolean>;
  applyUpdate: () => Promise<void>;
  dismissUpdateToast: () => void;
  showToast: boolean;
  setShowToast: (show: boolean) => void;
}

export function useAppUpdate(hasActiveQuiz: boolean = false): AppUpdateState {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [latestVersion, setLatestVersion] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'updated' | 'up-to-date' | 'error'>('idle');
  const [lastCheckedTime, setLastCheckedTime] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  const currentVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.1.0';
  const currentBuildTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : Date.now();
  const lastCheckTimestampRef = useRef<number>(0);

  const checkForUpdates = useCallback(async (manual: boolean = false): Promise<boolean> => {
    setIsChecking(true);
    setCheckStatus('checking');

    let foundNewVersion = false;

    // 1. Tell Service Worker to check for updates on server
    try {
      if ('serviceWorker' in navigator) {
        const swReg = (window as any).__SW_REGISTRATION__ || (await navigator.serviceWorker.getRegistration());
        if (swReg) {
          await swReg.update();
        }
      }
    } catch (err) {
      console.warn('[UpdateChecker] SW update trigger warning:', err);
    }

    // 2. Fetch fresh version.json with anti-cache headers
    try {
      const url = resolveAssetUrl(`version.json?_t=${Date.now()}`);
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const data: VersionInfo = await res.json();
        setLastCheckedTime(Date.now());
        lastCheckTimestampRef.current = Date.now();

        // Check if buildTime on server is newer than currently compiled buildTime
        if (data.buildTime && data.buildTime > currentBuildTime) {
          foundNewVersion = true;
          setHasUpdate(true);
          setLatestVersion(data);
          setCheckStatus('updated');
          setShowToast(true);
        } else {
          setCheckStatus('up-to-date');
        }
      } else {
        setCheckStatus(manual ? 'error' : 'idle');
      }
    } catch (err) {
      console.warn('[UpdateChecker] version.json check error:', err);
      setCheckStatus(manual ? 'error' : 'idle');
    } finally {
      setIsChecking(false);
    }

    return foundNewVersion;
  }, [currentBuildTime]);

  const applyUpdate = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }
    } catch (err) {
      console.warn('[UpdateChecker] applyUpdate error:', err);
    }

    // Force hard reload to activate new version
    window.location.reload();
  }, []);

  const dismissUpdateToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Listen to Service Worker onNeedRefresh event
  useEffect(() => {
    const handleSwUpdateEvent = () => {
      console.log('[UpdateChecker] Service Worker signaled update available.');
      setHasUpdate(true);
      setShowToast(true);
      setCheckStatus('updated');
    };

    window.addEventListener('midterm-ace:update-available', handleSwUpdateEvent);
    return () => window.removeEventListener('midterm-ace:update-available', handleSwUpdateEvent);
  }, []);

  // Auto-check on device open & lifecycle events
  useEffect(() => {
    // 1. Initial check 1 second after device opens the page
    const initialTimer = setTimeout(() => {
      checkForUpdates(false);
    }, 1200);

    // 2. Check when device unlocks or user switches back to this tab/app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // Debounce: check if at least 15s have passed since last check
        if (now - lastCheckTimestampRef.current > 15000) {
          console.log('[UpdateChecker] Device opened/active: automatically checking for new version...');
          checkForUpdates(false);
        }
      }
    };

    // 3. Check on window focus
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastCheckTimestampRef.current > 15000) {
        checkForUpdates(false);
      }
    };

    // 4. Check when device regains network connection
    const handleOnline = () => {
      console.log('[UpdateChecker] Device back online: checking for updates...');
      checkForUpdates(false);
    };

    // 5. Periodic background check every 5 minutes
    const periodicTimer = setInterval(() => {
      checkForUpdates(false);
    }, 5 * 60 * 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdates]);

  return {
    hasUpdate,
    isChecking,
    currentVersion,
    currentBuildTime,
    latestVersion,
    checkStatus,
    lastCheckedTime,
    checkForUpdates,
    applyUpdate,
    dismissUpdateToast,
    showToast,
    setShowToast
  };
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedOS, DeviceInfo, getDeviceInfo, fetchLiveHardwareStats } from '../../utils/deviceDetector';
import { getSimulatedOffline } from '../../utils/offlineStorage';

interface DeviceContextType {
  os: SupportedOS;
  deviceInfo: DeviceInfo;
  isTouch: boolean;
  isMobile: boolean;
  isLowMemoryDevice: boolean;
  isLiquidUI: boolean;
  isFluentUI: boolean;
  customOSOverride: SupportedOS | null;
  setCustomOSOverride: (os: SupportedOS | null) => void;
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (val: boolean) => void;
  windowState: 'normal' | 'minimized' | 'maximized';
  setWindowState: (state: 'normal' | 'minimized' | 'maximized') => void;
  refreshHardwareInfo: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    try {
      localStorage.removeItem('crowdshield_custom_os');
      localStorage.removeItem('crowdshield_os_override');
    } catch {
      // ignore
    }
    return getDeviceInfo();
  });
  const [customOSOverride, setCustomOSOverride] = useState<SupportedOS | null>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => getSimulatedOffline());
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized'>('normal');

  // Pure automatic detection directly from device hardware & user agent
  const effectiveOS: SupportedOS = deviceInfo.currentOS;
  const isLiquidUI = effectiveOS === 'macos' || effectiveOS === 'ios';
  const isFluentUI = effectiveOS === 'windows';

  const refreshHardwareInfo = async () => {
    const baseInfo = getDeviceInfo();
    const liveStats = await fetchLiveHardwareStats();
    setDeviceInfo({
      ...baseInfo,
      battery: liveStats.battery || baseInfo.battery,
      storageEstimate: liveStats.storage || baseInfo.storageEstimate,
    });
  };

  const handleSetCustomOS = (newOS: SupportedOS | null) => {
    setCustomOSOverride(newOS);
    try {
      if (newOS) {
        localStorage.setItem('crowdshield_custom_os', newOS);
      } else {
        localStorage.removeItem('crowdshield_custom_os');
      }
    } catch (e) {
      console.warn('Could not persist custom OS:', e);
    }
  };

  // Automatically update and adjust on mount and when window resizes
  useEffect(() => {
    refreshHardwareInfo();

    const handleResize = () => {
      setDeviceInfo((prev) => ({
        ...getDeviceInfo(),
        battery: prev.battery,
        storageEstimate: prev.storageEstimate,
      }));
    };

    const handleOnlineStatus = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        isOnline: navigator.onLine && !isSimulatedOffline,
      }));
    };

    const handleSimulatedOfflineEvent = (e: any) => {
      const isSim = e.detail?.isSimulatedOffline ?? getSimulatedOffline();
      setIsSimulatedOffline(isSim);
      setDeviceInfo((prev) => ({
        ...prev,
        isOnline: navigator.onLine && !isSim,
      }));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('crowdshield_connectivity_change', handleSimulatedOfflineEvent);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('crowdshield_connectivity_change', handleSimulatedOfflineEvent);
    };
  }, [isSimulatedOffline]);

  // Apply automatic OS & low-memory classes to the HTML document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous OS classes
    root.classList.remove('os-android', 'os-ios', 'os-macos', 'os-windows', 'low-memory-mode', 'ui-liquid', 'ui-fluent');
    
    // Add current native OS class
    root.classList.add(`os-${effectiveOS}`);
    root.setAttribute('data-os', effectiveOS);

    if (isLiquidUI) {
      root.classList.add('ui-liquid');
      root.setAttribute('data-ui-theme', 'liquid');
    } else if (isFluentUI) {
      root.classList.add('ui-fluent');
      root.setAttribute('data-ui-theme', 'fluent');
    } else {
      root.setAttribute('data-ui-theme', 'material');
    }

    // If low memory device detected, apply low-memory-mode class to reduce blur & graphics overhead
    if (deviceInfo.isLowMemoryDevice) {
      root.classList.add('low-memory-mode');
      root.setAttribute('data-low-memory', 'true');
    } else {
      root.removeAttribute('data-low-memory');
    }
  }, [effectiveOS, isLiquidUI, isFluentUI, deviceInfo.isLowMemoryDevice]);

  return (
    <DeviceContext.Provider
      value={{
        os: effectiveOS,
        deviceInfo: {
          ...deviceInfo,
          currentOS: effectiveOS,
          isOnline: deviceInfo.isOnline && !isSimulatedOffline,
        },
        isTouch: deviceInfo.isTouch,
        isMobile: deviceInfo.isMobile,
        isLowMemoryDevice: deviceInfo.isLowMemoryDevice,
        isLiquidUI,
        isFluentUI,
        customOSOverride,
        setCustomOSOverride: handleSetCustomOS,
        isSimulatedOffline,
        setIsSimulatedOffline,
        windowState,
        setWindowState,
        refreshHardwareInfo,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

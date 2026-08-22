export type SupportedOS = 'android' | 'ios' | 'macos' | 'windows' | 'linux';

export interface DetailedHardwareInfo {
  // OS Details
  os: SupportedOS;
  osName: string;
  osVersion: string;
  kernelOrBuild: string;
  
  // Browser & Client
  browserName: string;
  browserVersion: string;
  engine: string;
  userAgent: string;
  platform: string;
  architecture: string;

  // Display & Screen
  screenResolution: string;
  viewportSize: string;
  pixelRatio: number;
  colorDepth: number;
  orientation: string;
  touchSupport: boolean;
  maxTouchPoints: number;

  // Processor, GPU & Graphics
  cpuCores: number;
  gpuRenderer: string;
  gpuVendor: string;
  webglSupported: boolean;

  // Memory & Storage
  deviceMemoryGB: number;
  isLowMemoryDevice: boolean;
  storageEstimate?: {
    quotaMB: number;
    usageMB: number;
    percentUsed: number;
  };

  // Battery & Power (Async populated)
  battery?: {
    level: number; // 0 to 100
    charging: boolean;
    chargingTime?: number;
    dischargingTime?: number;
  };

  // Network & Connectivity
  isOnline: boolean;
  connectionType: string;
  downlinkSpeed: string;
  roundTripTime: string;
  isDataSaver: boolean;

  // Sensor & Hardware APIs
  hasGeolocation: boolean;
  hasVibration: boolean;
  hasMotionSensors: boolean;
  hasSpeechSynthesis: boolean;
  isPWA: boolean;
}

export interface DeviceInfo extends DetailedHardwareInfo {
  detectedOS: SupportedOS;
  currentOS: SupportedOS;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isTouch: boolean;
  isMobile: boolean;
}

/**
 * Parses detailed OS name and version from UserAgent and Navigator
 */
export function detectDetailedOS(): {
  os: SupportedOS;
  osName: string;
  osVersion: string;
  kernelOrBuild: string;
  platform: string;
  architecture: string;
} {
  if (typeof window === 'undefined') {
    return {
      os: 'android',
      osName: 'Android',
      osVersion: '14.0',
      kernelOrBuild: 'Linux Kernel ARM64',
      platform: 'Linux arm64',
      architecture: 'ARM64',
    };
  }

  const ua = window.navigator.userAgent || '';
  const platform = (window.navigator as any)?.userAgentData?.platform || window.navigator.platform || 'Unknown';
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;

  // Check iOS (iPhone, iPad, iPod)
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1)) {
    const match = ua.match(/OS (\d+[_.]\d+([_.]\d+)?)/);
    const version = match ? match[1].replace(/_/g, '.') : '17.x / 18.x';
    const isIPad = /iPad/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
    return {
      os: 'ios',
      osName: isIPad ? 'Apple iPadOS' : 'Apple iOS (Cupertino)',
      osVersion: `iOS ${version}`,
      kernelOrBuild: 'Darwin / XNU Kernel',
      platform: isIPad ? 'iPad (Apple Silicon)' : 'iPhone (A-Series)',
      architecture: 'ARM64 (Apple Silicon)',
    };
  }

  // Check Android
  if (/Android/i.test(ua) || /Linux.*arm/i.test(platform)) {
    const match = ua.match(/Android\s([0-9.]+)/i);
    const version = match ? match[1] : '14 / 15';
    // Try finding device model
    const modelMatch = ua.match(/;\s([^;]+)\sBuild\//);
    const model = modelMatch ? modelMatch[1] : 'Mobile Device';
    return {
      os: 'android',
      osName: 'Android (Material You)',
      osVersion: `Android ${version} (${model})`,
      kernelOrBuild: 'Linux Kernel LTS',
      platform: 'Android Linux',
      architecture: ua.includes('arm64') || ua.includes('aarch64') ? 'ARM64 (AArch64)' : 'ARMv8-A 64-bit',
    };
  }

  // Check macOS (MacBook, iMac, Mac Studio)
  if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua) || /Mac/i.test(platform)) {
    const match = ua.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/);
    let rawVer = match ? match[1].replace(/_/g, '.') : '14.5';
    // Give macOS marketing names if version starts with 14 or 15
    let macName = 'macOS';
    if (rawVer.startsWith('15')) macName = 'macOS 15 (Sequoia)';
    else if (rawVer.startsWith('14')) macName = 'macOS 14 (Sonoma)';
    else if (rawVer.startsWith('13')) macName = 'macOS 13 (Ventura)';
    else macName = `macOS ${rawVer}`;

    const isAppleSilicon = ua.includes('ARM') || (maxTouchPoints === 0 && !ua.includes('Intel'));
    return {
      os: 'macos',
      osName: 'macOS (Sonoma/Sequoia)',
      osVersion: macName,
      kernelOrBuild: 'Darwin 23.x Kernel',
      platform: 'Macintosh Desktop',
      architecture: isAppleSilicon ? 'Apple Silicon (M1/M2/M3/M4)' : 'Intel x86_64 64-bit',
    };
  }

  // Check Windows (Windows 11 / 10 / Surface)
  if (/Win32|Win64|Windows|WinCE/i.test(ua) || /Win/i.test(platform)) {
    const match = ua.match(/Windows NT\s([0-9.]+)/);
    const ntVer = match ? match[1] : '10.0';
    let winVer = 'Windows 11 / 10';
    if (ntVer === '10.0') {
      // Modern Chromium/Edge reports Windows NT 10.0 for both 10 and 11
      winVer = 'Windows 11 / 10 (NT 10.0 Build)';
    } else if (ntVer === '6.3') winVer = 'Windows 8.1';
    else if (ntVer === '6.1') winVer = 'Windows 7';

    return {
      os: 'windows',
      osName: 'Windows 11 (Fluent Mica)',
      osVersion: winVer,
      kernelOrBuild: `NT Kernel v${ntVer}`,
      platform: 'Win32 / Win64 x64',
      architecture: ua.includes('WOW64') || ua.includes('Win64') ? 'x86_64 (64-bit)' : 'x86 Architecture',
    };
  }

  // Fallback (Linux Desktop / Embedded)
  if (/Linux/i.test(ua)) {
    return {
      os: maxTouchPoints > 0 ? 'android' : 'windows',
      osName: 'Linux OS',
      osVersion: 'GNU/Linux Kernel 6.x',
      kernelOrBuild: 'Linux Kernel Generic',
      platform: platform || 'Linux x86_64',
      architecture: 'x86_64 64-bit',
    };
  }

  return {
    os: 'android',
    osName: 'Android (Material You)',
    osVersion: 'Android 14.0',
    kernelOrBuild: 'Linux Kernel',
    platform: 'Mobile Platform',
    architecture: 'ARM64',
  };
}

/**
 * Detects Browser Name and exact Version
 */
export function detectBrowser(): { browserName: string; browserVersion: string; engine: string } {
  if (typeof window === 'undefined') {
    return { browserName: 'Chrome', browserVersion: '130.0', engine: 'Blink' };
  }

  const ua = window.navigator.userAgent;
  let browserName = 'Web Browser';
  let browserVersion = '1.0';
  let engine = 'Blink / WebKit';

  if (/Edg\/([0-9.]+)/.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || '';
    engine = 'Blink / Chromium';
  } else if (/Chrome\/([0-9.]+)/.test(ua) && !/Chromium|Edg|OPR/.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    engine = 'Blink / V8';
  } else if (/Safari\/([0-9.]+)/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) {
    browserName = 'Apple Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || ua.match(/Safari\/([0-9.]+)/)?.[1] || '';
    engine = 'WebKit / Nitro';
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    engine = 'Gecko / SpiderMonkey';
  } else if (/OPR\/([0-9.]+)/.test(ua)) {
    browserName = 'Opera';
    browserVersion = ua.match(/OPR\/([0-9.]+)/)?.[1] || '';
    engine = 'Blink';
  }

  return { browserName, browserVersion, engine };
}

/**
 * Queries WebGL context to extract GPU vendor and unmasked renderer name
 */
export function detectGPU(): { gpuRenderer: string; gpuVendor: string; webglSupported: boolean } {
  if (typeof window === 'undefined') {
    return { gpuRenderer: 'Hardware Accelerated GPU', gpuVendor: 'Generic', webglSupported: true };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      return { gpuRenderer: 'Software Rasterizer', gpuVendor: 'Standard', webglSupported: false };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Hardware Vendor';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Hardware Accelerated 3D GPU';
      return { gpuRenderer: renderer, gpuVendor: vendor, webglSupported: true };
    }

    const renderer = gl.getParameter(gl.RENDERER) || 'Hardware Accelerated GPU';
    const vendor = gl.getParameter(gl.VENDOR) || 'Hardware Vendor';
    return { gpuRenderer: renderer, gpuVendor: vendor, webglSupported: true };
  } catch {
    return { gpuRenderer: 'Hardware Accelerated GPU', gpuVendor: 'Generic', webglSupported: true };
  }
}

/**
 * Inbuilt Automatic Native OS & Device Hardware Engine
 */
export function getDeviceInfo(): DeviceInfo {
  const osData = detectDetailedOS();
  const browserData = detectBrowser();
  const gpuData = detectGPU();

  const nav = typeof window !== 'undefined' ? (window.navigator as any) : ({} as any);
  const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4;
  const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
  const dataSaver = !!nav.connection?.saveData;

  const isLowMemory = memory <= 2 || cores <= 2 || (memory <= 4 && cores <= 4 && osData.os === 'android');

  const isTouch = typeof window !== 'undefined' && (nav.maxTouchPoints > 0 || 'ontouchstart' in window);
  const isMobile = osData.os === 'android' || osData.os === 'ios';

  const deviceTypes: Record<SupportedOS, 'mobile' | 'tablet' | 'desktop'> = {
    android: 'mobile',
    ios: 'mobile',
    macos: 'desktop',
    windows: 'desktop',
    linux: 'desktop',
  };

  const isPWA = typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true);

  const screenResolution = typeof window !== 'undefined' 
    ? `${window.screen.width} × ${window.screen.height} px` 
    : '1920 × 1080 px';

  const viewportSize = typeof window !== 'undefined'
    ? `${window.innerWidth} × ${window.innerHeight} px`
    : '100% viewport';

  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const colorDepth = typeof window !== 'undefined' ? window.screen.colorDepth || 24 : 24;
  const orientation = typeof window !== 'undefined' 
    ? (window.screen.orientation?.type || (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'))
    : 'portrait';

  // Network connection info
  const conn = nav.connection || {};
  const isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;
  const connectionType = conn.effectiveType ? conn.effectiveType.toUpperCase() : (conn.type || (isOnline ? 'Active Network (High Speed)' : 'Offline'));
  const downlinkSpeed = conn.downlink ? `${conn.downlink} Mbps` : 'High Speed Stream';
  const roundTripTime = conn.rtt ? `${conn.rtt} ms latency` : '< 25 ms';

  return {
    detectedOS: osData.os,
    currentOS: osData.os,
    os: osData.os,
    osName: osData.osName,
    osVersion: osData.osVersion,
    kernelOrBuild: osData.kernelOrBuild,
    platform: osData.platform,
    architecture: osData.architecture,
    browserName: browserData.browserName,
    browserVersion: browserData.browserVersion,
    engine: browserData.engine,
    userAgent: nav.userAgent || '',
    deviceType: deviceTypes[osData.os],
    isTouch,
    isMobile,
    isPWA,
    screenResolution,
    viewportSize,
    pixelRatio,
    colorDepth,
    orientation,
    touchSupport: isTouch,
    maxTouchPoints: nav.maxTouchPoints || (isTouch ? 5 : 0),
    cpuCores: cores,
    gpuRenderer: gpuData.gpuRenderer,
    gpuVendor: gpuData.gpuVendor,
    webglSupported: gpuData.webglSupported,
    deviceMemoryGB: memory,
    isLowMemoryDevice: isLowMemory,
    isOnline,
    connectionType,
    downlinkSpeed,
    roundTripTime,
    isDataSaver: dataSaver,
    hasGeolocation: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    hasVibration: typeof navigator !== 'undefined' && 'vibrate' in navigator,
    hasMotionSensors: typeof window !== 'undefined' && ('DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window),
    hasSpeechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}

/**
 * Async fetch for Battery & Storage quota estimates
 */
export async function fetchLiveHardwareStats(): Promise<{
  battery?: { level: number; charging: boolean };
  storage?: { quotaMB: number; usageMB: number; percentUsed: number };
}> {
  const result: {
    battery?: { level: number; charging: boolean };
    storage?: { quotaMB: number; usageMB: number; percentUsed: number };
  } = {};

  // Battery status API
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const b = await (navigator as any).getBattery();
      result.battery = {
        level: Math.round(b.level * 100),
        charging: b.charging,
      };
    } catch {
      // Ignored
    }
  }

  // Storage API
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota && estimate.usage !== undefined) {
        const quotaMB = Math.round(estimate.quota / (1024 * 1024));
        const usageMB = Math.round(estimate.usage / (1024 * 1024));
        const percentUsed = Math.min(100, Math.round((estimate.usage / estimate.quota) * 100));
        result.storage = { quotaMB, usageMB, percentUsed };
      }
    } catch {
      // Ignored
    }
  }

  return result;
}

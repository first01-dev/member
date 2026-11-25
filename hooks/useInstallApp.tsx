'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useInstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false); // ตัวแปรเปิด-ปิดป๊อปอัปสอนวิธีติดตั้งบน iPhone

  useEffect(() => {
    // 1. เช็กว่าเปิดจากแอปที่ติดตั้งไปแล้วหรือยัง (Standalone Mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstallable(false);
      return; // ถ้าติดตั้งไปแล้ว ให้ซ่อนปุ่มตลอดไป
    }

    // 2. เช็กว่าเป็นอุปกรณ์ iOS (iPhone / iPad / iPod) หรือไม่
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIOSDevice) {
      setIsIOS(true);
      setIsInstallable(true); // สั่งให้ปุ่ม Install App โชว์บน iPhone ด้วย!
    }

    // 3. ดักจับสำหรับ Android และคอมพิวเตอร์ (Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    // ถ้าเป็น iPhone ให้เปิดป๊อปอัปสอนวิธีติดตั้งแทน
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // ถ้าเป็น Android / PC ให้เด้งหน้าต่างติดตั้งทันที
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, triggerInstall, showIOSGuide, setShowIOSGuide };
}

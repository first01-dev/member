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
  const [showInstallModal, setShowInstallModal] = useState(false); // ใช้เปิดป๊อปอัปทั้ง Android และ iOS

  useEffect(() => {
    // 1. เช็กว่าเปิดจากแอปที่ติดตั้งไปแล้วหรือยัง
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    // 2. เช็กว่าเป็น iOS หรือไม่
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIOSDevice) {
      setIsIOS(true);
      setIsInstallable(true);
    }

    // 3. ดักจับสำหรับ Android และ PC
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowInstallModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // กดปุ่ม Install App ครั้งแรก -> เปิดป๊อปอัปแนะนำเหมือนกันทุกเครื่อง!
  const triggerInstall = () => {
    setShowInstallModal(true);
  };

  // กดปุ่ม "ติดตั้งเลย" ข้างในป๊อปอัป (สำหรับ Android / PC)
  const confirmAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setShowInstallModal(false);
    }
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isIOS,
    showInstallModal,
    setShowInstallModal,
    triggerInstall,
    confirmAndroidInstall,
  };
}

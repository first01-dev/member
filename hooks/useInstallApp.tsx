'use client';

import { useEffect, useState } from 'react';

// กำหนด Type ให้ TypeScript รู้จัก Event ของการติดตั้ง PWA
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

  useEffect(() => {
    // 1. ดักจับตอนเบราว์เซอร์แจ้งว่าเว็บนี้พร้อมให้ติดตั้งแล้ว
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // ป้องกันไม่ให้เบราว์เซอร์เด้งป๊อปอัปขึ้นมาเอง
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true); // เปิดให้เมนู Install App แสดงขึ้นมา
    };

    // 2. ดักจับตอนผู้ใช้ติดตั้งแอปเสร็จสิ้นแล้ว
    const handleAppInstalled = () => {
      setIsInstallable(false); // ซ่อนเมนู Install App ทันที
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 3. ฟังก์ชันสำหรับสั่งให้หน้าต่าง Install เด้งขึ้นมาตอนผู้ใช้กดเมนู
  const triggerInstall = async () => {
    if (!deferredPrompt) return;

    // แสดงป๊อปอัปติดตั้งของเบราว์เซอร์
    await deferredPrompt.prompt();

    // รอดูคำตอบว่าผู้ใช้กด Install หรือกดยกเลิก
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, triggerInstall };
}

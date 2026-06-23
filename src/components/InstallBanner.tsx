"use client";

import { useState, useEffect } from "react";
import { X, Download, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Only show if not already installed and not dismissed recently
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 1000 * 60 * 60 * 24 * 7) {
      return; // Hide for 7 days if dismissed
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    if (ios) {
      setShow(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      alert("在 iOS 设备上：请点击下方工具栏的「分享」图标，然后选择「添加到主屏幕」即可离线畅玩！");
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 mb-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 cursor-pointer" onClick={handleDismiss}>
          <X className="w-5 h-5 text-white/70 hover:text-white" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">把脑力星球装进手机！</h3>
            <p className="text-white/90 text-sm">
              添加至桌面，0 秒启动，断网也能玩，再也不怕广告打扰啦。
            </p>
          </div>
          <button 
            onClick={handleInstall}
            className="whitespace-nowrap flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            {isIOS ? <Apple className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            免费安装
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

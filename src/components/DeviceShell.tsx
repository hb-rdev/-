import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Battery, Wifi, Signal, Sun, Moon } from "lucide-react";

interface DeviceShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (b: boolean) => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}

export default function DeviceShell({
  children,
  activeTab,
  onTabChange,
  isPhoneFrame,
  setIsPhoneFrame,
  theme,
  onThemeChange,
}: DeviceShellProps) {
  const [time, setTime] = useState("09:41");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Header Controls */}
      <header className={`w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b gap-4 sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark 
          ? "bg-slate-950/80 border-slate-800/80 text-white" 
          : "bg-white/80 border-slate-200 text-slate-800 shadow-2xs"
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight ${
              isDark 
                ? "bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent"
                : "text-slate-900"
            }`}>
              연금저축 시뮬레이터 Pro
            </h1>
            <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              React Native 하이브리드 엔진
            </p>
          </div>
        </div>

        {/* Controls Section (Theme Switcher & Device Screen Layout Split) */}
        <div className="flex items-center space-x-3">
          {/* Black & White Premium Mode Switcher Button */}
          <div className={`flex items-center p-1 rounded-xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onClick={() => onThemeChange("light")}
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                !isDark 
                  ? "bg-white text-amber-500 shadow-xs scale-102 font-bold" 
                  : "text-slate-500 hover:text-slate-350"
              }`}
              title="화이트 모드"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onThemeChange("dark")}
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                isDark 
                  ? "bg-indigo-600 text-white shadow-xs scale-102 font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="블랙 모드"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Device Mockup Segmented Toggle */}
          <div className={`flex items-center p-1 rounded-xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onClick={() => setIsPhoneFrame(true)}
              id="toggle-phone-frame"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-205 ${
                isPhoneFrame
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>모바일 앱</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              id="toggle-desktop-frame"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-205 ${
                !isPhoneFrame
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>데스크탑 뷰</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 flex items-center justify-center py-6 px-4 md:py-10 transition-colors duration-300 ${
        isDark 
          ? "bg-radial-at-t from-slate-900 via-slate-950 to-slate-950" 
          : "bg-slate-100"
      }`}>
        {isPhoneFrame ? (
          /* Phone Frame Mockup */
          <div className={`relative w-full max-w-[430px] h-[880px] rounded-[48px] p-3.5 border-4 transition-all duration-300 overflow-hidden flex flex-col ${
            isDark 
              ? "bg-slate-950 border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10" 
              : "bg-slate-900 border-slate-700 shadow-xl"
          }`}>
            {/* Camera Dynamic Island / Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-4 ring-1 ring-white/5">
              <div className="w-1.5 h-1.5 bg-indigo-500/80 rounded-full animate-pulse"></div>
              <div className="w-3.5 h-1.5 bg-zinc-800 rounded-full"></div>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className={`w-full h-8 flex items-center justify-between px-6 text-xs z-40 pt-1 font-semibold select-none ${
              isDark ? "text-white/90" : "text-white/95"
            }`}>
              <span>{time}</span>
              <div className="flex items-center space-x-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 ml-0.5" />
              </div>
            </div>

            {/* Phone Screen App Container */}
            <div className={`flex-1 rounded-[34px] overflow-y-auto flex flex-col relative overflow-hidden pb-16 transition-colors duration-300 ${
              isDark ? "bg-slate-900 border border-slate-800/50" : "bg-slate-50 border border-slate-200"
            }`}>
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full pointer-events-none z-50 ${
              isDark ? "bg-white/40" : "bg-white/50"
            }`}></div>
          </div>
        ) : (
          /* Broad Desktop Layout */
          <div className={`w-full max-w-6xl border rounded-2xl shadow-2xl overflow-hidden min-h-[750px] flex flex-col transition-all duration-300 ${
            isDark ? "bg-slate-900 border-slate-800/90" : "bg-white border-slate-180"
          }`}>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {children}
            </div>
          </div>
        )}
      </main>

      {/* Footer Meta Credits */}
      <footer className={`py-4 border-t text-center text-xs font-mono transition-colors ${
        isDark 
          ? "border-slate-800/40 bg-slate-950/60 text-slate-500" 
          : "border-slate-200 bg-white text-slate-400"
      }`}>
        Annuity Savings Simulator Pro (React v19 & Tailwind v4) · Crafted for Financial Freedom
      </footer>
    </div>
  );
}

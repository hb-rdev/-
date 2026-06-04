import React from "react";
import { Monitor, Sun, Moon } from "lucide-react";

interface DeviceShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}

export default function DeviceShell({
  children,
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
}: DeviceShellProps) {
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
            <Monitor className="w-6 h-6 text-white" />
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
              3대 노후상품 정밀 비교 및 분석 엔진
            </p>
          </div>
        </div>

        {/* Controls Section (Theme Switcher Button) */}
        <div className="flex items-center space-x-3">
          {/* Black & White Premium Mode Switcher Button */}
          <div className={`flex items-center p-1 rounded-xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onClick={() => onThemeChange("light")}
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
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
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                isDark 
                  ? "bg-indigo-600 text-white shadow-xs scale-102 font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="블랙 모드"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Broad Desktop Layout */}
      <main className={`flex-1 flex items-center justify-center py-6 px-4 md:py-10 transition-colors duration-300 ${
        isDark 
          ? "bg-radial-at-t from-slate-900 via-slate-950 to-slate-950" 
          : "bg-radial-at-t from-slate-50 via-slate-100 to-slate-100"
      }`}>
        <div className={`w-full max-w-7xl border rounded-2xl shadow-2xl overflow-hidden min-h-[750px] flex flex-col transition-all duration-300 ${
          isDark ? "bg-slate-900/90 border-slate-800/95" : "bg-white border-slate-200"
        }`}>
          <div className="flex-1 overflow-y-auto flex flex-col">
            {children}
          </div>
        </div>
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

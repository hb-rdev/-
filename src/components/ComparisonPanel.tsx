import React, { useMemo, useState } from "react";
import { SimulationInputs } from "../types";
import ComparisonCards from "./ComparisonCards";
import { runSimulation, yLabel, getPensionTaxRate } from "../utils";
import { 
  Plus,
  Minus,
  Coins, 
  User, 
  Hourglass, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  PiggyBank, 
  Percent,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Award,
  Wallet,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

interface ComparisonPanelProps {
  inputs: SimulationInputs;
  onInputChange: (newInputs: Partial<SimulationInputs>) => void;
  theme?: "dark" | "light";
}

export default function ComparisonPanel({ 
  inputs, 
  onInputChange, 
  theme = "light" 
}: ComparisonPanelProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showHybrid, setShowHybrid] = useState<boolean>(true);
  
  const isDark = theme === "dark";

  // Compute all three simulation results on the fly from the inputs
  const fundResult = useMemo(() => {
    return runSimulation({ ...inputs, simulationType: "fund" });
  }, [inputs]);

  const nonTaxableResult = useMemo(() => {
    return runSimulation({ ...inputs, simulationType: "nonTaxable" });
  }, [inputs]);

  const hybridResult = useMemo(() => {
    return runSimulation({ ...inputs, simulationType: "hybrid" });
  }, [inputs]);

  // Total principal paid across all three simulations (since it's a common condition)
  const totalPrincipal = useMemo(() => {
    return inputs.monthlyDeposit * 12 * inputs.depositYears;
  }, [inputs.monthlyDeposit, inputs.depositYears]);

  // Adjust helper for numerical sliders
  const adj = (key: keyof SimulationInputs, delta: number, min: number, max: number) => {
    const val = inputs[key] as number;
    let newVal = parseFloat((val + delta).toFixed(2));
    if (newVal < min) newVal = min;
    if (newVal > max) newVal = max;
    onInputChange({ [key]: newVal });
  };

  const getHelpContent = (key: string): string => {
    switch (key) {
      case "monthlyDeposit":
        return "매월 연금계좌에 납입하는 핵심 원금입니다.";
      case "startAge":
        return "자산 적립을 개시하는 가입 연령입니다.";
      case "endAge":
        return "연금 수령을 처음으로 시작하는 은퇴 개령입니다. (최선 55세)";
      case "depositYears":
        return "원금을 납입하는 총 연도 수입니다. 개시나이 직전까지가 기본입니다.";
      case "taxCreditRate":
        return "가입자의 연소득에 따른 세액공제 환급 비율입니다. (연 900만원 한도)";
      default:
        return "";
    }
  };

  const showHelp = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  const renderAdjustBtn = (onClick: () => void, isPlus: boolean) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-4 h-4 flex items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0 ${
        isDark
          ? "bg-slate-950 border-slate-880 text-slate-300 hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white"
          : "bg-white border-slate-200 text-slate-600 hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white shadow-3xs"
      }`}
    >
      {isPlus ? <Plus className="w-2 h-2" /> : <Minus className="w-2 h-2" />}
    </button>
  );

  const renderMiniAdjustBtn = (onClick: () => void, isPlus: boolean, hoverBgClass: string) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-4 h-4 flex items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0 ${
        isDark
          ? "bg-slate-950 border-slate-800 text-slate-400 " + hoverBgClass
          : "bg-white border-slate-200 text-slate-500 shadow-3xs " + hoverBgClass
      }`}
    >
      {isPlus ? <Plus className="w-2 h-2" /> : <Minus className="w-2 h-2" />}
    </button>
  );

  const renderSlider = (
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    color: string
  ) => {
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    const trackBg = isDark ? "#334155" : "#cbd5e1";
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(step % 1 === 0 ? parseInt(e.target.value) : parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${color} ${percent}%, ${trackBg} ${percent}%)`,
          color: color,
          "--thumb-color": color,
        } as React.CSSProperties}
        className="flex-1 w-full min-w-0 h-1 cursor-pointer"
      />
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. TOP INPUTS CONSOLE (공통 설정 + 개별 설정 상단에 집결) */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
        isDark 
          ? "bg-slate-900 border-slate-800" 
          : "bg-white border-slate-200 shadow-xs"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          
          {/* Column 1: 공통 가입 조건 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-8 mb-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                isDark ? "bg-[#355c7d]/15 text-[#e2e8f0]" : "bg-slate-100 text-[#355c7d]"
              }`}>
                공통 가입 조건
              </span>
              <span className={`text-[9.5px] font-bold ${isDark ? "text-slate-400" : "text-[#355c7d]"}`}>
                {inputs.startAge}세~{inputs.endAge}세 (납입 {inputs.depositYears}년)
              </span>
            </div>

            <div className={`p-4 rounded-xl border flex-1 flex flex-col justify-between ${
               isDark ? "bg-slate-950/45 border-slate-800/80" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="space-y-4">
                {/* 월 납입액 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 text-[9.5px]">
                      <Coins className="w-3.5 h-3.5 mr-1 text-[#355c7d] shrink-0" />
                      월 납입액
                      <button type="button" onClick={(e) => showHelp(e, "monthlyDeposit")} className="text-slate-500 hover:text-[#355c7d] ml-1">
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </span>
                    <span className={`font-mono font-black text-[10.5px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {inputs.monthlyDeposit}만원
                    </span>
                  </div>
                  {activeTooltip === "monthlyDeposit" && (
                    <div className="absolute left-0 right-0 top-6 z-50 text-[10px] p-2 bg-slate-950 border border-slate-800 text-slate-350 rounded-lg">
                      {getHelpContent("monthlyDeposit")}
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {renderAdjustBtn(() => adj("monthlyDeposit", -5, 10, 200), false)}
                    {renderSlider(inputs.monthlyDeposit, 10, 200, 5, (val) => onInputChange({ monthlyDeposit: val }), "#355c7d")}
                    {renderAdjustBtn(() => adj("monthlyDeposit", 5, 10, 200), true)}
                  </div>
                </div>

                {/* 시작 나이 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-455 truncate text-[9.5px]">
                      <User className="w-3.5 h-3.5 mr-1 text-[#355c7d] shrink-0" />
                      시작 나이
                    </span>
                    <span className={`font-mono font-black text-[10.5px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {inputs.startAge}세
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {renderAdjustBtn(() => adj("startAge", -1, 25, 50), false)}
                    {renderSlider(inputs.startAge, 25, 50, 1, (val) => onInputChange({ startAge: val }), "#355c7d")}
                    {renderAdjustBtn(() => adj("startAge", 1, 25, 50), true)}
                  </div>
                </div>

                {/* 개시 나이 + 납입 기간 코어설정 1x2 그리드 */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 개시 나이 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-455 truncate text-[9px] flex items-center">
                        <Hourglass className="w-2.5 h-2.5 mr-0.5 text-[#355c7d] shrink-0" />
                        개시 나이
                      </span>
                      <span className={`font-mono font-black text-[10.5px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {inputs.endAge}세
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("endAge", -1, 55, 70), false, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                      {renderSlider(inputs.endAge, 55, 70, 1, (val) => onInputChange({ endAge: val }), "#355c7d")}
                      {renderMiniAdjustBtn(() => adj("endAge", 1, 55, 70), true, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                    </div>
                  </div>

                  {/* 납입 기간 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-455 truncate text-[9px] flex items-center">
                        <Hourglass className="w-2.5 h-2.5 mr-0.5 text-[#355c7d] shrink-0" />
                        납입 기간
                      </span>
                      <span className={`font-mono text-[10.5px] text-slate-455 font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {inputs.depositYears}년({inputs.startAge + inputs.depositYears}세)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("depositYears", -1, 1, inputs.endAge - inputs.startAge), false, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                      {renderSlider(inputs.depositYears, 1, Math.max(1, inputs.endAge - inputs.startAge), 1, (val) => onInputChange({ depositYears: val }), "#355c7d")}
                      {renderMiniAdjustBtn(() => adj("depositYears", 1, 1, inputs.endAge - inputs.startAge), true, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                    </div>
                  </div>
                </div>

                {/* 소득형태별 공제율 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-455 truncate text-[9.5px]">
                      <Percent className="w-3.5 h-3.5 mr-1 text-[#355c7d] shrink-0" />
                      공제율
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
                    <button type="button" onClick={() => onInputChange({ taxCreditRate: 13.2 })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.taxCreditRate === 13.2 ? "bg-[#355c7d] text-white shadow-xs" : "text-slate-455 hover:text-[#355c7d]"}`}>13.2%</button>
                    <button type="button" onClick={() => onInputChange({ taxCreditRate: 16.5 })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.taxCreditRate === 16.5 ? "bg-[#355c7d] text-white shadow-xs" : "text-slate-455 hover:text-[#355c7d]"}`}>16.5%</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: 연금저축펀드 */}
          <div className="flex flex-col">
            <div className="flex items-center h-8 mb-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                isDark ? "bg-[#696FC7]/15 text-[#A7AAE1]" : "bg-slate-100 text-slate-700"
              }`}>
                연금저축펀드
              </span>
            </div>

            <div className={`p-4 rounded-xl border relative overflow-hidden flex-1 flex flex-col justify-between ${
              isDark ? "bg-[#355c7d]/5 border-[#355c7d]/30" : "bg-[#355c7d]/5 border-[#355c7d]/15"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: "#355c7d" }}></div>
              <div className="space-y-4">
                {/* 적립기/인출기 수익률 가로 1x2 배열 */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 적립기 수익률 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">적립기수익률</span>
                      <span className={`font-mono font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#355c7d" }}>{inputs.ratePre.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("ratePre", -0.1, 2, 15), false, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                      {renderSlider(inputs.ratePre, 2, 15, 0.1, (val) => onInputChange({ ratePre: val }), "#355c7d")}
                      {renderMiniAdjustBtn(() => adj("ratePre", 0.1, 2, 15), true, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                    </div>
                  </div>

                  {/* 인출기 수익률 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">인출기수익률</span>
                      <span className={`font-mono font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#355c7d" }}>{inputs.ratePost.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("ratePost", -0.1, 1, 15), false, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                      {renderSlider(inputs.ratePost, 1, 15, 0.1, (val) => onInputChange({ ratePost: val }), "#355c7d")}
                      {renderMiniAdjustBtn(() => adj("ratePost", 0.1, 1, 15), true, "hover:bg-[#355c7d] hover:border-[#355c7d] hover:text-white")}
                    </div>
                  </div>
                </div>

                {/* 연 희망 입출액 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">희망수령 연액</span>
                    <span className={`font-mono font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#355c7d" }}>
                      {inputs.annualWithdrawal}만 <span className="text-[9px] font-bold text-slate-400">({fundResult.retirementBalance > 0 ? ((inputs.annualWithdrawal / fundResult.retirementBalance) * 100).toFixed(1) : 0}%)</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1">
                    {renderAdjustBtn(() => adj("annualWithdrawal", -100, 500, 6000), false)}
                    {renderSlider(inputs.annualWithdrawal, 500, 6000, 100, (val) => onInputChange({ annualWithdrawal: val }), "#355c7d")}
                    {renderAdjustBtn(() => adj("annualWithdrawal", 100, 500, 6000), true)}
                  </div>
                </div>

                {/* 세액공제 재투자 전략 */}
                <div className={`flex flex-col space-y-1 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">세액공제 재투자 전략</span>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
                    <button
                      type="button"
                      onClick={() => onInputChange({ reinvestTaxCredit: true })}
                      style={{
                        backgroundColor: inputs.reinvestTaxCredit ? "#355c7d" : "transparent",
                        color: inputs.reinvestTaxCredit ? "#ffffff" : undefined
                      }}
                      className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${
                        inputs.reinvestTaxCredit
                          ? "shadow-xs text-white"
                          : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() => onInputChange({ reinvestTaxCredit: false })}
                      style={{
                        backgroundColor: !inputs.reinvestTaxCredit ? "#355c7d" : "transparent",
                        color: !inputs.reinvestTaxCredit ? "#ffffff" : undefined
                      }}
                      className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${
                        !inputs.reinvestTaxCredit
                          ? "shadow-xs text-white"
                          : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      OFF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: 세제비적격 연금보험 */}
          <div className="flex flex-col">
            <div className="flex items-center h-8 mb-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                isDark ? "bg-rose-500/10 text-rose-455" : "bg-slate-100 text-slate-700"
              }`}>
                연금보험
              </span>
            </div>

            <div className={`p-4 rounded-xl border relative overflow-hidden flex-1 flex flex-col justify-between ${
              isDark ? "bg-[#f67280]/5 border-[#f67280]/30" : "bg-[#f67280]/5 border-[#f67280]/15"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: "#f67280" }}></div>
              <div className="space-y-4">
                {/* 공시이율 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold mb-0.5">
                    <span className="text-slate-400">공시이율</span>
                    <span className={`font-mono font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#f67280" }}>{inputs.rateInsurance.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1">
                    {renderAdjustBtn(() => adj("rateInsurance", -0.1, 1.0, 6.0), false)}
                    {renderSlider(inputs.rateInsurance, 1.0, 6.0, 0.1, (val) => onInputChange({ rateInsurance: val }), "#f67280")}
                    {renderAdjustBtn(() => adj("rateInsurance", 0.1, 1.0, 6.0), true)}
                  </div>
                </div>

                {/* 수령방법 */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-slate-400 block mb-1">수령 형태 선택</label>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
                    <button
                      type="button"
                      onClick={() => onInputChange({ payoutMethod: "fixed" })}
                      style={{
                        backgroundColor: inputs.payoutMethod === "fixed" ? "#f67280" : "transparent",
                        color: inputs.payoutMethod === "fixed" ? "#ffffff" : undefined
                      }}
                      className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${
                        inputs.payoutMethod === "fixed"
                          ? "shadow-xs text-white"
                          : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      확정형
                    </button>
                    <button
                      type="button"
                      onClick={() => onInputChange({ payoutMethod: "lifetime" })}
                      style={{
                        backgroundColor: inputs.payoutMethod === "lifetime" ? "#f67280" : "transparent",
                        color: inputs.payoutMethod === "lifetime" ? "#ffffff" : undefined
                      }}
                      className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${
                        inputs.payoutMethod === "lifetime"
                          ? "shadow-xs text-white"
                          : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      종신형
                    </button>
                  </div>
                </div>

                {inputs.payoutMethod === "fixed" ? (
                  /* 수령기간 (fixed) */
                  <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold mb-0.5">
                        <span className="text-slate-400">수령 연한</span>
                        <span className={`font-mono font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#f67280" }}>{inputs.fixedTerm}년</span>
                      </div>
                      <div className="flex items-center space-x-1.5 pt-1">
                        {renderAdjustBtn(() => adj("fixedTerm", -5, 5, 20), false)}
                        {renderSlider(inputs.fixedTerm, 5, 20, 5, (val) => onInputChange({ fixedTerm: val }), "#f67280")}
                        {renderAdjustBtn(() => adj("fixedTerm", 5, 5, 20), true)}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 종신형 선택시 표준 종신지급률, 유병자 효과 1x2 정렬 */
                  <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* 표준 종신지급률 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold mb-0.5">
                          <span className="text-slate-400 truncate">표준 수령률</span>
                          <span className={`font-mono text-[9.5px] font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#f67280" }}>{inputs.insuranceAnnuityRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("insuranceAnnuityRate", -0.1, 2.0, 7.0), false, "hover:bg-[#f67280] hover:border-[#f67280] hover:text-white")}
                          {renderSlider(inputs.insuranceAnnuityRate, 2.0, 7.0, 0.1, (val) => onInputChange({ insuranceAnnuityRate: val }), "#f67280")}
                          {renderMiniAdjustBtn(() => adj("insuranceAnnuityRate", 0.1, 2.0, 7.0), true, "hover:bg-[#f67280] hover:border-[#f67280] hover:text-white")}
                        </div>
                      </div>

                      {/* 유병자 효과 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold mb-0.5">
                          <span className="text-slate-400 truncate">유병자효율</span>
                          <span className={`font-mono text-[9.5px] font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#f67280" }}>{inputs.illHealthEffect.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("illHealthEffect", -5, 100, 200), false, "hover:bg-[#f67280] hover:border-[#f67280] hover:text-white")}
                          {renderSlider(inputs.illHealthEffect, 100, 200, 5, (val) => onInputChange({ illHealthEffect: val }), "#f67280")}
                          {renderMiniAdjustBtn(() => adj("illHealthEffect", 5, 100, 200), true, "hover:bg-[#f67280] hover:border-[#f67280] hover:text-white")}
                        </div>
                      </div>
                    </div>

                    {/* 최종 종신연금 비율 */}
                    <div className={`space-y-1 pt-1.5 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <span className="text-[10px] text-slate-400 font-bold">최종 종신연금 비율</span>
                      <span className={`font-mono text-[10px] font-black ${isDark ? "text-slate-200" : "text-slate-800"}`} style={{ color: "#f67280" }}>
                        {inputs.annuityPayoutRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 4: 하이브리드 */}
          <div className="flex flex-col">
            <div className="flex items-center h-8 mb-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                isDark ? "bg-[#6C5B7B]/20 text-[#ac9dbf]" : "bg-[#6C5B7B]/10 text-[#6C5B7B]"
              }`}>
                하이브리드
              </span>
            </div>

            <div className={`p-4 rounded-xl border relative overflow-hidden flex-1 flex flex-col justify-between ${
              isDark ? "bg-[#6C5B7B]/10 border-[#6C5B7B]/35" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#6C5B7B]"></div>
              <div className="space-y-4">
                {/* 적립기수익률/공시이율 가로 1x2 배열 */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 적립기 수익률 (펀드와 싱크) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">적립기수익률</span>
                      <span className={`font-mono font-black ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{inputs.ratePre.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("ratePre", -0.1, 2, 15), false, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                      {renderSlider(inputs.ratePre, 2, 15, 0.1, (val) => onInputChange({ ratePre: val }), isDark ? "#ac9dbf" : "#6C5B7B")}
                      {renderMiniAdjustBtn(() => adj("ratePre", 0.1, 2, 15), true, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                    </div>
                  </div>

                  {/* 공시이율 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">공시이율</span>
                      <span className={`font-mono font-black ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{inputs.rateInsurance}%</span>
                    </div>
                    <div className="flex items-center space-x-1 pt-1.5">
                      {renderMiniAdjustBtn(() => adj("rateInsurance", -0.1, 1.0, 6.0), false, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                      {renderSlider(inputs.rateInsurance, 1.0, 6.0, 0.1, (val) => onInputChange({ rateInsurance: val }), isDark ? "#ac9dbf" : "#6C5B7B")}
                      {renderMiniAdjustBtn(() => adj("rateInsurance", 0.1, 1.0, 6.0), true, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                    </div>
                  </div>
                </div>

                {/* 세제비적격 연금보험의 수령 형태 선택박스 높이를 맞추기 위한 투명 구조적 Spacer */}
                <div className="space-y-1 block select-none opacity-0 invisible pointer-events-none" aria-hidden="true">
                  <label className="text-[9.5px] font-bold text-slate-400 block mb-1">수령 형태 선택</label>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
                    <span className="py-1 text-[9.5px] font-bold">확정형</span>
                    <span className="py-1 text-[9.5px] font-bold">종신형</span>
                  </div>
                </div>

                {/* 종신형 매칭 요소를 담는 리스트 및 선언부 1x2 레이아웃 적용 */}
                <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* 표준 종신지급률 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold mb-0.5">
                        <span className="text-slate-400 truncate">표준 수령률</span>
                        <span className={`font-mono text-[9.5px] font-black ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{inputs.insuranceAnnuityRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-1 pt-1.5">
                        {renderMiniAdjustBtn(() => adj("insuranceAnnuityRate", -0.1, 2.0, 7.0), false, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                        {renderSlider(inputs.insuranceAnnuityRate, 2.0, 7.0, 0.1, (val) => onInputChange({ insuranceAnnuityRate: val }), isDark ? "#ac9dbf" : "#6C5B7B")}
                        {renderMiniAdjustBtn(() => adj("insuranceAnnuityRate", 0.1, 2.0, 7.0), true, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                      </div>
                    </div>

                    {/* 유병자 효과 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold mb-0.5">
                        <span className="text-slate-400 truncate">유병자효율</span>
                        <span className={`font-mono text-[9.5px] font-black ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{inputs.illHealthEffect.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-1 pt-1.5">
                        {renderMiniAdjustBtn(() => adj("illHealthEffect", -5, 100, 200), false, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                        {renderSlider(inputs.illHealthEffect, 100, 200, 5, (val) => onInputChange({ illHealthEffect: val }), isDark ? "#ac9dbf" : "#6C5B7B")}
                        {renderMiniAdjustBtn(() => adj("illHealthEffect", 5, 100, 200), true, "hover:bg-[#6C5B7B] hover:border-[#6C5B7B] hover:text-white")}
                      </div>
                    </div>
                  </div>

                  {/* 최종 종신연금 비율 */}
                  <div className={`space-y-1 pt-1.5 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                    <span className="text-[10px] text-slate-400 font-bold">최종 종신연금 비율</span>
                    <span className={`font-mono text-[10px] font-black ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                      {inputs.annuityPayoutRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. RESULTS COMPARISON GRID */}
      <div className="flex justify-between items-center pb-2 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
        <h4 className={`text-xs font-black tracking-tight uppercase ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
          실시간 상품 시뮬레이션 비교
        </h4>
        <div className="flex items-center space-x-2.5">
          <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            하이브리드 상품 포함
          </span>
          <button
            onClick={() => setShowHybrid(!showHybrid)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showHybrid 
                ? "bg-[#6C5B7B]" 
                : (isDark ? "bg-slate-800" : "bg-slate-200")
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                showHybrid ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <ComparisonCards
        fundResult={fundResult}
        nonTaxableResult={nonTaxableResult}
        hybridResult={hybridResult}
        inputs={inputs}
        theme={theme}
        showHybrid={showHybrid}
      />
      {false && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* COLUMN 1: 연금저축펀드 */}
        <div className={`border rounded-2xl p-5 shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] overflow-hidden ${
          isDark 
            ? "bg-indigo-950/20 border-indigo-900/40 hover:border-indigo-500/30" 
            : "bg-indigo-50/20 border-indigo-150 shadow-xs hover:shadow-sm"
        }`}>
          <div className="absolute top-0 left-0 w-full h-[6px] bg-indigo-500"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 mt-1">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-500 tracking-wider bg-indigo-500/5`}>
                대표 투자전략
              </span>
              <span className="text-[10px] font-bold text-slate-500">연금저축펀드</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              연금저축펀드
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              적립기·인출기 ETF 복리 운용 방식
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-indigo-100/5 dark:bg-indigo-950/15 border border-indigo-500/10 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  개시 시점 예상 적립금
                </span>
                <span className="text-xl font-black text-indigo-650 dark:text-indigo-400 block tracking-tight font-mono">
                  {yLabel(fundResult.retirementBalance)}
                </span>
              </div>

              {/* 세부사항 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-450">가입 원금합계</span>
                  <span className="font-mono font-bold">{yLabel(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">세액공제 재투자액</span>
                  <span className="font-mono font-bold text-indigo-620 dark:text-indigo-400">
                    {inputs.reinvestTaxCredit ? yLabel(fundResult.cumulativeRefundTotal) : "전략 OFF [0원]"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">순수 적립 투자수익</span>
                  <span className="font-mono font-bold text-emerald-580 dark:text-emerald-400">
                    {yLabel(Math.max(0, fundResult.retirementBalance - totalPrincipal - (inputs.reinvestTaxCredit ? fundResult.cumulativeRefundTotal : 0)))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-800/10 dark:border-slate-850">
                  <span className="text-slate-450">누적 세액환급금 (연말정산)</span>
                  <span className="font-mono font-bold text-indigo-620 dark:text-indigo-400">{yLabel(fundResult.cumulativeRefundTotal)}</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                인출 연금연액 및 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-100/40 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-455 block">희망 세전 연액</span>
                    <strong className="text-[13px] tracking-tight">{yLabel(inputs.annualWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-indigo-50/10 border-indigo-150"}`}>
                    <span className={`text-[9.5px] font-bold block ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>예상 세후 연 수령</span>
                    <strong className={`text-[13px] tracking-tight ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{yLabel(fundResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-455">월 수령환산 평준액</span>
                  <span className={`font-bold font-mono ${isDark ? "text-indigo-400" : "text-indigo-655"}`}>{(fundResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">연금 보장 형태</span>
                  <span className="font-bold font-mono text-slate-500">
                    확정수령형 (잔고고갈시 종결)
                  </span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-455">납입 시 세금혜택</span>
                <span className={`font-semibold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>연 최대 148.5만원 환급</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">수령 목적 연금소득세</span>
                <span className="font-bold text-slate-500">3.3% ~ 5.5% 차등 세율</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">연 예상 평균 소득세제</span>
                <span className={`font-mono font-bold ${isDark ? "text-red-450" : "text-red-650"}`}>
                  {yLabel(Math.max(0, fundResult.preTaxWithdrawal - fundResult.afterTaxWithdrawal))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: 세제비적격 연금보험 */}
        <div className={`border rounded-2xl p-5 shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] overflow-hidden ${
          isDark 
            ? "bg-rose-950/15 border-rose-900/40 hover:border-rose-455/30" 
            : "bg-rose-50/20 border-rose-150 shadow-xs hover:shadow-sm"
        }`}>
          <div className="absolute top-0 left-0 w-full h-[6px] bg-rose-500"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 mt-1">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-rose-500/20 ${
                isDark ? "text-rose-400 bg-rose-500/5" : "text-rose-700 bg-rose-50"
              } tracking-wider`}>
                과세 제외특약
              </span>
              <span className="text-[10px] font-bold text-slate-500">세제비적격 연금보험</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              세제비적격 연금보험
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              납입 시 환급금 희생형 · 전액 비과세
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-rose-100/5 dark:bg-rose-950/15 border border-rose-500/10 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  개시 시점 예상 적립금
                </span>
                <span className="text-xl font-black text-rose-500 dark:text-rose-450 block tracking-tight font-mono">
                  {yLabel(nonTaxableResult.retirementBalance)}
                </span>
              </div>

              {/* 세부사항 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-455">가입 원금합계</span>
                  <span className="font-mono font-bold">{yLabel(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">세액공제 재투자액</span>
                  <span className="font-mono font-bold text-rose-500 dark:text-rose-455">비적격: 대상 없음 [0원]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">공시이율 적립수익</span>
                  <span className="font-mono font-bold text-emerald-580 dark:text-emerald-400">
                    {yLabel(Math.max(0, nonTaxableResult.retirementBalance - totalPrincipal))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-800/10 dark:border-slate-850">
                  <span className="text-slate-455">누적 세환급 총액</span>
                  <span className="font-mono font-bold text-rose-500 dark:text-rose-455">0원 (공제희생됨)</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                인출 연금연액 및 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-100/40 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-455 block">인출 산출 연액 (세전)</span>
                    <strong className="text-[13px] tracking-tight">{yLabel(nonTaxableResult.preTaxWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-rose-50/15 border-rose-200"}`}>
                    <span className="text-[9.5px] text-rose-500 font-bold block">산출 연 실수령 (세후)</span>
                    <strong className="text-[13px] text-rose-500 tracking-tight">{yLabel(nonTaxableResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-455">월 수령환산 평준액</span>
                  <span className="font-bold text-rose-500 dark:text-rose-455 font-mono">{(nonTaxableResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">연금 보장 형태</span>
                  <span className="font-bold font-mono text-slate-500">
                    {inputs.payoutMethod === "lifetime" ? "종신연금 (평생)" : `지정확정 (${inputs.fixedTerm}년)`}
                  </span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-rose-400" : "text-rose-600"}`}>
                절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-450">납입 시 세금혜택</span>
                <span className="font-bold text-slate-450">공제 혜택 없음</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">수령 목적 연금소득세</span>
                <span className="font-extrabold text-emerald-580">0.0% 비과세 면제 특약</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">연 예상 평균 소득세제</span>
                <span className="font-mono font-semibold text-emerald-580">전액 비과세 [0원]</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: 하이브리드 전략 */}
        <div className={`border rounded-2xl p-5 shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] overflow-hidden ${
          isDark 
            ? "bg-[#6C5B7B]/10 border-[#6C5B7B]/35 hover:border-[#6C5B7B]/55" 
            : "bg-slate-50 border-slate-200 shadow-xs hover:shadow-sm"
        }`}>
          <div className="absolute top-0 left-0 w-full h-[6px] bg-[#6C5B7B]"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 mt-1">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-[#6C5B7B]/25 ${
                isDark ? "text-[#ac9dbf] bg-[#6C5B7B]/15" : "text-[#6C5B7B] border-[#6C5B7B]/25 bg-[#6C5B7B]/10"
              } tracking-wider`}>
                가장 추천하는 혼합형
              </span>
              <span className="text-[10px] font-bold text-slate-500">하이브리드 연금전환</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              하이브리드 전환형
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              적립기 펀드(ETF) 극대화 + 종신연금 평생 보증
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-slate-100/40 dark:bg-[#6C5B7B]/5 border border-slate-200 dark:border-[#6C5B7B]/20 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  개시 시점 예상 적립금
                </span>
                <span className={`text-xl font-black block tracking-tight font-mono ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                  {yLabel(hybridResult.retirementBalance)}
                </span>
              </div>

              {/* 세부사항 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-455">가입 원금합계</span>
                  <span className="font-mono font-bold">{yLabel(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">세액공제 재투자액</span>
                  <span className={`font-mono font-bold ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                    {inputs.reinvestTaxCredit ? yLabel(hybridResult.cumulativeRefundTotal) : "전략 OFF [0원]"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">순수 적립 투자수익</span>
                  <span className="font-mono font-bold text-emerald-580 dark:text-emerald-400">
                    {yLabel(Math.max(0, hybridResult.retirementBalance - totalPrincipal - (inputs.reinvestTaxCredit ? hybridResult.cumulativeRefundTotal : 0)))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-800/10 dark:border-slate-850">
                  <span className="text-slate-455">누적 세환급 총액 (연말정산)</span>
                  <span className={`font-mono font-bold ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{yLabel(hybridResult.cumulativeRefundTotal)}</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                인출 연금연액 및 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-100/40 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-455 block">인출 대상액 (세전)</span>
                    <strong className={`text-[13px] tracking-tight ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{yLabel(hybridResult.preTaxWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-[#6C5B7B]/10 border-[#6C5B7B]/30"}`}>
                    <span className={`text-[9.5px] font-bold block ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>보장 연 실수령 (세후)</span>
                    <strong className={`text-[13px] tracking-tight ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{yLabel(hybridResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-455">월 수령환산 평준액</span>
                  <span className={`font-bold font-mono ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>{(hybridResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">종신 연금 보장 여부</span>
                  <span className="font-black font-mono text-emerald-580 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/25">
                    평생 무고갈 수령 보장
                  </span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-450">납입 시 세금혜택</span>
                <span className={`font-semibold ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>연 최대 148.5만원 환급</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">종신 연소득세 특약</span>
                <span className="font-bold text-amber-500">지정 완화 3.3% 저율 고정</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">연 세금차감 평준액</span>
                <span className={`font-mono font-bold ${isDark ? "text-[#ac9dbf]" : "text-[#6C5B7B]"}`}>
                  {yLabel(Math.max(0, hybridResult.preTaxWithdrawal - hybridResult.afterTaxWithdrawal))}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* FOOTER ALERT TIP REMOVED */}
    </div>
  );
}

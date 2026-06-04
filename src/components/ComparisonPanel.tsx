import React, { useMemo, useState } from "react";
import { SimulationInputs } from "../types";
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
  theme = "dark" 
}: ComparisonPanelProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
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
          ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white"
          : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white shadow-3xs"
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
          : "bg-white border-slate-250 shadow-xs"
      }`}>
        <div className="flex items-center space-x-2 border-b pb-3 mb-5 border-dashed"
             style={{ borderColor: isDark ? "rgba(71, 85, 105, 0.4)" : "rgba(226, 232, 240, 1)" }}>
          <Sparkles className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          <h3 className={`text-sm font-black tracking-tight uppercase ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            시뮬레이션 가입 조건 통합 설정 콘솔
          </h3>
        </div>

        {/* Outer Grid split: Common vs Product Specific */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          
          {/* LEFT: 공통 가입 조건 */}
          <div className="flex-1 lg:flex-[1_2.5_0%] lg:min-w-[280px] lg:max-w-[325px] flex flex-col">
            <div className="flex items-center h-8 mb-2">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isDark ? "bg-[#696FC7]/15 text-[#A7AAE1]" : "bg-indigo-50 text-indigo-700"
              }`}>
                공통 가입 조건
              </span>
            </div>

            <div className={`p-4 rounded-xl border flex-1 flex flex-col justify-between ${
               isDark ? "bg-slate-950/45 border-slate-800/80" : "bg-slate-50 border-slate-200"
            }`} style={{ minHeight: "330px" }}>
              <div className="space-y-4">
                {/* 월 납입액 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 text-[9.5px]">
                      <Coins className="w-3.5 h-3.5 mr-1 text-indigo-400 shrink-0" />
                      월 납입액
                      <button type="button" onClick={(e) => showHelp(e, "monthlyDeposit")} className="text-slate-500 hover:text-indigo-400 ml-1">
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
                    {renderSlider(inputs.monthlyDeposit, 10, 200, 5, (val) => onInputChange({ monthlyDeposit: val }), "#6366f1")}
                    {renderAdjustBtn(() => adj("monthlyDeposit", 5, 10, 200), true)}
                  </div>
                </div>

                {/* 시작 나이 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 truncate text-[9.5px]">
                      <User className="w-3.5 h-3.5 mr-1 text-indigo-400 shrink-0" />
                      시작 나이
                    </span>
                    <span className={`font-mono font-black text-[10.5px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {inputs.startAge}세
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {renderAdjustBtn(() => adj("startAge", -1, 25, 50), false)}
                    {renderSlider(inputs.startAge, 25, 50, 1, (val) => onInputChange({ startAge: val }), "#6366f1")}
                    {renderAdjustBtn(() => adj("startAge", 1, 25, 50), true)}
                  </div>
                </div>

                {/* 개시 나이 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 truncate text-[9.5px]">
                      <Hourglass className="w-3.5 h-3.5 mr-1 text-indigo-400 shrink-0" />
                      개시 나이
                    </span>
                    <span className={`font-mono font-black text-[10.5px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {inputs.endAge}세
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {renderAdjustBtn(() => adj("endAge", -1, 55, 70), false)}
                    {renderSlider(inputs.endAge, 55, 70, 1, (val) => onInputChange({ endAge: val }), "#6366f1")}
                    {renderAdjustBtn(() => adj("endAge", 1, 55, 70), true)}
                  </div>
                </div>

                {/* 납입 기간 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 truncate text-[9.5px]">
                      <Hourglass className="w-3.5 h-3.5 mr-1 text-indigo-400 shrink-0" />
                      납입 기간
                    </span>
                    <span className={`font-mono text-[10.5px] text-slate-400 font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {inputs.depositYears}년 <span className="text-[9px] text-slate-400 font-bold ml-1">({inputs.startAge + inputs.depositYears}세 완납)</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {renderAdjustBtn(() => adj("depositYears", -1, 1, inputs.endAge - inputs.startAge), false)}
                    {renderSlider(inputs.depositYears, 1, Math.max(1, inputs.endAge - inputs.startAge), 1, (val) => onInputChange({ depositYears: val }), "#6366f1")}
                    {renderAdjustBtn(() => adj("depositYears", 1, 1, inputs.endAge - inputs.startAge), true)}
                  </div>
                </div>

                {/* 소득형태별 공제율 */}
                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center text-slate-450 truncate text-[9.5px]">
                      <Percent className="w-3.5 h-3.5 mr-1 text-indigo-400 shrink-0" />
                      소득형태별 공제율
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg border ${isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
                    <button type="button" onClick={() => onInputChange({ taxCreditRate: 13.2 })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.taxCreditRate === 13.2 ? "bg-indigo-600 text-white shadow-xs" : "text-slate-450 hover:text-indigo-400"}`}>13.2%</button>
                    <button type="button" onClick={() => onInputChange({ taxCreditRate: 16.5 })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.taxCreditRate === 16.5 ? "bg-indigo-600 text-white shadow-xs" : "text-slate-450 hover:text-indigo-400"}`}>16.5%</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: 상품별 개별 조건 */}
          <div className="lg:flex-[4_1_0%] lg:min-w-[700px] flex flex-col">
            <div className="flex items-center h-8 mb-2">
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block ${
                isDark ? "bg-[#A7AAE1]/15 text-[#A7AAE1]" : "bg-slate-150 text-slate-700"
              }`}>
                시뮬레이션 개별 설정
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1 select-none">
              
              {/* Product 1: 연금저축펀드 */}
              <div className={`p-3.5 rounded-xl border relative overflow-hidden flex flex-col justify-between md:min-w-[225px] ${
                isDark ? "bg-[#696FC7]/5 border-[#696FC7]/30" : "bg-indigo-50/30 border-indigo-150"
              }`}>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500"></div>
                <div>
                  <h4 className="text-[11px] font-black text-indigo-500 mb-2.5 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></span>
                    연금저축펀드
                  </h4>
                  <div className="space-y-4">
                    {/* 적립기/인출기 수익률 가로 1x2 배열 */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* 적립기 수익률 */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">적립기수익률</span>
                          <span className="font-mono text-indigo-505 font-black">{inputs.ratePre.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("ratePre", -0.1, 2, 15), false, "hover:bg-indigo-650 hover:border-indigo-650 hover:text-white")}
                          {renderSlider(inputs.ratePre, 2, 15, 0.1, (val) => onInputChange({ ratePre: val }), "#6366f1")}
                          {renderMiniAdjustBtn(() => adj("ratePre", 0.1, 2, 15), true, "hover:bg-indigo-650 hover:border-indigo-650 hover:text-white")}
                        </div>
                      </div>

                      {/* 인출기 수익률 */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">인출기수익률</span>
                          <span className="font-mono text-indigo-505 font-black">{inputs.ratePost.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("ratePost", -0.1, 1, 15), false, "hover:bg-indigo-650 hover:border-indigo-650 hover:text-white")}
                          {renderSlider(inputs.ratePost, 1, 15, 0.1, (val) => onInputChange({ ratePost: val }), "#6366f1")}
                          {renderMiniAdjustBtn(() => adj("ratePost", 0.1, 1, 15), true, "hover:bg-indigo-650 hover:border-indigo-650 hover:text-white")}
                        </div>
                      </div>
                    </div>

                    {/* 연 희망 입출액 */}
                    <div className="h-[45px] flex flex-col justify-between">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400">희망수령 연액</span>
                        <span className="font-mono text-indigo-505 font-black">
                          {inputs.annualWithdrawal}만 <span className="text-[9px] font-bold text-indigo-400">({fundResult.retirementBalance > 0 ? ((inputs.annualWithdrawal / fundResult.retirementBalance) * 100).toFixed(1) : 0}%)</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {renderAdjustBtn(() => adj("annualWithdrawal", -100, 500, 6000), false)}
                        {renderSlider(inputs.annualWithdrawal, 500, 6000, 100, (val) => onInputChange({ annualWithdrawal: val }), "#6366f1")}
                        {renderAdjustBtn(() => adj("annualWithdrawal", 100, 500, 6000), true)}
                      </div>
                    </div>

                    {/* 세액공제 재투자 전략 */}
                    <div className={`flex flex-col space-y-1 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">세액공제 재투자 전략</span>
                      <div className={`grid grid-cols-2 gap-1 p-0.5 bg-slate-950/20 rounded-md border text-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <button
                          type="button"
                          onClick={() => onInputChange({ reinvestTaxCredit: true })}
                          className={`py-1 text-[9.5px] font-black rounded cursor-pointer transition-all ${
                            inputs.reinvestTaxCredit
                              ? "bg-indigo-650 text-white shadow-xs"
                              : "text-slate-500 hover:text-indigo-400"
                          }`}
                        >
                          ON
                        </button>
                        <button
                          type="button"
                          onClick={() => onInputChange({ reinvestTaxCredit: false })}
                          className={`py-1 text-[9.5px] font-black rounded cursor-pointer transition-all ${
                            !inputs.reinvestTaxCredit
                              ? "bg-indigo-650 text-white shadow-xs"
                              : "text-slate-500 hover:text-indigo-400"
                          }`}
                        >
                          OFF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 2: 세제비적격 연금보험 */}
              <div className={`p-3.5 rounded-xl border relative overflow-hidden flex flex-col justify-between md:min-w-[225px] ${
                isDark ? "bg-[#F2AEBB]/5 border-[#F2AEBB]/30" : "bg-rose-50/30 border-rose-150"
              }`}>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-400"></div>
                <div>
                  <h4 className="text-[11px] font-black text-rose-455 mb-2.5 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1"></span>
                    세제비적격 연금보험
                  </h4>
                  <div className="space-y-4">
                    {/* 공시이율 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold mb-0.5">
                        <span className="text-slate-400">공시이율</span>
                        <span className="font-mono text-rose-455 font-black">{inputs.rateInsurance}%</span>
                      </div>
                      <div className="flex items-center space-x-1.5 pt-1.5">
                        {renderAdjustBtn(() => adj("rateInsurance", -0.1, 1.0, 6.0), false)}
                        {renderSlider(inputs.rateInsurance, 1.0, 6.0, 0.1, (val) => onInputChange({ rateInsurance: val }), "#f43f5e")}
                        {renderAdjustBtn(() => adj("rateInsurance", 0.1, 1.0, 6.0), true)}
                      </div>
                    </div>

                    {/* 수령방법 */}
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-slate-400 block mb-1">수령 형태 선택</label>
                      <div className={`grid grid-cols-2 p-0.5 bg-slate-950/20 rounded-md border text-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <button type="button" onClick={() => onInputChange({ payoutMethod: "fixed" })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.payoutMethod === "fixed" ? "bg-rose-400 text-slate-950 font-black shadow-sm" : "text-slate-500 hover:text-rose-400"}`}>확정형</button>
                        <button type="button" onClick={() => onInputChange({ payoutMethod: "lifetime" })} className={`py-1 text-[9.5px] font-bold rounded cursor-pointer transition-all ${inputs.payoutMethod === "lifetime" ? "bg-rose-400 text-slate-950 font-black shadow-sm" : "text-slate-500 hover:text-rose-400"}`}>종신형</button>
                      </div>
                    </div>

                    {inputs.payoutMethod === "fixed" ? (
                      /* 수령기간 (fixed) */
                      <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold mb-0.5">
                            <span className="text-slate-400">수령 연한</span>
                            <span className="font-mono text-rose-455 font-black">{inputs.fixedTerm}년</span>
                          </div>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            {renderAdjustBtn(() => adj("fixedTerm", -5, 5, 20), false)}
                            {renderSlider(inputs.fixedTerm, 5, 20, 5, (val) => onInputChange({ fixedTerm: val }), "#f43f5e")}
                            {renderAdjustBtn(() => adj("fixedTerm", 5, 5, 20), true)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 종신형 선택시 표준 종신지급률, 유병자 효과, 최종 종신연금 비율 다 노출 */
                      <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        {/* 표준 종신지급률 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold mb-0.5">
                            <span className="text-slate-400">표준 종신지급률</span>
                            <span className="font-mono text-rose-455 font-black">{inputs.insuranceAnnuityRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            {renderAdjustBtn(() => adj("insuranceAnnuityRate", -0.1, 2.0, 7.0), false)}
                            {renderSlider(inputs.insuranceAnnuityRate, 2.0, 7.0, 0.1, (val) => onInputChange({ insuranceAnnuityRate: val }), "#f43f5e")}
                            {renderAdjustBtn(() => adj("insuranceAnnuityRate", 0.1, 2.0, 7.0), true)}
                          </div>
                        </div>

                        {/* 유병자 효과 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold mb-0.5">
                            <span className="text-slate-400">유병자 효과</span>
                            <span className="font-mono text-rose-455 font-black">{inputs.illHealthEffect}%</span>
                          </div>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            {renderAdjustBtn(() => adj("illHealthEffect", -5, 100, 150), false)}
                            {renderSlider(inputs.illHealthEffect, 100, 150, 5, (val) => onInputChange({ illHealthEffect: val }), "#f43f5e")}
                            {renderAdjustBtn(() => adj("illHealthEffect", 5, 100, 150), true)}
                          </div>
                        </div>

                        {/* 최종 종신연금 비율 */}
                        <div className={`space-y-1 pt-1.5 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          <span className="text-[10px] text-slate-400 font-bold">최종 종신연금 비율</span>
                          <span className="font-mono text-[10px] text-rose-455 font-black">
                            {inputs.annuityPayoutRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product 3: 하이브리드 */}
              <div className={`p-3.5 rounded-xl border relative overflow-hidden flex flex-col justify-between md:min-w-[225px] ${
                isDark ? "bg-[#A7AAE1]/5 border-[#A7AAE1]/30" : "bg-purple-50/30 border-purple-150"
              }`}>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#A7AAE1]"></div>
                <div>
                  <h4 className="text-[11px] font-black text-[#A7AAE1] mb-2.5 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A7AAE1] mr-1"></span>
                    하이브리드
                  </h4>
                  <div className="space-y-4">
                    {/* 적립기수익률/공시이율 가로 1x2 배열 */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* 적립기 수익률 (펀드와 싱크) */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">적립기수익률</span>
                          <span className="font-mono text-[#A7AAE1] font-black">{inputs.ratePre.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("ratePre", -0.1, 2, 15), false, "hover:bg-[#A7AAE1] hover:border-[#A7AAE1] hover:text-slate-950")}
                          {renderSlider(inputs.ratePre, 2, 15, 0.1, (val) => onInputChange({ ratePre: val }), "#A7AAE1")}
                          {renderMiniAdjustBtn(() => adj("ratePre", 0.1, 2, 15), true, "hover:bg-[#A7AAE1] hover:border-[#A7AAE1] hover:text-slate-950")}
                        </div>
                      </div>

                      {/* 공시이율 */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400">공시이율</span>
                          <span className="font-mono text-[#A7AAE1] font-black">{inputs.rateInsurance}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderMiniAdjustBtn(() => adj("rateInsurance", -0.1, 1.0, 6.0), false, "hover:bg-[#A7AAE1] hover:border-[#A7AAE1] hover:text-slate-950")}
                          {renderSlider(inputs.rateInsurance, 1.0, 6.0, 0.1, (val) => onInputChange({ rateInsurance: val }), "#A7AAE1")}
                          {renderMiniAdjustBtn(() => adj("rateInsurance", 0.1, 1.0, 6.0), true, "hover:bg-[#A7AAE1] hover:border-[#A7AAE1] hover:text-slate-950")}
                        </div>
                      </div>
                    </div>

                    {/* 세제비적격 연금보험의 수령 형태 선택박스 높이를 맞추기 위한 투명 구조적 Spacer */}
                    <div className="space-y-1 block select-none opacity-0 invisible pointer-events-none" aria-hidden="true">
                      <label className="text-[9.5px] font-bold text-slate-400 block mb-1">수령 형태 선택</label>
                      <div className={`grid grid-cols-2 p-0.5 bg-slate-950/20 rounded-md border text-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className="py-1 text-[9.5px] font-bold">확정형</span>
                        <span className="py-1 text-[9.5px] font-bold">종신형</span>
                      </div>
                    </div>

                    {/* 종신형 매칭 요소를 담는 리스트 및 선언부 */}
                    <div className={`space-y-4 pt-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      {/* 표준 종신지급률 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                          <span className="text-slate-400">표준 종신지급률</span>
                          <span className="font-mono text-[#A7AAE1] font-black">{inputs.insuranceAnnuityRate}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderAdjustBtn(() => adj("insuranceAnnuityRate", -0.1, 2.0, 7.0), false)}
                          {renderSlider(inputs.insuranceAnnuityRate, 2.0, 7.0, 0.1, (val) => onInputChange({ insuranceAnnuityRate: val }), "#A7AAE1")}
                          {renderAdjustBtn(() => adj("insuranceAnnuityRate", 0.1, 2.0, 7.0), true)}
                        </div>
                      </div>

                      {/* 유병자 효과 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                          <span className="text-slate-400 font-sans">유병자 효과</span>
                          <span className="font-mono text-[#A7AAE1] font-black">{inputs.illHealthEffect}%</span>
                        </div>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          {renderAdjustBtn(() => adj("illHealthEffect", -5, 100, 150), false)}
                          {renderSlider(inputs.illHealthEffect, 100, 150, 5, (val) => onInputChange({ illHealthEffect: val }), "#A7AAE1")}
                          {renderAdjustBtn(() => adj("illHealthEffect", 5, 100, 150), true)}
                        </div>
                      </div>

                      {/* 최종 종신연금 비율 */}
                      <div className={`space-y-1 pt-1.5 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className="text-[10px] text-slate-400 font-bold font-sans">최종 종신연금 비율</span>
                        <span className="font-mono text-[10px] text-[#A7AAE1] font-black">
                          {inputs.annuityPayoutRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. COMMON CONDITIONS OVERVIEW SUMMARY BANNER */}
      <div className={`p-4 rounded-xl border flex items-center space-x-3.5 relative overflow-hidden ${
        isDark 
          ? "bg-gradient-to-r from-slate-950/80 to-slate-900 border-slate-805" 
          : "bg-gradient-to-r from-indigo-50/20 to-white border-slate-200"
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
        <div className={`p-2 rounded-lg ${isDark ? "bg-indigo-950/60" : "bg-indigo-50"}`}>
          <Info className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
        <div className="text-xs leading-relaxed max-w-4xl">
          <span className="font-bold block text-sm mb-0.5">💡 시뮬레이션 기반 공통 저축 정보 요약</span>
          <span className={isDark ? "text-slate-400 font-medium" : "text-slate-600"}>
            귀하는 <strong className="text-indigo-505">{inputs.startAge}세</strong>부터 <strong className="text-indigo-505">{inputs.endAge}세</strong>까지 총 <strong className="text-indigo-505">{inputs.depositYears}개년</strong> 동안
            매월 <strong className="text-indigo-550">{inputs.monthlyDeposit}만원</strong>씩 가입 납입합니다.
            납입 원금 총액은 <strong className={`font-mono text-${isDark ? "white" : "indigo-950"}`}>{yLabel(totalPrincipal)}</strong>이며, 개시 나이 시점에 생성된 노후 자산을 운용하여 연금을 수취합니다.
          </span>
        </div>
      </div>

      {/* 3. THREE-WAY SIDE-BY-SIDE ANALYTICS CARDS (핵심 비교화면) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* COLUMN 1: 연금저축펀드 */}
        <div className={`border rounded-2xl p-5 shadow-xl transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] ${
          isDark 
            ? "bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800/80 hover:border-indigo-500/30" 
            : "bg-white border-slate-205 shadow-sm hover:shadow-md"
        }`}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-650"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-indigo-520/20 text-indigo-450 tracking-wider bg-indigo-500/5`}>
                대표 투자전략
              </span>
              <span className="text-[10px] font-bold text-slate-500">연금저축펀드</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              📈 연금저축펀드 (ETF)
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              적립기·인출기 ETF 복리 운용 방식
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-indigo-100/5 dark:bg-indigo-950/15 border border-indigo-500/10 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  💡 개시 시점 예상 적립금
                </span>
                <span className="text-xl font-black text-indigo-505 block tracking-tight font-mono">
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
                  <span className="text-slate-450">세액공제 재투자액</span>
                  <span className="font-mono font-bold text-indigo-505">
                    {inputs.reinvestTaxCredit ? yLabel(fundResult.cumulativeRefundTotal) : "전략 OFF [0원]"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">순수 적립 투자수익</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {yLabel(Math.max(0, fundResult.retirementBalance - totalPrincipal - (inputs.reinvestTaxCredit ? fundResult.cumulativeRefundTotal : 0)))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-850">
                  <span className="text-slate-450">누적 세액환급금(재투자 무관)</span>
                  <span className="font-mono font-bold">{yLabel(fundResult.cumulativeRefundTotal)}</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-wider mb-2">
                💵 인출 연금연액 &amp; 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-450 block">희망 세전 연액</span>
                    <strong className="text-[13px] tracking-tight">{yLabel(inputs.annualWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-indigo-50/30 border-indigo-150"}`}>
                    <span className="text-[9.5px] text-indigo-400 font-bold block">예상 세후 연 수령</span>
                    <strong className="text-[13px] text-indigo-505 tracking-tight">{yLabel(fundResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">월 수령환산 평준액</span>
                  <span className="font-bold text-indigo-480 font-mono">{(fundResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">자산 소진나이</span>
                  {fundResult.depleteAge ? (
                    <span className="font-black font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                      {fundResult.depleteAge}세 소진 (재고갈)
                    </span>
                  ) : (
                    <span className="font-black font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      100세 이상 안심 지속
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className="text-[11px] font-black text-[#A7AAE1] uppercase tracking-wider mb-2">
                🛡️ 절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-450">납입 시 세금혜택</span>
                <span className="font-bold text-indigo-400">연 최대 148.5만원 환급</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">연금소득세 비율 ({inputs.endAge}세)</span>
                <span className="font-bold text-rose-400">{getPensionTaxRate(inputs.endAge)}% 적용</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">연금소득세액 (연 기준)</span>
                <span className="font-mono font-bold text-rose-450">
                  {yLabel(Math.max(0, fundResult.preTaxWithdrawal - fundResult.afterTaxWithdrawal))}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-3 rounded-lg text-[10.5px] leading-relaxed select-none ${
            isDark ? "bg-slate-950/60 border border-slate-850 text-slate-400" : "bg-slate-50 border border-slate-200 text-slate-600"
          }`}>
            🚨 <strong className="text-amber-500">투자자 책임형:</strong> 높은 연평균 ETF 복리 수익으로 노후 자산이 크게 증대하는 반면, 수익률 부진 시 소진이 조기화될 수 있어 연간 인출금 통제가 중요합니다.
          </div>
        </div>

        {/* COLUMN 2: 세제비적격 연금보험 */}
        <div className={`border rounded-2xl p-5 shadow-xl transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] ${
          isDark 
            ? "bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800/80 hover:border-rose-400/30" 
            : "bg-white border-slate-205 shadow-sm hover:shadow-md"
        }`}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-400"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-rose-350/20 text-rose-400 tracking-wider bg-rose-500/5`}>
                과세 제외특약
              </span>
              <span className="text-[10px] font-bold text-slate-500">세제비적격 연금보험</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              🛡️ 세제비적격 연금보험
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              납입 시 환급금 희생형 · 전액 비과세
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-rose-100/5 dark:bg-rose-950/15 border border-rose-500/10 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  💡 개시 시점 예상 적립금
                </span>
                <span className="text-xl font-black text-rose-400 block tracking-tight font-mono">
                  {yLabel(nonTaxableResult.retirementBalance)}
                </span>
              </div>

              {/* 세부사항 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-450">가입 원금합계</span>
                  <span className="font-mono font-bold">{yLabel(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">세액공제 재투자액</span>
                  <span className="font-mono font-bold text-rose-400">비적격: 대상 없음 [0원]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">공시이율 적립수익</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {yLabel(Math.max(0, nonTaxableResult.retirementBalance - totalPrincipal))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-850">
                  <span className="text-slate-450">누적 세환급 총액</span>
                  <span className="font-mono font-bold text-rose-450">0원 (공제희생됨)</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className="text-[11px] font-black text-rose-400 uppercase tracking-wider mb-2">
                💵 인출 연금연액 &amp; 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-450 block">인출 산출 연액 (세전)</span>
                    <strong className="text-[13px] tracking-tight">{yLabel(nonTaxableResult.preTaxWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-rose-955/15 border-rose-350"}`}>
                    <span className="text-[9.5px] text-rose-400 font-bold block">산출 연 실수령 (세후)</span>
                    <strong className="text-[13px] text-rose-500 tracking-tight">{yLabel(nonTaxableResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">월 수령환산 평준액</span>
                  <span className="font-bold text-rose-450 font-mono">{(nonTaxableResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">연금 보장 형태</span>
                  <span className="font-bold font-mono">
                    {inputs.payoutMethod === "lifetime" ? "종신연금 (평생)" : `지정확정 (${inputs.fixedTerm}년)`}
                  </span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className="text-[11px] font-black text-rose-400 uppercase tracking-wider mb-2">
                🛡️ 절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-450">납입 시 세금혜택</span>
                <span className="font-semibold text-rose-400">없음 (소득 공제 미적용)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">수령 시 소득세</span>
                <span className="font-bold text-emerald-400">전액 비과세 (0원 소득세)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">절세 효과 금액</span>
                <span className="font-bold text-emerald-400">지급금 전액 15.4% 등 세액 100% 면제</span>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-3 rounded-lg text-[10.5px] leading-relaxed select-none ${
            isDark ? "bg-slate-950/60 border border-slate-850 text-slate-400" : "bg-slate-50 border border-slate-200 text-slate-600"
          }`}>
            🚨 <strong className="text-rose-400">공제 소외형:</strong> 납입할 때 연도별 연말세액환급은 일절 발생하지 않으나, 10년 이상 계좌 관리 충족 시 연금을 언제, 어떻게 수령하든 종합소득세 및 건강보험료에 전혀 합산 연동되지 않는 강력한 절세 안심이 장점입니다.
          </div>
        </div>

        {/* COLUMN 3: 하이브리드 전략 */}
        <div className={`border rounded-2xl p-5 shadow-xl transition-all duration-300 relative flex flex-col justify-between hover:scale-[1.01] ${
          isDark 
            ? "bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800/80 hover:border-purple-300/30" 
            : "bg-white border-slate-205 shadow-sm hover:shadow-md"
        }`}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#A7AAE1]"></div>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border border-[#A7AAE1]/20 text-[#A7AAE1] tracking-wider bg-[#A7AAE1]/5`}>
                가장 추천하는 혼합형
              </span>
              <span className="text-[10px] font-bold text-slate-500">하이브리드 연금전환</span>
            </div>
            
            <h3 className={`text-base font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              🛡️ 하이브리드 전환형
            </h3>
            <p className={`text-[11px] mb-5 leading-relaxed truncate ${isDark ? "text-slate-450" : "text-slate-500"}`}>
              적립기 펀드(ETF) 극대화 + 종신연금 평생 보증
            </p>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 1: 적립 총 자산 */}
            <div className="space-y-3.5 mb-6">
              <div className="p-3 bg-purple-100/5 dark:bg-purple-950/15 border border-purple-550/20 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  💡 개시 시점 예상 적립금
                </span>
                <span className="text-xl font-black text-[#A7AAE1] block tracking-tight font-mono">
                  {yLabel(hybridResult.retirementBalance)}
                </span>
              </div>

              {/* 세부사항 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-450">가입 원금합계</span>
                  <span className="font-mono font-bold">{yLabel(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">세액공제 재투자액</span>
                  <span className="font-mono font-bold text-[#A7AAE1]">
                    {inputs.reinvestTaxCredit ? yLabel(hybridResult.cumulativeRefundTotal) : "전략 OFF [0원]"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">순수 적립 투자수익</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {yLabel(Math.max(0, hybridResult.retirementBalance - totalPrincipal - (inputs.reinvestTaxCredit ? hybridResult.cumulativeRefundTotal : 0)))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-850">
                  <span className="text-slate-450">누적 세환급 총액 (연말정산)</span>
                  <span className="font-mono font-bold">{yLabel(hybridResult.cumulativeRefundTotal)}</span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 2: 연금연액 및 수령 조건 */}
            <div className="space-y-3 mb-6">
              <h5 className="text-[11px] font-black text-[#A7AAE1] uppercase tracking-wider mb-2">
                💵 인출 연금연액 &amp; 연한
              </h5>
              
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[9.5px] text-slate-450 block">인출 대상액 (세전)</span>
                    <strong className="text-[13px] tracking-tight">{yLabel(hybridResult.preTaxWithdrawal)}</strong>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-950/40 border-slate-850" : "bg-purple-950/20 border-purple-300/40"}`}>
                    <span className="text-[9.5px] text-[#A7AAE1] font-bold block">보장 연 실수령 (세후)</span>
                    <strong className="text-[13px] text-[#A7AAE1] tracking-tight">{yLabel(hybridResult.afterTaxWithdrawal)}</strong>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-450">월 수령환산 평준액</span>
                  <span className="font-bold text-[#A7AAE1] font-mono">{(hybridResult.afterTaxWithdrawal / 12).toFixed(1)}만원/월</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">종신 연금 보장 여부</span>
                  <span className="font-black font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    평생 무고갈 수령 보장
                  </span>
                </div>
              </div>
            </div>

            <hr className={`border-dashed mb-5 ${isDark ? "border-slate-800" : "border-slate-150"}`} />

            {/* Section 3: 세금 혜택 */}
            <div className="space-y-2.5 text-xs">
              <h5 className="text-[11px] font-black text-[#A7AAE1] uppercase tracking-wider mb-2">
                🛡️ 절세 구조 및 세제 혜택
              </h5>

              <div className="flex justify-between">
                <span className="text-slate-450">납입 시 세금혜택</span>
                <span className="font-semibold text-[#A7AAE1]">연 최대 148.5만원 환급</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">종신 연소득세 특약</span>
                <span className="font-bold text-amber-500">지정 완화 3.3% 저율 고정</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">연 세금차감 평준액</span>
                <span className="font-mono font-bold text-rose-455">
                  {yLabel(Math.max(0, hybridResult.preTaxWithdrawal - hybridResult.afterTaxWithdrawal))}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-3 rounded-lg text-[10.5px] leading-relaxed select-none ${
            isDark ? "bg-slate-950/60 border border-slate-850 text-slate-400" : "bg-slate-50 border border-slate-200 text-slate-600"
          }`}>
            🚨 <strong className="text-purple-400">최적 결합 스마트형:</strong> 연금저축의 소득공제 환급 혜택과 ETF 고수익 운용 효과를 100% 흡수하면서도, 은퇴 이후에는 보험사 종신전형으로 일괄 양도 이체시킴으로써 잔고 고갈 걱정 없는 종신 소득력을 획득하는 가장 추천하는 설계전략입니다.
          </div>
        </div>

      </div>

    </div>
  );
}

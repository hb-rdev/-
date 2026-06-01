import { SimulationInputs } from "../types";
import { 
  Coins, 
  User, 
  Hourglass, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  FlameKindling,
  DollarSign,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Percent,
  Award,
  Landmark
} from "lucide-react";
import React, { useState } from "react";
import { yLabel } from "../utils";

interface InputPanelProps {
  inputs: SimulationInputs;
  onInputChange: (newInputs: Partial<SimulationInputs>) => void;
  retirementBalance: number;
  annualRefund: number;
  reinvestmentEffect: number;
  cumulativeRefund: number;
  theme?: "dark" | "light";
}

export default function InputPanel({ 
  inputs, 
  onInputChange, 
  retirementBalance, 
  annualRefund,
  reinvestmentEffect,
  cumulativeRefund,
  theme = "dark" 
}: InputPanelProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Card layout ordering state (drag-and-drop & manual swap reordering)
  const [cardOrder, setCardOrder] = useState<string[]>([
    "ratePre",
    "ratePost",
    "rateInsurance",
    "fixedTerm",
    "insuranceAnnuityRate",
    "illHealthEffect",
    "annualWithdrawal"
  ]);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Helper adjustment buttons for sliders
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
        return "매달 연금계좌에 납입하는 금액입니다. 연간 저축 총액은 월 납입액의 12배가 기준 금액이 됩니다.";
      case "startAge":
        return "연금 계좌에 가입하여 적립을 처음으로 작수할 연령(나이)입니다.";
      case "endAge":
        return "연금을 개시하여 첫 지급금을 수령받기 시작할 연령(나이)입니다. (최소 55세)";
      case "ratePre":
        return "자산 적립기 동안 세액공제 재투자분을 포함한 예상 자산 복리 연수익률입니다.";
      case "ratePost":
        return "연금 수령(인출)기 안전 자산 분산 등으로 안정화한 보수적 복리 연수익률입니다.";
      case "rateInsurance":
        return "보험사의 세제비적격 연금보험 및 하이브리드 수령액 산출에 반영되는 예정 공시 복리연이율입니다.";
      case "fixedTerm":
        return "적립 자산 잔고를 지정된 연도(5년, 10년, 15년, 20년) 동안 등분하여 매년 균등액을 인출하고 소지하는 수령방식입니다.";
      case "insuranceAnnuityRate":
        return "연금 개시 시점 기준, 보험사에서 산정해 제공하는 표준 종신 연금지급률입니다. 범위: 2.0% ~ 7.0% (0.1% 단위)";
      case "illHealthEffect":
        return "건강 상태가 좋지 않은 피보험자의 기대수명 단축을 감안하여 일시금 지급액 비율을 높여주는 유병자 효과 비율입니다. 범위: 0% ~ 100% (5% 단위)";
      case "annualWithdrawal":
        return "연금저축펀드 수령기 동안 매년 본인의 은퇴 생활비 등으로 인출할 계획인 세전 희망액입니다.";
      case "depositYears":
        return "실제 납입금액을 매월 이체하여 저축하는 총 년 수입니다. 기본적으로 개시나이 직전까지이며, 필요 시 단축해 납입하는 설계가 가능합니다.";
      default:
        return "";
    }
  };

  const getCardDetails = (id: string) => {
    switch (id) {
      case "monthlyDeposit":
        return {
          title: "월 납입액",
          icon: <Coins className="w-3.5 h-3.5 text-indigo-400" />,
          min: 10,
          max: 200,
          step: 5,
          unit: "만원",
          key: "monthlyDeposit" as keyof SimulationInputs,
          colorClass: "text-[#6366f1]",
          bgColorClass: "bg-indigo-500/10",
          stepDelta: 5,
        };
      case "startAge":
        return {
          title: "시작 나이",
          icon: <User className="w-3.5 h-3.5 text-indigo-400" />,
          min: 25,
          max: 50,
          step: 1,
          unit: "세",
          key: "startAge" as keyof SimulationInputs,
          colorClass: "text-[#6366f1]",
          bgColorClass: "bg-indigo-500/10",
          stepDelta: 1,
        };
      case "endAge":
        return {
          title: "개시 나이",
          icon: <Hourglass className="w-3.5 h-3.5 text-indigo-400" />,
          min: 55,
          max: 70,
          step: 1,
          unit: "세",
          key: "endAge" as keyof SimulationInputs,
          colorClass: "text-[#6366f1]",
          bgColorClass: "bg-indigo-500/10",
          stepDelta: 1,
        };
      case "depositYears":
        return {
          title: "납입 기간",
          icon: <Hourglass className="w-3.5 h-3.5 text-indigo-400" />,
          min: 1,
          max: Math.max(1, inputs.endAge - inputs.startAge),
          step: 1,
          unit: "년",
          key: "depositYears" as keyof SimulationInputs,
          colorClass: "text-[#6366f1]",
          bgColorClass: "bg-indigo-500/10",
          stepDelta: 1,
        };
      case "ratePre":
        return {
          title: "적립기 수익률",
          icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />,
          min: 2,
          max: 15,
          step: 0.5,
          unit: "%",
          key: "ratePre" as keyof SimulationInputs,
          colorClass: "text-[#6366f1]",
          bgColorClass: "bg-indigo-500/10",
          stepDelta: 0.5,
        };
      case "ratePost":
        return {
          title: "인출기 수익률",
          icon: <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />,
          min: 1,
          max: 15,
          step: 0.5,
          unit: "%",
          key: "ratePost" as keyof SimulationInputs,
          colorClass: "text-[#64748b]",
          bgColorClass: "bg-slate-500/10",
          stepDelta: 0.5,
        };
      case "rateInsurance":
        return {
          title: "공시이율",
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#A7AAE1]" />,
          min: 1.0,
          max: 6.0,
          step: 0.1,
          unit: "%",
          key: "rateInsurance" as keyof SimulationInputs,
          colorClass: "text-[#A7AAE1]",
          bgColorClass: "bg-[#A7AAE1]/10",
          stepDelta: 0.1,
        };
      case "fixedTerm":
        return {
          title: "확정 수령기간",
          icon: <Hourglass className="w-3.5 h-3.5 text-[#F2AEBB]" />,
          min: 5,
          max: 20,
          step: 5,
          unit: "년",
          key: "fixedTerm" as keyof SimulationInputs,
          colorClass: "text-[#F2AEBB]",
          bgColorClass: "bg-[#F2AEBB]/10",
          stepDelta: 5,
        };
      case "insuranceAnnuityRate":
        return {
          title: "종신연금비율",
          icon: <DollarSign className="w-3.5 h-3.5 text-[#A7AAE1]" />,
          min: 2.0,
          max: 7.0,
          step: 0.1,
          unit: "%",
          key: "insuranceAnnuityRate" as keyof SimulationInputs,
          colorClass: "text-[#A7AAE1]",
          bgColorClass: "bg-[#A7AAE1]/10",
          stepDelta: 0.1,
        };
      case "illHealthEffect":
        return {
          title: "유병자연금 효과",
          icon: <Percent className="w-3.5 h-3.5 text-[#A7AAE1]" />,
          min: 100,
          max: 150,
          step: 5,
          unit: "%",
          key: "illHealthEffect" as keyof SimulationInputs,
          colorClass: "text-[#A7AAE1]",
          bgColorClass: "bg-[#A7AAE1]/10",
          stepDelta: 5,
        };
      case "annualWithdrawal":
      default:
        return {
          title: "희망 연 수령액",
          icon: <DollarSign className="w-3.5 h-3.5 text-[#F2AEBB]" />,
          min: 500,
          max: 6000,
          step: 100,
          unit: "만원",
          key: "annualWithdrawal" as keyof SimulationInputs,
          colorClass: "text-[#F2AEBB]",
          bgColorClass: "bg-[#F2AEBB]/10",
          stepDelta: 100,
        };
    }
  };

  const commonCardIds = ["monthlyDeposit", "depositYears", "startAge", "endAge"];

  const activeVariableCardIds = (() => {
    switch (inputs.simulationType) {
      case "nonTaxable": {
        const base = ["rateInsurance"];
        if (inputs.payoutMethod === "fixed") {
          return [...base, "fixedTerm"];
        } else {
          return [...base, "insuranceAnnuityRate", "illHealthEffect"];
        }
      }
      case "hybrid":
        return ["ratePre", "rateInsurance", "insuranceAnnuityRate", "illHealthEffect"];
      case "fund":
      default:
        return ["ratePre", "ratePost", "annualWithdrawal"];
    }
  })();

  // Filter cardOrder to only include active variable cards for the current mode
  const visibleCards = cardOrder.filter(id => activeVariableCardIds.includes(id));

  const showInsuranceAnnuitySection = activeVariableCardIds.includes("insuranceAnnuityRate") && activeVariableCardIds.includes("illHealthEffect");
  const listCards = showInsuranceAnnuitySection 
    ? visibleCards.filter(id => id !== "insuranceAnnuityRate" && id !== "illHealthEffect")
    : visibleCards;

  const withdrawRatio = retirementBalance > 0 
    ? (inputs.annualWithdrawal / retirementBalance) * 100 
    : 0;

  // Manual swap for mobile/arrow indicators based on visible list cards
  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= listCards.length) return;
    const sourceCardId = listCards[index];
    const targetCardId = listCards[targetIdx];

    const newOrder = [...cardOrder];
    const srcOIdx = newOrder.indexOf(sourceCardId);
    const tgtOIdx = newOrder.indexOf(targetCardId);
    if (srcOIdx !== -1 && tgtOIdx !== -1) {
      newOrder[srcOIdx] = targetCardId;
      newOrder[tgtOIdx] = sourceCardId;
      setCardOrder(newOrder);
    }
  };

  // HTML5 Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }

    const newOrder = [...cardOrder];
    const sourceIdx = newOrder.indexOf(sourceId);
    const targetIdx = newOrder.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      newOrder[sourceIdx] = targetId;
      newOrder[targetIdx] = sourceId;
      setCardOrder(newOrder);
    }
    setDraggedId(null);
  };

  const isDark = theme === "dark";
  const isNonTaxable = inputs.simulationType === "nonTaxable";

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-lg ${
      isDark 
        ? "bg-slate-900/90 border-slate-800" 
        : "bg-white border-slate-200/90"
    }`}>
      {/* Header section */}
      <div className="flex items-center justify-between border-b pb-2.5 mb-4 border-dashed transition-colors duration-300 gap-2 overflow-hidden select-none"
           style={{ borderColor: isDark ? "rgba(71, 85, 105, 0.4)" : "rgba(226, 232, 240, 1)" }}>
        <div className="flex items-center space-x-2">
          <FlameKindling className={`w-4 h-4 animate-pulse ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          <span className={`text-xs font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            시뮬레이션 인풋 설정
          </span>
        </div>
        <p className={`text-[9px] font-mono tracking-wider font-semibold px-1.5 py-0.5 rounded border border-indigo-500/20 text-indigo-400 bg-indigo-500/5`}>
          Interactive Controller
        </p>
      </div>

      {/* 1) 유형 선택 / Simulation Type Selector */}
      <div className="mb-4">
        <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          1) 시뮬레이션 유형 선택
        </label>
        <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl transition-all duration-300 ${
          isDark ? "bg-slate-950/80 border border-slate-800" : "bg-slate-100 border border-slate-200"
        }`}>
          <button
            type="button"
            id="sim-type-fund"
            onClick={() => onInputChange({ simulationType: "fund" })}
            className={`py-2 px-1.5 rounded-lg text-[10.5px] font-black tracking-tight text-center transition-all cursor-pointer focus:outline-none flex flex-col items-center justify-center min-h-[46px] ${
              inputs.simulationType === "fund"
                ? "bg-[#696FC7] text-white shadow-md"
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            연금저축<br />펀드
          </button>
          <button
            type="button"
            id="sim-type-nontax"
            onClick={() => onInputChange({ simulationType: "nonTaxable" })}
            className={`py-2 px-1.5 rounded-lg text-[10.5px] font-black tracking-tight text-center transition-all cursor-pointer focus:outline-none flex flex-col items-center justify-center min-h-[46px] ${
              inputs.simulationType === "nonTaxable"
                ? "bg-[#F2AEBB] text-slate-950 shadow-md font-black"
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            세제비적격<br />연금보험
          </button>
          <button
            type="button"
            id="sim-type-hybrid"
            onClick={() => onInputChange({ simulationType: "hybrid" })}
            className={`py-2 px-1.5 rounded-lg text-[10.5px] font-black tracking-tight text-center transition-all cursor-pointer focus:outline-none flex flex-col items-center justify-center min-h-[46px] ${
              inputs.simulationType === "hybrid"
                ? "bg-[#A7AAE1] text-slate-950 shadow-md font-black"
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            하이브리드<br />방식
          </button>
        </div>
      </div>

      {/* 2) 공통가입조건 및 세액공제 재투자 전략 */}
      <div className="mb-4 border-t border-dashed pt-3.5"
           style={{ borderColor: isDark ? "rgba(71, 85, 105, 0.4)" : "rgba(226, 232, 240, 1)" }}>
        <label className={`text-[10px] font-black uppercase tracking-wider mb-2.5 block ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          2) 공통 가입 조건 &amp; 세액공제 재투자 전략
        </label>
        
        {/* 공통 가입조건 카드 (2x2 Compact Grid) */}
        <div className={`p-3 rounded-2xl border mb-3.5 select-none ${
          isDark 
            ? "bg-slate-950/45 border-slate-800/90" 
            : "bg-slate-50/50 border-slate-205/90 shadow-2xs"
        }`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`}>
                📋 공통 가입 조건
              </span>
              {inputs.depositYears < (inputs.endAge - inputs.startAge) && (
                <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border select-none ${
                  isDark ? "bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse" : "bg-amber-50 border-amber-200 text-amber-600 shadow-3xs"
                }`}>
                  단축 납입 ({inputs.depositYears}년)
                </span>
              )}
            </div>
            <span className={`text-[9px] font-semibold text-slate-500`}>
              {inputs.startAge}세 ~ {inputs.endAge}세 (적립 {inputs.endAge - inputs.startAge}년)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {commonCardIds.map((cardId) => {
              const detail = getCardDetails(cardId);
              const val = inputs[detail.key] as number;
              const tooltipActive = activeTooltip === cardId;

              return (
                <div
                  key={cardId}
                  className={`flex flex-col justify-between p-2 rounded-xl border transition-all duration-300 relative select-none ${
                    isDark 
                      ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60" 
                      : "bg-white border-slate-200 hover:bg-white hover:border-indigo-150 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center space-x-1 min-w-0">
                      <span className="shrink-0">{detail.icon}</span>
                      <span className={`text-[9.5px] font-black truncate ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                        {detail.title}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTooltip(tooltipActive ? null : cardId);
                      }}
                      className="text-slate-500 hover:text-indigo-400 focus:outline-none shrink-0"
                    >
                      <HelpCircle className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {tooltipActive && (
                    <div className={`absolute left-1 right-1 top-7.5 z-50 text-[9px] leading-relaxed p-1.5 rounded-lg border ${
                      isDark 
                        ? "bg-slate-950 text-slate-300 border-slate-850" 
                        : "bg-white text-slate-600 border-slate-200 shadow-md"
                    }`}>
                      {getHelpContent(cardId)}
                    </div>
                  )}

                  <div className="text-right py-0.5 flex items-center justify-between">
                    {cardId === "depositYears" ? (
                      <span className={`text-[8.5px] font-black tracking-tight px-1 py-0.2 rounded border select-none ${
                        isDark 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : "bg-amber-50 border-amber-100 text-amber-600"
                      }`}>
                        완료: {inputs.startAge + val}세
                      </span>
                    ) : <span />}
                    <span className={`text-xs font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {val.toLocaleString()}{detail.unit}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => adj(detail.key, -detail.stepDelta, detail.min, detail.max)}
                      className={`w-4 h-4 rounded font-bold text-[9px] flex items-center justify-center transition focus:outline-none border shrink-0 ${
                        isDark 
                          ? "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 active:scale-95" 
                          : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-95 shadow-2xs"
                      }`}
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min={detail.min}
                      max={detail.max}
                      step={detail.step}
                      value={val}
                      onChange={(e) => {
                        onInputChange({ [detail.key]: parseFloat(e.target.value) });
                      }}
                      className="flex-1 min-w-0 accent-indigo-500 h-0.5 bg-slate-300 dark:bg-slate-850 rounded cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => adj(detail.key, detail.stepDelta, detail.min, detail.max)}
                      className={`w-4 h-4 rounded font-bold text-[9px] flex items-center justify-center transition focus:outline-none border shrink-0 ${
                        isDark 
                          ? "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 active:scale-95" 
                          : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-95 shadow-2xs"
                      }`}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tax Credit Strategy Inner Panel */}
        {isNonTaxable ? (
          <div className={`p-3 rounded-xl border flex flex-col justify-between text-left select-none ${
            isDark 
              ? "bg-slate-950/40 border-slate-800/80 text-white" 
              : "bg-slate-50 border-slate-200/90 text-slate-800 shadow-sm"
          }`}>
            <div className={`flex items-center justify-between border-b pb-1.5 mb-2 border-dashed ${
              isDark ? "border-slate-800" : "border-slate-150"
            }`}>
              <h4 className="text-[10px] font-bold flex items-center gap-1.5 text-indigo-400">
                <Award className="w-3.5 h-3.5" />
                세법 적용: 이자·수령 과세 전액 면제 (비과세)
              </h4>
            </div>
            <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
              🛡️ <strong>세제비적격 연금보험</strong>은 납입원금에 대한 연간 세액공제를 제공하지 않는 대신, 관계법령 요건 충족 시 수령기 <strong>총 연금 차익에 소득세율 0.0% 장기 비과세 혜택</strong>을 고스란히 부여하여 종합과세 위험을 원천 차단합니다.
            </p>
          </div>
        ) : (
          <div className={`p-3 rounded-xl border space-y-3 shadow-sm select-none transition-all ${
            isDark 
              ? "bg-slate-950/40 border-slate-800/80" 
              : "bg-slate-50 border-slate-200/95 text-slate-800"
          }`}>
            <div className={`flex items-center justify-between border-b pb-1.5 border-dashed ${
              isDark ? "border-slate-800" : "border-slate-150"
            }`}>
              <h4 className="text-[10px] font-bold flex items-center space-x-1.5">
                <Award className={`w-3.5 h-3.5 ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`} />
                <span>세액공제 환급금 재투자 설정 (연 900만원 한도)</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Toggle 1: 세액공제 재투자 ON/OFF */}
              <div className="flex flex-col space-y-1">
                <span className={`text-[9px] font-bold flex items-center ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                  <RefreshCw className={`w-3 h-3 mr-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  환급금 재투자 여부
                </span>
                <div className="flex select-none">
                  <button
                    type="button"
                    onClick={() => onInputChange({ reinvestTaxCredit: true })}
                    className={`flex-1 text-center font-bold tracking-wide transition flex items-center justify-center cursor-pointer`}
                    style={{
                      backgroundColor: inputs.reinvestTaxCredit 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "#1e293b" : "#f1f5f9"),
                      color: inputs.reinvestTaxCredit ? "#ffffff" : "#64748b",
                      borderRadius: "6px 0 0 6px",
                      height: "24px",
                      fontSize: "10.5px",
                      border: "1px solid " + (inputs.reinvestTaxCredit 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(100, 116, 139, 0.15)")),
                    }}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    onClick={() => onInputChange({ reinvestTaxCredit: false })}
                    className={`flex-1 text-center font-bold tracking-wide transition flex items-center justify-center cursor-pointer`}
                    style={{
                      backgroundColor: !inputs.reinvestTaxCredit 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "#1e293b" : "#f1f5f9"),
                      color: !inputs.reinvestTaxCredit ? "#ffffff" : "#64748b",
                      borderRadius: "0 6px 6px 0",
                      height: "24px",
                      fontSize: "10.5px",
                      border: "1px solid " + (!inputs.reinvestTaxCredit 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(100, 116, 139, 0.15)")),
                    }}
                  >
                    OFF
                  </button>
                </div>
              </div>

              {/* Toggle 2: 세액공제율 선택 (13.2% vs 16.5%) */}
              <div className="flex flex-col space-y-1">
                <span className={`text-[9px] font-bold flex items-center ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                  <Percent className={`w-3 h-3 mr-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  소득형태별 공제율
                </span>
                <div className="flex select-none">
                  <button
                    type="button"
                    onClick={() => onInputChange({ taxCreditRate: 13.2 })}
                    className={`flex-1 text-center font-bold tracking-wide transition flex items-center justify-center cursor-pointer`}
                    style={{
                      backgroundColor: inputs.taxCreditRate === 13.2 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "#1e293b" : "#f1f5f9"),
                      color: inputs.taxCreditRate === 13.2 ? "#ffffff" : "#64748b",
                      borderRadius: "6px 0 0 6px",
                      height: "24px",
                      fontSize: "10.5px",
                      border: "1px solid " + (inputs.taxCreditRate === 13.2 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(100, 116, 139, 0.15)")),
                    }}
                  >
                    13.2%
                  </button>
                  <button
                    type="button"
                    onClick={() => onInputChange({ taxCreditRate: 16.5 })}
                    className={`flex-1 text-center font-bold tracking-wide transition flex items-center justify-center cursor-pointer`}
                    style={{
                      backgroundColor: inputs.taxCreditRate === 16.5 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "#1e293b" : "#f1f5f9"),
                      color: inputs.taxCreditRate === 16.5 ? "#ffffff" : "#64748b",
                      borderRadius: "0 6px 6px 0",
                      height: "24px",
                      fontSize: "10.5px",
                      border: "1px solid " + (inputs.taxCreditRate === 16.5 
                        ? (isDark ? "#6366f1" : "#4f46e5") 
                        : (isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(100, 116, 139, 0.15)")),
                    }}
                  >
                    16.5%
                  </button>
                </div>
              </div>
            </div>

            {/* Tax benefits stats sub-cards */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/40">
              <div className={`p-2 rounded-lg border transition-all ${
                isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-150"
              }`}>
                <div className={`text-[8px] font-bold mb-0.5 flex items-center ${isDark ? "text-slate-500" : "text-slate-500"}`} title="연간 예상 환급액">
                  <Landmark className="w-2 h-2 mr-0.5 text-indigo-400 shrink-0" />
                  <span className="truncate">연간 환급액</span>
                </div>
                <div className={`text-[11px] font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {yLabel(annualRefund)}
                </div>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${
                isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-150"
              }`}>
                <div className={`text-[8px] font-bold mb-0.5 flex items-center ${isDark ? "text-slate-500" : "text-slate-500"}`} title="재투자 효과 차액">
                  <TrendingUp className="w-2 h-2 mr-0.5 text-indigo-400 shrink-0" />
                  <span className="truncate">재투자 차액</span>
                </div>
                <div className={`text-[11px] font-black font-mono ${isDark ? "text-indigo-450" : "text-indigo-650"}`}>
                  +{yLabel(reinvestmentEffect)}
                </div>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${
                isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-150"
              }`}>
                <div className={`text-[8px] font-bold mb-0.5 flex items-center ${isDark ? "text-slate-500" : "text-slate-500"}`} title="납입 기간 내 총 예상 누적 환급 합계액">
                  <span className="truncate">총 누적 환급액</span>
                </div>
                <div className={`text-[11px] font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {yLabel(cumulativeRefund)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3) 시뮬레이션별 조건 */}
      <div className="mb-4 border-t border-dashed pt-3.5"
           style={{ borderColor: isDark ? "rgba(71, 85, 105, 0.4)" : "rgba(226, 232, 240, 1)" }}>
        <label className={`text-[10px] font-black uppercase tracking-wider mb-2.5 block ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          3) 시뮬레이션 유형별 조건 설정 (상태 자율 정렬)
        </label>

        {/* Dynamic Payout Method Sub-Selector exclusively for nonTaxable */}
        {inputs.simulationType === "nonTaxable" && (
          <div className="mb-3.5 mt-1 animate-fadeIn">
            <span className={`text-[9.5px] font-black uppercase tracking-wider mb-1 block ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}>
              수령 방식 설정
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <button
                type="button"
                id="payout-method-fixed"
                onClick={() => onInputChange({ payoutMethod: "fixed" })}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-black tracking-tight transition cursor-pointer border ${
                  inputs.payoutMethod === "fixed"
                    ? isDark ? "bg-slate-800 text-indigo-400 border-indigo-500/35 font-bold" : "bg-white text-indigo-600 border-indigo-550/30 shadow-xs font-bold"
                    : isDark ? "bg-transparent text-slate-500 border-slate-800 opacity-60" : "bg-transparent text-slate-400 border-slate-200 opacity-70"
                }`}
              >
                확정기간형 (5~20년)
              </button>
              <button
                type="button"
                id="payout-method-lifetime"
                onClick={() => onInputChange({ payoutMethod: "lifetime" })}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-black tracking-tight transition cursor-pointer border ${
                  inputs.payoutMethod === "lifetime"
                    ? isDark ? "bg-slate-800 text-indigo-400 border-indigo-500/35 font-bold" : "bg-white text-indigo-600 border-indigo-550/30 shadow-xs font-bold"
                    : isDark ? "bg-transparent text-slate-500 border-slate-800 opacity-60" : "bg-transparent text-slate-400 border-slate-200 opacity-70"
                }`}
              >
                종신연금형 (10년보증)
              </button>
            </div>
          </div>
        )}

        {/* Hybrid Information message indicator */}
        {inputs.simulationType === "hybrid" && (
          <div className={`p-2.5 rounded-lg border mb-3 select-none text-[10px] leading-relaxed ${
            isDark 
              ? "bg-slate-950/45 border-slate-800/60 text-slate-400" 
              : "bg-slate-50 border-slate-205 text-slate-600"
          }`}>
            💡 <span className="font-bold text-[#A7AAE1]">하이브리드:</span> 적립기 동안 연금저축펀드에서 세액공제를 최대한 받고, 은퇴 시 연계액 총합을 보험사로 전산 이관하여 비과세 종신연금으로 영속 수령하게 설계됩니다.
          </div>
        )}

        <p className={`text-[9px] leading-normal font-medium mb-3 transition-colors duration-300 ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}>
          * 아래 카드는 드래그하거나 미세 조정 화살표를 눌러 정렬 우선순위를 변경할 수 있습니다.
        </p>

        {/* Grid wrapper for Drag & Drop items (3x2 Grid or 1col) */}
        {listCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {listCards.map((cardId, index) => {
              const detail = getCardDetails(cardId);
              const val = inputs[detail.key] as number;
              const tooltipActive = activeTooltip === cardId;
 
              return (
                <div
                  key={cardId}
                  id={`card-${cardId}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cardId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cardId)}
                  className={`group flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 relative select-none cursor-grab active:cursor-grabbing ${
                    draggedId === cardId ? "opacity-30 scale-95" : ""
                  } ${
                    isDark 
                      ? "bg-slate-950/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-950/90" 
                      : "bg-slate-50 border-slate-200 hover:border-indigo-400/50 hover:bg-white hover:shadow-xs"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <div className="p-1 rounded bg-indigo-550/10 flex items-center justify-center pointer-events-none">
                        <GripVertical className={`w-3 h-3 ${isDark ? "text-slate-600 group-hover:text-indigo-400" : "text-slate-450 group-hover:text-indigo-500"}`} />
                      </div>
                      <span className={`text-[10.5px] font-black truncate  ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {detail.title}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(tooltipActive ? null : cardId);
                        }}
                        className="text-slate-500 hover:text-indigo-505 focus:outline-none"
                      >
                        <HelpCircle className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Tactile Swap Arrows */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, "left");
                        }}
                        disabled={index === 0}
                        className={`p-0.5 rounded transition focus:outline-none ${
                          index === 0
                            ? "opacity-20 cursor-not-allowed"
                            : "hover:bg-indigo-500/10 text-slate-450 hover:text-indigo-400"
                        }`}
                        title="앞으로 이동"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, "right");
                        }}
                        disabled={index === listCards.length - 1}
                        className={`p-0.5 rounded transition focus:outline-none ${
                          index === listCards.length - 1
                            ? "opacity-20 cursor-not-allowed"
                            : "hover:bg-indigo-500/10 text-slate-450 hover:text-indigo-400"
                        }`}
                        title="뒤로 이동"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Tooltip detail block */}
                  {tooltipActive && (
                    <div className={`text-[9.5px] leading-relaxed p-1.5 rounded-lg border mb-2 select-none z-10 ${
                      isDark 
                        ? "bg-slate-900 text-slate-300 border-slate-800" 
                        : "bg-white text-slate-600 border-slate-150 shadow-sm"
                    }`}>
                      {getHelpContent(cardId)}
                    </div>
                  )}

                  {/* Value displaying row */}
                  <div className="flex flex-col mb-1.5 gap-0.5">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-[9.5px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>설정 수치</span>
                      <span className={`text-xs font-black font-mono transition-colors ${
                        cardId === "annualWithdrawal" 
                          ? "text-[#F2AEBB]" 
                          : isDark ? "text-slate-100" : "text-slate-900"
                      }`}>
                        {cardId === "annualWithdrawal" ? (
                          <span className="flex items-center space-x-1.5">
                            <span>{val.toLocaleString()}만원</span>
                            <span className={`text-[8.5px] px-1 py-0.5 rounded border border-indigo-500/25 text-indigo-400 bg-indigo-500/10`} title="개시시점 잔액 대비 연 수령 비중">
                              {withdrawRatio.toFixed(1)}%
                            </span>
                          </span>
                        ) : (
                          `${val.toLocaleString()}${detail.unit}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Slider bar */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adj(detail.key, -detail.stepDelta, detail.min, detail.max);
                      }}
                      className={`w-4.5 h-4.5 shrink-0 flex-none rounded-md font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                        isDark 
                          ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                          : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                      }`}
                    >
                      －
                    </button>
                    <input
                      type="range"
                      min={detail.min}
                      max={detail.max}
                      step={detail.step}
                      value={val}
                      onChange={(e) => {
                        onInputChange({ [detail.key]: parseFloat(e.target.value) });
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent trigger drag
                      className="flex-1 min-w-0 w-full accent-indigo-500 h-1 bg-slate-300 dark:bg-slate-800 rounded cursor-pointer"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adj(detail.key, detail.stepDelta, detail.min, detail.max);
                      }}
                      className={`w-4.5 h-4.5 shrink-0 flex-none rounded-md font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                        isDark 
                          ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                          : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                      }`}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Special 1x1 & 1x2 Fixed Section for Insurance Lifetime Annuity Rates */}
        {showInsuranceAnnuitySection && (
          <div className="mt-4 space-y-3 pt-4 border-t border-slate-800/15">
            <h4 className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`}>
              종신 연금수령 지급률 설정
            </h4>

            {/* (카드 1x1) 연금연액비율 카드 */}
            <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 shadow-sm ${
              isDark 
                ? "bg-slate-900 border-slate-800/80 text-white" 
                : "bg-indigo-50/50 border-indigo-200 text-slate-800 shadow-sm"
            }`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#6366f1]"></div>
              
              <div className="flex justify-between items-center mb-1">
                <div className={`text-[10.5px] font-black tracking-wider uppercase flex items-center ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                  <Percent className="w-3.5 h-3.5 mr-1" />
                  연금연액비율
                </div>
                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                  isDark ? "bg-[#6366f1]/15 text-[#A7AAE1]" : "bg-[#6366f1]/10 text-indigo-700"
                }`}>
                  자동 계산 결과
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1.5">
                <div className="text-xl md:text-2xl font-black tracking-tight font-sans">
                  {inputs.annuityPayoutRate.toFixed(2)}%
                </div>
                <div className={`text-[10px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  지급률 산식: {inputs.insuranceAnnuityRate.toFixed(1)}% (기본 비율) × ({inputs.illHealthEffect}%)
                </div>
              </div>
            </div>

            {/* (카드 1x2) 종신연금비율 & 유병자연금 효과 조정 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 종신연금비율 카드 */}
              {(() => {
                const detail = getCardDetails("insuranceAnnuityRate");
                const val = inputs.insuranceAnnuityRate;
                const tooltipActive = activeTooltip === "insuranceAnnuityRate";
                return (
                  <div className={`flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 relative select-none ${
                    isDark 
                      ? "bg-slate-950/60 border-slate-800/80 hover:bg-slate-950/90" 
                      : "bg-slate-50 border-slate-200 hover:bg-white hover:shadow"
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10.5px] font-black truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {detail.title}
                      </span>
                      <button 
                        onClick={() => setActiveTooltip(tooltipActive ? null : "insuranceAnnuityRate")}
                        className="text-slate-500 hover:text-indigo-500 focus:outline-none"
                      >
                        <HelpCircle className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {tooltipActive && (
                      <div className={`text-[9.5px] leading-relaxed p-1.5 rounded-lg border mb-2 select-none ${
                        isDark ? "bg-slate-900 text-slate-300 border-slate-800" : "bg-white text-slate-650 border-slate-150 shadow-sm"
                      }`}>
                        {getHelpContent("insuranceAnnuityRate")}
                      </div>
                    )}

                    {/* Value */}
                    <div className="flex items-baseline justify-between mb-1.5 min-h-[18px]">
                      <span className={`text-[9.5px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>설정 비율</span>
                      <span className={`text-xs font-black font-sans transition-colors flex items-center space-x-1.5 ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}>
                        <span>{val.toFixed(1)}%</span>
                        <span className="text-[8.5px] text-[#A7AAE1] bg-[#A7AAE1]/15 border border-[#A7AAE1]/25 px-1 py-0.2 rounded font-sans font-bold">
                          기본 비율
                        </span>
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => adj(detail.key, -detail.stepDelta, detail.min, detail.max)}
                        className={`w-5.5 h-5.5 shrink-0 flex-none rounded-lg font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                          isDark 
                            ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                            : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                        }`}
                      >
                        －
                      </button>
                      <input
                        type="range"
                        min={detail.min}
                        max={detail.max}
                        step={detail.step}
                        value={val}
                        onChange={(e) => onInputChange({ [detail.key]: parseFloat(e.target.value) })}
                        className="flex-1 min-w-0 w-full accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => adj(detail.key, detail.stepDelta, detail.min, detail.max)}
                        className={`w-5.5 h-5.5 shrink-0 flex-none rounded-lg font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                          isDark 
                            ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                            : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 유병자연금 효과 카드 */}
              {(() => {
                const detail = getCardDetails("illHealthEffect");
                const val = inputs.illHealthEffect;
                const tooltipActive = activeTooltip === "illHealthEffect";
                return (
                  <div className={`flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 relative select-none ${
                    isDark 
                      ? "bg-slate-950/60 border-slate-800/80 hover:bg-slate-950/90" 
                      : "bg-slate-50 border-slate-200 hover:bg-white hover:shadow"
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10.5px] font-black truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {detail.title}
                      </span>
                      <button 
                        onClick={() => setActiveTooltip(tooltipActive ? null : "illHealthEffect")}
                        className="text-slate-500 hover:text-indigo-500 focus:outline-none"
                      >
                        <HelpCircle className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {tooltipActive && (
                      <div className={`text-[9.5px] leading-relaxed p-1.5 rounded-lg border mb-2 select-none ${
                        isDark ? "bg-slate-900 text-slate-300 border-slate-800" : "bg-white text-slate-650 border-slate-150 shadow-sm"
                      }`}>
                        {getHelpContent("illHealthEffect")}
                      </div>
                    )}

                    {/* Value */}
                    <div className="flex items-baseline justify-between mb-1.5 min-h-[18px]">
                      <span className={`text-[9.5px] font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>설정 비율</span>
                      <span className={`text-xs font-black font-sans transition-colors flex items-center space-x-1.5 ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}>
                        <span>{val}%</span>
                        <span className="text-[8.5px] text-emerald-400 bg-emerald-555/15 border border-emerald-500/25 px-1 py-0.2 rounded font-sans font-bold">
                          개선 배수
                        </span>
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => adj(detail.key, -detail.stepDelta, detail.min, detail.max)}
                        className={`w-5.5 h-5.5 shrink-0 flex-none rounded-lg font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                          isDark 
                            ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                            : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                        }`}
                      >
                        －
                      </button>
                      <input
                        type="range"
                        min={detail.min}
                        max={detail.max}
                        step={detail.step}
                        value={val}
                        onChange={(e) => onInputChange({ [detail.key]: parseFloat(e.target.value) })}
                        className="flex-1 min-w-0 w-full accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => adj(detail.key, detail.stepDelta, detail.min, detail.max)}
                        className={`w-5.5 h-5.5 shrink-0 flex-none rounded-lg font-bold text-[9px] flex items-center justify-center transition focus:outline-none border ${
                          isDark 
                            ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 active:scale-90" 
                            : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 active:scale-90 shadow-2xs"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

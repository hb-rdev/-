import React from "react";
import { yLabel, getPensionTaxRate } from "../utils";
import { SimulationInputs } from "../types";
import { 
  PiggyBank, 
  Clock, 
  Percent, 
  ShieldCheck, 
  TrendingUp,
  AlertCircle,
  Coins,
  ArrowRight
} from "lucide-react";

interface MetricsCardsProps {
  retirementBalance: number;
  firstYearGainVsWithdraw: number;
  depleteAge: number | null;
  accumulationYears: number;
  annualRefundAmount: number;
  reinvestmentEffect: number;
  cumulativeRefundTotal: number;
  withdrawalRatio: number;
  afterTaxWithdrawal: number;
  annualWithdrawal: number;
  preTaxWithdrawal?: number;
  inputs: SimulationInputs;
  theme?: "dark" | "light";
}

export default function MetricsCards({
  retirementBalance,
  firstYearGainVsWithdraw,
  depleteAge,
  accumulationYears,
  annualRefundAmount,
  reinvestmentEffect,
  cumulativeRefundTotal,
  withdrawalRatio,
  afterTaxWithdrawal,
  annualWithdrawal,
  preTaxWithdrawal,
  inputs,
  theme = "light",
}: MetricsCardsProps) {
  const isDark = theme === "dark";
  const startAge = inputs.endAge; // This is the start of withdrawal age
  const baseRate = getPensionTaxRate(startAge);
  const isNonTaxable = inputs.simulationType === "nonTaxable";
  const isHybrid = inputs.simulationType === "hybrid";
  const isLifetimeAnnuity = isHybrid || (isNonTaxable && inputs.payoutMethod === "lifetime");

  const effectiveAnnualWithdrawal = preTaxWithdrawal !== undefined ? preTaxWithdrawal : annualWithdrawal;

  // Live split calculation details
  const limit = 1500; // 1,500만원
  const isOver1500 = !isNonTaxable && effectiveAnnualWithdrawal > limit;
  
  let basePortion = 0;
  let excessPortion = 0;
  let baseTax = 0;
  let excessTax = 0;
  let totalTax = 0;
  let computedAfterTax = effectiveAnnualWithdrawal;

  if (isNonTaxable) {
    basePortion = 0;
    excessPortion = 0;
    baseTax = 0;
    excessTax = 0;
    totalTax = 0;
    computedAfterTax = effectiveAnnualWithdrawal;
  } else if (isHybrid) {
    basePortion = Math.min(effectiveAnnualWithdrawal, limit);
    excessPortion = Math.max(0, effectiveAnnualWithdrawal - limit);
    baseTax = basePortion * 0.033;
    excessTax = excessPortion * 0.165;
    totalTax = baseTax + excessTax;
    computedAfterTax = effectiveAnnualWithdrawal - totalTax;
  } else {
    basePortion = Math.min(effectiveAnnualWithdrawal, limit);
    excessPortion = Math.max(0, effectiveAnnualWithdrawal - limit);
    baseTax = basePortion * (baseRate / 100);
    excessTax = excessPortion * 0.165;
    totalTax = baseTax + excessTax;
    computedAfterTax = effectiveAnnualWithdrawal - totalTax;
  }

  return (
    <div className="space-y-4">
      {/* 3 Core Highlight Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
        {/* Card 1: 개시 시점 잔액 */}
        <div className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-lg flex flex-col justify-center relative overflow-hidden transition-all duration-300 h-20 sm:h-24 ${
          isDark 
            ? "bg-slate-900 border-slate-800/80 text-white" 
            : "bg-white border-slate-200 text-slate-800 shadow-sm"
        }`}>
          <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#6366f1]"></div>
          <div className="pl-1 sm:pl-0">
            <div className={`text-[8px] xs:text-[9px] sm:text-[10px] font-black tracking-tight sm:tracking-wider uppercase mb-0.5 sm:mb-1 flex items-center ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
              <PiggyBank className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" />
              개시 예상 잔액
            </div>
            <div className={`text-[10px] xs:text-xs sm:text-base md:text-lg font-black tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {yLabel(retirementBalance)}
            </div>
          </div>
        </div>

        {/* Card 2: 연 수익 vs 인출 */}
        <div className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-lg flex flex-col justify-center relative overflow-hidden transition-all duration-300 h-20 sm:h-24 ${
          isDark 
            ? "bg-slate-900 border-slate-800/80 text-white" 
            : "bg-white border-slate-200 text-slate-800 shadow-sm"
        }`}>
          <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#696FC7]"></div>
          <div className="pl-1 sm:pl-0">
            <div className={`text-[8px] xs:text-[9px] sm:text-[10px] font-black tracking-tight sm:tracking-wider uppercase mb-0.5 sm:mb-1 flex items-center ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`}>
              <TrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" />
              첫해 수익 vs 인출
            </div>
            <div className={`text-[10px] xs:text-xs sm:text-base md:text-lg font-black tracking-tight ${
              firstYearGainVsWithdraw >= 0 ? "text-[#696FC7]" : "text-[#F2AEBB]"
            }`}>
              {firstYearGainVsWithdraw >= 0 ? "+" : ""}
              {yLabel(firstYearGainVsWithdraw)}
            </div>
          </div>
        </div>

        {/* Card 3: 소진 예상 나이 */}
        <div className={`border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-lg flex flex-col justify-center relative overflow-hidden transition-all duration-300 h-20 sm:h-24 ${
          isDark 
            ? "bg-slate-900 border-slate-800/80 text-white" 
            : "bg-white border-slate-200 text-slate-800 shadow-sm"
        }`}>
          <div className={`absolute top-0 left-0 w-1 sm:w-1.5 h-full ${
            isLifetimeAnnuity ? "bg-emerald-500" : "bg-[#F2AEBB]"
          }`}></div>
          <div className="pl-1 sm:pl-0">
            <div className={`text-[8px] xs:text-[9px] sm:text-[10px] font-black tracking-tight sm:tracking-wider uppercase mb-0.5 sm:mb-1 flex items-center ${
              isLifetimeAnnuity 
                ? "text-emerald-500" 
                : isDark ? "text-[#F2AEBB]" : "text-[#696FC7]"
            }`}>
              <AlertCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" />
              소진 예상 나이
            </div>
            <div className={`text-[10px] xs:text-xs sm:text-base md:text-lg font-black tracking-tight ${
              isLifetimeAnnuity 
                ? "text-emerald-500" 
                : depleteAge !== null ? "text-[#F2AEBB]" : "text-[#696FC7]"
            }`}>
              {isLifetimeAnnuity ? (
                "종신보장"
              ) : depleteAge !== null ? (
                `${depleteAge}세 소진`
              ) : (
                "소진 없음"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Metric Grid Rows & Tax Split Breakdown Details Section */}
      <div className={`border rounded-2xl p-4 transition-all duration-305 ${
        isDark 
          ? "bg-slate-900/40 border-slate-800/80 text-white" 
          : "bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
      }`}>
        <h4 className={`text-xs font-black mb-3 uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-700"}`}>
          세부 자산 통계 지표
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-200"}`}>
            <div className={`text-[10px] font-bold mb-1 flex items-center ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              <Clock className="w-3 h-3 mr-1 text-indigo-400" />
              자산 적립 기간
            </div>
            <div className={`text-xs font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {accumulationYears}년 적립
            </div>
            <p className="text-[9px] text-slate-400 mt-1 leading-none">{inputs.startAge}세 ~ {inputs.endAge}세 (납입: {inputs.depositYears}년)</p>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-200"}`}>
            <div className={`text-[10px] font-bold mb-1 flex items-center ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              <Percent className="w-3 h-3 mr-1 text-indigo-400" />
              수령인출 비율 (SWR)
            </div>
            <div className={`text-xs font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {withdrawalRatio.toFixed(2)}%
            </div>
            <p className="text-[9px] text-slate-400 mt-1 leading-none">연 수령액 / 개시시점 잔액</p>
          </div>

          <div className={`p-3 rounded-xl border col-span-2 md:col-span-1 border-indigo-500/10 ${
            isDark ? "bg-indigo-550/5" : "bg-indigo-50/50"
          }`}>
            <div className="text-[10px] font-bold mb-1 flex items-center text-indigo-500">
              <ShieldCheck className="w-3 h-3 mr-1 text-indigo-500 animate-pulse" />
              세후 연 실수령액
            </div>
            <div className="text-sm font-black text-indigo-500 font-mono">
              {yLabel(computedAfterTax)}
            </div>
            <div className="text-[9px] text-slate-400 mt-1 leading-none">
              내부 연 수령액 대비 실수령 합산액
            </div>
          </div>
        </div>

        {/* Live Tax Split Analysis Block */}
        <div className={`mt-4 p-3.5 rounded-xl border transition-all ${
          isDark 
            ? "bg-slate-950/65 border-slate-800/80" 
            : "bg-white border-slate-200 shadow-2xs"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-indigo-500 flex items-center">
              <Coins className="w-3.5 h-3.5 mr-1.5" />
              {isNonTaxable 
                ? "실시간 연금 비과세 요건 및 세법 적용 정보" 
                : isHybrid 
                  ? "하이브리드 세법 적용 상세 (종신 연금소득세율 적용)" 
                  : "실시간 세법 적용 상세 계산식 (1,500만원 초과 분리과세 적용)"}
            </span>
            <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
              isDark 
                ? "bg-slate-900 border border-slate-800 text-slate-400" 
                : "bg-slate-50 border border-slate-200 text-slate-500"
            }`}>
              {isNonTaxable 
                ? "연금보험 비과세 적용" 
                : isHybrid 
                  ? "종신형 3.3% 저율 단일과세" 
                  : `개시시점 ${startAge}세 세법 기준`}
            </span>
          </div>

          {isNonTaxable ? (
            <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              세제비적격 연금보험은 납입 원금에 대해 소득세 감면환급을 받지 않는 대신, 관련 요건 충족 시 <strong>차익 전부에 대해 이자소득세 및 연금소득세를 전혀 부과하지 않습니다 (비과세율 0.0%)</strong>. 따라서 수령 한도 초과(연 1,500만원)에 따른 분리과세 및 종합과세 부담이 없어 고액 장기 수령 시 가장 세금 측면에서 유리합니다.
            </p>
          ) : isHybrid ? (
            <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              하이브리드 방식은 적립기에 가입한 세제적격 자산을 연금개시 후 즉시 <strong>보험사 종신연금형</strong>으로 수령하기 때문에, 세법상 연 1,500만원 이하 구간은 <strong>종신 저율과세 3.3%</strong>가 부과되고 초과 금액에 한해서 <strong>16.5% 분리과세</strong>가 연동 처리되어 실용적인 절세 통계를 달성할 수 있습니다.
            </p>
          ) : (
            <p className={`text-[10px] leading-relaxed mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              현행 세법 기준 연 연금 수령 총액이 <strong className="font-semibold text-[#696FC7]">1,500만원 이하</strong>일 경우에는 연령에 부합하는 연금소득세율
              (<strong className="font-semibold text-[#696FC7]">{baseRate}%</strong>)만 단순 차감되지만, <strong className="font-semibold text-[#F2AEBB]">1,500만원을 초과</strong>하는 수령액 전부에 대해서는 초과분 분리과세율
              (<strong className="font-semibold text-[#F2AEBB]">16.5%</strong>)가 적용되어 세후 수령액이 계산됩니다.
            </p>
          )}

          <div className="space-y-2">
            {isNonTaxable ? (
              <div className={`p-3 rounded-lg border text-center ${isDark ? "bg-indigo-500/5 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"}`}>
                <div className="text-[11px] font-black text-indigo-500 mb-1">🎉 세금 부담액 0원 (비과세 100%)</div>
                <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  세제비적격 요건을 충족하여 연 인출 총액인 <strong>{yLabel(effectiveAnnualWithdrawal)}</strong> 전액 고스란히 세후 실수령액으로 보전됩니다. 
                </div>
              </div>
            ) : isHybrid ? (
              <>
                <div className={`p-3 rounded-lg border text-left ${isDark ? "bg-[#A7AAE1]/5 border-[#A7AAE1]/20" : "bg-indigo-50/50 border-indigo-100"}`}>
                  <div className="text-[11px] font-black text-[#A7AAE1] mb-1">🛡️ 종신연금 저율과세(3.3%) 및 초과분 분리과세 적용 완료</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-200" : "text-slate-600"} leading-relaxed`}>
                    연 1,500만원 이하 수령분에 대해서는 <strong>3.3%</strong> 우대세율이 적용되며, 1,500만원 초과분에 대해서는 <strong>16.5%</strong> 분리과세가 적용됩니다. <br/>
                    연 수령액 <strong>{yLabel(effectiveAnnualWithdrawal)}</strong> 수령 시, 매년 실제 차감 세액은 종합소득세 합산 없이 <strong>{yLabel(totalTax)}</strong>으로 대폭 절감됩니다.
                  </div>
                </div>
                {/* Total formula summary block */}
                <div className={`p-2.5 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isDark ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    <span className={isDark ? "text-slate-300" : "text-slate-600"}>연 수령액 {yLabel(effectiveAnnualWithdrawal)}</span>
                    <span className="text-slate-400">－</span>
                    <span className="text-rose-500 font-mono">총 세금계산 {yLabel(totalTax)}</span>
                    <span className="text-slate-400">({yLabel(baseTax)} + {yLabel(excessTax)})</span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <ArrowRight className="w-3 h-3 mr-1 text-indigo-400" />
                      실수령
                    </span>
                    <span className="text-xs font-black text-indigo-400 font-mono">{yLabel(computedAfterTax)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Calculation Breakdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Portion 1: Up to 1,500 Manwon */}
                  <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-150"
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-indigo-400">① 1,500만원 이하분 (연령별 과세)</span>
                        <span className={`text-[9px] font-black font-mono px-1 rounded ${
                          isDark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {baseRate}% 적용
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mt-1.5">
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>과세 과표구간</span>
                        <span className={isDark ? "text-slate-200" : "text-slate-800"}>{yLabel(basePortion)}</span>
                      </div>
                    </div>
                    <div className={`flex justify-between text-[10px] font-semibold mt-2 border-t pt-1.5 ${
                      isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200 text-slate-400"
                    }`}>
                      <span>연금소득세액</span>
                      <span className="text-red-400 font-mono">-{yLabel(baseTax)}</span>
                    </div>
                  </div>

                  {/* Portion 2: Excess over 1,500 Manwon */}
                  <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-150"
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-[#F2AEBB]">② 1,500만원 초과분 (분리과세)</span>
                        <span className={`text-[9px] font-black font-mono px-1 rounded ${
                          isOver1500 ? "bg-[#F2AEBB]/15 text-[#F2AEBB]" : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-400"
                        }`}>
                          16.5% 적용
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mt-1.5">
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>과세 과표구간</span>
                        <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                          {isOver1500 ? yLabel(excessPortion) : "0원 (초과 없음)"}
                        </span>
                      </div>
                    </div>
                    <div className={`flex justify-between text-[10px] font-semibold mt-2 border-t pt-1.5 ${
                      isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200 text-slate-400"
                    }`}>
                      <span>분리과세액 (16.5%)</span>
                      <span className={`${isOver1500 ? "text-red-400 font-mono" : "text-slate-500"}`}>
                        {isOver1500 ? `-${yLabel(excessTax)}` : "0원"}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Total formula summary block */}
                <div className={`p-2.5 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isDark ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    <span className={isDark ? "text-slate-300" : "text-slate-600"}>연 수령액 {yLabel(effectiveAnnualWithdrawal)}</span>
                    <span className="text-slate-400">－</span>
                    <span className="text-rose-500 font-mono">총 세금계산 {yLabel(totalTax)}</span>
                    <span className="text-slate-400">({yLabel(baseTax)} + {yLabel(excessTax)})</span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <ArrowRight className="w-3 h-3 mr-1 text-indigo-400" />
                      실수령
                    </span>
                    <span className="text-xs font-black text-indigo-400 font-mono">{yLabel(computedAfterTax)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const isOver1505 = true;

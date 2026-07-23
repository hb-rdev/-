import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { SimulationInputs, SimulationResult } from "../types";
import { yLabel } from "../utils";

interface ComparisonCardsProps {
  fundResult: SimulationResult;
  nonTaxableResult: SimulationResult;
  hybridResult: SimulationResult;
  inputs: SimulationInputs;
  theme?: "dark" | "light";
  showHybrid?: boolean;
}

export default function ComparisonCards({
  fundResult,
  nonTaxableResult,
  hybridResult,
  inputs,
  theme = "light",
  showHybrid = true,
}: ComparisonCardsProps) {
  const isDark = theme === "dark";

  // Total principal paid across all three simulations (since it's a common condition)
  const totalPrincipal = inputs.monthlyDeposit * 12 * inputs.depositYears;

  // Helper for formatting value in Korean billions (Modified from '억' to '억원' as explicitly requested)
  const formatEok = (v: number): string => {
    if (v <= 0) return "0원";
    if (v < 10000) {
      return `${Math.round(v)}만원`;
    }
    const eok = v / 10000;
    return `${eok.toFixed(1)}억원`;
  };

  // Combine all three simulation results into a timeline for the growth chart
  const growthTimeline = useMemo(() => {
    const data = [];
    const minAge = inputs.startAge;
    const maxAge = inputs.endAge;
    
    for (let age = minAge; age <= maxAge; age++) {
      const fundTimelineItem = fundResult.timeline.find((t) => t.age === age) || { balance: fundResult.retirementBalance, principal: totalPrincipal };
      const insuranceTimelineItem = nonTaxableResult.timeline.find((t) => t.age === age) || { balance: nonTaxableResult.retirementBalance, principal: totalPrincipal };
      const hybridTimelineItem = hybridResult.timeline.find((t) => t.age === age) || { balance: hybridResult.retirementBalance, principal: totalPrincipal };

      const fBal = age === maxAge ? fundResult.retirementBalance : fundTimelineItem.balance;
      const nBal = age === maxAge ? nonTaxableResult.retirementBalance : insuranceTimelineItem.balance;
      const hBal = age === maxAge ? hybridResult.retirementBalance : hybridTimelineItem.balance;

      const fPrincipal = age === maxAge ? totalPrincipal : (fundTimelineItem.principal ?? totalPrincipal);
      const nPrincipal = age === maxAge ? totalPrincipal : (insuranceTimelineItem.principal ?? totalPrincipal);

      data.push({
        age: `${age}세`,
        fund: Math.round(fBal),
        insurance: Math.round(nBal),
        hybrid: Math.round(hBal),
        fundPrincipal: fPrincipal,
        insurancePrincipal: nPrincipal,
      });
    }
    return data;
  }, [fundResult, nonTaxableResult, hybridResult, inputs.startAge, inputs.endAge, totalPrincipal]);

  // Generate X-axis ticks starting from inputs.startAge, then subsequent 5-year multiples, up to endAge
  const growthXTicks = useMemo(() => {
    const ticks: number[] = [inputs.startAge];
    let current = Math.floor(inputs.startAge / 5) * 5 + 5;
    while (current <= inputs.endAge) {
      if (!ticks.includes(current)) {
        ticks.push(current);
      }
      current += 5;
    }
    if (!ticks.includes(inputs.endAge)) {
      ticks.push(inputs.endAge);
    }
    return ticks.sort((a, b) => a - b).map((age) => `${age}세`);
  }, [inputs.startAge, inputs.endAge]);

  // Combined payout comparison bar chart data
  const barData = useMemo(() => {
    const fundPre = fundResult.preTaxWithdrawal;
    const fundPost = fundResult.afterTaxWithdrawal;
    const fundTax = Math.max(0, fundPre - fundPost);

    const nonTaxablePre = nonTaxableResult.preTaxWithdrawal;
    const nonTaxablePost = nonTaxableResult.afterTaxWithdrawal;
    const nonTaxableTax = Math.max(0, nonTaxablePre - nonTaxablePost);

    const hybridPre = hybridResult.preTaxWithdrawal;
    const hybridPost = hybridResult.afterTaxWithdrawal;
    const hybridTax = Math.max(0, hybridPre - hybridPost);

    const data = [
      {
        name: "연금저축펀드",
        afterTax: Math.round(fundPost),
        tax: Math.round(fundTax),
        preTax: Math.round(fundPre),
      },
      {
        name: "연금보험",
        afterTax: Math.round(nonTaxablePost),
        tax: Math.round(nonTaxableTax),
        preTax: Math.round(nonTaxablePre),
      },
    ];

    if (showHybrid) {
      data.push({
        name: "하이브리드",
        afterTax: Math.round(hybridPost),
        tax: Math.round(hybridTax),
        preTax: Math.round(hybridPre),
      });
    }

    return data;
  }, [fundResult, nonTaxableResult, hybridResult, showHybrid]);

  // Compute clean Y-axis ticks and domain for the post-tax withdrawal comparison bar chart
  const barChartYAxisProps = useMemo(() => {
    const maxVal = Math.max(...barData.map((d) => d.preTax), 0);
    if (maxVal <= 0) {
      return { domain: [0, 500], ticks: [0, 100, 200, 300, 400, 500] };
    }

    // Determine an appropriate step size (in '만' won, i.e., unit of 10,000 KRW)
    // Standard step sizes in '만' won:
    // 50 (50만), 100 (100만), 200 (200만), 500 (500만), 1000 (1000만), 2000 (2000만), 5000 (5000만), 10000 (1억)
    let step = 100; // default 100만
    if (maxVal <= 500) {
      step = 100; // 100만 steps
    } else if (maxVal <= 1000) {
      step = 200; // 200만 steps
    } else if (maxVal <= 2500) {
      step = 500; // 500만 steps
    } else if (maxVal <= 5000) {
      step = 1000; // 1000만 steps
    } else if (maxVal <= 10000) {
      step = 2000; // 2000만 steps
    } else if (maxVal <= 25000) {
      step = 5000; // 5000만 steps
    } else {
      step = 10000; // 1억 steps
    }

    const maxTick = Math.ceil(maxVal / step) * step;
    const ticks: number[] = [];
    for (let i = 0; i <= maxTick; i += step) {
      ticks.push(i);
    }

    return {
      domain: [0, maxTick],
      ticks,
    };
  }, [barData]);

  // Dynamic sum of after-tax payouts up to 85세
  const getCumulativePayoutAt85 = (res: SimulationResult) => {
    const sum = res.timeline
      .filter((t) => !t.isAccumulation && t.age <= 85)
      .reduce((acc, cur) => acc + cur.withdrawnAfterTax, 0);
    return sum;
  };

  const fundPayout85 = useMemo(() => getCumulativePayoutAt85(fundResult), [fundResult]);
  const insurancePayout85 = useMemo(() => getCumulativePayoutAt85(nonTaxableResult), [nonTaxableResult]);
  const hybridPayout85 = useMemo(() => getCumulativePayoutAt85(hybridResult), [hybridResult]);

  const maxPayout85 = useMemo(() => {
    return Math.max(fundPayout85, insurancePayout85, showHybrid ? hybridPayout85 : 0, 1);
  }, [fundPayout85, insurancePayout85, hybridPayout85, showHybrid]);

  return (
    <div className="space-y-6">
      {/* 1. 은퇴 시점 적립금 SECTION */}
      <div className="space-y-3 mt-4 text-left">
        <h3 className={`text-sm font-extrabold tracking-tight text-left ${isDark ? "text-slate-100" : "text-slate-800"}`}>
          은퇴 시점 적립금
        </h3>
        <div className={`grid grid-cols-1 ${showHybrid ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 lg:gap-6`}>
          {/* Card 1: 연금저축펀드 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark 
              ? "bg-slate-900 border-slate-800 shadow-md text-white" 
              : "bg-white border-slate-200 shadow-3xs text-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>연금저축펀드</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#355c7d]/10 border border-[#355c7d]/20 text-[#355c7d] dark:bg-[#355c7d]/20 dark:text-blue-300">펀드형</span>
            </div>
            <div className="flex items-baseline gap-1.5 overflow-hidden">
              <span className={`text-3xl font-black tracking-tight font-mono ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                {formatEok(fundResult.retirementBalance)}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans shrink-0">
                ({totalPrincipal > 0 ? Math.round((fundResult.retirementBalance / totalPrincipal) * 100) : 0}%)
              </span>
            </div>
            
            {/* Card contents - Organized strictly as requested */}
            <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>투자원금</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatEok(totalPrincipal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>수익률</span>
                <span className="font-mono text-[#355c7d] dark:text-blue-400">투자수익률 {inputs.ratePre.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>세제혜택</span>
                <span className="font-mono text-[#355c7d] dark:text-blue-400">세액공제 재투자 +{formatEok(fundResult.reinvestmentEffect)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: 세제비적격 연금보험 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark 
              ? "bg-slate-900 border-slate-800 shadow-md text-white" 
              : "bg-white border-slate-200 shadow-3xs text-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>세제비적격 연금보험</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#f67280]/10 border border-[#f67280]/20 text-[#f67280] dark:bg-[#f67280]/20 dark:text-rose-305">보험형</span>
            </div>
            <div className="flex items-baseline gap-1.5 overflow-hidden">
              <span className={`text-3xl font-black tracking-tight font-mono ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                {formatEok(nonTaxableResult.retirementBalance)}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans shrink-0">
                ({totalPrincipal > 0 ? Math.round((nonTaxableResult.retirementBalance / totalPrincipal) * 100) : 0}%)
              </span>
            </div>
            
            {/* Card contents - Organized strictly as requested */}
            <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>투자원금</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatEok(totalPrincipal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>수익률</span>
                <span className="font-mono text-[#f67280] dark:text-rose-400">공시이율 {inputs.rateInsurance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>세제혜택</span>
                <span className="font-mono text-[#f67280] dark:text-rose-450">이자소득세 비과세</span>
              </div>
            </div>
          </div>

          {/* Card 3: 하이브리드 전환형 */}
          {showHybrid && (
            <div className={`p-6 rounded-2xl border transition-all ${
              isDark 
                ? "bg-slate-900 border-slate-800 shadow-md text-white" 
                : "bg-white border-slate-200 shadow-3xs text-slate-800"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>하이브리드 전환형</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#6C5B7B]/15 border border-[#6C5B7B]/20 text-[#6C5B7B] dark:bg-[#6C5B7B]/25 dark:text-[#ac9dbf]">복합형</span>
              </div>
              <div className="flex items-baseline gap-1.5 overflow-hidden">
                <span className={`text-3xl font-black tracking-tight font-mono ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                  {formatEok(hybridResult.retirementBalance)}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans shrink-0">
                  ({totalPrincipal > 0 ? Math.round((hybridResult.retirementBalance / totalPrincipal) * 100) : 0}%)
                </span>
              </div>
              
              {/* Card contents - Organized strictly as requested */}
              <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>투자원금</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatEok(totalPrincipal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>수익률</span>
                  <span className="font-mono text-[#6C5B7B] dark:text-[#ac9dbf]">투자수익률 {inputs.ratePre.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>세제혜택</span>
                  <span className="font-mono text-[#6C5B7B] dark:text-[#ac9dbf]">세액공제 재투자 +{formatEok(hybridResult.reinvestmentEffect)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CHARTS SIDE-BY-SIDE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left: 적립금 성장 추이 LineChart */}
        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-3xs"}`}>
          <h3 className={`text-sm font-extrabold mb-1.5 text-left ${isDark ? "text-slate-50" : "text-slate-850"}`}>
            적립금 성장 추이
          </h3>
          {/* Custom HTML Legend using Palette Colors */}
          <div className="flex items-center gap-4 mb-4 text-[11px] font-bold">
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded bg-[#355c7d] mr-1.5 shrink-0" />
              <span className={isDark ? "text-slate-400" : "text-slate-550"}>연금저축</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded bg-[#f67280] mr-1.5 shrink-0" />
              <span className={isDark ? "text-slate-400" : "text-slate-550"}>연금보험</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthTimeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#edf2f7"} />
                <XAxis dataKey="age" ticks={growthXTicks} interval={0} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#4a5568" }} />
                <YAxis width={65} tickLine={false} axisLine={false} tickFormatter={(v) => formatEok(v)} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#4a5568" }} />
                <Tooltip
                  cursor={{ stroke: isDark ? "#334155" : "#e2e8f0", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const fundVal = payload[0].payload.fund;
                      const fundPrinc = payload[0].payload.fundPrincipal;
                      const fundPct = fundPrinc > 0 ? (fundVal / fundPrinc) * 100 : 0;

                      const insVal = payload[0].payload.insurance;
                      const insPrinc = payload[0].payload.insurancePrincipal;
                      const insPct = insPrinc > 0 ? (insVal / insPrinc) * 100 : 0;

                      return (
                        <div className={`p-3 rounded-lg border text-xs shadow-lg text-left ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-855"
                        }`}>
                          <p className="font-extrabold mb-1">{payload[0].payload.age}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between space-x-6">
                              <span className="text-[#355c7d] font-bold">연금저축:</span>
                              <span className="font-mono font-semibold">
                                {yLabel(fundVal)}
                                <span className={`text-[10px] ml-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  ({fundPct.toFixed(1)}%)
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between space-x-6">
                              <span className="text-[#f67280] font-bold">연금보험:</span>
                              <span className="font-mono font-semibold">
                                {yLabel(insVal)}
                                <span className={`text-[10px] ml-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  ({insPct.toFixed(1)}%)
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="fund" stroke="#355c7d" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} name="연금저축" />
                <Line type="monotone" dataKey="insurance" stroke="#f67280" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} name="연금보험" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 세후 연 수령액 비교 Stacked BarChart */}
        <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-3xs"}`}>
          <h3 className={`text-sm font-extrabold mb-1.5 text-left ${isDark ? "text-slate-50" : "text-slate-850"}`}>
            세후 연 수령액 비교
          </h3>
          {/* Custom HTML Legend using Palette Colors & light gray for tax */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-[11px] font-bold">
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded bg-[#355c7d] mr-1.5 shrink-0" />
              <span className={isDark ? "text-slate-400" : "text-slate-550"}>연금저축</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded bg-[#f67280] mr-1.5 shrink-0" />
              <span className={isDark ? "text-slate-400" : "text-slate-550"}>연금보험</span>
            </div>
            {showHybrid && (
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded bg-[#6C5B7B] mr-1.5 shrink-0" />
                <span className={isDark ? "text-slate-400" : "text-slate-550"}>하이브리드</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 rounded bg-[#cbd5e1] mr-1.5 shrink-0" />
              <span className={isDark ? "text-slate-400" : "text-slate-550"}>세금</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#edf2f7"} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#4a5568" }} />
                <YAxis
                  width={55}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}만`}
                  tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#4a5568" }}
                  ticks={barChartYAxisProps.ticks}
                  domain={barChartYAxisProps.domain}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "#1e293b" : "#f8fafc", opacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isFund = data.name === "연금저축펀드";
                      const isInsurance = data.name === "연금보험";
                      const colorClass = isFund ? "text-[#355c7d]" : isInsurance ? "text-[#f67280]" : "text-[#6C5B7B]";
                      return (
                        <div className={`p-3 rounded-lg border text-xs shadow-lg ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-855"
                        }`}>
                          <p className="font-extrabold mb-1">{data.name}</p>
                          <div className="space-y-1">
                            <div className={`flex justify-between space-x-6 ${colorClass} font-bold`}>
                              <span>세후 실수령:</span>
                              <span>{yLabel(data.afterTax)}</span>
                            </div>
                            <div className="flex justify-between space-x-6 text-slate-500 font-bold">
                              <span>세금:</span>
                              <span>{yLabel(data.tax)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="afterTax" stackId="a">
                  <Cell fill="#355c7d" /> {/* Deep slate blue */}
                  <Cell fill="#f67280" /> {/* Peach rose */}
                  {showHybrid && <Cell fill="#6C5B7B" />} {/* Muted purple-grey hybrid */}
                </Bar>
                <Bar dataKey="tax" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. 수령 구조 · 보장 안정성 SECTION */}
      <div className="space-y-3 mt-6 text-left">
        <h3 className={`text-sm font-extrabold tracking-tight text-left ${isDark ? "text-slate-100" : "text-slate-800"}`}>
          수령 구조 · 보장 안정성
        </h3>
        
        <div className={`grid grid-cols-1 ${showHybrid ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 lg:gap-6`}>
          {/* Card 1: 연금저축펀드 */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800 shadow-3xs"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-black ${isDark ? "text-slate-100" : "text-slate-900"} tracking-tight`}>연금저축펀드</span>
              </div>

              {/* Rows */}
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>세후 연 수령액</span>
                  <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(fundResult.afterTaxWithdrawal).toLocaleString()}만원/년</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>월 환산</span>
                  <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(fundResult.afterTaxWithdrawal / 12).toLocaleString()}만원/월</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>예상 수령 기간</span>
                  <span className={`font-black text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {fundResult.depleteAge === null || fundResult.depleteAge > 100 
                      ? "평생 (무고갈)" 
                      : `${fundResult.depleteAge - inputs.endAge}년 후 소진`
                    }
                  </span>
                </div>
                
                {/* Cumulative with Progress-Bar */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className={isDark ? "text-slate-400" : "text-slate-555"}>85세 기준 총 수령액</span>
                    <span className="font-black font-mono text-[13px] text-[#355c7d] dark:text-blue-300">{formatEok(fundPayout85)}</span>
                  </div>
                  {/* Custom horizontal comparator bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#355c7d] rounded-full transition-all duration-500" 
                      style={{ width: `${(fundPayout85 / maxPayout85) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-5 pt-3 border-t text-[11px] font-bold text-left ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-455"}`}>
              {fundResult.depleteAge === null || fundResult.depleteAge > 100 
                ? "소진되지 않고 전액 가상 상속 가능" 
                : `${fundResult.depleteAge}세 소진 예상`
              }
            </div>
          </div>

          {/* Card 2: 세제비적격 연금보험 */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800 shadow-3xs"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-black ${isDark ? "text-slate-100" : "text-slate-900"} tracking-tight`}>세제비적격 연금보험</span>
              </div>

              {/* Rows */}
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>세후 연 수령액</span>
                  <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(nonTaxableResult.afterTaxWithdrawal).toLocaleString()}만원/년</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>월 환산</span>
                  <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(nonTaxableResult.afterTaxWithdrawal / 12).toLocaleString()}만원/월</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className={isDark ? "text-slate-400" : "text-slate-555"}>수령 보장</span>
                  <span className={`font-black text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {inputs.payoutMethod === "lifetime" ? "평생 (사망 시까지)" : `${inputs.fixedTerm}년 확정지급`}
                  </span>
                </div>
                
                {/* Cumulative with Progress-Bar */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className={isDark ? "text-slate-400" : "text-slate-555"}>85세 기준 총 수령액</span>
                    <span className="font-black font-mono text-[13px] text-[#f67280] dark:text-rose-300">{formatEok(insurancePayout85)}</span>
                  </div>
                  {/* Custom horizontal comparator bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#f67280] rounded-full transition-all duration-500" 
                      style={{ width: `${(insurancePayout85 / maxPayout85) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-5 pt-3 border-t text-[11px] font-bold text-left ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-455"}`}>
              비과세 — 세전 = 세후 실수령
            </div>
          </div>

          {/* Card 3: 하이브리드 전환형 */}
          {showHybrid && (
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800 shadow-3xs"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-black ${isDark ? "text-slate-100" : "text-slate-900"} tracking-tight`}>하이브리드 전환형</span>
                </div>

                {/* Rows */}
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between items-center py-0.5">
                    <span className={isDark ? "text-slate-400" : "text-slate-555"}>세후 연 수령액</span>
                    <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(hybridResult.afterTaxWithdrawal).toLocaleString()}만원/년</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className={isDark ? "text-slate-400" : "text-slate-555"}>월 환산</span>
                    <span className={`font-black font-mono text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{Math.round(hybridResult.afterTaxWithdrawal / 12).toLocaleString()}만원/월</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className={isDark ? "text-slate-400" : "text-slate-555"}>수령 보장</span>
                    <span className={`font-black text-[13px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>평생 (사망 시까지)</span>
                  </div>
                  
                  {/* Cumulative with Progress-Bar */}
                  <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className={isDark ? "text-slate-400" : "text-slate-555"}>85세 기준 총 수령액</span>
                      <span className="font-black font-mono text-[13px] text-[#6C5B7B] dark:text-[#ac9dbf]">{formatEok(hybridPayout85)}</span>
                    </div>
                    {/* Custom horizontal comparator bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6C5B7B] rounded-full transition-all duration-500" 
                        style={{ width: `${(hybridPayout85 / maxPayout85) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-5 pt-3 border-t text-[11px] font-bold text-left ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-455"}`}>
                연금저축 적립 후 종신보험 전환
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
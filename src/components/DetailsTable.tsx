import React, { useState } from "react";
import { SimulationResult } from "../types";
import { yLabel } from "../utils";
import { Table, Download, Eye, EyeOff, CalendarRange } from "lucide-react";

interface DetailsTableProps {
  timeline: SimulationResult["timeline"];
  theme?: "dark" | "light";
}

export default function DetailsTable({ timeline, theme = "light" }: DetailsTableProps) {
  const [showFull, setShowFull] = useState(false);
  const isDark = theme === "dark";

  // Filter to show a concise summary or full table
  const displayedTimeline = showFull ? timeline : timeline.filter((_, idx) => idx % 3 === 0 || idx === timeline.length - 1);

  return (
    <div className={`border rounded-2xl p-5 space-y-4 transition-all duration-300 ${
      isDark 
        ? "bg-slate-900 border-slate-800/80 text-white" 
        : "bg-white border-slate-200 text-slate-800 shadow-md"
    }`}>
      <div className={`flex items-center justify-between border-b pb-3 flex-wrap gap-2 ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <div className="flex items-center space-x-2">
          <CalendarRange className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          <h3 className={`text-sm font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            연도별 세부 재무상태 원장
          </h3>
        </div>
        <button
          onClick={() => setShowFull(!showFull)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all text-xs font-bold focus:outline-none cursor-pointer border ${
            isDark 
              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300" 
              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 shadow-3xs"
          }`}
        >
          {showFull ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>간략히 보기</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>전체년도 보기</span>
            </>
          )}
        </button>
      </div>

      <div className={`overflow-x-auto rounded-xl border ${
        isDark ? "border-slate-800" : "border-slate-200"
      }`}>
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className={`border-b font-bold tracking-tight ${
              isDark 
                ? "bg-slate-950/70 text-slate-400 border-slate-800" 
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              <th className="p-2.5 text-center">나이</th>
              <th className="p-2.5 text-center">시기</th>
              <th className="p-2.5 text-right">기말 잔액</th>
              <th className="p-2.5 text-right">투자 추가입금</th>
              <th className="p-2.5 text-right">투자 연수익</th>
              <th className="p-2.5 text-right">세전 인출</th>
              <th className="p-2.5 text-right">세후 실수령</th>
              <th className="p-2.5 text-right">소득세금</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark ? "divide-slate-800/50" : "divide-slate-150"
          }`}>
            {displayedTimeline.map((item) => {
              const isZero = item.balance <= 0 && item.withdrawnPreTax === 0 && item.deposit === 0;
              return (
                <tr 
                  key={item.age} 
                  className={`transition-colors ${
                    isDark 
                      ? "hover:bg-slate-800/40" 
                      : "hover:bg-slate-50"
                  } ${
                    item.isAccumulation 
                      ? (isDark ? "bg-slate-900/10" : "bg-indigo-50/20") 
                      : (isDark ? "bg-emerald-950/5" : "bg-emerald-50/20")
                  } ${isZero ? "opacity-30" : ""}`}
                >
                  <td className={`p-2.5 text-center font-bold font-mono ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    {item.age}세
                  </td>
                  <td className="p-2.5 text-center">
                    {item.isAccumulation ? (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isDark 
                          ? "bg-[#A7AAE1]/10 text-indigo-300 border-[#A7AAE1]/10" 
                          : "bg-indigo-50 text-indigo-650 border-indigo-150"
                      }`}>
                        적립기
                      </span>
                    ) : (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isDark 
                          ? "bg-[#F5D3C4]/10 text-orange-300 border-[#F5D3C4]/10" 
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        인출기
                      </span>
                    )}
                  </td>
                  <td className={`p-2.5 text-right font-black font-mono ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {yLabel(item.balance)}
                  </td>
                  <td className={`p-2.5 text-right font-mono font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {item.isAccumulation ? (
                      <div className="flex flex-col text-right">
                        <span>+{item.deposit.toLocaleString()}만</span>
                        {item.refund > 0 && item.age > timeline[0].age && (
                          <span className={`${isDark ? "text-emerald-400" : "text-emerald-600"} text-[9px] font-bold`}>
                            (+환급 {item.refund.toFixed(0)}만)
                          </span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className={`p-2.5 text-right font-mono font-bold ${
                    isDark ? "text-indigo-300" : "text-indigo-600"
                  }`}>
                    {item.investmentReturn > 0 ? `+${yLabel(item.investmentReturn)}` : "0원"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-amber-500 font-bold">
                    {!item.isAccumulation && item.withdrawnPreTax > 0 ? `-${yLabel(item.withdrawnPreTax)}` : "-"}
                  </td>
                  <td className={`p-2.5 text-right font-mono font-black ${
                    isDark ? "text-[#F2AEBB]" : "text-[#ca5b72]"
                  }`}>
                    {!item.isAccumulation && item.withdrawnPreTax > 0 ? `${yLabel(item.withdrawnAfterTax)}` : "-"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-rose-400 font-medium">
                    {!item.isAccumulation && item.withdrawnTax > 0 ? `${yLabel(item.withdrawnTax)}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl p-2.5 border flex justify-between items-center text-[10px] select-none ${
        isDark 
          ? "bg-slate-950/30 border-slate-800 text-slate-500" 
          : "bg-slate-50 border-slate-200 text-slate-550"
      }`}>
        <span>※ 기말 잔액은 기중 납입, 지출 및 해당 연도 복리 수익이 정산 반영된 주주 최종 액수입니다.</span>
        {!showFull && <span className="font-bold text-indigo-500">3개년 주기 압축 출력 중</span>}
      </div>
    </div>
  );
}

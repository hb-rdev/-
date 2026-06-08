import React from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Chart1DataPoint, Chart2DataPoint } from "../types";
import { makeTickSet, niceMax, yLabel } from "../utils";

interface ChartsProps {
  chart1Data: Chart1DataPoint[];
  chart2Data: Chart2DataPoint[];
  startAge: number;
  endAge: number;
  theme?: "dark" | "light";
}

// Custom Tooltip for Chart 1 (Balance Breakdown over time)
const CustomChart1Tooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
    return (
      <div className={`p-3 rounded-lg text-xs leading-relaxed shadow-lg border transition-colors ${
        isDark 
          ? "bg-slate-950 border-slate-800 text-slate-100" 
          : "bg-white border-slate-200 text-slate-850 shadow-md"
      }`}>
        <p className={`font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{label}세 자산 구조</p>
        <div className="space-y-1">
          {payload.map((item: any) => (
            <div key={item.name} className="flex items-center justify-between space-x-6">
              <span className="flex items-center text-slate-500 font-semibold">
                <span className="w-2 h-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: item.fill }}></span>
                {item.name}
              </span>
              <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {yLabel(item.value)}
              </span>
            </div>
          ))}
          <div className={`border-t pt-1.5 mt-1.5 flex items-center justify-between font-black text-indigo-500 ${
            isDark ? "border-slate-800" : "border-slate-150"
          }`}>
            <span>자산 총잔액</span>
            <span className="font-mono">{yLabel(total)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Chart 2 (Withdrawal & Returns Flow)
const CustomChart2Tooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const afterTaxItem = payload.find((item: any) => item.dataKey === "afterTax");
    const taxItem = payload.find((item: any) => item.dataKey === "tax");
    const annualReturnItem = payload.find((item: any) => item.dataKey === "annualReturn");

    const afterTaxVal = afterTaxItem ? afterTaxItem.value : 0;
    const taxVal = taxItem ? taxItem.value : 0;
    const annualReturnVal = annualReturnItem ? annualReturnItem.value : 0;
    const preTaxTotal = afterTaxVal + taxVal;

    return (
      <div className={`p-3 rounded-lg text-xs leading-relaxed shadow-lg border transition-colors ${
        isDark 
          ? "bg-slate-950 border-slate-800 text-slate-100" 
          : "bg-white border-slate-200 text-slate-850 shadow-md"
      }`}>
        <p className={`font-black mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{label}세 연간 현금흐름</p>
        <div className="space-y-1">
          
          <div className="flex items-center justify-between space-x-6">
            <span className="flex items-center text-slate-500 font-bold">
              <span className="w-2 h-2 rounded-full mr-1.5 bg-[#696FC7]"></span>
              연 투자수익 (단독)
            </span>
            <span className="font-mono font-black text-[#696FC7]">
              {yLabel(annualReturnVal)}
            </span>
          </div>

          <div className={`border-t my-1 pt-1 ${isDark ? "border-slate-850" : "border-slate-150"}`}>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              연금 수령 / 인출 내역
            </span>
            <div className="flex items-center justify-between space-x-6">
              <span className="flex items-center text-slate-500 font-semibold">
                <span className="w-2 h-2 rounded-full mr-1.5 bg-[#F2AEBB]"></span>
                실수령액 (세후)
              </span>
              <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {yLabel(afterTaxVal)}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-6">
              <span className="flex items-center text-slate-500 font-semibold">
                <span className="w-2 h-2 rounded-full mr-1.5 bg-[#F5D3C4]"></span>
                연금소득세
              </span>
              <span className={`font-mono font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {yLabel(taxVal)}
              </span>
            </div>
          </div>

          <div className={`border-t pt-1.5 mt-1.5 flex items-center justify-between font-black text-[#696FC7] ${
            isDark ? "border-slate-800" : "border-slate-150"
          }`}>
            <span>세전 인출액 합계</span>
            <span className="font-mono">{yLabel(preTaxTotal)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function getFlexibleXTicks(start: number, end: number): number[] {
  const range = end - start;
  let step = 5;
  if (range > 40) {
    step = 10;
  } else if (range > 20) {
    step = 5;
  } else {
    step = 2;
  }

  const ticks: number[] = [start];
  let firstStepTick = Math.ceil((start + 1) / step) * step;
  if (firstStepTick === start) firstStepTick += step;

  for (let val = firstStepTick; val < end; val += step) {
    if (!ticks.includes(val)) {
      ticks.push(val);
    }
  }

  if (!ticks.includes(end)) {
    ticks.push(end);
  }

  return ticks.sort((a, b) => a - b).filter(v => v <= end);
}

function getNiceTicksAndMax(maxVal: number, targetTicks: number = 5): { ticks: number[]; max: number } {
  if (maxVal <= 0) {
    return { ticks: [0], max: 1000 };
  }
  const rawStep = maxVal / targetTicks;
  const log = Math.log10(rawStep);
  const magnitude = Math.pow(10, Math.floor(log));
  const normalized = rawStep / magnitude;

  let step: number;
  if (normalized < 1.5) {
    step = 1 * magnitude;
  } else if (normalized < 3) {
    step = 2 * magnitude;
  } else if (normalized < 7) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }

  // Keep step friendly for Korean currency milestones (milestones of 500, 1000, 2000, 5000, 10000, 20000, 50000 etc.)
  step = Math.max(100, Math.round(step / 100) * 100);

  const niceMaxVal = Math.ceil(maxVal / step) * step;
  const ticks: number[] = [];
  for (let val = 0; val <= niceMaxVal; val += step) {
    ticks.push(val);
  }

  return { ticks, max: niceMaxVal };
}

export default function Charts({ chart1Data, chart2Data, startAge, endAge, theme = "light" }: ChartsProps) {
  const isDark = theme === "dark";

  // Compute flexible nice max height and tick intervals dynamically to prevent crowding
  const maxValChart1 = Math.max(...chart1Data.map(d => d.total), 1000);
  const { ticks: chart1YTicks, max: maxValChart1Rounded } = getNiceTicksAndMax(maxValChart1, 5);

  const startTicks = getFlexibleXTicks(startAge, 100);
  const endTicks = getFlexibleXTicks(endAge, 100); 

  const gridStroke = isDark ? "#1e293b" : "#edf2f7";
  const axisColor = isDark ? "#64748b" : "#4a5568";

  return (
    <div className="space-y-6">
      {/* Chart 1: 잔액 추이 */}
      <div className={`border rounded-2xl p-4 md:p-5 transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/60 border-slate-800/85 text-white" 
          : "bg-white border-slate-200 text-slate-800 shadow-md"
      }`}>
        <div className="mb-4">
          <h4 className={`text-sm font-black mb-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            차트 1: 자산 잔액 추이 (적립 + 은퇴 인출기합)
          </h4>
          <div className="text-[10px] text-slate-500 font-medium leading-relaxed flex flex-wrap items-center gap-x-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A7AAE1] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>납입 원금</span>
            </span>
            <span>+</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2AEBB] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>세액환급 재투자분</span>
            </span>
            <span>+</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#696FC7] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>투자수익</span>
            </span>
            <span>의 시간별 합산 잔액 추이</span>
          </div>
        </div>

        <div className="h-[280px] w-full" id="chart-balance-trend">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chart1Data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="age"
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                ticks={startTicks}
                interval={0}
              />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                ticks={chart1YTicks}
                interval={0}
                tickFormatter={(v) => {
                  if (v === 0) return "0원";
                  if (v < 10000) {
                    return `${v.toLocaleString()}만원`;
                  }
                  const eok = v / 10000;
                  return eok % 1 === 0 ? `${eok}억원` : `${eok.toFixed(1)}억원`;
                }}
                domain={[0, maxValChart1Rounded]}
              />
              <Tooltip content={<CustomChart1Tooltip isDark={isDark} />} cursor={{ fill: isDark ? "#1e293b" : "#f7fafc", opacity: 0.2 }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#4a5568" }}
              />
              <Bar dataKey="principal" stackId="a" fill="#A7AAE1" name="납입 원금" />
              <Bar dataKey="reinvested" stackId="a" fill="#F2AEBB" name="세액공제 재투자분" />
              <Bar dataKey="gains" stackId="a" fill="#696FC7" name="투자수익" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: 인출기 현금흐름 (은퇴 전용) */}
      <div className={`border rounded-2xl p-4 md:p-5 transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/60 border-slate-800/85 text-white" 
          : "bg-white border-slate-200 text-slate-800 shadow-md"
      }`}>
        <div className="mb-4">
          <h4 className={`text-sm font-black mb-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            차트 2: 은퇴 인출기 연간 현금흐름 (수익 vs 인출)
          </h4>
          <div className="text-[10px] text-slate-500 font-medium leading-relaxed flex flex-wrap items-center gap-x-1.5">
            <span>매년 발생하는</span>
            <span className="inline-flex items-center gap-1 mx-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#696FC7] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>연간 투자 수익</span>
            </span>
            <span>과, 실제로 수령하는 연금 수령액:</span>
            <span className="inline-flex items-center gap-1 mx-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2AEBB] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>실수령액(세후)</span>
            </span>
            <span>+</span>
            <span className="inline-flex items-center gap-1 mx-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5D3C4] inline-block"></span>
              <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>연금소득세</span>
            </span>
            <span>의 영역비교</span>
          </div>
        </div>

        {chart2Data.length === 0 ? (
          <div className={`h-[280px] flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed ${
            isDark 
              ? "bg-slate-950/20 border-slate-800 text-slate-500" 
              : "bg-slate-50 border-slate-250 text-slate-500"
          }`}>
            <span className="text-xs font-black">적립 중에는 인출기 현금 흐름 자료가 존재하지 않습니다.</span>
            <p className="text-[10px] text-slate-400 mt-1">시작 나이가 개시 나이보다 더 작을 때 활성화됩니다.</p>
          </div>
        ) : (
          <div className="h-[280px] w-full" id="chart-cash-flow">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chart2Data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#696FC7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#696FC7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="age"
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  ticks={endTicks}
                  interval={0}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v.toLocaleString()}만`}
                />
                <Tooltip content={<CustomChart2Tooltip isDark={isDark} />} cursor={{ stroke: "#696FC7", strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#4a5568" }}
                />
                <Area type="monotone" dataKey="annualReturn" stroke="#696FC7" fill="url(#colorReturn)" strokeWidth={2} name="연 투자수익 (단독)" />
                <Bar dataKey="afterTax" stackId="payout" fill="#F2AEBB" fillOpacity={0.3} name="실수령액 (세후)" />
                <Bar dataKey="tax" stackId="payout" fill="#F5D3C4" fillOpacity={0.3} name="연금소득세" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

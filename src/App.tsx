import React, { useState, useMemo } from "react";
import DeviceShell from "./components/DeviceShell";
import InputPanel from "./components/InputPanel";
import MetricsCards from "./components/MetricsCards";
import Charts from "./components/Charts";
import DetailsTable from "./components/DetailsTable";
import TaxGuide from "./components/TaxGuide";
import ComparisonPanel from "./components/ComparisonPanel";
import { SimulationInputs } from "./types";
import { runSimulation } from "./utils";
import { 
  Calculator, 
  BookOpen, 
  Table, 
  Zap, 
  RotateCcw, 
  CheckCircle,
  HelpCircle,
  PiggyBank,
  ShieldCheck,
  Scale,
  Save,
  Trash2,
  Database,
  Plus
} from "lucide-react";

interface SavedCase {
  id: string;
  name: string;
  inputs: SimulationInputs;
  isDefault?: boolean;
}

const DEFAULT_CASES: SavedCase[] = [
  {
    id: "case-default-1",
    name: "기본 조건 (월 50만 / 30세 / 8.0%)",
    inputs: {
      monthlyDeposit: 50,
      startAge: 30,
      endAge: 55,
      depositYears: 25,
      ratePre: 8.0,
      ratePost: 5.0,
      annualWithdrawal: 1500,
      reinvestTaxCredit: true,
      taxCreditRate: 13.2,
      simulationType: "fund",
      rateInsurance: 2.5,
      payoutMethod: "lifetime",
      fixedTerm: 10,
      annuityPayoutRate: 3.7,
      insuranceAnnuityRate: 3.7,
      illHealthEffect: 100,
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("compare");
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // State initialized with precise financial default values
  const [inputs, setInputs] = useState<SimulationInputs>({
    monthlyDeposit: 50,      // 만원
    startAge: 30,          // 세
    endAge: 55,            // 세
    depositYears: 25,      // 년
    ratePre: 8.0,         // %
    ratePost: 5.0,         // %
    annualWithdrawal: 1500, // 만원
    reinvestTaxCredit: true,
    taxCreditRate: 13.2,
    simulationType: "fund",
    rateInsurance: 2.5,
    payoutMethod: "lifetime",
    fixedTerm: 10,
    annuityPayoutRate: 3.7,
    insuranceAnnuityRate: 3.7,
    illHealthEffect: 100,
  });

  const [savedCases, setSavedCases] = useState<SavedCase[]>(() => {
    try {
      const stored = localStorage.getItem("saved_simulation_cases");
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Upgrade or replace the default case to the new requested defaults
          parsed = parsed.map((c) => {
            if (c.id === "case-default-1") {
              return DEFAULT_CASES[0];
            }
            return c;
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CASES;
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>("case-default-1");
  const [newCaseName, setNewCaseName] = useState("");

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = newCaseName.trim()
      ? newCaseName.trim()
      : `월 ${inputs.monthlyDeposit}만 / ${inputs.startAge}세 / ${inputs.ratePre.toFixed(1)}%`;

    const newCase: SavedCase = {
      id: `case-${Date.now()}`,
      name: nameToUse,
      inputs: { ...inputs },
    };

    const updated = [...savedCases, newCase];
    setSavedCases(updated);
    setSelectedCaseId(newCase.id);
    setNewCaseName("");
    try {
      localStorage.setItem("saved_simulation_cases", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCases.filter((c) => c.id !== id);
    setSavedCases(updated);
    if (selectedCaseId === id) {
      if (updated.length > 0) {
        setSelectedCaseId(updated[0].id);
        setInputs({ ...updated[0].inputs });
      } else {
        setSelectedCaseId(null);
      }
    }
    try {
      localStorage.setItem("saved_simulation_cases", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const isSameInputs = (a: SimulationInputs, b: SimulationInputs) => {
    return (
      a.monthlyDeposit === b.monthlyDeposit &&
      a.startAge === b.startAge &&
      a.endAge === b.endAge &&
      a.depositYears === b.depositYears &&
      a.ratePre === b.ratePre &&
      a.ratePost === b.ratePost &&
      a.annualWithdrawal === b.annualWithdrawal &&
      a.reinvestTaxCredit === b.reinvestTaxCredit &&
      a.taxCreditRate === b.taxCreditRate &&
      a.simulationType === b.simulationType &&
      a.rateInsurance === b.rateInsurance &&
      a.payoutMethod === b.payoutMethod &&
      a.fixedTerm === b.fixedTerm &&
      a.insuranceAnnuityRate === b.insuranceAnnuityRate &&
      a.illHealthEffect === b.illHealthEffect
    );
  };

  const handleInputChange = (newInputs: Partial<SimulationInputs>) => {
    setInputs((prev) => {
      const merged = { ...prev, ...newInputs };
      
      // Validation: 은퇴개시 나이는 무조건 시작 나이 이상이어야 함
      if (merged.endAge < merged.startAge) {
        merged.endAge = merged.startAge;
      }

      const maxDepositYears = Math.max(1, merged.endAge - merged.startAge);
      if (merged.depositYears > maxDepositYears) {
        merged.depositYears = maxDepositYears;
      }
      if (merged.depositYears < 1) {
        merged.depositYears = 1;
      }
      
      // Calculate annuityPayoutRate dynamically if insuranceAnnuityRate or illHealthEffect is updated
      if (newInputs.insuranceAnnuityRate !== undefined || newInputs.illHealthEffect !== undefined) {
        merged.annuityPayoutRate = parseFloat((merged.insuranceAnnuityRate * (merged.illHealthEffect / 100)).toFixed(3));
      }
      
      return merged;
    });
  };

  const handleReset = () => {
    setInputs({
      monthlyDeposit: 50,
      startAge: 30,
      endAge: 55,
      depositYears: 25,
      ratePre: 8.0,
      ratePost: 5.0,
      annualWithdrawal: 1500,
      reinvestTaxCredit: true,
      taxCreditRate: 13.2,
      simulationType: "fund",
      rateInsurance: 2.5,
      payoutMethod: "lifetime",
      fixedTerm: 10,
      annuityPayoutRate: 3.7,
      insuranceAnnuityRate: 3.7,
      illHealthEffect: 100,
    });
  };

  // Memoized simulation result
  const result = useMemo(() => {
    return runSimulation(inputs);
  }, [inputs]);

  // Map timeline data into plotting structures for Recharts
  const chart1Data = useMemo(() => {
    return result.timeline.map((p) => {
      if (p.age === inputs.endAge) {
        return {
          age: p.age,
          principal: result.retirementPrincipal,
          reinvested: result.retirementReinvested,
          gains: result.retirementGains,
          total: result.retirementBalance,
        };
      }
      return {
        age: p.age,
        principal: p.principal,
        reinvested: p.reinvested,
        gains: p.gains,
        total: p.balance,
      };
    });
  }, [result, inputs.endAge]);

  const chart2Data = useMemo(() => {
    return result.timeline
      .filter((p) => !p.isAccumulation)
      .map((p) => ({
        age: p.age,
        annualReturn: p.investmentReturn,
        afterTax: p.withdrawnAfterTax,
        tax: p.withdrawnTax,
        preTax: p.withdrawnPreTax,
      }));
  }, [result.timeline]);

  const isDark = theme === "dark";
  const showInsuranceNotice = inputs.simulationType === "hybrid" || (inputs.simulationType === "nonTaxable" && inputs.payoutMethod === "lifetime");

  return (
    <DeviceShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme={theme}
      onThemeChange={setTheme}
    >
      <div className={`flex-1 flex flex-col min-h-0 pb-16 transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}>
        {/* Inside App Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shadow-2xs sticky top-0 z-30 transition-colors ${
          isDark 
            ? "bg-slate-950 border-slate-800/80 text-white" 
            : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center space-x-2">
            <PiggyBank className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            <div>
              <span className={`text-[9px] font-black block leading-none uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                재무 설계 시뮬레이터
              </span>
              <h2 className={`text-sm font-black mt-0.5 leading-none ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}>
                연금저축펀드 시뮬레이터
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Real-time sync signal */}
            <span className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-black border uppercase tracking-wider ${
              isDark 
                ? "bg-[#696FC7]/15 text-[#A7AAE1] border-[#696FC7]/30" 
                : "bg-[#696FC7]/5 text-[#696FC7] border-[#696FC7]/20"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#696FC7] animate-pulse inline-block mr-0.5 animate-duration-1000"></span>
              자동연산 완료
            </span>
            <button
              onClick={handleReset}
              id="reset-simulation"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border focus:outline-none ${
                isDark 
                  ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200" 
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              title="초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Inner Tab View */}
        <div className="p-4 md:p-5 flex-1 min-h-0">
          {/* Simulation Cases Manager Widget */}
          <div className={`p-4 rounded-2xl border mb-6 transition-all duration-300 shadow-xs ${
            isDark 
              ? "bg-slate-900/60 border-slate-800" 
              : "bg-white border-slate-200"
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3 pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Database className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-650"}`} />
                <span className="text-xs font-black tracking-tight">시뮬레이션 케이스 데이터베이스</span>
                <span className="text-[10px] text-slate-450 font-medium">(조건을 수정하고 저장해 보세요)</span>
              </div>

              {/* Inline Save & Update Form */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="케이스 이름 입력/수정..."
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  className={`px-3 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 transition-all w-48 ${
                    isDark 
                      ? "bg-slate-955 border-slate-800 text-slate-250 focus:border-[#355c7d] focus:ring-[#355c7d]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#355c7d] focus:ring-[#355c7d]"
                  }`}
                />
                
                <button
                  type="button"
                  onClick={(e) => {
                    handleSaveCase(e as any);
                  }}
                  className="px-3 py-1 bg-[#355c7d] hover:bg-[#2c4c68] text-white text-[11px] font-black rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  title="현재 설정값으로 새로운 케이스를 저장합니다."
                >
                  <Plus className="w-3.5 h-3.5" />
                  새 케이스로 저장
                </button>

                {selectedCaseId && savedCases.some(c => c.id === selectedCaseId) && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = savedCases.map((c) => {
                        if (c.id === selectedCaseId) {
                          return {
                            ...c,
                            name: newCaseName.trim() ? newCaseName.trim() : c.name,
                            inputs: { ...inputs },
                          };
                        }
                        return c;
                      });
                      setSavedCases(updated);
                      setNewCaseName("");
                      try {
                        localStorage.setItem("saved_simulation_cases", JSON.stringify(updated));
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-3 py-1 bg-[#6C5B7B] hover:bg-[#5b4c6a] text-white text-[11px] font-black rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    title="현재 수치로 선택된 슬롯를 업데이트합니다. 입력창에 텍스트가 있으면 이름도 변경됩니다."
                  >
                    <Save className="w-3.5 h-3.5" />
                    선택 케이스 덮어쓰기 (수정)
                  </button>
                )}
              </div>
            </div>

            {/* Cases list */}
            <div className="flex flex-wrap gap-2">
              {savedCases.map((savedCase) => {
                const isActive = selectedCaseId === savedCase.id;
                return (
                  <div
                    key={savedCase.id}
                    onClick={() => {
                      setInputs({ ...savedCase.inputs });
                      setSelectedCaseId(savedCase.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#355c7d] border-[#2c4c68] text-white shadow-3xs hover:bg-[#2c4c68] hover:scale-[1.02]"
                        : isDark
                          ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-3xs"
                    }`}
                  >
                    <span className="truncate max-w-[280px]">{savedCase.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCase(savedCase.id, e)}
                      className={`p-0.5 rounded-md transition-colors ${
                        isActive
                          ? "text-slate-200 hover:text-white hover:bg-white/10"
                          : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      }`}
                      title="케이스 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {activeTab === "compare" && (
            <ComparisonPanel
              inputs={inputs}
              onInputChange={handleInputChange}
              theme={theme}
            />
          )}

          {activeTab === "simulator" && (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 lg:items-start">
              {/* Left Side: Inputs and settings */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-[76px]">
                {/* Dynamic sliders & inputs panel */}
                <InputPanel 
                  inputs={inputs} 
                  onInputChange={handleInputChange} 
                  retirementBalance={result.retirementBalance} 
                  annualRefund={result.annualRefundAmount}
                  reinvestmentEffect={result.reinvestmentEffect}
                  cumulativeRefund={result.cumulativeRefundTotal}
                  theme={theme}
                />
              </div>

              {/* Right Side: KPIs and Charts */}
              <div className="lg:col-span-8 space-y-4">
                {/* KPIs (Summary cards) */}
                <MetricsCards
                  retirementBalance={result.retirementBalance}
                  firstYearGainVsWithdraw={result.firstYearGainVsWithdraw}
                  depleteAge={result.depleteAge}
                  accumulationYears={result.accumulationYears}
                  annualRefundAmount={result.annualRefundAmount}
                  reinvestmentEffect={result.reinvestmentEffect}
                  cumulativeRefundTotal={result.cumulativeRefundTotal}
                  withdrawalRatio={result.withdrawalRatio}
                  afterTaxWithdrawal={result.afterTaxWithdrawal}
                  annualWithdrawal={inputs.annualWithdrawal}
                  preTaxWithdrawal={result.preTaxWithdrawal}
                  inputs={inputs}
                  theme={theme}
                />

                {/* Visual interactive Charts or Lifetime Insurance Attribution Guide */}
                {showInsuranceNotice ? (
                  <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-xl relative overflow-hidden text-left ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-indigo-950/20 to-slate-900 border-slate-800/80 text-white"
                      : "bg-gradient-to-br from-indigo-50/20 to-white border-slate-200 text-slate-800 shadow-sm"
                  }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 text-left">
                      <div className="text-left">
                        <h4 className="text-sm font-black tracking-tight mb-1 text-left">
                          {inputs.simulationType === "hybrid" 
                            ? "🛡️ 하이브리드 수령 시 적립자산 보험사 귀속 안내" 
                            : "🛡️ 종신연금 수령 시 적립자산 보험사 귀속 안내"}
                        </h4>
                        <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed max-w-xl text-left`}>
                          {inputs.simulationType === "hybrid" ? (
                            <>
                              하이브리드형 방식을 선택함에 따라, 55세 개시 시점의 적립 자산 총액 및 매년 발생하는 투자 운용 수익 등은 <strong>전량 보험사로 이체</strong>됩니다. <br className="hidden md:inline"/>
                              귀속된 자산은 가입자가 평생 마르지 않는 연금을 안정적으로 지급받는 <strong>종신연금형(10년 보증)</strong> 재원으로 변환되므로, 가입자 개인의 연간 자산 잔액 추이 및 자산 현금흐름 차트는 산출되지 않습니다.
                            </>
                          ) : (
                            <>
                              종신연금형 방식을 선택함에 따라, 개시 시점의 적립 자산 총액 및 매년 발생하는 운용 수익 등은 <strong>보험사 종신보장 재원으로 전산 운용</strong>됩니다. <br className="hidden md:inline"/>
                              귀속된 자산은 평생 마르지 않는 연금을 지급받는 <strong>종신연금(10년 보증)</strong> 재원으로 고정되어 연금 지급을 개시하므로, 가입자 개인의 연간 자산 잔액 추이 및 펀드 차트는 산출되지 않습니다.
                            </>
                          )}
                        </p>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 px-2.5 py-1 rounded-full border ${
                        theme === "dark" 
                          ? "bg-indigo-950/40 border-indigo-850 text-indigo-300"
                          : "bg-indigo-50 border-indigo-100 text-indigo-600"
                      }`}>
                        수령권 평생 보증
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
                      <div className={`p-3.5 rounded-xl border text-left text-xs leading-relaxed ${
                        theme === "dark" ? "bg-slate-950/40 border-slate-800/60" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="font-bold text-indigo-400 mb-1">💡 생존 보증 연금</div>
                        <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>본인이 살아있는 동안 생존 여부에 따라 평생 연금이 고정 지급되어 장수 리스크를 완벽하게 방정합니다.</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border text-left text-xs leading-relaxed ${
                        theme === "dark" ? "bg-slate-950/40 border-slate-800/60" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="font-bold text-[#F2AEBB] mb-1">🛡️ 10년 확정 보증</div>
                        <span className={theme === "dark" ? "text-slate-450" : "text-slate-550"}>연금 개시 후 만일 10년 이내 사망하더라도, 미지급된 10년 분량의 연금 주기는 지정 상속인에게 끝까지 보장 지급됩니다.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Charts
                    chart1Data={chart1Data}
                    chart2Data={chart2Data}
                    startAge={inputs.startAge}
                    endAge={inputs.endAge}
                    theme={theme}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "table" && (
            <DetailsTable timeline={result.timeline} theme={theme} />
          )}

          {activeTab === "guide" && (
            <TaxGuide theme={theme} />
          )}
        </div>

        {/* Tactile Native Floating Under-Navigation Bar */}
        <nav className={`fixed bottom-0 left-0 right-0 max-w-inherit mx-auto h-16 flex items-center justify-around px-2 z-40 transition-all ${
          isDark 
            ? "bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 text-white" 
            : "bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg text-slate-800"
        }`}>
          <button
            onClick={() => setActiveTab("compare")}
            id="tab-compare"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
              activeTab === "compare"
                ? isDark ? "text-indigo-400 font-bold scale-102" : "text-indigo-650 font-black scale-102"
                : isDark ? "text-slate-500 hover:text-slate-300 font-medium" : "text-slate-400 hover:text-slate-650 font-semibold"
            }`}
          >
            <Scale className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-1 font-bold">3대상품 비교분석</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            id="tab-simulator"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
              activeTab === "simulator"
                ? isDark ? "text-indigo-400 font-bold scale-102" : "text-indigo-650 font-black scale-102"
                : isDark ? "text-slate-500 hover:text-slate-300 font-medium" : "text-slate-400 hover:text-slate-650 font-semibold"
            }`}
          >
            <Calculator className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-1 font-bold">개별 시뮬레이터</span>
          </button>
          
          <button
            onClick={() => setActiveTab("table")}
            id="tab-table"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
              activeTab === "table"
                ? isDark ? "text-indigo-400 font-bold scale-102" : "text-indigo-650 font-black scale-102"
                : isDark ? "text-slate-500 hover:text-slate-300 font-medium" : "text-slate-400 hover:text-slate-650 font-semibold"
            }`}
          >
            <Table className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-1 font-bold">연도별 원장</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            id="tab-guide"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer ${
              activeTab === "guide"
                ? isDark ? "text-indigo-400 font-bold scale-102" : "text-indigo-650 font-black scale-102"
                : isDark ? "text-slate-500 hover:text-slate-300 font-medium" : "text-slate-400 hover:text-slate-650 font-semibold"
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-1 font-bold">세무 가이드</span>
          </button>
        </nav>
      </div>
    </DeviceShell>
  );
}

import React from "react";
import { 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  AlertTriangle, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Percent
} from "lucide-react";

interface TaxGuideProps {
  theme?: "dark" | "light";
}

export default function TaxGuide({ theme = "dark" }: TaxGuideProps) {
  const isDark = theme === "dark";

  return (
    <div className={`border rounded-2xl p-5 space-y-6 transition-all duration-300 ${
      isDark 
        ? "bg-slate-900 border-slate-800/80 text-white" 
        : "bg-white border-slate-200 text-slate-800 shadow-md"
    }`}>
      <div className={`flex items-center space-x-2 border-b pb-3 ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <BookOpen className={`w-4 h-4 ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`} />
        <h3 className={`text-sm font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>
          연금저축 & IRP 완벽 세제 가이드
        </h3>
      </div>

      {/* Grid for two core laws */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: 세액공제 혜택 */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDark ? "bg-slate-950/40 border-slate-800/70" : "bg-slate-50 border-slate-200 shadow-3xs"
        }`}>
          <div className="flex items-center space-x-2">
            <Coins className={`w-4.5 h-4.5 ${isDark ? "text-[#A7AAE1]" : "text-indigo-600"}`} />
            <h4 className={`text-xs font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              1. 세액공제 한도 및 공제율
            </h4>
          </div>
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            연금저축계좌 연 <strong className={isDark ? "text-slate-200 font-black" : "text-slate-900 font-black"}>600만원</strong>, IRP 계좌 추가 시 연 최대 <strong className={isDark ? "text-slate-200 font-black" : "text-slate-900 font-black"}>900만원</strong>까지 납입액에 대해 세액공제 환급 혜택을 줍니다.
          </p>
          <div className={`p-2.5 rounded text-[10px] space-y-1 font-mono transition-colors ${
            isDark ? "bg-slate-900/60 text-slate-300" : "bg-white border border-slate-200 text-slate-700"
          }`}>
            <div className="flex justify-between">
              <span>연소득 5,500만원 이하:</span>
              <span className={isDark ? "text-[#F2AEBB] font-bold" : "text-pink-600 font-bold"}>16.5% 세액공제</span>
            </div>
            <div className="flex justify-between">
              <span>연소득 5,500만원 초과:</span>
              <span className={isDark ? "text-[#A7AAE1] font-bold" : "text-indigo-600 font-bold"}>13.2% 세액공제</span>
            </div>
          </div>
          <div className={`text-[10px] flex items-start space-x-1 ${isDark ? "text-[#A7AAE1]" : "text-[#696FC7]"}`}>
            <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="leading-relaxed">이 환급금을 소비하지 않고 매년 연금펀드에 재투자하면 엄청난 복리 가속 효과가 발생합니다 (시뮬레이터 Pro의 기본 설정).</span>
          </div>
        </div>

        {/* Section 2: 연금소득세 */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDark ? "bg-slate-950/40 border-slate-800/70" : "bg-slate-50 border-slate-200 shadow-3xs"
        }`}>
          <div className="flex items-center space-x-2">
            <Percent className={`w-4.5 h-4.5 ${isDark ? "text-[#F5D3C4]" : "text-orange-650"}`} />
            <h4 className={`text-xs font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              2. 은퇴 수령 시 연금소득세율
            </h4>
          </div>
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            연금 개시 시점 나이가 많을수록 더 낮은 우대 세율을 적용하여, 은퇴 시점에도 세금을 이연시키는 최적 자산 설계를 돕습니다.
          </p>
          <div className={`p-2.5 rounded text-[10px] space-y-1 font-mono transition-colors ${
            isDark ? "bg-slate-900/60 text-slate-300" : "bg-white border border-slate-200 text-slate-700"
          }`}>
            <div className="flex justify-between">
              <span>55세 ~ 69세 수령:</span>
              <span className="text-indigo-500 font-bold">5.5% 납부</span>
            </div>
            <div className="flex justify-between">
              <span>70세 ~ 79세 수령:</span>
              <span className="text-blue-500 font-bold">4.4% 납부</span>
            </div>
            <div className="flex justify-between">
              <span>80세 이상 수령:</span>
              <span className="text-[#696FC7] font-bold">3.3% 납부</span>
            </div>
          </div>
          <div className={`text-[10px] border rounded p-2.5 flex items-start space-x-1.5 leading-relaxed ${
            isDark 
              ? "text-[#F5D3C4] bg-[#F5D3C4]/10 border-[#F5D3C4]/20" 
              : "text-[#696FC7] bg-[#F5D3C4]/20 border-[#F5D3C4]/40"
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>사적 연금 1,500만원 초과 한도:</strong> 매년 사적 연금(연금저축+IRP 환급금 및 수익금) 수령 한도가 <strong className="font-bold underline">1,500만원</strong>을 초과할 경우, 초과분 포함 전체 수령금액이 분리과세(<strong>16.5%</strong>)되거나 종합과세 대상으로 포함됩니다 (시뮬레이터 Pro에서 분리과세를 포함한 최적 법정 구간 자동 산출).
            </span>
          </div>
        </div>
      </div>

      {/* Deep Compounding Principle */}
      <div className={`p-4 rounded-xl border space-y-2 transition-colors ${
        isDark 
          ? "bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-indigo-800/40" 
          : "bg-indigo-50/30 border-indigo-200/50"
      }`}>
        <h4 className={`text-xs font-black flex items-center ${isDark ? "text-indigo-350" : "text-indigo-650"}`}>
          <ShieldCheck className={`w-4 h-4 mr-1.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          포트폴리오 설계 팁 및 제언
        </h4>
        <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          - <strong>화폐 가치 이연:</strong> 연금저축펀드 내에서 배당이나 매매차익에 대해 즉각 과세(15.4%)하지 않고 즉각 원리금에 포함하여 재투자하게 하므로 <strong>과세이연 및 세액공제</strong>가 결합된 극강의 복리를 보장합니다.
          <br />- <strong>포트폴리오 배분:</strong> 적립기에는 미국 S&P 500, 나스닥 100, 반도체 ETF 등 장기 성장에 투자하며, 은퇴가 임박한 인출기에는 한국 거래소 고배당주 커버드콜, 배당 성장 ETF(SCHD), 단기 국채 금리형 ETF로 안정적인 인컴 현금흐름을 확보하여 시뮬레이션을 구현하는 것이 현실적입니다.
        </p>
      </div>
    </div>
  );
}

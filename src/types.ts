export interface SimulationInputs {
  monthlyDeposit: number;     // 월 납입액 (만원, 10~200, 기본 50)
  startAge: number;          // 시작 나이 (세, 25~50, 기본 35)
  endAge: number;            // 개시 나이 (세, 55~70, 기본 55)
  depositYears: number;      // 납입 기간 (년, 1 ~ (endAge - startAge), 기본 endAge - startAge)
  ratePre: number;           // 연 수익률 적립기 (%, 2~15, 기본 7)
  ratePost: number;          // 연 수익률 인출기 (%, 1~15, 기본 5)
  annualWithdrawal: number;  // 연간 인출액 (만원, 500~6000, 기본 1500)
  reinvestTaxCredit: boolean; // 세액공제 재투자 (ON/OFF, 기본 ON)
  taxCreditRate: 13.2 | 16.5; // 세액공제율 (13.2% / 16.5%, 기본 13.2%)
  simulationType: "fund" | "nonTaxable" | "hybrid"; // 시뮬레이션 유형 (fund: 연금저축펀드, nonTaxable: 세제비적격 연금보험, hybrid: 하이브리드)
  rateInsurance: number;      // 공시이율 (%, 1~10, 기본 2.5)
  payoutMethod: "fixed" | "lifetime"; // 연금 수령방법 (fixed: 확정기간형, lifetime: 종신연금형 10년보증형)
  fixedTerm: number;          // 확정기간 (5, 10, 15, 20년, 기본 10)
  annuityPayoutRate: number;  // 적립액 대비 연금연액비율 (%, 1~15, 기본 4.5)
  insuranceAnnuityRate: number; // 종신연금비율 (%, 2~7, 기본 4.5)
  illHealthEffect: number;      // 유병자 연금효과 (%, 0~100, 기본 10)
}

export interface Chart1DataPoint {
  age: number;
  principal: number;   // 납입 원금
  reinvested: number;  // 세액공제 재투자분
  gains: number;       // ETF 수익분
  total: number;       // 총 잔액
}

export interface Chart2DataPoint {
  age: number;
  annualReturn: number; // 연 수익
  afterTax: number;     // 세후 인출액
  tax: number;          // 연금소득세
  preTax: number;       // 세전 인출액
}

export interface SimulationResult {
  timeline: {
    age: number;
    balance: number;
    principal: number;
    reinvested: number;
    gains: number;
    deposit: number;
    refund: number;
    withdrawnPreTax: number;
    withdrawnAfterTax: number;
    withdrawnTax: number;
    investmentReturn: number;
    isAccumulation: boolean;
  }[];
  retirementBalance: number; // 개시 시점 잔액
  retirementPrincipal: number; // 개시 시점 원금
  retirementReinvested: number; // 개시 시점 재투자금
  retirementGains: number; // 개시 시점 투자 수익
  depleteAge: number | null; // 소진 예상 나이 (null 이면 없음)
  firstYearGainVsWithdraw: number; // 연 수익 vs 인출 (개시 첫해 수익 - 세전 인출액)
  accumulationYears: number; // 적립 기간
  annualRefundAmount: number; // 세액공제 재투자 기준 연 환급액
  reinvestmentEffect: number; // 재투자 효과 (ON vs OFF 개시 시점 잔액 차이)
  cumulativeRefundTotal: number; // 누적 환급 총액
  withdrawalRatio: number; // 개시 잔액 대비 인출 비율
  afterTaxWithdrawal: number; // 세후 실수령
  preTaxWithdrawal: number; // 세전 목표 인출금
}

import { SimulationInputs, SimulationResult } from "./types";

/**
 * 나이별 연금소득세율 반환
 * - 55~69세: 5.5%
 * - 70~79세: 4.4%
 * - 80세+:   3.3%
 * - 55세 미만: 5.5% (Fallback)
 */
export function getPensionTaxRate(age: number): number {
  if (age < 55) return 5.5;
  if (age <= 69) return 5.5;
  if (age <= 79) return 4.4;
  return 3.3;
}

/**
 * 세전 인출액 -> 세후/세금 분리 계산
 * - 1,500만원 이하: 나이별 세율 적용 (5.5%, 4.4%, 3.3%)
 * - 1,500만원 초과분: 16.5% 분리과세 적용
 */
export function calcAfterTax(wManwon: number, age: number): { afterTax: number; tax: number; baseRate: number } {
  const baseRate = getPensionTaxRate(age);
  if (wManwon <= 1500) {
    const tax = wManwon * (baseRate / 100);
    return {
      afterTax: wManwon - tax,
      tax,
      baseRate,
    };
  } else {
    const tax1500 = 1500 * (baseRate / 100);
    const taxExcess = (wManwon - 1500) * 0.165;
    const totalTax = tax1500 + taxExcess;
    return {
      afterTax: wManwon - totalTax,
      tax: totalTax,
      baseRate,
    };
  }
}

/**
 * 월 납입액 기준 연 세액공제 환급액 계산
 * - 연금저축 600만원 + IRP 300만원 = 연 900만원 한도자
 */
export function getAnnualCredit(monthlyManwon: number, creditRate: 13.2 | 16.5): number {
  const annualDeposit = monthlyManwon * 12;
  const applicableAmount = Math.min(annualDeposit, 900); // 900만원 한도
  return applicableAmount * (creditRate / 100);
}

/**
 * Y축 숫자를 억/만원 단위의 정중하면서 가독성 높은 한국어 문자열로 변환
 */
export function yLabel(v: number): string {
  if (v <= 0) return "0원";
  const eok = Math.floor(v / 10000);
  const man = Math.round(v % 10000);
  
  if (eok > 0) {
    if (man === 0) {
      return `${eok}억원`;
    }
    return `${eok}억 ${man.toLocaleString()}만원`;
  }
  return `${man.toLocaleString()}만원`;
}

/**
 * X축 5세 단위 눈금 Set 생성 (시작나이 포함, 최대 100세까지)
 */
export function makeTickSet(startAge: number, endAge: number): number[] {
  const maxAge = 100;
  const ticks: number[] = [startAge];
  
  // 시작나이 바로 다음의 5의 배수 찾기
  let nextMultipleOf5 = Math.ceil((startAge + 1) / 5) * 5;
  for (let age = nextMultipleOf5; age <= maxAge; age += 5) {
    if (!ticks.includes(age)) {
      ticks.push(age);
    }
  }
  
  if (!ticks.includes(100)) {
    ticks.push(100);
  }
  
  return ticks.filter(age => age <= 100).sort((a, b) => a - b);
}

/**
 * Y축 최대값을 보기 좋은 단위로 올림 (niceMax)
 */
export function niceMax(val: number): number {
  if (val <= 0) return 1000;
  if (val < 5000) {
    return Math.ceil(val / 500) * 500;
  } else if (val < 10000) {
    return Math.ceil(val / 1000) * 1000;
  } else if (val < 50000) {
    return Math.ceil(val / 5000) * 5000;
  } else if (val < 100000) {
    return Math.ceil(val / 10000) * 10000;
  } else {
    return Math.ceil(val / 50000) * 50000;
  }
}

/**
 * 핵심 시뮬레이션 계산 엔진
 */
export function runSimulation(inputs: SimulationInputs): SimulationResult {
  const {
    monthlyDeposit,
    startAge,
    endAge,
    depositYears,
    ratePre,
    ratePost,
    annualWithdrawal,
    reinvestTaxCredit,
    taxCreditRate,
    simulationType,
    rateInsurance,
    payoutMethod,
    fixedTerm,
    annuityPayoutRate,
    insuranceAnnuityRate,
    illHealthEffect,
  } = inputs;

  const actualAnnuityPayoutRate = annuityPayoutRate;

  const timeline: SimulationResult["timeline"] = [];

  let balance = 0;
  let principal = 0;
  let reinvested = 0;
  let gains = 0;
  let pendingTaxCredit = 0; // 전년도 납입에 대한 환급액 (1월에 재투자용)
  let cumulativeRefundTotal = 0;

  const isNonTaxable = simulationType === "nonTaxable";
  const isHybrid = simulationType === "hybrid";

  // 1. 적립기 시뮬레이션 (시작 나이 ~ 개시 나이 - 1)
  for (let age = startAge; age < endAge; age++) {
    const isPayingThisYear = (age - startAge) < depositYears;
    const depositThisYear = isPayingThisYear ? (monthlyDeposit * 12) : 0;
    
    // 세제비적격은 세액공제 환급액이 0. 납입하지 않는 해는 환급액이 0
    const taxCreditThisYear = (isNonTaxable || !isPayingThisYear) ? 0 : getAnnualCredit(monthlyDeposit, taxCreditRate);
    cumulativeRefundTotal += taxCreditThisYear;

    // 기중 입금 및 재투자 처리
    const principal_add = depositThisYear;
    const reinvest_add = (!isNonTaxable && reinvestTaxCredit && age > startAge) ? pendingTaxCredit : 0;

    // 기중 가합산
    const principal_mid = principal + principal_add;
    const reinvest_mid = reinvested + reinvest_add;
    const gains_mid = gains;

    const total_pre_interest = principal_mid + reinvest_mid + gains_mid;
    
    // 세제비적격은 공시이율 사용, 그 외는 적립기 펀드수익률(ratePre) 사용
    const currentRate = isNonTaxable ? rateInsurance : ratePre;
    const growth_rate = currentRate / 100;
    const growth_gain = total_pre_interest * growth_rate;

    // 기말 정산
    principal = principal_mid;
    reinvested = reinvest_mid;
    gains = gains_mid + growth_gain;
    balance = principal + reinvested + gains;

    pendingTaxCredit = taxCreditThisYear;

    timeline.push({
      age,
      balance,
      principal,
      reinvested,
      gains,
      deposit: depositThisYear,
      refund: taxCreditThisYear,
      withdrawnPreTax: 0,
      withdrawnAfterTax: 0,
      withdrawnTax: 0,
      investmentReturn: growth_gain,
      isAccumulation: true,
    });
  }

  // 개시 시점 정산 (개시 시점에 전년도 최종 세액공제가 재투자 ON일 때 반영됨)
  let retirementBalance = balance;
  if (!isNonTaxable && reinvestTaxCredit && endAge > startAge && pendingTaxCredit > 0) {
    reinvested += pendingTaxCredit;
    balance = principal + reinvested + gains;
    retirementBalance = balance;
  }

  // 인출기 목표 연간 인출액 산정
  let withdrawnTarget = annualWithdrawal;
  if (isNonTaxable) {
    if (payoutMethod === "fixed") {
      if (retirementBalance > 0) {
        const r = rateInsurance / 100;
        const n = fixedTerm;
        if (r > 0) {
          withdrawnTarget = retirementBalance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
          withdrawnTarget = retirementBalance / n;
        }
      } else {
        withdrawnTarget = 0;
      }
    } else { // lifetime
      withdrawnTarget = retirementBalance * (actualAnnuityPayoutRate / 100);
    }
  } else if (isHybrid) {
    // 하이브리드는 종신연금형 선택
    withdrawnTarget = retirementBalance * (actualAnnuityPayoutRate / 100);
  }

  let depleteAge: number | null = null;
  
  // 첫해 연수익 vs 인출비교용 연수익률 선택
  const postGrowthRate = isNonTaxable ? rateInsurance : (isHybrid ? rateInsurance : ratePost);
  const firstYearGainVsWithdraw = (retirementBalance * postGrowthRate / 100) - withdrawnTarget;

  // 2. 인출기 시뮬레이션 (개시 나이 ~ 최대 나이 100세)
  for (let age = endAge; age <= 100; age++) {
    // 세제비적격 및 하이브리드 종신연금형은 잔고가 0이 되어도 평생 연금액 수령을 보증함 (Insurer guarantee)
    const isLifetimeGuarantee = (isNonTaxable && payoutMethod === "lifetime") || isHybrid;
    
    // 확정기간형의 경우 매년 고정 연금액 수령
    let currentYearTarget = withdrawnTarget;
    if (isNonTaxable && payoutMethod === "fixed") {
      if (age - endAge >= fixedTerm) {
        currentYearTarget = 0; // 기간 종료시 인출 없음
      } else {
        currentYearTarget = withdrawnTarget;
      }
    }

    if (balance <= 0) {
      if (depleteAge === null && (isLifetimeGuarantee || currentYearTarget > 0)) {
        depleteAge = age;
      }
      
      const targetPay = isLifetimeGuarantee ? withdrawnTarget : 0;
      let afterTax = targetPay;
      let tax = 0;
      if (targetPay > 0 && !isNonTaxable) {
        if (isHybrid) {
          const basePortion = Math.min(targetPay, 1500);
          const excessPortion = Math.max(0, targetPay - 1500);
          tax = basePortion * 0.033 + excessPortion * 0.165;
          afterTax = targetPay - tax;
        } else {
          const computedTax = calcAfterTax(targetPay, age);
          afterTax = computedTax.afterTax;
          tax = computedTax.tax;
        }
      }

      timeline.push({
        age,
        balance: 0,
        principal: 0,
        reinvested: 0,
        gains: 0,
        deposit: 0,
        refund: 0,
        withdrawnPreTax: targetPay,
        withdrawnAfterTax: afterTax,
        withdrawnTax: tax,
        investmentReturn: 0,
        isAccumulation: false,
      });
      continue;
    }

    // 인출기 투자 수익 발생 (세제비적격 및 하이브리드는 공시이율 사용, 일반 펀드는 ratePost 사용)
    const currentPostRate = (isNonTaxable || isHybrid) ? rateInsurance : ratePost;
    const investmentReturn = balance * (currentPostRate / 100);
    const gains_pre = gains + investmentReturn;
    const balance_before_withdrawal = balance + investmentReturn;

    // 세전인출 정산
    let withdrawnPreTax = currentYearTarget;
    if (!isLifetimeGuarantee && balance_before_withdrawal < currentYearTarget) {
      withdrawnPreTax = balance_before_withdrawal;
    }

    let afterTax = withdrawnPreTax;
    let tax = 0;

    // 세제적격(펀드, 하이브리드) 상품에 대해서만 연금소득세 과세
    if (!isNonTaxable && withdrawnPreTax > 0) {
      if (isHybrid) {
        const basePortion = Math.min(withdrawnPreTax, 1500);
        const excessPortion = Math.max(0, withdrawnPreTax - 1500);
        tax = basePortion * 0.033 + excessPortion * 0.165; // 하이브리드 종신연금형 연금소득세: 1500 이하는 3.3%, 초과분은 16.5% 적용
        afterTax = withdrawnPreTax - tax;
      } else {
        const taxResult = calcAfterTax(withdrawnPreTax, age);
        afterTax = taxResult.afterTax;
        tax = taxResult.tax;
      }
    }

    const balance_new = Math.max(0, balance_before_withdrawal - withdrawnPreTax);

    if (balance_new <= 0) {
      if (depleteAge === null) {
        depleteAge = age;
      }
      balance = 0;
      principal = 0;
      reinvested = 0;
      gains = 0;
    } else {
      // 차감 우선순위: ETF 수익금(gains) -> 세액공제 재투자분(reinvested) -> 납입 원금(principal)
      let remainingWithdrawal = withdrawnPreTax;
      let nextGains = gains_pre;
      let nextReinvested = reinvested;
      let nextPrincipal = principal;

      // 1. ETF 수익금(이자)에서 우선 차감
      if (remainingWithdrawal <= nextGains) {
        nextGains -= remainingWithdrawal;
        remainingWithdrawal = 0;
      } else {
        remainingWithdrawal -= nextGains;
        nextGains = 0;
      }

      // 2. 남은 금액은 세액공제 재투자분에서 차감
      if (remainingWithdrawal > 0) {
        if (remainingWithdrawal <= nextReinvested) {
          nextReinvested -= remainingWithdrawal;
          remainingWithdrawal = 0;
        } else {
          remainingWithdrawal -= nextReinvested;
          nextReinvested = 0;
        }
      }

      // 3. 남은 금액은 납입 원금에서 차감
      if (remainingWithdrawal > 0) {
        if (remainingWithdrawal <= nextPrincipal) {
          nextPrincipal -= remainingWithdrawal;
          remainingWithdrawal = 0;
        } else {
          remainingWithdrawal -= nextPrincipal;
          nextPrincipal = 0;
        }
      }

      principal = nextPrincipal;
      reinvested = nextReinvested;
      gains = nextGains;
      balance = balance_new;
    }

    timeline.push({
      age,
      balance,
      principal,
      reinvested,
      gains,
      deposit: 0,
      refund: 0,
      withdrawnPreTax,
      withdrawnAfterTax: afterTax,
      withdrawnTax: tax,
      investmentReturn,
      isAccumulation: false,
    });
  }

  if (isNonTaxable && payoutMethod === "fixed") {
    depleteAge = endAge + fixedTerm;
  }

  // 3. 재투자 효과 산출을 위해 재투자 OFF 버전 개산 (세제적격 상품만 적용)
  let reinvestmentEffect = 0;
  if (!isNonTaxable && reinvestTaxCredit) {
    const noReinvestResult = runSimulation({
      ...inputs,
      reinvestTaxCredit: false,
    });
    reinvestmentEffect = retirementBalance - noReinvestResult.retirementBalance;
  }

  // 연 환급액
  const annualRefundAmount = isNonTaxable ? 0 : getAnnualCredit(monthlyDeposit, taxCreditRate);

  // 개시 잔액 대비 인출 비율
  const withdrawalRatio = retirementBalance > 0
    ? (withdrawnTarget / retirementBalance) * 100
    : 0;

  // 세후 실수령
  let afterTaxWithdrawal = withdrawnTarget;
  if (!isNonTaxable && withdrawnTarget > 0) {
    if (isHybrid) {
      const basePortion = Math.min(withdrawnTarget, 1500);
      const excessPortion = Math.max(0, withdrawnTarget - 1500);
      const tax = basePortion * 0.033 + excessPortion * 0.165;
      afterTaxWithdrawal = withdrawnTarget - tax;
    } else {
      afterTaxWithdrawal = calcAfterTax(withdrawnTarget, endAge).afterTax;
    }
  }

  return {
    timeline,
    retirementBalance,
    depleteAge,
    firstYearGainVsWithdraw,
    accumulationYears: endAge - startAge,
    annualRefundAmount,
    reinvestmentEffect,
    cumulativeRefundTotal,
    withdrawalRatio,
    afterTaxWithdrawal,
    preTaxWithdrawal: withdrawnTarget,
  };
}

/**
 * Yield Comparison Engine
 * Fetches and compares APY rates across Mantle DeFi protocols
 */

export interface ProtocolYieldData {
  protocol: 'rivera' | 'merchant_moe' | 'agni';
  poolName: string;
  currentAPY: number;
  tvl: number;
  dailyVolume: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface YieldComparison {
  protocols: ProtocolYieldData[];
  bestYield: ProtocolYieldData;
  bestRiskAdjustedYield: ProtocolYieldData;
  averageAPY: number;
  recommendation: string;
}

/**
 * Mock data for yield comparison
 * In production, this would fetch real-time data from on-chain sources
 */
function getMockProtocolYields(): ProtocolYieldData[] {
  return [
    {
      protocol: 'rivera',
      poolName: 'MNT-USDC Concentrated Liquidity',
      currentAPY: 8.5,
      tvl: 45000000,
      dailyVolume: 2500000,
      riskLevel: 'low',
      description: 'Risk-optimized market-making strategy with active liquidity management',
    },
    {
      protocol: 'merchant_moe',
      poolName: 'MOE-MNT Farm',
      currentAPY: 12.3,
      tvl: 28000000,
      dailyVolume: 1800000,
      riskLevel: 'medium',
      description: 'Liquidity farming with MOE token incentives and fee rewards',
    },
    {
      protocol: 'agni',
      poolName: 'USDC-MNT Concentrated Pool',
      currentAPY: 10.2,
      tvl: 25530000,
      dailyVolume: 3600000,
      riskLevel: 'medium',
      description: 'High-capital efficiency concentrated liquidity with AGNI insurance pool',
    },
  ];
}

/**
 * Compare yields across protocols and provide recommendations
 */
export function compareProtocolYields(): YieldComparison {
  const protocols = getMockProtocolYields();

  // Find best yield
  const bestYield = protocols.reduce((prev, current) =>
    prev.currentAPY > current.currentAPY ? prev : current
  );

  // Calculate risk-adjusted yield (APY / risk multiplier)
  const riskMultipliers = { low: 1, medium: 1.2, high: 1.5 };
  const riskAdjustedYields = protocols.map(p => ({
    ...p,
    riskAdjustedYield: p.currentAPY / riskMultipliers[p.riskLevel],
  }));

  const bestRiskAdjusted = riskAdjustedYields.reduce((prev, current) =>
    prev.riskAdjustedYield > current.riskAdjustedYield ? prev : current
  );

  const averageAPY =
    protocols.reduce((sum, p) => sum + p.currentAPY, 0) / protocols.length;

  // Generate recommendation
  let recommendation = '';
  if (bestYield.protocol === 'merchant_moe') {
    recommendation = `Merchant Moe offers the highest APY at ${bestYield.currentAPY}%, driven by strong MOE token incentives. However, consider risk exposure.`;
  } else if (bestRiskAdjusted.protocol === 'rivera') {
    recommendation = `Rivera provides the best risk-adjusted returns with its low-risk, actively managed strategy. Ideal for conservative investors.`;
  } else {
    recommendation = `Agni Finance offers a balanced approach with concentrated liquidity and insurance protection. Good for moderate risk tolerance.`;
  }

  return {
    protocols,
    bestYield,
    bestRiskAdjustedYield: bestRiskAdjusted as ProtocolYieldData,
    averageAPY,
    recommendation,
  };
}

/**
 * Calculate optimal allocation based on yields and risk profile
 */
export function calculateOptimalAllocation(
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  yieldComparison: YieldComparison
): { rivera: number; merchant_moe: number; agni: number } {
  let allocation = { rivera: 0, merchant_moe: 0, agni: 0 };

  switch (riskProfile) {
    case 'conservative':
      // Prioritize low-risk Rivera
      allocation = { rivera: 60, merchant_moe: 20, agni: 20 };
      break;
    case 'moderate':
      // Balanced approach
      allocation = { rivera: 30, merchant_moe: 40, agni: 30 };
      break;
    case 'aggressive':
      // Maximize yield with higher-risk protocols
      allocation = { rivera: 20, merchant_moe: 50, agni: 30 };
      break;
  }

  return allocation;
}

/**
 * Simulate portfolio performance
 */
export function simulatePortfolioPerformance(
  allocation: { rivera: number; merchant_moe: number; agni: number },
  investmentAmount: number,
  days: number = 365,
  yieldComparison?: YieldComparison
): {
  initialInvestment: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dailyBreakdown: Array<{
    day: number;
    value: number;
    earned: number;
  }>;
} {
  const yields = yieldComparison || compareProtocolYields();

  // Get APYs for each protocol
  const apys = {
    rivera: yields.protocols.find(p => p.protocol === 'rivera')?.currentAPY || 8.5,
    merchant_moe: yields.protocols.find(p => p.protocol === 'merchant_moe')?.currentAPY || 12.3,
    agni: yields.protocols.find(p => p.protocol === 'agni')?.currentAPY || 10.2,
  };

  // Calculate weighted average APY
  const weightedAPY =
    (allocation.rivera * apys.rivera +
      allocation.merchant_moe * apys.merchant_moe +
      allocation.agni * apys.agni) /
    100;

  // Daily compound calculation
  const dailyRate = weightedAPY / 365 / 100;
  let currentValue = investmentAmount;
  const dailyBreakdown = [];

  for (let day = 1; day <= days; day++) {
    const dailyEarnings = currentValue * dailyRate;
    currentValue += dailyEarnings;

    if (day % 30 === 0 || day === 1 || day === days) {
      dailyBreakdown.push({
        day,
        value: currentValue,
        earned: currentValue - investmentAmount,
      });
    }
  }

  const totalReturn = currentValue - investmentAmount;
  const totalReturnPercent = (totalReturn / investmentAmount) * 100;

  return {
    initialInvestment: investmentAmount,
    finalValue: currentValue,
    totalReturn,
    totalReturnPercent,
    dailyBreakdown,
  };
}

/**
 * Get protocol risk metrics
 */
export function getProtocolRiskMetrics(protocol: 'rivera' | 'merchant_moe' | 'agni') {
  const metrics: Record<string, any> = {
    rivera: {
      protocol: 'rivera',
      name: 'Rivera Money',
      riskScore: 0.3, // Low risk
      volatility: 'Low',
      smartContractRisk: 'Audited',
      liquidityRisk: 'Low',
      description: 'Actively managed concentrated liquidity with risk optimization',
      strengths: ['Low volatility', 'Active management', 'Audited contracts'],
      weaknesses: ['Lower APY', 'Complexity'],
    },
    merchant_moe: {
      protocol: 'merchant_moe',
      name: 'Merchant Moe',
      riskScore: 0.6, // Medium-high risk
      volatility: 'Medium-High',
      smartContractRisk: 'Audited',
      liquidityRisk: 'Medium',
      description: 'DEX with farming incentives and token rewards',
      strengths: ['High APY', 'Strong liquidity', 'Token incentives'],
      weaknesses: ['Token price risk', 'Higher volatility'],
    },
    agni: {
      protocol: 'agni',
      name: 'Agni Finance',
      riskScore: 0.5, // Medium risk
      volatility: 'Medium',
      smartContractRisk: 'Audited',
      liquidityRisk: 'Low',
      description: 'Concentrated liquidity DEX with insurance protection',
      strengths: ['Insurance pool', 'Concentrated liquidity', 'Balanced APY'],
      weaknesses: ['Moderate APY', 'Newer protocol'],
    },
  };

  return metrics[protocol] || metrics.rivera;
}

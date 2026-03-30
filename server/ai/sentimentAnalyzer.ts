import { invokeLLM } from "../_core/llm";

export interface SentimentAnalysisResult {
  sentimentScore: number; // -1.0 (bearish) to 1.0 (bullish)
  confidence: number; // 0.0 to 1.0
  summary: string;
  recommendation: 'buy' | 'hold' | 'sell';
  protocolSentiments: {
    rivera: number;
    merchant_moe: number;
    agni: number;
  };
  dataSources: string[];
}

/**
 * Analyze market sentiment using LLM
 * Processes market data, news, and on-chain metrics to generate investment recommendations
 */
export async function analyzeMarketSentiment(
  marketData: {
    currentAPYs: { rivera: number; merchant_moe: number; agni: number };
    tvls: { rivera: number; merchant_moe: number; agni: number };
    dailyVolumes: { rivera: number; merchant_moe: number; agni: number };
    recentNews?: string[];
    onChainMetrics?: {
      mantleNetworkActivity: string;
      liquidityTrends: string;
      userGrowth: string;
    };
  }
): Promise<SentimentAnalysisResult> {
  const prompt = `
You are a DeFi market analyst specializing in Mantle Network protocols. Analyze the following market data and provide a comprehensive sentiment analysis.

CURRENT MARKET DATA:
- Rivera APY: ${marketData.currentAPYs.rivera}%
- Merchant Moe APY: ${marketData.currentAPYs.merchant_moe}%
- Agni Finance APY: ${marketData.currentAPYs.agni}%

TVL (Total Value Locked):
- Rivera: $${marketData.tvls.rivera}M
- Merchant Moe: $${marketData.tvls.merchant_moe}M
- Agni: $${marketData.tvls.agni}M

Daily Trading Volume:
- Rivera: $${marketData.dailyVolumes.rivera}M
- Merchant Moe: $${marketData.dailyVolumes.merchant_moe}M
- Agni: $${marketData.dailyVolumes.agni}M

${marketData.recentNews ? `Recent Market News:\n${marketData.recentNews.join('\n')}` : ''}

${marketData.onChainMetrics ? `On-Chain Metrics:\n${JSON.stringify(marketData.onChainMetrics, null, 2)}` : ''}

Please provide:
1. Overall market sentiment score (-1.0 to 1.0, where -1 is very bearish and 1 is very bullish)
2. Confidence level (0.0 to 1.0)
3. A brief summary of market conditions
4. Investment recommendation (buy, hold, or sell)
5. Individual sentiment scores for each protocol (-1.0 to 1.0)

Format your response as JSON with the following structure:
{
  "sentimentScore": <number>,
  "confidence": <number>,
  "summary": "<string>",
  "recommendation": "<buy|hold|sell>",
  "protocolSentiments": {
    "rivera": <number>,
    "merchant_moe": <number>,
    "agni": <number>
  }
}
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a professional DeFi analyst. Provide analysis in valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              sentimentScore: {
                type: "number",
                description: "Sentiment score from -1.0 to 1.0",
              },
              confidence: {
                type: "number",
                description: "Confidence level from 0.0 to 1.0",
              },
              summary: {
                type: "string",
                description: "Brief market analysis summary",
              },
              recommendation: {
                type: "string",
                enum: ["buy", "hold", "sell"],
                description: "Investment recommendation",
              },
              protocolSentiments: {
                type: "object",
                properties: {
                  rivera: { type: "number" },
                  merchant_moe: { type: "number" },
                  agni: { type: "number" },
                },
                required: ["rivera", "merchant_moe", "agni"],
              },
            },
            required: [
              "sentimentScore",
              "confidence",
              "summary",
              "recommendation",
              "protocolSentiments",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    return {
      sentimentScore: Math.max(-1, Math.min(1, parsed.sentimentScore)),
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      summary: parsed.summary,
      recommendation: parsed.recommendation,
      protocolSentiments: {
        rivera: Math.max(-1, Math.min(1, parsed.protocolSentiments.rivera)),
        merchant_moe: Math.max(-1, Math.min(1, parsed.protocolSentiments.merchant_moe)),
        agni: Math.max(-1, Math.min(1, parsed.protocolSentiments.agni)),
      },
      dataSources: ["on-chain-metrics", "market-data", "ai-analysis"],
    };
  } catch (error) {
    console.error("Error analyzing market sentiment:", error);
    // Return neutral sentiment on error
    return {
      sentimentScore: 0,
      confidence: 0.3,
      summary: "Unable to complete sentiment analysis. Market conditions unclear.",
      recommendation: "hold",
      protocolSentiments: {
        rivera: 0,
        merchant_moe: 0,
        agni: 0,
      },
      dataSources: ["error-fallback"],
    };
  }
}

/**
 * Generate rebalancing recommendation based on sentiment and yield data
 */
export async function generateRebalancingRecommendation(
  currentAllocation: { rivera: number; merchant_moe: number; agni: number },
  sentiment: SentimentAnalysisResult,
  userRiskLevel: 'conservative' | 'moderate' | 'aggressive',
  userInvestmentGoal: 'yield' | 'growth' | 'stability'
): Promise<{
  recommendedAllocation: { rivera: number; merchant_moe: number; agni: number };
  reason: string;
  projectedReturnIncrease: number;
  projectedAPY: number;
  riskScore: number;
}> {
  const prompt = `
You are a DeFi portfolio manager. Based on the following data, recommend an optimal allocation across three Mantle protocols.

CURRENT ALLOCATION:
- Rivera: ${currentAllocation.rivera}%
- Merchant Moe: ${currentAllocation.merchant_moe}%
- Agni: ${currentAllocation.agni}%

MARKET SENTIMENT:
- Overall Sentiment: ${sentiment.sentimentScore} (${sentiment.recommendation})
- Confidence: ${sentiment.confidence}
- Rivera Sentiment: ${sentiment.protocolSentiments.rivera}
- Merchant Moe Sentiment: ${sentiment.protocolSentiments.merchant_moe}
- Agni Sentiment: ${sentiment.protocolSentiments.agni}

USER PROFILE:
- Risk Level: ${userRiskLevel}
- Investment Goal: ${userInvestmentGoal}

ALLOCATION CONSTRAINTS:
- Conservative: 60% stable, 30% moderate, 10% growth
- Moderate: 40% stable, 40% moderate, 20% growth
- Aggressive: 20% stable, 40% moderate, 40% growth

Provide a recommended allocation that:
1. Aligns with the user's risk profile
2. Capitalizes on positive sentiment
3. Diversifies across protocols
4. Maintains reasonable risk exposure

Format your response as JSON:
{
  "recommendedAllocation": {
    "rivera": <number 0-100>,
    "merchant_moe": <number 0-100>,
    "agni": <number 0-100>
  },
  "reason": "<string explaining the recommendation>",
  "projectedReturnIncrease": <number percentage>,
  "riskScore": <number 0-1.0>
}
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert DeFi portfolio manager. Provide recommendations in valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rebalancing_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendedAllocation: {
                type: "object",
                properties: {
                  rivera: { type: "number" },
                  merchant_moe: { type: "number" },
                  agni: { type: "number" },
                },
                required: ["rivera", "merchant_moe", "agni"],
              },
              reason: { type: "string" },
              projectedReturnIncrease: { type: "number" },
              riskScore: { type: "number" },
            },
            required: [
              "recommendedAllocation",
              "reason",
              "projectedReturnIncrease",
              "riskScore",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    // Normalize allocation to sum to 100
    const total =
      parsed.recommendedAllocation.rivera +
      parsed.recommendedAllocation.merchant_moe +
      parsed.recommendedAllocation.agni;
    const normalized = {
      rivera: (parsed.recommendedAllocation.rivera / total) * 100,
      merchant_moe: (parsed.recommendedAllocation.merchant_moe / total) * 100,
      agni: (parsed.recommendedAllocation.agni / total) * 100,
    };

    // Calculate current APY (simplified - would use real APY data in production)
    const currentAPY =
      (currentAllocation.rivera * 8 +
        currentAllocation.merchant_moe * 12 +
        currentAllocation.agni * 10) /
      100;
    const projectedAPY =
      (normalized.rivera * 8 +
        normalized.merchant_moe * 12 +
        normalized.agni * 10) /
      100;

    return {
      recommendedAllocation: normalized,
      reason: parsed.reason,
      projectedReturnIncrease: projectedAPY - currentAPY,
      projectedAPY: projectedAPY,
      riskScore: Math.max(0, Math.min(1, parsed.riskScore)),
    };
  } catch (error) {
    console.error("Error generating rebalancing recommendation:", error);
    // Return current allocation on error
    return {
      recommendedAllocation: currentAllocation,
      reason: "Unable to generate recommendation. Maintaining current allocation.",
      projectedReturnIncrease: 0,
      projectedAPY: 10, // Average APY
      riskScore: 0.5,
    };
  }
}

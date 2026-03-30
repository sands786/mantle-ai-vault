import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { analyzeMarketSentiment, generateRebalancingRecommendation } from "./ai/sentimentAnalyzer";
import { compareProtocolYields, calculateOptimalAllocation, simulatePortfolioPerformance, getProtocolRiskMetrics } from "./ai/yieldComparison";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ VAULT MANAGEMENT ============
  vault: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
        investmentGoal: z.enum(['yield', 'growth', 'stability']),
        initialDepositUSD: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createVault(ctx.user.id, input);
        return { success: true, vaultId: (result as any).insertId || 1 };
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserVaults(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ vaultId: z.number() }))
      .query(async ({ input }) => {
        return db.getVaultById(input.vaultId);
      }),

    update: protectedProcedure
      .input(z.object({
        vaultId: z.number(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(['active', 'paused', 'closed']).optional(),
          autoRebalanceEnabled: z.boolean().optional(),
          rebalanceThresholdPercent: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateVault(input.vaultId, input.updates as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ vaultId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateVault(input.vaultId, { status: 'closed' } as any);
        return { success: true };
      }),
  }),

  // ============ ALLOCATIONS ============
  allocation: router({
    getByVault: protectedProcedure
      .input(z.object({ vaultId: z.number() }))
      .query(async ({ input }) => {
        return db.getVaultAllocations(input.vaultId);
      }),

    update: protectedProcedure
      .input(z.object({
        vaultId: z.number(),
        allocations: z.object({
          rivera: z.number().min(0).max(100),
          merchant_moe: z.number().min(0).max(100),
          agni: z.number().min(0).max(100),
        }),
      }))
      .mutation(async ({ input }) => {
        const total = input.allocations.rivera + input.allocations.merchant_moe + input.allocations.agni;
        if (Math.abs(total - 100) > 0.01) {
          throw new Error("Allocations must sum to 100%");
        }

        for (const [protocol, percentage] of Object.entries(input.allocations)) {
          await db.upsertAllocation(input.vaultId, protocol as any, {
            percentageAllocation: percentage,
          });
        }

        return { success: true };
      }),
  }),

  // ============ PERFORMANCE ============
  performance: router({
    getHistory: protectedProcedure
      .input(z.object({ vaultId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getVaultPerformanceHistory(input.vaultId, input.days);
      }),

    recordSnapshot: protectedProcedure
      .input(z.object({
        vaultId: z.number(),
        totalValueUSD: z.string(),
        totalReturnsUSD: z.string(),
        totalReturnsPercent: z.string(),
        benchmarkAPY: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.recordPerformanceSnapshot(input.vaultId, input);
        return { success: true };
      }),
  }),

  // ============ AI & ANALYTICS ============
  ai: router({
    analyzeSentiment: publicProcedure
      .input(z.object({
        currentAPYs: z.object({
          rivera: z.number(),
          merchant_moe: z.number(),
          agni: z.number(),
        }),
        tvls: z.object({
          rivera: z.number(),
          merchant_moe: z.number(),
          agni: z.number(),
        }),
        dailyVolumes: z.object({
          rivera: z.number(),
          merchant_moe: z.number(),
          agni: z.number(),
        }),
      }))
      .query(async ({ input }) => {
        return analyzeMarketSentiment(input);
      }),

    compareYields: publicProcedure
      .query(async () => {
        return compareProtocolYields();
      }),

    getOptimalAllocation: publicProcedure
      .input(z.object({
        riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
      }))
      .query(async ({ input }) => {
        const yields = compareProtocolYields();
        return calculateOptimalAllocation(input.riskProfile, yields);
      }),

    simulatePerformance: publicProcedure
      .input(z.object({
        allocation: z.object({
          rivera: z.number(),
          merchant_moe: z.number(),
          agni: z.number(),
        }),
        investmentAmount: z.number(),
        days: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return simulatePortfolioPerformance(
          input.allocation,
          input.investmentAmount,
          input.days
        );
      }),

    getProtocolRisks: publicProcedure
      .input(z.object({
        protocol: z.enum(['rivera', 'merchant_moe', 'agni']).optional(),
      }))
      .query(async ({ input }) => {
        if (input.protocol) {
          return getProtocolRiskMetrics(input.protocol);
        }
        return {
          rivera: getProtocolRiskMetrics('rivera'),
          merchant_moe: getProtocolRiskMetrics('merchant_moe'),
          agni: getProtocolRiskMetrics('agni'),
        };
      }),
  }),

  // ============ REBALANCING ============
  rebalancing: router({
    generateRecommendation: protectedProcedure
      .input(z.object({
        vaultId: z.number(),
        currentAllocation: z.object({
          rivera: z.number(),
          merchant_moe: z.number(),
          agni: z.number(),
        }),
        riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
        investmentGoal: z.enum(['yield', 'growth', 'stability']),
      }))
      .mutation(async ({ input }) => {
        const sentiment = await analyzeMarketSentiment({
          currentAPYs: { rivera: 8.5, merchant_moe: 12.3, agni: 10.2 },
          tvls: { rivera: 45, merchant_moe: 28, agni: 25.53 },
          dailyVolumes: { rivera: 2.5, merchant_moe: 1.8, agni: 3.6 },
        });

        const recommendation = await generateRebalancingRecommendation(
          input.currentAllocation,
          sentiment,
          input.riskLevel,
          input.investmentGoal
        );

        const result = await db.createRebalancingRecommendation(input.vaultId, {
          currentAllocation: input.currentAllocation,
          recommendedAllocation: recommendation.recommendedAllocation,
          reason: recommendation.reason,
          projectedReturnIncrease: recommendation.projectedReturnIncrease,
          projectedAPY: recommendation.projectedAPY,
          riskScore: recommendation.riskScore,
        });

        return {
          success: true,
          recommendationId: (result as any).insertId || 1,
          recommendation,
        };
      }),

    getRecommendations: protectedProcedure
      .input(z.object({
        vaultId: z.number(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getVaultRecommendations(input.vaultId, input.status);
      }),

    acceptRecommendation: protectedProcedure
      .input(z.object({
        recommendationId: z.number(),
        transactionHash: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateRecommendationStatus(
          input.recommendationId,
          'executed',
          { transactionHash: input.transactionHash }
        );
        return { success: true };
      }),

    rejectRecommendation: protectedProcedure
      .input(z.object({ recommendationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateRecommendationStatus(input.recommendationId, 'rejected');
        return { success: true };
      }),

    getHistory: protectedProcedure
      .input(z.object({ vaultId: z.number() }))
      .query(async ({ input }) => {
        return db.getVaultRebalancingHistory(input.vaultId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

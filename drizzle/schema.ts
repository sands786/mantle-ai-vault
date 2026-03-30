import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  json,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * AI Vaults - User's multi-protocol yield optimization vaults
 */
export const aiVaults = mysqlTable("ai_vaults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Risk profile: conservative, moderate, aggressive
  riskLevel: mysqlEnum("riskLevel", ["conservative", "moderate", "aggressive"]).default("moderate").notNull(),
  
  // Investment goals: yield, growth, stability
  investmentGoal: mysqlEnum("investmentGoal", ["yield", "growth", "stability"]).default("yield").notNull(),
  
  // Vault status
  status: mysqlEnum("status", ["active", "paused", "closed"]).default("active").notNull(),
  
  // Financial metrics
  totalValueUSD: decimal("totalValueUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  totalReturnsUSD: decimal("totalReturnsUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  totalReturnsPercent: decimal("totalReturnsPercent", { precision: 10, scale: 4 }).default("0").notNull(),
  
  // Initial deposit
  initialDepositUSD: decimal("initialDepositUSD", { precision: 18, scale: 2 }).notNull(),
  
  // Rebalancing settings
  autoRebalanceEnabled: boolean("autoRebalanceEnabled").default(true).notNull(),
  rebalanceThresholdPercent: decimal("rebalanceThresholdPercent", { precision: 5, scale: 2 }).default("5").notNull(),
  
  // Smart contract reference
  smartContractAddress: varchar("smartContractAddress", { length: 42 }),
  mantle_chain_id: int("mantle_chain_id").default(5000), // Mantle mainnet
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIVault = typeof aiVaults.$inferSelect;
export type InsertAIVault = typeof aiVaults.$inferInsert;

/**
 * Vault Allocations - Current allocation across protocols
 */
export const vaultAllocations = mysqlTable("vault_allocations", {
  id: int("id").autoincrement().primaryKey(),
  vaultId: int("vaultId").notNull(),
  
  // Protocol: rivera, merchant_moe, agni
  protocol: mysqlEnum("protocol", ["rivera", "merchant_moe", "agni"]).notNull(),
  
  // Allocation details
  amountUSD: decimal("amountUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  percentageAllocation: decimal("percentageAllocation", { precision: 5, scale: 2 }).default("0").notNull(),
  
  // Protocol-specific data
  protocolVaultAddress: varchar("protocolVaultAddress", { length: 42 }),
  lpTokensHeld: decimal("lpTokensHeld", { precision: 18, scale: 6 }).default("0").notNull(),
  
  // Performance metrics
  currentAPY: decimal("currentAPY", { precision: 10, scale: 4 }).default("0").notNull(),
  earnedUSD: decimal("earnedUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Last update
  lastRebalancedAt: timestamp("lastRebalancedAt"),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultAllocation = typeof vaultAllocations.$inferSelect;
export type InsertVaultAllocation = typeof vaultAllocations.$inferInsert;

/**
 * Performance History - Track vault performance over time
 */
export const performanceHistory = mysqlTable("performance_history", {
  id: int("id").autoincrement().primaryKey(),
  vaultId: int("vaultId").notNull(),
  
  // Daily snapshot
  snapshotDate: timestamp("snapshotDate").notNull(),
  
  // Portfolio metrics
  totalValueUSD: decimal("totalValueUSD", { precision: 18, scale: 2 }).notNull(),
  totalReturnsUSD: decimal("totalReturnsUSD", { precision: 18, scale: 2 }).notNull(),
  totalReturnsPercent: decimal("totalReturnsPercent", { precision: 10, scale: 4 }).notNull(),
  
  // Benchmark (simple average of all protocols' APY)
  benchmarkAPY: decimal("benchmarkAPY", { precision: 10, scale: 4 }).default("0").notNull(),
  benchmarkReturnsUSD: decimal("benchmarkReturnsUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Allocation snapshot (JSON for historical reference)
  allocationSnapshot: json("allocationSnapshot"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceHistory = typeof performanceHistory.$inferSelect;
export type InsertPerformanceHistory = typeof performanceHistory.$inferInsert;

/**
 * Market Sentiment Analysis - AI-driven market analysis results
 */
export const sentimentAnalysis = mysqlTable("sentiment_analysis", {
  id: int("id").autoincrement().primaryKey(),
  
  // Sentiment score: -1.0 (very bearish) to 1.0 (very bullish)
  sentimentScore: decimal("sentimentScore", { precision: 3, scale: 2 }).notNull(),
  
  // Confidence level: 0.0 to 1.0
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  
  // Analysis details
  summary: text("summary").notNull(),
  
  // Data sources analyzed
  dataSources: json("dataSources"), // Array of sources: news, social, on-chain
  
  // Recommendation
  recommendation: mysqlEnum("recommendation", ["buy", "hold", "sell"]).notNull(),
  
  // Protocol-specific sentiment
  protocolSentiments: json("protocolSentiments"), // { rivera: 0.5, merchant_moe: 0.3, agni: 0.6 }
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = typeof sentimentAnalysis.$inferInsert;

/**
 * Rebalancing Recommendations - AI-generated rebalancing suggestions
 */
export const rebalancingRecommendations = mysqlTable("rebalancing_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  vaultId: int("vaultId").notNull(),
  
  // Current allocation
  currentAllocation: json("currentAllocation").notNull(), // { rivera: 30, merchant_moe: 40, agni: 30 }
  
  // Recommended allocation
  recommendedAllocation: json("recommendedAllocation").notNull(),
  
  // Reason for recommendation
  reason: text("reason").notNull(),
  
  // Expected impact
  projectedReturnIncrease: decimal("projectedReturnIncrease", { precision: 10, scale: 4 }).notNull(),
  projectedAPY: decimal("projectedAPY", { precision: 10, scale: 4 }).notNull(),
  
  // Risk assessment
  riskScore: decimal("riskScore", { precision: 3, scale: 2 }).notNull(), // 0-1.0
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "executed"]).default("pending").notNull(),
  
  // Execution details (if executed)
  executedAt: timestamp("executedAt"),
  transactionHash: varchar("transactionHash", { length: 66 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RebalancingRecommendation = typeof rebalancingRecommendations.$inferSelect;
export type InsertRebalancingRecommendation = typeof rebalancingRecommendations.$inferInsert;

/**
 * Protocol Yields - Real-time APY data from each protocol
 */
export const protocolYields = mysqlTable("protocol_yields", {
  id: int("id").autoincrement().primaryKey(),
  
  // Protocol
  protocol: mysqlEnum("protocol", ["rivera", "merchant_moe", "agni"]).notNull(),
  
  // Pool/Vault identifier
  poolId: varchar("poolId", { length: 255 }).notNull(),
  poolName: varchar("poolName", { length: 255 }),
  
  // Yield metrics
  currentAPY: decimal("currentAPY", { precision: 10, scale: 4 }).notNull(),
  apr: decimal("apr", { precision: 10, scale: 4 }),
  
  // Risk metrics
  tvl: decimal("tvl", { precision: 18, scale: 2 }), // Total Value Locked
  dailyVolume: decimal("dailyVolume", { precision: 18, scale: 2 }),
  
  // Pool details
  tokenPair: varchar("tokenPair", { length: 100 }), // e.g., "MNT/USDC"
  
  // Last update
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProtocolYield = typeof protocolYields.$inferSelect;
export type InsertProtocolYield = typeof protocolYields.$inferInsert;

/**
 * Rebalancing History - Track all rebalancing events
 */
export const rebalancingHistory = mysqlTable("rebalancing_history", {
  id: int("id").autoincrement().primaryKey(),
  vaultId: int("vaultId").notNull(),
  recommendationId: int("recommendationId"),
  
  // Before and after
  previousAllocation: json("previousAllocation").notNull(),
  newAllocation: json("newAllocation").notNull(),
  
  // Execution details
  transactionHash: varchar("transactionHash", { length: 66 }).notNull(),
  gasUsed: decimal("gasUsed", { precision: 18, scale: 2 }),
  gasPrice: decimal("gasPrice", { precision: 18, scale: 2 }),
  
  // Reason
  reason: varchar("reason", { length: 255 }),
  
  // Result
  success: boolean("success").default(true).notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RebalancingHistory = typeof rebalancingHistory.$inferSelect;
export type InsertRebalancingHistory = typeof rebalancingHistory.$inferInsert;

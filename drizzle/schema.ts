import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  integer
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const riskLevelEnum = pgEnum("riskLevel", ["conservative", "moderate", "aggressive"]);
export const investmentGoalEnum = pgEnum("investmentGoal", ["yield", "growth", "stability"]);
export const vaultStatusEnum = pgEnum("vaultStatus", ["active", "paused", "closed"]);
export const protocolEnum = pgEnum("protocol", ["rivera", "merchant_moe", "agni"]);
export const recommendationEnum = pgEnum("recommendation", ["buy", "hold", "sell"]);
export const rebalanceStatusEnum = pgEnum("rebalanceStatus", ["pending", "accepted", "rejected", "executed"]);

export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const aiVaults = pgTable("ai_vaults", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  riskLevel: riskLevelEnum("riskLevel").default("moderate").notNull(),
  investmentGoal: investmentGoalEnum("investmentGoal").default("yield").notNull(),
  status: vaultStatusEnum("status").default("active").notNull(),
  totalValueUSD: decimal("totalValueUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  totalReturnsUSD: decimal("totalReturnsUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  totalReturnsPercent: decimal("totalReturnsPercent", { precision: 10, scale: 4 }).default("0").notNull(),
  initialDepositUSD: decimal("initialDepositUSD", { precision: 18, scale: 2 }).notNull(),
  autoRebalanceEnabled: boolean("autoRebalanceEnabled").default(true).notNull(),
  rebalanceThresholdPercent: decimal("rebalanceThresholdPercent", { precision: 5, scale: 2 }).default("5").notNull(),
  smartContractAddress: varchar("smartContractAddress", { length: 42 }),
  mantle_chain_id: integer("mantle_chain_id").default(5000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AIVault = typeof aiVaults.$inferSelect;
export type InsertAIVault = typeof aiVaults.$inferInsert;

export const vaultAllocations = pgTable("vault_allocations", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vaultId: integer("vaultId").notNull(),
  protocol: protocolEnum("protocol").notNull(),
  amountUSD: decimal("amountUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  percentageAllocation: decimal("percentageAllocation", { precision: 5, scale: 2 }).default("0").notNull(),
  protocolVaultAddress: varchar("protocolVaultAddress", { length: 42 }),
  lpTokensHeld: decimal("lpTokensHeld", { precision: 18, scale: 6 }).default("0").notNull(),
  currentAPY: decimal("currentAPY", { precision: 10, scale: 4 }).default("0").notNull(),
  earnedUSD: decimal("earnedUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  lastRebalancedAt: timestamp("lastRebalancedAt"),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VaultAllocation = typeof vaultAllocations.$inferSelect;
export type InsertVaultAllocation = typeof vaultAllocations.$inferInsert;

export const performanceHistory = pgTable("performance_history", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vaultId: integer("vaultId").notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalValueUSD: decimal("totalValueUSD", { precision: 18, scale: 2 }).notNull(),
  totalReturnsUSD: decimal("totalReturnsUSD", { precision: 18, scale: 2 }).notNull(),
  totalReturnsPercent: decimal("totalReturnsPercent", { precision: 10, scale: 4 }).notNull(),
  benchmarkAPY: decimal("benchmarkAPY", { precision: 10, scale: 4 }).default("0").notNull(),
  benchmarkReturnsUSD: decimal("benchmarkReturnsUSD", { precision: 18, scale: 2 }).default("0").notNull(),
  allocationSnapshot: json("allocationSnapshot"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceHistory = typeof performanceHistory.$inferSelect;
export type InsertPerformanceHistory = typeof performanceHistory.$inferInsert;

export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  sentimentScore: decimal("sentimentScore", { precision: 3, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  summary: text("summary").notNull(),
  dataSources: json("dataSources"),
  recommendation: recommendationEnum("recommendation").notNull(),
  protocolSentiments: json("protocolSentiments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = typeof sentimentAnalysis.$inferInsert;

export const rebalancingRecommendations = pgTable("rebalancing_recommendations", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vaultId: integer("vaultId").notNull(),
  currentAllocation: json("currentAllocation").notNull(),
  recommendedAllocation: json("recommendedAllocation").notNull(),
  reason: text("reason").notNull(),
  projectedReturnIncrease: decimal("projectedReturnIncrease", { precision: 10, scale: 4 }).notNull(),
  projectedAPY: decimal("projectedAPY", { precision: 10, scale: 4 }).notNull(),
  riskScore: decimal("riskScore", { precision: 3, scale: 2 }).notNull(),
  status: rebalanceStatusEnum("status").default("pending").notNull(),
  executedAt: timestamp("executedAt"),
  transactionHash: varchar("transactionHash", { length: 66 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RebalancingRecommendation = typeof rebalancingRecommendations.$inferSelect;
export type InsertRebalancingRecommendation = typeof rebalancingRecommendations.$inferInsert;

export const protocolYields = pgTable("protocol_yields", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  protocol: protocolEnum("protocol").notNull(),
  poolId: varchar("poolId", { length: 255 }).notNull(),
  poolName: varchar("poolName", { length: 255 }),
  currentAPY: decimal("currentAPY", { precision: 10, scale: 4 }).notNull(),
  apr: decimal("apr", { precision: 10, scale: 4 }),
  tvl: decimal("tvl", { precision: 18, scale: 2 }),
  dailyVolume: decimal("dailyVolume", { precision: 18, scale: 2 }),
  tokenPair: varchar("tokenPair", { length: 100 }),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProtocolYield = typeof protocolYields.$inferSelect;
export type InsertProtocolYield = typeof protocolYields.$inferInsert;

export const rebalancingHistory = pgTable("rebalancing_history", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  vaultId: integer("vaultId").notNull(),
  recommendationId: integer("recommendationId"),
  previousAllocation: json("previousAllocation").notNull(),
  newAllocation: json("newAllocation").notNull(),
  transactionHash: varchar("transactionHash", { length: 66 }).notNull(),
  gasUsed: decimal("gasUsed", { precision: 18, scale: 2 }),
  gasPrice: decimal("gasPrice", { precision: 18, scale: 2 }),
  reason: varchar("reason", { length: 255 }),
  success: boolean("success").default(true).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RebalancingHistory = typeof rebalancingHistory.$inferSelect;
export type InsertRebalancingHistory = typeof rebalancingHistory.$inferInsert;

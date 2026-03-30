import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
  InsertUser, 
  users,
  aiVaults,
  vaultAllocations,
  performanceHistory,
  sentimentAnalysis,
  rebalancingRecommendations,
  protocolYields,
  rebalancingHistory,
  type AIVault,
  type VaultAllocation,
  type PerformanceHistory,
  type RebalancingRecommendation,
  type ProtocolYield,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ VAULT OPERATIONS ============

export async function createVault(userId: number, vaultData: {
  name: string;
  description?: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  investmentGoal: 'yield' | 'growth' | 'stability';
  initialDepositUSD: string;
  autoRebalanceEnabled?: boolean;
  rebalanceThresholdPercent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiVaults).values({
    userId,
    name: vaultData.name,
    description: vaultData.description,
    riskLevel: vaultData.riskLevel,
    investmentGoal: vaultData.investmentGoal,
    initialDepositUSD: vaultData.initialDepositUSD as any,
    totalValueUSD: vaultData.initialDepositUSD as any,
    autoRebalanceEnabled: vaultData.autoRebalanceEnabled ?? true,
    rebalanceThresholdPercent: vaultData.rebalanceThresholdPercent as any,
  });

  return result;
}

export async function getUserVaults(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(aiVaults).where(eq(aiVaults.userId, userId));
}

export async function getVaultById(vaultId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(aiVaults).where(eq(aiVaults.id, vaultId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateVault(vaultId: number, updates: Partial<AIVault>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(aiVaults).set(updates).where(eq(aiVaults.id, vaultId));
}

// ============ ALLOCATION OPERATIONS ============

export async function getVaultAllocations(vaultId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(vaultAllocations).where(eq(vaultAllocations.vaultId, vaultId));
}

export async function upsertAllocation(vaultId: number, protocol: 'rivera' | 'merchant_moe' | 'agni', allocationData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(vaultAllocations)
    .where(and(eq(vaultAllocations.vaultId, vaultId), eq(vaultAllocations.protocol, protocol)))
    .limit(1);

  if (existing.length > 0) {
    return db.update(vaultAllocations)
      .set(allocationData)
      .where(and(eq(vaultAllocations.vaultId, vaultId), eq(vaultAllocations.protocol, protocol)));
  } else {
    return db.insert(vaultAllocations).values({
      vaultId,
      protocol,
      ...allocationData,
    });
  }
}

// ============ PERFORMANCE HISTORY ============

export async function recordPerformanceSnapshot(vaultId: number, snapshot: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(performanceHistory).values({
    vaultId,
    snapshotDate: new Date(),
    ...snapshot,
  });
}

export async function getVaultPerformanceHistory(vaultId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

  return db.select().from(performanceHistory)
    .where(and(
      eq(performanceHistory.vaultId, vaultId),
    ))
    .orderBy(desc(performanceHistory.snapshotDate));
}

// ============ SENTIMENT ANALYSIS ============

export async function recordSentimentAnalysis(sentimentData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(sentimentAnalysis).values(sentimentData);
}

export async function getLatestSentimentAnalysis() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(sentimentAnalysis)
    .orderBy(desc(sentimentAnalysis.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ REBALANCING RECOMMENDATIONS ============

export async function createRebalancingRecommendation(vaultId: number, recommendationData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(rebalancingRecommendations).values({
    vaultId,
    ...recommendationData,
  });
}

export async function getVaultRecommendations(vaultId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (status) {
    return db.select().from(rebalancingRecommendations)
      .where(and(
        eq(rebalancingRecommendations.vaultId, vaultId),
        eq(rebalancingRecommendations.status, status as any)
      ))
      .orderBy(desc(rebalancingRecommendations.createdAt));
  }

  return db.select().from(rebalancingRecommendations)
    .where(eq(rebalancingRecommendations.vaultId, vaultId))
    .orderBy(desc(rebalancingRecommendations.createdAt));
}

export async function updateRecommendationStatus(recommendationId: number, status: string, executionData?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (executionData) {
    updateData.executedAt = new Date();
    updateData.transactionHash = executionData.transactionHash;
  }

  return db.update(rebalancingRecommendations)
    .set(updateData)
    .where(eq(rebalancingRecommendations.id, recommendationId));
}

// ============ PROTOCOL YIELDS ============

export async function upsertProtocolYield(yieldData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(protocolYields)
    .where(and(
      eq(protocolYields.protocol, yieldData.protocol),
      eq(protocolYields.poolId, yieldData.poolId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return db.update(protocolYields)
      .set(yieldData)
      .where(and(
        eq(protocolYields.protocol, yieldData.protocol),
        eq(protocolYields.poolId, yieldData.poolId)
      ));
  } else {
    return db.insert(protocolYields).values(yieldData);
  }
}

export async function getProtocolYields(protocol?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (protocol) {
    return db.select().from(protocolYields).where(eq(protocolYields.protocol, protocol as any));
  }

  return db.select().from(protocolYields);
}

// ============ REBALANCING HISTORY ============

export async function recordRebalancingEvent(vaultId: number, historyData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(rebalancingHistory).values({
    vaultId,
    ...historyData,
  });
}

export async function getVaultRebalancingHistory(vaultId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(rebalancingHistory)
    .where(eq(rebalancingHistory.vaultId, vaultId))
    .orderBy(desc(rebalancingHistory.createdAt));
}

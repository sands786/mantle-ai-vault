CREATE TABLE `ai_vaults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`riskLevel` enum('conservative','moderate','aggressive') NOT NULL DEFAULT 'moderate',
	`investmentGoal` enum('yield','growth','stability') NOT NULL DEFAULT 'yield',
	`status` enum('active','paused','closed') NOT NULL DEFAULT 'active',
	`totalValueUSD` decimal(18,2) NOT NULL DEFAULT '0',
	`totalReturnsUSD` decimal(18,2) NOT NULL DEFAULT '0',
	`totalReturnsPercent` decimal(10,4) NOT NULL DEFAULT '0',
	`initialDepositUSD` decimal(18,2) NOT NULL,
	`autoRebalanceEnabled` boolean NOT NULL DEFAULT true,
	`rebalanceThresholdPercent` decimal(5,2) NOT NULL DEFAULT '5',
	`smartContractAddress` varchar(42),
	`mantle_chain_id` int DEFAULT 5000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_vaults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaultId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`totalValueUSD` decimal(18,2) NOT NULL,
	`totalReturnsUSD` decimal(18,2) NOT NULL,
	`totalReturnsPercent` decimal(10,4) NOT NULL,
	`benchmarkAPY` decimal(10,4) NOT NULL DEFAULT '0',
	`benchmarkReturnsUSD` decimal(18,2) NOT NULL DEFAULT '0',
	`allocationSnapshot` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocol_yields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`protocol` enum('rivera','merchant_moe','agni') NOT NULL,
	`poolId` varchar(255) NOT NULL,
	`poolName` varchar(255),
	`currentAPY` decimal(10,4) NOT NULL,
	`apr` decimal(10,4),
	`tvl` decimal(18,2),
	`dailyVolume` decimal(18,2),
	`tokenPair` varchar(100),
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocol_yields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rebalancing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaultId` int NOT NULL,
	`recommendationId` int,
	`previousAllocation` json NOT NULL,
	`newAllocation` json NOT NULL,
	`transactionHash` varchar(66) NOT NULL,
	`gasUsed` decimal(18,2),
	`gasPrice` decimal(18,2),
	`reason` varchar(255),
	`success` boolean NOT NULL DEFAULT true,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rebalancing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rebalancing_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaultId` int NOT NULL,
	`currentAllocation` json NOT NULL,
	`recommendedAllocation` json NOT NULL,
	`reason` text NOT NULL,
	`projectedReturnIncrease` decimal(10,4) NOT NULL,
	`projectedAPY` decimal(10,4) NOT NULL,
	`riskScore` decimal(3,2) NOT NULL,
	`status` enum('pending','accepted','rejected','executed') NOT NULL DEFAULT 'pending',
	`executedAt` timestamp,
	`transactionHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rebalancing_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sentiment_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sentimentScore` decimal(3,2) NOT NULL,
	`confidence` decimal(3,2) NOT NULL,
	`summary` text NOT NULL,
	`dataSources` json,
	`recommendation` enum('buy','hold','sell') NOT NULL,
	`protocolSentiments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sentiment_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vaultId` int NOT NULL,
	`protocol` enum('rivera','merchant_moe','agni') NOT NULL,
	`amountUSD` decimal(18,2) NOT NULL DEFAULT '0',
	`percentageAllocation` decimal(5,2) NOT NULL DEFAULT '0',
	`protocolVaultAddress` varchar(42),
	`lpTokensHeld` decimal(18,6) NOT NULL DEFAULT '0',
	`currentAPY` decimal(10,4) NOT NULL DEFAULT '0',
	`earnedUSD` decimal(18,2) NOT NULL DEFAULT '0',
	`lastRebalancedAt` timestamp,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vault_allocations_id` PRIMARY KEY(`id`)
);

# Mantle AI Agentic Vault (MAAV) - Development TODO

## Phase 1: Database & Schema
- [x] Design vault schema (vault_id, owner, allocation, risk_level, created_at, updated_at)
- [x] Design allocation schema (vault_id, protocol, amount, percentage, last_updated)
- [x] Design performance_history schema (vault_id, date, total_value, returns, benchmark_returns)
- [x] Design sentiment_analysis schema (timestamp, market_sentiment, confidence, data_sources)
- [x] Create Drizzle schema file with all tables
- [x] Generate and apply database migrations

## Phase 2: Backend - Core Procedures
- [x] Create vault CRUD procedures (create, read, update, delete)
- [x] Create allocation management procedures
- [x] Create performance tracking procedures
- [x] Implement vault statistics queries (total_value, returns, allocation breakdown)

## Phase 3: Backend - AI & Analytics
- [x] Implement LLM sentiment analyzer (market sentiment from news/social)
- [x] Create yield comparison engine (fetch APY from Rivera, Merchant Moe, Agni)
- [x] Build rebalancing recommendation engine (AI-driven allocation suggestions)
- [x] Create historical performance tracker
- [x] Implement risk assessment based on user preferences

## Phase 4: Backend - Smart Contract Integration
- [ ] Create smart contract interaction helpers (deposit, withdraw, rebalance)
- [ ] Build Mantle Network RPC integration
- [ ] Implement ERC-4626 vault interface helpers (Rivera integration)
- [ ] Create transaction simulation engine (preview rebalancing results) - Partially done via simulation engine

## Phase 5: Frontend - Core Dashboard
- [x] Build main dashboard layout with portfolio overview
- [x] Create real-time portfolio allocation display
- [x] Implement vault statistics cards (total value, returns, allocation %)
- [x] Build navigation structure (Dashboard, Vaults, Analytics, Settings)

## Phase 6: Frontend - Vault Management
- [x] Create vault creation form (name, initial deposit, risk level)
- [x] Build vault detail view with allocation breakdown
- [x] Implement allocation adjustment UI
- [x] Create risk preference selector

## Phase 7: Frontend - AI Features
- [x] Build sentiment analysis display (market sentiment indicator)
- [x] Create yield comparison table (protocols, APY, risk metrics)
- [x] Implement rebalancing recommendation panel
- [x] Build rebalancing simulator (show projected returns)

## Phase 8: Frontend - Analytics & Charts
- [x] Create performance chart (vault value over time)
- [x] Build allocation pie/donut chart
- [x] Implement protocol performance comparison chart
- [x] Create returns vs benchmark chart

## Phase 9: Testing & Quality
- [ ] Write vitest tests for backend procedures
- [ ] Write vitest tests for LLM sentiment analyzer
- [ ] Write vitest tests for yield comparison engine
- [ ] Write vitest tests for rebalancing logic
- [ ] Test smart contract integration flows

## Phase 10: Documentation & GitHub
- [ ] Write comprehensive README with features overview
- [ ] Create architecture diagram (system design)
- [ ] Create data flow diagram (AI analysis pipeline)
- [ ] Create smart contract integration guide
- [ ] Write API documentation for all tRPC procedures
- [ ] Create setup and deployment guide
- [ ] Write Mantle integration guide

## Phase 11: Final Polish & Delivery
- [ ] Create checkpoint
- [ ] Prepare GitHub push instructions
- [ ] Write X post thread for competition submission
- [ ] Prepare all deliverables for user

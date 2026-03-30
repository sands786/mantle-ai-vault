# Mantle AI Agentic Vault (MAAV)

**AI-Powered DeFi Yield Optimization Platform on Mantle Network**

MAAV is a cutting-edge platform that combines artificial intelligence with DeFi to help users maximize their yield farming returns on Mantle Network. By leveraging LLM-driven market sentiment analysis and real-time yield comparison across multiple protocols, MAAV provides intelligent rebalancing recommendations that adapt to market conditions and user risk preferences.

## 🎯 Key Features

### 1. **AI-Powered Market Sentiment Analysis**
- LLM-based analysis of market conditions, news, and on-chain metrics
- Protocol-specific sentiment scoring (Rivera, Merchant Moe, Agni)
- Real-time recommendation generation (Buy, Hold, Sell)
- Confidence scoring for all recommendations

### 2. **Multi-Protocol Yield Aggregation**
- **Rivera Money**: Risk-optimized concentrated liquidity with active management
- **Merchant Moe**: High-yield DEX farming with MOE token incentives
- **Agni Finance**: Concentrated liquidity with insurance protection
- Real-time APY comparison and risk metrics

### 3. **Intelligent Rebalancing Engine**
- AI-driven allocation optimization based on market sentiment
- User risk preferences (Conservative, Moderate, Aggressive)
- Investment goal alignment (Yield, Growth, Stability)
- Projected return simulation before execution

### 4. **Comprehensive Dashboard**
- Real-time portfolio allocation visualization
- Performance tracking with historical charts
- Vault management and creation interface
- Rebalancing recommendation panel

### 5. **Risk Management**
- User-defined risk profiles guide AI decisions
- Protocol-specific risk scoring
- Volatility analysis and capital preservation options
- Smart contract audit verification

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  Dashboard | Vault Management | Analytics | Rebalancing    │
└──────────────────────┬──────────────────────────────────────┘
                       │ tRPC
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Express + tRPC)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AI & Analytics Layer                                   │ │
│  │ • LLM Sentiment Analyzer                              │ │
│  │ • Yield Comparison Engine                             │ │
│  │ • Rebalancing Recommendation Engine                   │ │
│  │ • Risk Assessment Module                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Core Business Logic (tRPC Routers)                    │ │
│  │ • Vault Management (CRUD)                             │ │
│  │ • Allocation Management                               │ │
│  │ • Performance Tracking                                │ │
│  │ • Rebalancing Workflows                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Data Access Layer (Drizzle ORM)                       │ │
│  │ • Database Helpers & Query Builders                   │ │
│  │ • Transaction Management                              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Data & Blockchain Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Database   │  │ Mantle RPC  │  │ Smart Contracts  │   │
│  │  (MySQL)    │  │  (Mainnet)  │  │ (ERC-4626, etc)  │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: AI Rebalancing Pipeline

```
Market Data Collection
    ↓
┌─────────────────────────────────────┐
│ LLM Sentiment Analysis              │
│ • Analyze market conditions         │
│ • Score protocol sentiment          │
│ • Generate recommendations          │
└────────────────┬────────────────────┘
                 ↓
         Yield Comparison
         ↓
┌─────────────────────────────────────┐
│ Rebalancing Engine                  │
│ • Calculate optimal allocation      │
│ • Apply risk constraints            │
│ • Project returns                   │
└────────────────┬────────────────────┘
                 ↓
        Store Recommendation
                 ↓
         User Approval
                 ↓
    Execute on Smart Contract
```

## 🗄️ Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `ai_vaults` | User vault records | id, userId, name, riskLevel, investmentGoal, totalValueUSD, status |
| `vault_allocations` | Current protocol allocations | vaultId, protocol, amountUSD, percentageAllocation, currentAPY |
| `performance_history` | Daily performance snapshots | vaultId, snapshotDate, totalValueUSD, totalReturnsPercent, benchmarkAPY |
| `sentiment_analysis` | LLM analysis results | sentimentScore, confidence, recommendation, protocolSentiments |
| `rebalancing_recommendations` | AI-generated recommendations | vaultId, currentAllocation, recommendedAllocation, projectedAPY, status |
| `rebalancing_history` | Executed rebalancing events | vaultId, previousAllocation, newAllocation, transactionHash, success |
| `protocol_yields` | Real-time protocol APY data | protocol, poolId, currentAPY, tvl, dailyVolume |

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Manus OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mantle-ai-vault.git
cd mantle-ai-vault

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/mantle_ai_vault

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# JWT
JWT_SECRET=your_jwt_secret

# LLM Integration
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key

# Mantle Network
MANTLE_RPC_URL=https://rpc.mantle.xyz
MANTLE_CHAIN_ID=5000
```

## 🔗 Mantle Network Integration

### Smart Contract Integration

MAAV integrates with Mantle Network smart contracts through the following interfaces:

#### 1. **ERC-4626 Vault Standard (Rivera)**

```solidity
interface IERC4626 {
    function deposit(uint256 assets, address receiver) external returns (uint256);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
}
```

**Integration Point**: MAAV uses the ERC-4626 interface to deposit/withdraw from Rivera vaults and track share balances.

#### 2. **DEX Interfaces (Merchant Moe, Agni)**

```solidity
interface IUniswapV3Pool {
    function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes calldata data) external returns (int256, int256);
    function observe(uint32[] calldata secondsAgos) external view returns (uint56[] calldata tickCumulatives, uint160[] calldata secondsPerLiquidityCumulativeX128s);
}
```

**Integration Point**: MAAV queries pool data to calculate APY and execute rebalancing swaps.

#### 3. **Custom MAAV Vault Contract**

The platform includes a custom smart contract for multi-protocol vault management:

```solidity
contract MAVAVault is ERC4626 {
    // Multi-protocol deposit/withdrawal
    function depositToProtocol(address protocol, uint256 amount) external;
    function withdrawFromProtocol(address protocol, uint256 amount) external;
    
    // Rebalancing
    function rebalance(uint256[] calldata allocations) external onlyOwner;
    
    // Performance tracking
    function getPortfolioValue() external view returns (uint256);
    function getProtocolAllocations() external view returns (uint256[] memory);
}
```

### RPC Endpoints

```typescript
// Mantle Mainnet
const MANTLE_RPC = "https://rpc.mantle.xyz";
const MANTLE_CHAIN_ID = 5000;

// Testnet (if available)
const MANTLE_TESTNET_RPC = "https://rpc.testnet.mantle.xyz";
const MANTLE_TESTNET_CHAIN_ID = 5001;
```

### Protocol Contract Addresses

| Protocol | Contract Address | Type |
|----------|------------------|------|
| Rivera | `0x...` | ERC-4626 Vault |
| Merchant Moe | `0x...` | DEX/AMM |
| Agni Finance | `0x...` | Concentrated Liquidity |

*Note: Contract addresses should be updated with actual Mantle mainnet addresses*

## 📊 API Reference

### tRPC Procedures

#### Vault Management

```typescript
// Create vault
trpc.vault.create.mutate({
  name: "My Yield Vault",
  riskLevel: "moderate",
  investmentGoal: "yield",
  initialDepositUSD: "1000"
})

// List user vaults
trpc.vault.list.useQuery()

// Get vault details
trpc.vault.getById.useQuery({ vaultId: 1 })

// Update vault
trpc.vault.update.mutate({
  vaultId: 1,
  updates: { status: "paused" }
})
```

#### AI & Analytics

```typescript
// Analyze market sentiment
trpc.ai.analyzeSentiment.useQuery({
  currentAPYs: { rivera: 8.5, merchant_moe: 12.3, agni: 10.2 },
  tvls: { rivera: 45, merchant_moe: 28, agni: 25.53 },
  dailyVolumes: { rivera: 2.5, merchant_moe: 1.8, agni: 3.6 }
})

// Compare yields
trpc.ai.compareYields.useQuery()

// Get optimal allocation
trpc.ai.getOptimalAllocation.useQuery({ riskProfile: "moderate" })

// Simulate performance
trpc.ai.simulatePerformance.useQuery({
  allocation: { rivera: 30, merchant_moe: 40, agni: 30 },
  investmentAmount: 1000,
  days: 365
})
```

#### Rebalancing

```typescript
// Generate recommendation
trpc.rebalancing.generateRecommendation.mutate({
  vaultId: 1,
  currentAllocation: { rivera: 30, merchant_moe: 40, agni: 30 },
  riskLevel: "moderate",
  investmentGoal: "yield"
})

// Accept recommendation
trpc.rebalancing.acceptRecommendation.mutate({
  recommendationId: 1,
  transactionHash: "0x..."
})

// Get recommendations
trpc.rebalancing.getRecommendations.useQuery({ vaultId: 1 })
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/ai/sentimentAnalyzer.test.ts
```

### Test Coverage

- ✅ Sentiment analyzer LLM integration
- ✅ Yield comparison engine
- ✅ Rebalancing recommendation logic
- ✅ Vault CRUD operations
- ✅ Risk assessment calculations
- ✅ Portfolio simulation

## 🎨 Frontend Features

### Dashboard
- Real-time portfolio overview with key metrics
- Quick access to vault management and analytics
- AI recommendation highlights

### Vault Management
- Create vaults with custom risk profiles
- View detailed vault information
- Track allocation across protocols
- Monitor performance over time

### Analytics
- Market sentiment indicator
- Protocol yield comparison table
- Performance charts (value over time, returns)
- Risk metrics and volatility analysis

### Rebalancing Interface
- View AI-generated recommendations
- Preview projected returns before execution
- Accept/reject recommendations
- Track rebalancing history

## 🔐 Security Considerations

### Smart Contract Security
- All vault contracts should be audited
- Use OpenZeppelin's ERC-4626 implementation
- Implement access controls and reentrancy guards
- Test on Mantle testnet before mainnet deployment

### Data Security
- All user data encrypted at rest
- HTTPS-only communication
- JWT-based authentication
- Rate limiting on API endpoints

### Risk Management
- User-defined risk constraints
- Portfolio diversification requirements
- Slippage protection on swaps
- Emergency pause mechanisms

## 📈 Performance Metrics

### Expected Returns (Historical Average)
- **Conservative Portfolio**: 6-8% APY
- **Moderate Portfolio**: 9-12% APY
- **Aggressive Portfolio**: 12-18% APY

*Note: Past performance does not guarantee future results*

### Rebalancing Frequency
- Automatic: Every 7 days (if threshold exceeded)
- Manual: User-initiated at any time
- Threshold: 5% allocation drift (configurable)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Mantle Network** for the scalable L2 infrastructure
- **Rivera Money** for liquidity management innovation
- **Merchant Moe** for DEX infrastructure
- **Agni Finance** for concentrated liquidity solutions
- **Manus** for the AI and OAuth infrastructure

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Join the Mantle community on Discord
- Follow updates on Twitter @Mantle_Official

---

**Built with ❤️ for the Mantle Community**

*Mantle Squad Bounty: When AI Meets Mantle - Topic 2: Builder Track*

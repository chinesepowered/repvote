# RepVouch - Decentralized Reputation System

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by Flow](https://img.shields.io/badge/Powered%20by-Flow-00EF8B?logo=flow)](https://flow.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **Built for Flow Hackathon - Decentralized Economies, Governance & Science Track**

RepVouch is a decentralized reputation system where community members can vouch for each other through a secure two-step process. Built on Flow blockchain with Cadence smart contracts, it creates transparent and immutable reputation relationships.

## 🚀 Features

- **Two-Step Vouching**: Secure vouching process requiring explicit acceptance
- **Decentralized Reputation**: Transparent, immutable reputation stored on Flow blockchain
- **Community Trust**: Build trust through verified vouching relationships
- **Dynamic System**: Vouches can be created, accepted, and revoked
- **Gamified Levels**: Progress through reputation tiers to unlock new features
- **Trust Visualization**: Interactive network graph of vouching relationships

## 🎯 Use Cases

- **Open Source**: Code reviewer reputation and contributor trust
- **DAOs**: Governance participation and proposal creation rights
- **Grants**: Community-driven allocation based on trust
- **DeSci**: Scientific collaboration and peer review systems
- **Communities**: Member reputation and moderation privileges

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Blockchain**: Flow blockchain with Cadence 1.0 smart contracts
- **Wallet**: Flow Control Library (FCL) for wallet integration
- **UI**: Lucide React icons and Framer Motion animations

## 📋 How It Works

### Two-Step Vouching Process

1. **Create Vouch**: Voucher creates a vouch for another user (allocates their reputation)
2. **Accept Vouch**: Vouchee must explicitly accept the vouch to receive reputation benefits
3. **Revoke**: Either party can revoke the vouching relationship
4. **Remove**: Vouchee removes the received vouch after revocation

This two-step process ensures:
- **Explicit Consent**: Both parties must agree to the vouching relationship
- **Security**: No unauthorized reputation changes
- **Transparency**: Clear audit trail of all vouching actions

### Reputation System

- **Base Reputation**: Every user starts with 10 reputation points
- **Vouch Power**: Users can vouch up to 10% of their total reputation
- **Vouch Slots**: Maximum of 5 active vouches per user
- **Dynamic Updates**: Reputation changes in real-time with vouching activity

## 🎮 Reputation Levels

| Level | Min Reputation | Benefits |
|-------|----------------|----------|
| **Newcomer** | 0 | Basic access, can receive vouches |
| **Trusted** | 25 | Can vouch for others, vote on proposals |
| **Respected** | 100 | Create proposals, higher vouch power |
| **Authority** | 500 | Moderate discussions, exclusive features |
| **Legend** | 1000+ | All privileges, platform governance |

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Flow CLI (for local development)
- Flow wallet (Blocto, Dapper, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/repvouch/repvouch.git
cd repvouch

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=0x26cc4629675aa875
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard page
│   ├── leaderboard/       # Reputation leaderboard
│   └── about/             # About page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── ReputationCard.tsx # User reputation display
│   └── VouchingInterface.tsx # Vouching UI with two-step process
├── lib/                   # Utilities and helpers
│   ├── flow.ts           # Flow configuration
│   └── flowHelpers.ts    # Blockchain interaction
├── types/                 # TypeScript types
└── cadence/              # Smart contracts
    ├── contracts/        # Cadence contracts
    ├── transactions/     # Blockchain transactions
    │   ├── setup_user.cdc        # User initialization
    │   ├── create_vouch.cdc      # Create vouch (step 1)
    │   ├── accept_vouch.cdc      # Accept vouch (step 2)
    │   ├── revoke_vouch.cdc      # Revoke existing vouch
    │   └── remove_received_vouch.cdc # Remove received vouch
    └── scripts/          # Query scripts
```

## 🔗 Smart Contracts

The RepVouch system is powered by Cadence 1.0 smart contracts on Flow:

### Main Contract: RepVouch.cdc

- **User Management**: Create and manage user profiles
- **Vouching Logic**: Handle vouch creation and validation
- **Reputation Calculation**: Dynamic reputation scoring
- **Event Emission**: Transparent activity logging

### Two-Step Transaction Flow

#### Creating a Vouch
```cadence
// 1. Voucher creates vouch
import RepVouch from 0x26cc4629675aa875

transaction(voucheeAddress: Address, amount: UFix64) {
    // Validates voucher has sufficient reputation
    // Creates vouch on voucher's side
    // Emits VouchCreated event
}
```

#### Accepting a Vouch
```cadence
// 2. Vouchee accepts vouch
import RepVouch from 0x26cc4629675aa875

transaction(voucherAddress: Address, amount: UFix64) {
    // Validates vouch exists and amount matches
    // Applies reputation benefit to vouchee
    // Creates vouching relationship
}
```

### Key Features
- **Cadence 1.0 Compatibility**: Updated authorization patterns
- **Resource-Based Security**: Secure storage access patterns
- **Event-Driven Architecture**: Complete audit trail
- **Explicit Consent Model**: Two-step approval process

## 🌐 Deployment

### Testnet Deployment

The contract is deployed on Flow Testnet:
- **Contract Address**: `0x26cc4629675aa875`
- **Network**: Flow Testnet

### Vercel (Recommended)

The app is optimized for Vercel deployment:

```bash
# Deploy to Vercel
pnpm build
vercel --prod
```

### Other Platforms

The app can be deployed to any platform supporting Next.js:

```bash
# Build for production
pnpm build
pnpm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

**Track**: Decentralized Economies, Governance & Science

RepVouch addresses the challenge of "unlocking coordination at the speed of the internet" by creating a transparent, community-driven reputation system. The two-step vouching process ensures security while maintaining the decentralized ethos of Web3.

**Key Innovation**: Secure two-step vouching system that requires explicit consent from both parties, preventing unauthorized reputation manipulation while enabling fluid trust relationships.

## 🔮 Future Roadmap

- [ ] Enhanced pending vouch detection via event indexing
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Integration with GitHub for code reviewer reputation
- [ ] DAO governance features and proposal system  
- [ ] Reputation-based token rewards
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Advanced analytics and trust scoring

## 📞 Contact

- **Website**: [repvouch.app](https://repvouch.app)
- **Twitter**: [@repvouch](https://twitter.com/repvouch)
- **Discord**: [Join our community](https://discord.gg/repvouch)

Built with ❤️ for the Flow ecosystem and the future of decentralized reputation.

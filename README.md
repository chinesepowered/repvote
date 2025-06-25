# RepVouch - Decentralized Reputation System

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by Flow](https://img.shields.io/badge/Powered%20by-Flow-00EF8B?logo=flow)](https://flow.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> **Built for Flow Hackathon - Decentralized Economies, Governance & Science Track**

RepVouch is a decentralized reputation system where community members can vouch for each other by temporarily lending their reputation points. Built on Flow blockchain with Cadence smart contracts.

## 🚀 Features

- **Decentralized Reputation**: Transparent, immutable reputation stored on Flow blockchain
- **Community Vouching**: Lend up to 10% of your reputation to people you trust
- **Dynamic System**: Vouches can be revoked, creating fluid reputation flow
- **Gamified Levels**: Progress through reputation tiers to unlock new features
- **Social Proof**: View vouching history and community trust relationships

## 🎯 Use Cases

- **Open Source**: Code reviewer reputation and contributor trust
- **DAOs**: Governance participation and proposal creation rights
- **Grants**: Community-driven allocation based on trust
- **DeSci**: Scientific collaboration and peer review systems
- **Communities**: Member reputation and moderation privileges

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Blockchain**: Flow blockchain with Cadence smart contracts
- **Wallet**: Flow Control Library (FCL) for wallet integration
- **UI**: Lucide React icons and Framer Motion animations

## 📋 How It Works

1. **Join**: Connect your Flow wallet and receive 10 base reputation points
2. **Vouch**: Lend up to 10% of your reputation to trusted community members (5 slots max)
3. **Build**: Gain reputation through vouches and community contributions
4. **Unlock**: Higher reputation levels unlock voting rights, proposals, and exclusive features

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
NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=0x1d007d755706c469
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
│   └── VouchingInterface.tsx # Vouching UI
├── lib/                   # Utilities and helpers
│   ├── flow.ts           # Flow configuration
│   └── flowHelpers.ts    # Blockchain interaction
├── types/                 # TypeScript types
└── cadence/              # Smart contracts
    ├── contracts/        # Cadence contracts
    ├── transactions/     # Blockchain transactions
    └── scripts/          # Query scripts
```

## 🔗 Smart Contracts

The RepVouch system is powered by Cadence smart contracts on Flow:

- **RepVouch.cdc**: Main contract handling users, vouches, and reputation
- **Transactions**: Setup users, create/revoke vouches
- **Scripts**: Query user profiles and reputation data

Key contract features:
- Quadratic reputation scaling to prevent monopolies
- Temporary vouching with revocation capability
- Event emission for transparency
- Resource-based security model

## 🌐 Deployment

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

RepVouch addresses the challenge of "unlocking coordination at the speed of the internet" by creating a transparent, community-driven reputation system that can be used across various platforms and use cases. It demonstrates how blockchain technology can create economic engines that reward open collaboration.

**Key Innovation**: Dynamic reputation vouching system that creates social proof and community trust without centralized authority.

## 🔮 Future Roadmap

- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Integration with GitHub for code reviewer reputation
- [ ] DAO governance features and proposal system  
- [ ] Reputation-based token rewards
- [ ] Mobile app development
- [ ] API for third-party integrations

## 📞 Contact

- **Website**: [repvouch.app](https://repvouch.app)
- **Twitter**: [@repvouch](https://twitter.com/repvouch)
- **Discord**: [Join our community](https://discord.gg/repvouch)

Built with ❤️ for the Flow ecosystem and the future of decentralized reputation.

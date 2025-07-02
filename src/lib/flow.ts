import * as fcl from "@onflow/fcl"

// Configure FCL for Flow testnet
fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/testnet/authn")
  .put("discovery.authn.include", ["0x82ec283f88a62e65", "0x9d2e44203cb13051"])
  .put("0xProfile", "0x1d007d755706c469")
  .put("0xRepVouch", "0x26cc4629675aa875")
  .put("flow.network", "testnet")
  .put("app.detail.title", "RepVouch")
  .put("app.detail.icon", "🏆")
  // WalletConnect configuration
  .put("walletconnect.projectId", process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id")
  .put("walletconnect.metadata", {
    name: "RepVouch",
    description: "Decentralized reputation system on Flow",
    url: "https://repvouch.app",
    icons: ["🏆"]
  })

export default fcl
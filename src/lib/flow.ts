import * as fcl from "@onflow/fcl"

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xProfile": "0x1d007d755706c469",
  "0xRepVouch": process.env.NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS || "0x1d007d755706c469"
})

export default fcl
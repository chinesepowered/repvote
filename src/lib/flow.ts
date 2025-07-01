import * as fcl from "@onflow/fcl"

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xProfile": "0x1d007d755706c469",
  "0xRepVouch": "0x26cc4629675aa875",
  "flow.network": "testnet",
})

export default fcl
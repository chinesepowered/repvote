# Flow Testnet Deployment Guide

This guide will help you deploy the RepVouch smart contracts to Flow testnet.

## Prerequisites

1. **Install Flow CLI**:
   ```bash
   # macOS
   brew install flow-cli
   
   # Or download from: https://github.com/onflow/flow-cli/releases
   ```

2. **Create Flow Account**:
   - Go to [Flow Faucet](https://testnet-faucet.onflow.org/)
   - Create a testnet account and save your private key
   - Fund your account with testnet FLOW tokens

## Step 1: Initialize Flow Project

```bash
# In your project root
flow init
```

This creates a `flow.json` configuration file.

## Step 2: Configure flow.json

Replace the contents of `flow.json` with:

```json
{
  "emulators": {
    "default": {
      "port": 3569,
      "host": "127.0.0.1"
    }
  },
  "contracts": {
    "RepVouch": "./cadence/contracts/RepVouch.cdc"
  },
  "networks": {
    "emulator": "127.0.0.1:3569",
    "mainnet": "access.mainnet.nodes.onflow.org:9000",
    "testnet": "access.devnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "emulator-account": {
      "address": "f8d6e0586b0a20c7",
      "key": "5112883de06b9576af62b9aafa7ead685fb7fb46c495039b1a83649d61bff97c"
    },
    "testnet-account": {
      "address": "SERVICE_ACCOUNT_ADDRESS",
      "key": {
        "type": "hex",
        "index": 0,
        "signatureAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256",
        "privateKey": "YOUR_PRIVATE_KEY_HERE"
      }
    }
  },
  "deployments": {
    "testnet": {
      "testnet-account": ["RepVouch"]
    }
  }
}
```

**Replace these values:**
- `SERVICE_ACCOUNT_ADDRESS`: Your testnet account address (starts with 0x)
- `YOUR_PRIVATE_KEY_HERE`: Your testnet account private key

## Step 3: Fix Contract Dependencies

The current contract imports dependencies that don't exist. Create a simplified version:

```bash
# Create a backup
cp cadence/contracts/RepVouch.cdc cadence/contracts/RepVouch.cdc.backup
```

Then replace the first few lines of `cadence/contracts/RepVouch.cdc`:

**REMOVE these imports:**
```cadence
import NonFungibleToken from "./NonFungibleToken.cdc"
import MetadataViews from "./MetadataViews.cdc"
```

**REPLACE with:**
```cadence
// RepVouch - Standalone reputation system
```

## Step 4: Fix Admin Resource Setup

Update the `setup_user.cdc` transaction to work without admin dependency:

Replace `cadence/transactions/setup_user.cdc` with:

```cadence
import RepVouch from 0xREPVOUCH_ADDRESS

transaction {
    prepare(signer: AuthAccount) {
        // Check if user already has a RepVouch user resource
        if signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            // For now, create user directly (in production, this would be controlled)
            let user <- RepVouch.createUser(userAddress: signer.address)
            
            // Save user resource to storage
            signer.save(<-user, to: RepVouch.UserStoragePath)
            
            // Create public capability
            signer.link<&RepVouch.User{RepVouch.UserPublic}>(
                RepVouch.UserPublicPath,
                target: RepVouch.UserStoragePath
            )
        }
    }
    
    execute {
        log("User setup completed successfully")
    }
}
```

## Step 5: Deploy to Testnet

```bash
# Deploy the contract
flow project deploy --network testnet

# If deployment is successful, you'll see output like:
# "RepVouch" -> 0x1234567890abcdef (your deployed contract address)
```

## Step 6: Test Deployment

```bash
# Test reading contract
flow scripts execute cadence/scripts/get_user_profile.cdc 0xYOUR_ADDRESS --network testnet
```

## Step 7: Update Frontend Configuration

After successful deployment, update these files:

1. **Update `.env.local`** (create if doesn't exist):
   ```env
   NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
   ```

2. **Update `src/lib/flow.ts`**:
   ```typescript
   fcl.config({
     "accessNode.api": "https://rest-testnet.onflow.org",
     "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
     "0xRepVouch": "0xYOUR_DEPLOYED_CONTRACT_ADDRESS" // Replace this
   })
   ```

3. **Update all transaction files** in `cadence/transactions/`:
   Replace `0xRepVouch` with your actual deployed address in:
   - `create_vouch.cdc`
   - `revoke_vouch.cdc` 
   - `setup_user.cdc`

4. **Update script files** in `cadence/scripts/`:
   Replace `0xRepVouch` with your actual deployed address in:
   - `get_user_profile.cdc`
   - `get_reputation.cdc`

## Step 8: Test Frontend Integration

1. Start your Next.js app: `pnpm dev`
2. Connect your Flow wallet (use same account you deployed with)
3. Try the vouching functionality

## Troubleshooting

**Common Issues:**

1. **"Account not found"** - Make sure your testnet account is funded
2. **"Contract already exists"** - Use `flow project deploy --network testnet --update` to update
3. **"Import error"** - Make sure you removed the NonFungibleToken imports
4. **"Resource not found"** - Run the setup transaction first

**Useful Commands:**
```bash
# Check account info
flow accounts get 0xYOUR_ADDRESS --network testnet

# Check contract
flow accounts get 0xYOUR_ADDRESS --network testnet

# Execute setup transaction
flow transactions send cadence/transactions/setup_user.cdc --network testnet --signer testnet-account
```

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Frontend configuration updated with correct addresses
- [ ] Setup transaction executed successfully
- [ ] Wallet connection works in frontend
- [ ] Can query user profile from blockchain
- [ ] Vouch transactions work end-to-end

## Production Notes

For production deployment:
1. Add proper access controls to user creation
2. Implement admin role management
3. Add comprehensive error handling
4. Consider gas optimization
5. Add events for better observability

---

**After deployment, update the contract address in your frontend and you'll have a fully functional blockchain-powered reputation system!**
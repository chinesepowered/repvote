# Post-Deployment Checklist

After you deploy the smart contract to Flow testnet, follow these steps to make RepVouch fully functional.

## Step 1: Update Contract Addresses

After deployment, you'll get a contract address like `0x1234567890abcdef`. 

**Quick Method (Recommended):**
```bash
# Run the auto-update script
./update_contract_addresses.sh 0xYOUR_CONTRACT_ADDRESS
```

**Manual Method:**
If you prefer to update manually, update these files:

1. **src/lib/flow.ts** - Line 5:
   ```typescript
   "0xRepVouch": "0xYOUR_CONTRACT_ADDRESS"
   ```

2. **All Cadence files** - Replace `0xREPVOUCH_ADDRESS` with your actual address in:
   - `cadence/transactions/setup_user.cdc`
   - `cadence/transactions/create_vouch.cdc`
   - `cadence/transactions/revoke_vouch.cdc`
   - `cadence/scripts/get_user_profile.cdc`
   - `cadence/scripts/get_reputation.cdc`

3. **Create .env.local**:
   ```env
   NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
   ```

## Step 2: Test the Application

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

**Test Checklist:**
- [ ] Wallet connection works
- [ ] User setup transaction executes successfully
- [ ] Can view user profile (should show base reputation of 10)
- [ ] Can create vouches for other addresses
- [ ] Can revoke vouches
- [ ] Loading states work properly
- [ ] Error handling works

## Step 3: Test Vouching Flow

1. **Connect Wallet** - Use the same account you deployed with
2. **User Setup** - Should automatically trigger on first load
3. **Create Vouch**:
   - Enter any Flow address (can be fake for testing)
   - Enter amount (max 1.0 for new users with 10 base reputation)
   - Submit transaction
4. **Verify** - Check that transaction succeeds and UI updates

## Step 4: Deploy to Vercel

```bash
# If using git
git add .
git commit -m "Update contract addresses for testnet deployment"
git push

# Deploy to Vercel
# - Import your GitHub repo to Vercel
# - Add environment variable: NEXT_PUBLIC_REPVOUCH_CONTRACT_ADDRESS=0xYOUR_ADDRESS
# - Deploy!
```

## Troubleshooting

**Common Issues:**

1. **"User not found" errors**
   - Make sure setup transaction ran successfully
   - Check wallet is connected with same account used for deployment

2. **Transaction failures**
   - Ensure account has enough FLOW for gas fees
   - Check contract address is correct in all files
   - Verify wallet is on Flow testnet

3. **Build errors**
   - Run `pnpm build` locally first to test
   - Check environment variables are set correctly

4. **FCL connection issues**
   - Clear browser cache/localStorage
   - Try different wallet (Blocto, Dapper, etc.)

## Verification Steps

After everything is working:

- [ ] ✅ Smart contract deployed to testnet
- [ ] ✅ All contract addresses updated in code
- [ ] ✅ Local testing complete
- [ ] ✅ Wallet connection functional
- [ ] ✅ User setup transaction works
- [ ] ✅ Vouch creation/revocation works
- [ ] ✅ Application deployed to Vercel
- [ ] ✅ Production testing complete

## What Changed from Demo

**Now Real:**
- ✅ User profile data from blockchain
- ✅ Real vouching transactions
- ✅ Automatic user setup on first connect
- ✅ Actual reputation tracking
- ✅ Transaction status and error handling

**Still Mock (for demo):**
- Leaderboard data (commented for future implementation)
- Some UI statistics (can be made real with additional queries)

## Performance Notes

- First-time users will see ~3-5 second setup delay (blockchain transaction)
- Subsequent loads are fast (cached data)
- Vouching takes ~2-3 seconds per transaction
- All interactions are now on-chain and verifiable!

## Next Steps for Production

1. **Enhanced Leaderboard**: Query all users and sort by reputation
2. **Real-time Updates**: Subscribe to blockchain events
3. **Better Error Handling**: Specific error messages for different failure types
4. **Admin Functions**: Reputation grants, user management
5. **Analytics**: Track usage metrics and transaction volumes

---

**You now have a fully functional blockchain-powered reputation system! 🎉**
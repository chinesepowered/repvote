import RepVouch from 0x26cc4629675aa875

transaction(voucherAddress: Address, amount: UFix64) {
    let voucheeRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucheeRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Validate that the voucher exists and has actually created this vouch
        let voucherCap = getAccount(voucherAddress).capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        let voucherRef = voucherCap.borrow() ?? panic("Voucher not found")
        
        // Check if the voucher has an active vouch for this vouchee
        let voucherProfile = voucherRef.getUserProfile()
        if let vouchAmount = voucherProfile.activeVouches[self.voucheeRef.profile.address] {
            // Verify the amount matches
            if vouchAmount == amount {
                // Accept the vouch
                self.voucheeRef.receiveVouch(voucher: voucherAddress, amount: amount)
                log("Vouch accepted successfully")
            } else {
                panic("Vouch amount mismatch")
            }
        } else {
            panic("No active vouch found from this voucher")
        }
    }
} 
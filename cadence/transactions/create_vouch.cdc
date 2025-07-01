import RepVouch from 0x26cc4629675aa875

transaction(voucheeAddress: Address, amount: UFix64) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucherRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Validate that vouchee exists and get their public capability
        let voucheeCap = getAccount(voucheeAddress).capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        let voucheeRef = voucheeCap.borrow() ?? panic("Vouchee not found")
        
        // Create the vouch on voucher's side
        if self.voucherRef.createVouch(vouchee: voucheeAddress, amount: amount) {
            // Get vouchee's private storage reference to receive the vouch
            let voucheeAccount = getAccount(voucheeAddress)
            
            // For now, we'll emit the event and the vouchee will need to accept the vouch
            // In a production system, this would require the vouchee to sign a transaction to accept
            RepVouch.emitVouchCreated(
                voucherId: self.voucherRef.profile.address,
                voucheeId: voucheeAddress,
                amount: amount
            )
            
            log("Vouch created successfully")
        }
    }
}
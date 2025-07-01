import RepVouch from 0x26cc4629675aa875

transaction(voucheeAddress: Address) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucherRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Revoke the vouch on voucher's side
        if let amount = self.voucherRef.revokeVouch(vouchee: voucheeAddress) {
            // Emit the revocation event
            RepVouch.emitVouchRevoked(
                voucherId: self.voucherRef.profile.address,
                voucheeId: voucheeAddress,
                amount: amount
            )
            
            log("Vouch revoked successfully")
        } else {
            panic("No active vouch found for this address")
        }
    }
}
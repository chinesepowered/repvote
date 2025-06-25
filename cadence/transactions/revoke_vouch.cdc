import RepVouch from "../contracts/RepVouch.cdc"

transaction(voucheeAddress: Address) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: AuthAccount) {
        self.voucherRef = signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        RepVouch.revokeVouch(
            voucherId: self.voucherRef.profile.address,
            voucheeAddress: voucheeAddress
        )
        
        log("Vouch revoked successfully")
    }
}
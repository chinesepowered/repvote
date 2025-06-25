import RepVouch from "../contracts/RepVouch.cdc"

transaction(voucheeAddress: Address, amount: UFix64) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: AuthAccount) {
        self.voucherRef = signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        RepVouch.createVouch(
            voucherId: self.voucherRef.profile.address,
            voucheeAddress: voucheeAddress,
            amount: amount
        )
        
        log("Vouch created successfully")
    }
}
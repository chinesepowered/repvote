import RepVouch from 0x26cc4629675aa875

transaction(voucherAddress: Address) {
    let voucheeRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucheeRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Remove the received vouch (this would typically be called after a voucher revokes)
        self.voucheeRef.removeReceivedVouch(voucher: voucherAddress)
        log("Received vouch removed successfully")
    }
} 
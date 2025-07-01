import RepVouch from 0x26cc4629675aa875

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if user already has a RepVouch user resource
        if signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            // For now, create user directly (in production, this would be controlled)
            let user <- RepVouch.createUser(userAddress: signer.address)
            
            // Save user resource to storage
            signer.storage.save(<-user, to: RepVouch.UserStoragePath)
            
            // Create public capability using Cadence 1.0 syntax
            let userCap = signer.capabilities.storage.issue<&RepVouch.User>(RepVouch.UserStoragePath)
            signer.capabilities.publish(userCap, at: RepVouch.UserPublicPath)
        }
    }
    
    execute {
        log("User setup completed successfully")
    }
}
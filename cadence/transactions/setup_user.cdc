import RepVouch from 0xREPVOUCH_ADDRESS

transaction {
    prepare(signer: AuthAccount) {
        // Check if user already has a RepVouch user resource
        if signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            // Create user resource using public function
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
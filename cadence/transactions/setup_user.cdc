import RepVouch from "../contracts/RepVouch.cdc"

transaction {
    prepare(signer: AuthAccount) {
        // Check if user already has a RepVouch user resource
        if signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            // Get admin reference to create user
            let adminRef = signer.borrow<&RepVouch.Admin>(from: RepVouch.AdminStoragePath)
                ?? panic("Admin resource not found")
            
            // Create user resource
            let user <- adminRef.createUser(userAddress: signer.address)
            
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
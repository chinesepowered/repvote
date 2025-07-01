import RepVouch from 0x26cc4629675aa875

pub fun main(address: Address): UFix64? {
    let userRef = getAccount(address)
        .getCapability(RepVouch.UserPublicPath)
        .borrow<&RepVouch.User{RepVouch.UserPublic}>()
    
    return userRef?.getTotalReputation()
}
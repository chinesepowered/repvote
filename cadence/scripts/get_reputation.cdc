import RepVouch from 0xREPVOUCH_ADDRESS

pub fun main(address: Address): UFix64? {
    let userRef = getAccount(address)
        .getCapability(RepVouch.UserPublicPath)
        .borrow<&RepVouch.User{RepVouch.UserPublic}>()
    
    return userRef?.getTotalReputation()
}
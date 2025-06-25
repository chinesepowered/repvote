import RepVouch from "../contracts/RepVouch.cdc"

pub fun main(address: Address): UFix64? {
    let userRef = getAccount(address)
        .getCapability(RepVouch.UserPublicPath)
        .borrow<&RepVouch.User{RepVouch.UserPublic}>()
    
    return userRef?.getTotalReputation()
}
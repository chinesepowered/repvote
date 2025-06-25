import RepVouch from "../contracts/RepVouch.cdc"

pub fun main(address: Address): RepVouch.UserProfile? {
    return RepVouch.getUserProfile(address: address)
}
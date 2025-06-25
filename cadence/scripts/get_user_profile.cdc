import RepVouch from 0xREPVOUCH_ADDRESS

pub fun main(address: Address): RepVouch.UserProfile? {
    return RepVouch.getUserProfile(address: address)
}
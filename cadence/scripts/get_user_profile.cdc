import RepVouch from 0x26cc4629675aa875

pub fun main(address: Address): RepVouch.UserProfile? {
    return RepVouch.getUserProfile(address: address)
}
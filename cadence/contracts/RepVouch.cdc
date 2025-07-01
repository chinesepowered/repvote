// RepVouch - Standalone reputation system
// Updated for Cadence 1.0 syntax

access(all) contract RepVouch {
    
    access(all) var totalUsers: UInt64
    access(all) let maxVouches: UInt64
    access(all) let baseReputation: UFix64
    
    access(all) let UserStoragePath: StoragePath
    access(all) let UserPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath
    
    access(all) event ContractInitialized()
    access(all) event UserRegistered(address: Address, userId: UInt64)
    access(all) event VouchCreated(voucherId: Address, voucheeId: Address, amount: UFix64)
    access(all) event VouchRevoked(voucherId: Address, voucheeId: Address, amount: UFix64)
    access(all) event ReputationUpdated(address: Address, oldRep: UFix64, newRep: UFix64)
    
    access(all) struct UserProfile {
        access(all) let userId: UInt64
        access(all) let address: Address
        access(all) var baseReputation: UFix64
        access(all) var vouchedReputation: UFix64
        access(all) var activeVouches: {Address: UFix64}
        access(all) var vouchesReceived: {Address: UFix64}
        access(all) var vouchCount: UInt64
        access(all) let createdAt: UFix64
        
        init(userId: UInt64, address: Address) {
            self.userId = userId
            self.address = address
            self.baseReputation = RepVouch.baseReputation
            self.vouchedReputation = 0.0
            self.activeVouches = {}
            self.vouchesReceived = {}
            self.vouchCount = 0
            self.createdAt = getCurrentBlock().timestamp
        }
        
        access(all) view fun getTotalReputation(): UFix64 {
            return self.baseReputation + self.vouchedReputation
        }
        
        access(all) view fun getAvailableVouches(): UInt64 {
            return RepVouch.maxVouches - UInt64(self.activeVouches.length)
        }
        
        access(all) view fun calculateVouchPower(): UFix64 {
            let totalRep = self.getTotalReputation()
            return totalRep * 0.1 // 10% of reputation can be vouched
        }
        
        // Setter functions for mutable fields
        access(contract) fun setVouchCount(_ count: UInt64) {
            self.vouchCount = count
        }
        
        access(contract) fun addVouchedReputation(_ amount: UFix64) {
            self.vouchedReputation = self.vouchedReputation + amount
        }
        
        access(contract) fun removeVouchedReputation(_ amount: UFix64) {
            self.vouchedReputation = self.vouchedReputation - amount
        }
        
        access(contract) fun addBaseReputation(_ amount: UFix64) {
            self.baseReputation = self.baseReputation + amount
        }
    }
    
    access(all) resource interface UserPublic {
        access(all) view fun getUserProfile(): UserProfile
        access(all) view fun getTotalReputation(): UFix64
        access(all) view fun getVouchPower(): UFix64
    }
    
    access(all) resource User: UserPublic {
        access(all) var profile: UserProfile
        
        init(userId: UInt64, address: Address) {
            self.profile = UserProfile(userId: userId, address: address)
        }
        
        access(all) view fun getUserProfile(): UserProfile {
            return self.profile
        }
        
        access(all) view fun getTotalReputation(): UFix64 {
            return self.profile.getTotalReputation()
        }
        
        access(all) view fun getVouchPower(): UFix64 {
            return self.profile.calculateVouchPower()
        }
        
        access(all) fun createVouch(vouchee: Address, amount: UFix64): Bool {
            pre {
                RepVouch.maxVouches > UInt64(self.profile.activeVouches.length): "No available vouch slots"
                amount <= self.profile.calculateVouchPower(): "Vouch amount exceeds available power"
                !self.profile.activeVouches.containsKey(vouchee): "Already vouching for this user"
                vouchee != self.profile.address: "Cannot vouch for yourself"
            }
            
            self.profile.activeVouches[vouchee] = amount
            self.profile.setVouchCount(self.profile.vouchCount + 1)
            
            return true
        }
        
        access(all) fun revokeVouch(vouchee: Address): UFix64? {
            if let amount = self.profile.activeVouches.remove(key: vouchee) {
                return amount
            }
            return nil
        }
        
        access(all) fun receiveVouch(voucher: Address, amount: UFix64) {
            self.profile.vouchesReceived[voucher] = amount
            self.profile.addVouchedReputation(amount)
        }
        
        access(all) fun removeReceivedVouch(voucher: Address) {
            if let amount = self.profile.vouchesReceived.remove(key: voucher) {
                self.profile.removeVouchedReputation(amount)
            }
        }
        
        access(all) fun increaseBaseReputation(amount: UFix64) {
            let oldRep = self.profile.getTotalReputation()
            self.profile.addBaseReputation(amount)
            let newRep = self.profile.getTotalReputation()
            
            emit ReputationUpdated(address: self.profile.address, oldRep: oldRep, newRep: newRep)
        }
    }
    
    access(all) resource Admin {
        // Admin functions will be handled through transactions that properly access storage
    }
    
    // Public function to create users (for demo - in production would have access controls)
    access(all) fun createUser(userAddress: Address): @User {
        RepVouch.totalUsers = RepVouch.totalUsers + 1
        let user <- create User(userId: RepVouch.totalUsers, address: userAddress)
        
        emit UserRegistered(address: userAddress, userId: RepVouch.totalUsers)
        return <-user
    }
    
    // Emit events for vouching operations (called from transactions)
    access(all) fun emitVouchCreated(voucherId: Address, voucheeId: Address, amount: UFix64) {
        emit VouchCreated(voucherId: voucherId, voucheeId: voucheeId, amount: amount)
    }
    
    access(all) fun emitVouchRevoked(voucherId: Address, voucheeId: Address, amount: UFix64) {
        emit VouchRevoked(voucherId: voucherId, voucheeId: voucheeId, amount: amount)
    }
    
    access(all) view fun getUserProfile(address: Address): UserProfile? {
        let userCap = getAccount(address).capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        let userRef = userCap.borrow()
        
        return userRef?.getUserProfile()
    }
    
    init() {
        self.totalUsers = 0
        self.maxVouches = 5
        self.baseReputation = 10.0
        
        self.UserStoragePath = /storage/RepVouchUser
        self.UserPublicPath = /public/RepVouchUser
        self.AdminStoragePath = /storage/RepVouchAdmin
        
        let admin <- create Admin()
        self.account.storage.save(<-admin, to: self.AdminStoragePath)
        
        emit ContractInitialized()
    }
}
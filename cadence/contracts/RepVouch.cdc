// RepVouch - Decentralized Reputation System
// Built for Flow Hackathon - Decentralized Economies, Governance & Science

pub contract RepVouch {
    
    pub var totalUsers: UInt64
    pub let maxVouches: UInt64
    pub let baseReputation: UFix64
    
    pub let UserStoragePath: StoragePath
    pub let UserPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    
    pub event ContractInitialized()
    pub event UserRegistered(address: Address, userId: UInt64)
    pub event VouchCreated(voucherId: Address, voucheeId: Address, amount: UFix64)
    pub event VouchRevoked(voucherId: Address, voucheeId: Address, amount: UFix64)
    pub event ReputationUpdated(address: Address, oldRep: UFix64, newRep: UFix64)
    
    pub struct UserProfile {
        pub let userId: UInt64
        pub let address: Address
        pub var baseReputation: UFix64
        pub var vouchedReputation: UFix64
        pub var activeVouches: {Address: UFix64}
        pub var vouchesReceived: {Address: UFix64}
        pub var vouchCount: UInt64
        pub let createdAt: UFix64
        
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
        
        pub fun getTotalReputation(): UFix64 {
            return self.baseReputation + self.vouchedReputation
        }
        
        pub fun getAvailableVouches(): UInt64 {
            return RepVouch.maxVouches - UInt64(self.activeVouches.length)
        }
        
        pub fun calculateVouchPower(): UFix64 {
            let totalRep = self.getTotalReputation()
            return totalRep * 0.1 // 10% of reputation can be vouched
        }
    }
    
    pub resource interface UserPublic {
        pub fun getUserProfile(): UserProfile
        pub fun getTotalReputation(): UFix64
        pub fun getVouchPower(): UFix64
    }
    
    pub resource User: UserPublic {
        pub var profile: UserProfile
        
        init(userId: UInt64, address: Address) {
            self.profile = UserProfile(userId: userId, address: address)
        }
        
        pub fun getUserProfile(): UserProfile {
            return self.profile
        }
        
        pub fun getTotalReputation(): UFix64 {
            return self.profile.getTotalReputation()
        }
        
        pub fun getVouchPower(): UFix64 {
            return self.profile.calculateVouchPower()
        }
        
        pub fun createVouch(vouchee: Address, amount: UFix64): Bool {
            pre {
                self.profile.getAvailableVouches() > 0: "No available vouch slots"
                amount <= self.getVouchPower(): "Vouch amount exceeds available power"
                !self.profile.activeVouches.containsKey(vouchee): "Already vouching for this user"
                vouchee != self.profile.address: "Cannot vouch for yourself"
            }
            
            self.profile.activeVouches[vouchee] = amount
            self.profile.vouchCount = self.profile.vouchCount + 1
            
            return true
        }
        
        pub fun revokeVouch(vouchee: Address): UFix64? {
            if let amount = self.profile.activeVouches.remove(key: vouchee) {
                return amount
            }
            return nil
        }
        
        pub fun receiveVouch(voucher: Address, amount: UFix64) {
            self.profile.vouchesReceived[voucher] = amount
            self.profile.vouchedReputation = self.profile.vouchedReputation + amount
        }
        
        pub fun removeReceivedVouch(voucher: Address) {
            if let amount = self.profile.vouchesReceived.remove(key: voucher) {
                self.profile.vouchedReputation = self.profile.vouchedReputation - amount
            }
        }
        
        pub fun increaseBaseReputation(amount: UFix64) {
            let oldRep = self.profile.getTotalReputation()
            self.profile.baseReputation = self.profile.baseReputation + amount
            let newRep = self.profile.getTotalReputation()
            
            emit ReputationUpdated(address: self.profile.address, oldRep: oldRep, newRep: newRep)
        }
    }
    
    pub resource Admin {
        pub fun grantReputation(userAddress: Address, amount: UFix64) {
            let userRef = getAccount(userAddress)
                .getCapability(RepVouch.UserPublicPath)
                .borrow<&RepVouch.User{RepVouch.UserPublic}>()
                ?? panic("User not found")
            
            (userRef as! &RepVouch.User).increaseBaseReputation(amount: amount)
        }
    }
    
    // Public function to create users (for demo - in production would have access controls)
    pub fun createUser(userAddress: Address): @User {
        RepVouch.totalUsers = RepVouch.totalUsers + 1
        let user <- create User(userId: RepVouch.totalUsers, address: userAddress)
        
        emit UserRegistered(address: userAddress, userId: RepVouch.totalUsers)
        return <-user
    }
    
    pub fun createVouch(voucherId: Address, voucheeAddress: Address, amount: UFix64) {
        let voucherRef = getAccount(voucherId)
            .getCapability(RepVouch.UserPublicPath)
            .borrow<&RepVouch.User{RepVouch.UserPublic}>()
            ?? panic("Voucher not found")
        
        let voucheeRef = getAccount(voucheeAddress)
            .getCapability(RepVouch.UserPublicPath)
            .borrow<&RepVouch.User{RepVouch.UserPublic}>()
            ?? panic("Vouchee not found")
        
        let voucherPrivateRef = getAccount(voucherId)
            .borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow voucher reference")
        
        let voucheePrivateRef = getAccount(voucheeAddress)
            .borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow vouchee reference")
        
        if voucherPrivateRef.createVouch(vouchee: voucheeAddress, amount: amount) {
            voucheePrivateRef.receiveVouch(voucher: voucherId, amount: amount)
            emit VouchCreated(voucherId: voucherId, voucheeId: voucheeAddress, amount: amount)
        }
    }
    
    pub fun revokeVouch(voucherId: Address, voucheeAddress: Address) {
        let voucherRef = getAccount(voucherId)
            .borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow voucher reference")
        
        let voucheeRef = getAccount(voucheeAddress)
            .borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow vouchee reference")
        
        if let amount = voucherRef.revokeVouch(vouchee: voucheeAddress) {
            voucheeRef.removeReceivedVouch(voucher: voucherId)
            emit VouchRevoked(voucherId: voucherId, voucheeId: voucheeAddress, amount: amount)
        }
    }
    
    pub fun getUserProfile(address: Address): UserProfile? {
        let userRef = getAccount(address)
            .getCapability(RepVouch.UserPublicPath)
            .borrow<&RepVouch.User{RepVouch.UserPublic}>()
        
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
        self.account.save(<-admin, to: self.AdminStoragePath)
        
        emit ContractInitialized()
    }
}
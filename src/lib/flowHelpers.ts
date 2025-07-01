import * as fcl from "@onflow/fcl"
import { UserProfile } from '@/types'

// Script to get user profile
const GET_USER_PROFILE = `
import RepVouch from 0xRepVouch

access(all) fun main(address: Address): RepVouch.UserProfile? {
    return RepVouch.getUserProfile(address: address)
}
`

// Script to get user reputation
const GET_REPUTATION = `
import RepVouch from 0xRepVouch

access(all) fun main(address: Address): UFix64? {
    let userRef = getAccount(address)
        .capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        .borrow()
    
    return userRef?.getTotalReputation()
}
`

// Transaction to setup user
const SETUP_USER = `
import RepVouch from 0xRepVouch

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Check if user already has a RepVouch user resource
        if signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            // For now, create user directly (in production, this would be controlled)
            let user <- RepVouch.createUser(userAddress: signer.address)
            
            // Save user resource to storage
            signer.storage.save(<-user, to: RepVouch.UserStoragePath)
            
            // Create public capability using Cadence 1.0 syntax
            let userCap = signer.capabilities.storage.issue<&RepVouch.User>(RepVouch.UserStoragePath)
            signer.capabilities.publish(userCap, at: RepVouch.UserPublicPath)
        }
    }
    
    execute {
        log("User setup completed successfully")
    }
}
`

// Transaction to create vouch
const CREATE_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucheeAddress: Address, amount: UFix64) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucherRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Validate that vouchee exists and get their public capability
        let voucheeCap = getAccount(voucheeAddress).capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        let voucheeRef = voucheeCap.borrow() ?? panic("Vouchee not found")
        
        // Create the vouch on voucher's side
        if self.voucherRef.createVouch(vouchee: voucheeAddress, amount: amount) {
            // Emit the event
            RepVouch.emitVouchCreated(
                voucherId: self.voucherRef.profile.address,
                voucheeId: voucheeAddress,
                amount: amount
            )
            
            log("Vouch created successfully")
        }
    }
}
`

// Transaction to revoke vouch
const REVOKE_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucheeAddress: Address) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucherRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Revoke the vouch on voucher's side
        if let amount = self.voucherRef.revokeVouch(vouchee: voucheeAddress) {
            // Emit the revocation event
            RepVouch.emitVouchRevoked(
                voucherId: self.voucherRef.profile.address,
                voucheeId: voucheeAddress,
                amount: amount
            )
            
            log("Vouch revoked successfully")
        } else {
            panic("No active vouch found for this address")
        }
    }
}
`

// Transaction to accept vouch
const ACCEPT_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucherAddress: Address, amount: UFix64) {
    let voucheeRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucheeRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Validate that the voucher exists and has actually created this vouch
        let voucherCap = getAccount(voucherAddress).capabilities.get<&{RepVouch.UserPublic}>(RepVouch.UserPublicPath)
        let voucherRef = voucherCap.borrow() ?? panic("Voucher not found")
        
        // Check if the voucher has an active vouch for this vouchee
        let voucherProfile = voucherRef.getUserProfile()
        if let vouchAmount = voucherProfile.activeVouches[self.voucheeRef.profile.address] {
            // Verify the amount matches
            if vouchAmount == amount {
                // Accept the vouch
                self.voucheeRef.receiveVouch(voucher: voucherAddress, amount: amount)
                log("Vouch accepted successfully")
            } else {
                panic("Vouch amount mismatch")
            }
        } else {
            panic("No active vouch found from this voucher")
        }
    }
}
`

// Transaction to remove received vouch
const REMOVE_RECEIVED_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucherAddress: Address) {
    let voucheeRef: &RepVouch.User
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.voucheeRef = signer.storage.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        // Remove the received vouch (called after a voucher revokes)
        self.voucheeRef.removeReceivedVouch(voucher: voucherAddress)
        log("Received vouch removed successfully")
    }
}
`

export const flowHelpers = {
  // Query functions
  async getUserProfile(address: string): Promise<UserProfile | null> {
    try {
      const result = await fcl.query({
        cadence: GET_USER_PROFILE,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      })
      return result
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  },

  async getUserReputation(address: string): Promise<number | null> {
    try {
      const result = await fcl.query({
        cadence: GET_REPUTATION,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      })
      return result ? parseFloat(result) : null
    } catch (error) {
      console.error('Error getting reputation:', error)
      return null
    }
  },

  // Transaction functions
  async setupUser(): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: SETUP_USER,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      await fcl.tx(transactionId).onceSealed()
      return transactionId
    } catch (error) {
      console.error('Error setting up user:', error)
      throw error
    }
  },

  async createVouch(voucheeAddress: string, amount: number): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: CREATE_VOUCH,
        args: (arg: any, t: any) => [
          arg(voucheeAddress, t.Address),
          arg(amount.toFixed(1), t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      await fcl.tx(transactionId).onceSealed()
      return transactionId
    } catch (error) {
      console.error('Error creating vouch:', error)
      throw error
    }
  },

  async revokeVouch(voucheeAddress: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: REVOKE_VOUCH,
        args: (arg: any, t: any) => [arg(voucheeAddress, t.Address)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      await fcl.tx(transactionId).onceSealed()
      return transactionId
    } catch (error) {
      console.error('Error revoking vouch:', error)
      throw error
    }
  },

  async acceptVouch(voucherAddress: string, amount: number): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: ACCEPT_VOUCH,
        args: (arg: any, t: any) => [
          arg(voucherAddress, t.Address),
          arg(amount.toFixed(1), t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      await fcl.tx(transactionId).onceSealed()
      return transactionId
    } catch (error) {
      console.error('Error accepting vouch:', error)
      throw error
    }
  },

  async removeReceivedVouch(voucherAddress: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: REMOVE_RECEIVED_VOUCH,
        args: (arg: any, t: any) => [arg(voucherAddress, t.Address)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      await fcl.tx(transactionId).onceSealed()
      return transactionId
    } catch (error) {
      console.error('Error removing received vouch:', error)
      throw error
    }
  }
}
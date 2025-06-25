import * as fcl from "@onflow/fcl"
import { UserProfile } from '@/types'

// Script to get user profile
const GET_USER_PROFILE = `
import RepVouch from 0xRepVouch

pub fun main(address: Address): RepVouch.UserProfile? {
    return RepVouch.getUserProfile(address: address)
}
`

// Script to get user reputation
const GET_REPUTATION = `
import RepVouch from 0xRepVouch

pub fun main(address: Address): UFix64? {
    let userRef = getAccount(address)
        .getCapability(RepVouch.UserPublicPath)
        .borrow<&RepVouch.User{RepVouch.UserPublic}>()
    
    return userRef?.getTotalReputation()
}
`

// Transaction to setup user
const SETUP_USER = `
import RepVouch from 0xRepVouch

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath) == nil {
            let adminRef = signer.borrow<&RepVouch.Admin>(from: RepVouch.AdminStoragePath)
                ?? panic("Admin resource not found")
            
            let user <- adminRef.createUser(userAddress: signer.address)
            signer.save(<-user, to: RepVouch.UserStoragePath)
            
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
`

// Transaction to create vouch
const CREATE_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucheeAddress: Address, amount: UFix64) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: AuthAccount) {
        self.voucherRef = signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        RepVouch.createVouch(
            voucherId: self.voucherRef.profile.address,
            voucheeAddress: voucheeAddress,
            amount: amount
        )
        
        log("Vouch created successfully")
    }
}
`

// Transaction to revoke vouch
const REVOKE_VOUCH = `
import RepVouch from 0xRepVouch

transaction(voucheeAddress: Address) {
    let voucherRef: &RepVouch.User
    
    prepare(signer: AuthAccount) {
        self.voucherRef = signer.borrow<&RepVouch.User>(from: RepVouch.UserStoragePath)
            ?? panic("Could not borrow user reference")
    }
    
    execute {
        RepVouch.revokeVouch(
            voucherId: self.voucherRef.profile.address,
            voucheeAddress: voucheeAddress
        )
        
        log("Vouch revoked successfully")
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
  }
}
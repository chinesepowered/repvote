'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import * as fcl from "@onflow/fcl"
import { UserProfile } from '@/types'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const ReputationCard = dynamic(() => import('@/components/ReputationCard'), { ssr: false })
const VouchingInterface = dynamic(() => import('@/components/VouchingInterface'), { ssr: false })
const LiveTransactionFeed = dynamic(() => import('@/components/LiveTransactionFeed'), { ssr: false })
const AchievementNotification = dynamic(() => import('@/components/AchievementNotification'), { ssr: false })
const TrustNetworkVisualization = dynamic(() => import('@/components/TrustNetworkVisualization'), { ssr: false })
const ClientOnly = dynamic(() => import('@/components/ClientOnly'), { ssr: false })
const TransactionStatusDialog = dynamic(() => import('@/components/TransactionStatusDialog'), { ssr: false })

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false, addr: null })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [achievements, setAchievements] = useState<any[]>([])
  const [previousProfile, setPreviousProfile] = useState<UserProfile | null>(null)
  const [showNetworkViz, setShowNetworkViz] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [pendingVouches, setPendingVouches] = useState<Array<{ address: string; amount: number }>>([])
  const [transactionDialog, setTransactionDialog] = useState<{
    isOpen: boolean
    transaction: {
      type: 'vouch' | 'revoke' | 'accept' | 'remove'
      txId: string
      amount?: number
      message: string
    } | null
  }>({ isOpen: false, transaction: null })

  // Ensure proper hydration
  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [hasMounted])

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      loadUserProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  // Automatic vouch discovery is disabled - users use the manual check feature instead
  // In a production system, this would use blockchain event indexing or a discovery service  
  useEffect(() => {
    // Set empty array since automatic discovery is not implemented
    setPendingVouches([])
  }, [profile, user.addr])

  const loadUserProfile = async () => {
    if (!user.addr) return
    
    setLoading(true)
    console.log(`🔍 Loading user profile for address: ${user.addr}`)
    
    try {
      // Import flowHelpers dynamically to avoid SSR issues
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Try to get user profile from blockchain
      console.log('📡 Querying blockchain for existing user profile...')
      let userProfile = await flowHelpers.getUserProfile(user.addr)
      
      // If user doesn't exist on blockchain, try to set them up
      if (!userProfile) {
        console.log('❌ User not found on blockchain, attempting setup...')
        console.log('🚀 Starting user setup transaction...')
        
        try {
          const setupTxId = await flowHelpers.setupUser()
          console.log(`✅ Setup transaction submitted successfully! TX ID: ${setupTxId}`)
          console.log('⏳ Waiting 3 seconds for blockchain to process...')
          
          // Wait a bit for transaction to be processed
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          console.log('📡 Checking if user profile was created...')
          userProfile = await flowHelpers.getUserProfile(user.addr)
          
          if (userProfile) {
            console.log('🎉 USER SETUP SUCCESSFUL! Profile created on blockchain:')
            console.log(`   - Address: ${userProfile.address}`)
            console.log(`   - User ID: ${userProfile.userId}`)
            console.log(`   - Base Reputation: ${userProfile.baseReputation}`)
            console.log(`   - Created At: ${userProfile.createdAt}`)
          } else {
            console.log('⚠️ Profile still not found after setup - using fallback')
          }
        } catch (setupError) {
          console.error('❌ USER SETUP FAILED:', setupError)
          console.log('🔄 Using fallback profile for demo purposes...')
          
          // Fallback to basic profile for new users
          userProfile = {
            userId: "0",
            address: user.addr,
            baseReputation: 10,
            vouchedReputation: 0,
            activeVouches: {},
            vouchesReceived: {},
            vouchCount: 0,
            createdAt: 0 // Use fixed value for hydration consistency
          }
        }
      } else {
        console.log('✅ EXISTING USER FOUND on blockchain:')
        console.log(`   - Address: ${userProfile.address}`)
        console.log(`   - User ID: ${userProfile.userId}`)
        console.log(`   - Total Reputation: ${userProfile.baseReputation + userProfile.vouchedReputation}`)
        console.log(`   - Active Vouches: ${Object.keys(userProfile.activeVouches).length}`)
        console.log(`   - Vouches Received: ${Object.keys(userProfile.vouchesReceived).length}`)
      }
      
      // Check for achievements
      if (previousProfile && userProfile) {
        checkForAchievements(previousProfile, userProfile)
      }
      
      setPreviousProfile(profile)
      setProfile(userProfile)
      
      console.log('✅ User profile loading complete!')
    } catch (error) {
      console.error('💥 CRITICAL ERROR loading user profile:', error)
      console.log('🔄 Using emergency fallback profile...')
      
      // Fallback profile if blockchain is unavailable
      const fallbackProfile: UserProfile = {
        userId: "0",
        address: user.addr,
        baseReputation: 10,
        vouchedReputation: 0,
        activeVouches: {},
        vouchesReceived: {},
        vouchCount: 0,
        createdAt: 0 // Use fixed value for hydration consistency
      }
      setProfile(fallbackProfile)
    } finally {
      setLoading(false)
    }
  }

  const checkForAchievements = (oldProfile: UserProfile, newProfile: UserProfile) => {
    const oldTotal = oldProfile.baseReputation + oldProfile.vouchedReputation
    const newTotal = newProfile.baseReputation + newProfile.vouchedReputation
    
    // Check for level up
    const levels = [0, 25, 100, 500, 1000]
    const levelNames = ['Newcomer', 'Trusted', 'Respected', 'Authority', 'Legend']
    const oldLevel = levels.findIndex(level => oldTotal < level) - 1
    const newLevel = levels.findIndex(level => newTotal < level) - 1
    
    if (newLevel > oldLevel && newLevel >= 0) {
      addAchievement({
        title: 'Level Up!',
        description: `You've reached ${levelNames[newLevel]} level!`,
        reputation: newTotal,
        type: 'level_up'
      })
    }
    
    // Check for first vouch
    if (oldProfile.vouchCount === 0 && newProfile.vouchCount === 1) {
      addAchievement({
        title: 'First Vouch!',
        description: 'You vouched for your first community member',
        reputation: 0,
        type: 'first_vouch'
      })
    }
    
    // Check for vouch received
    const oldVouchesReceived = Object.keys(oldProfile.vouchesReceived).length
    const newVouchesReceived = Object.keys(newProfile.vouchesReceived).length
    
    if (oldVouchesReceived === 0 && newVouchesReceived === 1) {
      addAchievement({
        title: 'First Vouch Received!',
        description: 'Someone vouched for you for the first time',
        reputation: 0,
        type: 'vouches_received'
      })
    }
  }

  const addAchievement = (achievement: any) => {
    // Use crypto.randomUUID() for better uniqueness, fallback to counter
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `achievement-${achievements.length}-${performance.now()}`
    
    const newAchievement = {
      ...achievement,
      id,
      timestamp: performance.now() // Use performance.now() for client-side consistency
    }
    
    setAchievements(prev => [...prev, newAchievement])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissAchievement(newAchievement.id)
    }, 5000)
  }

  const dismissAchievement = (id: string) => {
    setAchievements(prev => prev.filter(achievement => achievement.id !== id))
  }

  const handleVouch = async (address: string, amount: number) => {
    try {
      console.log(`🤝 Creating vouch: ${amount} reputation points for ${address}`)
      console.log(`👤 Voucher: ${user.addr}`)
      console.log(`🎯 Vouchee: ${address}`)
      
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Check if vouchee exists first
      console.log('🔍 Checking if vouchee has a RepVouch profile...')
      const voucheeProfile = await flowHelpers.getUserProfile(address)
      
      if (!voucheeProfile) {
        console.error(`❌ VOUCH FAILED: Vouchee ${address} does not have a RepVouch profile!`)
        console.log('💡 Solution: The target user needs to connect their wallet to RepVouch first')
        alert(`Cannot vouch for ${address.slice(0,8)}...\n\nThe target user needs to connect their wallet to RepVouch and create a profile first.`)
        return
      }
      
      console.log(`✅ Vouchee profile found! They have ${voucheeProfile.baseReputation + voucheeProfile.vouchedReputation} total reputation`)
      
      // Execute the vouch transaction on blockchain
      console.log('🚀 Submitting vouch transaction to Flow blockchain...')
      const txId = await flowHelpers.createVouch(address, amount)
      console.log(`✅ VOUCH TRANSACTION SUCCESSFUL! TX ID: ${txId}`)
      console.log(`🔗 View on Flowscan: https://testnet.flowscan.io/tx/${txId}`)
      console.log('📋 Next step: The vouchee needs to accept this vouch to receive the reputation benefit')
      
      // Show transaction success dialog
      setTransactionDialog({
        isOpen: true,
        transaction: {
          type: 'vouch',
          txId: txId,
          amount: amount,
          message: `Successfully vouched ${amount} reputation points to ${address.slice(0, 8)}...${address.slice(-6)}`
        }
      })
      
      // Refresh user profile after successful transaction
      console.log('🔄 Refreshing your profile to show updated vouch status...')
      await loadUserProfile()
    } catch (error) {
      console.error('❌ VOUCH FAILED:', error)
      
      if (error instanceof Error && error.message && error.message.includes('Vouchee not found')) {
        alert(`Cannot vouch for this user.\n\nThe target address doesn't have a RepVouch profile yet. They need to connect their wallet and create a profile first.`)
      } else {
        alert('Failed to create vouch. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (address: string) => {
    try {
      console.log(`🔄 Revoking vouch for: ${address}`)
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Execute the revoke transaction on blockchain
      console.log('🚀 Submitting revoke transaction to Flow blockchain...')
      const txId = await flowHelpers.revokeVouch(address)
      console.log(`✅ REVOKE TRANSACTION SUCCESSFUL! TX ID: ${txId}`)
      console.log(`🔗 View on Flowscan: https://testnet.flowscan.io/tx/${txId}`)
      
      // Show transaction success dialog
      setTransactionDialog({
        isOpen: true,
        transaction: {
          type: 'revoke',
          txId: txId,
          message: `Successfully revoked vouch for ${address.slice(0, 8)}...${address.slice(-6)}`
        }
      })
      
      // Refresh user profile after successful transaction
      console.log('🔄 Refreshing your profile...')
      await loadUserProfile()
    } catch (error) {
      console.error('❌ REVOKE FAILED:', error)
      alert('Failed to revoke vouch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptVouch = async (address: string, amount: number) => {
    try {
      console.log(`🎉 Accepting vouch: ${amount} reputation points from ${address}`)
      console.log(`👤 Vouchee (you): ${user.addr}`)
      console.log(`👥 Voucher: ${address}`)
      
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Execute the accept vouch transaction on blockchain
      console.log('🚀 Submitting accept vouch transaction to Flow blockchain...')
      const txId = await flowHelpers.acceptVouch(address, amount)
      console.log(`✅ ACCEPT VOUCH SUCCESSFUL! TX ID: ${txId}`)
      console.log(`🔗 View on Flowscan: https://testnet.flowscan.io/tx/${txId}`)
      console.log(`🎊 You should now have ${amount} additional reputation points!`)
      
      // Show transaction success dialog
      setTransactionDialog({
        isOpen: true,
        transaction: {
          type: 'accept',
          txId: txId,
          amount: amount,
          message: `Successfully accepted vouch from ${address.slice(0, 8)}...${address.slice(-6)}`
        }
      })
      
      // Refresh user profile after successful transaction
      console.log('🔄 Refreshing your profile to show new reputation...')
      await loadUserProfile()
    } catch (error) {
      console.error('❌ ACCEPT VOUCH FAILED:', error)
      alert('Failed to accept vouch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveReceivedVouch = async (address: string) => {
    try {
      console.log(`🔄 Removing received vouch from: ${address}`)
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Execute the remove received vouch transaction on blockchain
      console.log('🚀 Submitting remove vouch transaction to Flow blockchain...')
      const txId = await flowHelpers.removeReceivedVouch(address)
      console.log(`✅ REMOVE VOUCH SUCCESSFUL! TX ID: ${txId}`)
      console.log(`🔗 View on Flowscan: https://testnet.flowscan.io/tx/${txId}`)
      
      // Show transaction success dialog
      setTransactionDialog({
        isOpen: true,
        transaction: {
          type: 'remove',
          txId: txId,
          message: `Successfully removed received vouch from ${address.slice(0, 8)}...${address.slice(-6)}`
        }
      })
      
      // Refresh user profile after successful transaction
      console.log('🔄 Refreshing your profile...')
      await loadUserProfile()
    } catch (error) {
      console.error('❌ REMOVE VOUCH FAILED:', error)
      alert('Failed to remove received vouch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function moved to top of component

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.loggedIn ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to RepVouch
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Build reputation through community vouching
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ReputationCard profile={profile} />
                    <VouchingInterface 
                      profile={profile}
                      onVouch={handleVouch}
                      onRevoke={handleRevoke}
                      onAcceptVouch={handleAcceptVouch}
                      onRemoveReceivedVouch={handleRemoveReceivedVouch}
                      pendingVouches={pendingVouches}
                    />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <ClientOnly>
                    <LiveTransactionFeed maxItems={8} autoRefresh={true} />
                  </ClientOnly>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  How RepVouch Works
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Start with Base Reputation</h3>
                      <p className="text-sm text-gray-600">
                        Every user begins with 10 base reputation points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Vouch for Others</h3>
                      <p className="text-sm text-gray-600">
                        Lend your reputation to people you trust (up to 5 at once)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Earn Benefits</h3>
                      <p className="text-sm text-gray-600">
                        Higher reputation unlocks voting, proposals, and exclusive features
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Trust Network
                </h2>
                <p className="text-gray-600 mb-6">
                  Explore the visualization of reputation relationships and see how trust flows through the community.
                </p>
                <button
                  onClick={() => setShowNetworkViz(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🕸️ View Trust Network
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  <p>• Interactive network graph</p>
                  <p>• Real-time vouching relationships</p>
                  <p>• Reputation flow visualization</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              RepVouch
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A decentralized reputation system where community vouching builds trust and unlocks opportunities. 
              Connect your Flow wallet to start building your reputation.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Why RepVouch?
                  </h2>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">Decentralized reputation on Flow blockchain</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">Community-driven trust system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">Unlock features as you build reputation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">Transparent and immutable history</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Get Started
                  </h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">1.</span>
                      <span className="text-gray-700">Connect your Flow wallet</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">2.</span>
                      <span className="text-gray-700">Start with 10 base reputation</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">3.</span>
                      <span className="text-gray-700">Vouch for trusted community members</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">4.</span>
                      <span className="text-gray-700">Build your reputation and unlock benefits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Achievement Notifications */}
      {hasMounted && (
        <AchievementNotification 
          achievements={achievements}
          onDismiss={dismissAchievement}
        />
      )}

      {/* Trust Network Visualization */}
      <TrustNetworkVisualization
        isOpen={showNetworkViz}
        onClose={() => setShowNetworkViz(false)}
        currentUser={profile}
      />

      {/* Transaction Status Dialog */}
      <TransactionStatusDialog
        isOpen={transactionDialog.isOpen}
        onClose={() => setTransactionDialog({ isOpen: false, transaction: null })}
        transaction={transactionDialog.transaction}
      />
    </div>
  )
}

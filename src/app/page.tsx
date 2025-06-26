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

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false, addr: null })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [achievements, setAchievements] = useState<any[]>([])
  const [previousProfile, setPreviousProfile] = useState<UserProfile | null>(null)
  const [showNetworkViz, setShowNetworkViz] = useState(false)

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      loadUserProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user.addr) return
    
    setLoading(true)
    try {
      // Import flowHelpers dynamically to avoid SSR issues
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Try to get user profile from blockchain
      let userProfile = await flowHelpers.getUserProfile(user.addr)
      
      // If user doesn't exist on blockchain, try to set them up
      if (!userProfile) {
        console.log('User not found on blockchain, attempting setup...')
        try {
          await flowHelpers.setupUser()
          // Wait a bit for transaction to be processed
          await new Promise(resolve => setTimeout(resolve, 3000))
          userProfile = await flowHelpers.getUserProfile(user.addr)
        } catch (setupError) {
          console.error('Failed to setup user:', setupError)
          // Fallback to basic profile for new users
          userProfile = {
            userId: "0",
            address: user.addr,
            baseReputation: 10,
            vouchedReputation: 0,
            activeVouches: {},
            vouchesReceived: {},
            vouchCount: 0,
            createdAt: Date.now()
          }
        }
      }
      
      // Check for achievements
      if (previousProfile && userProfile) {
        checkForAchievements(previousProfile, userProfile)
      }
      
      setPreviousProfile(profile)
      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Fallback profile if blockchain is unavailable
      const fallbackProfile: UserProfile = {
        userId: "0",
        address: user.addr,
        baseReputation: 10,
        vouchedReputation: 0,
        activeVouches: {},
        vouchesReceived: {},
        vouchCount: 0,
        createdAt: Date.now()
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
    const newAchievement = {
      ...achievement,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
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
      console.log('Creating vouch:', { address, amount })
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Execute the vouch transaction on blockchain
      const txId = await flowHelpers.createVouch(address, amount)
      console.log('Vouch transaction successful:', txId)
      
      // Refresh user profile after successful transaction
      await loadUserProfile()
    } catch (error) {
      console.error('Failed to create vouch:', error)
      alert('Failed to create vouch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (address: string) => {
    try {
      console.log('Revoking vouch:', address)
      setLoading(true)
      
      // Import flowHelpers dynamically
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // Execute the revoke transaction on blockchain
      const txId = await flowHelpers.revokeVouch(address)
      console.log('Revoke transaction successful:', txId)
      
      // Refresh user profile after successful transaction
      await loadUserProfile()
    } catch (error) {
      console.error('Failed to revoke vouch:', error)
      alert('Failed to revoke vouch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                    />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <LiveTransactionFeed maxItems={8} autoRefresh={true} />
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
      <AchievementNotification 
        achievements={achievements}
        onDismiss={dismissAchievement}
      />

      {/* Trust Network Visualization */}
      <TrustNetworkVisualization
        isOpen={showNetworkViz}
        onClose={() => setShowNetworkViz(false)}
        currentUser={profile}
      />
    </div>
  )
}

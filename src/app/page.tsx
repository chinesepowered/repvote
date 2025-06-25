'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import * as fcl from "@onflow/fcl"
import { UserProfile } from '@/types'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const ReputationCard = dynamic(() => import('@/components/ReputationCard'), { ssr: false })
const VouchingInterface = dynamic(() => import('@/components/VouchingInterface'), { ssr: false })

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false, addr: null })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fcl.currentUser.subscribe(setUser)
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
      // For demo purposes, create a mock profile
      // In production, this would query the blockchain
      const mockProfile: UserProfile = {
        userId: "1",
        address: user.addr,
        baseReputation: 25,
        vouchedReputation: 15.5,
        activeVouches: {
          "0x1234567890abcdef": 5.0,
          "0xabcdef1234567890": 3.2
        },
        vouchesReceived: {
          "0xfedcba0987654321": 10.0,
          "0x1111222233334444": 5.5
        },
        vouchCount: 2,
        createdAt: Date.now() - 86400000 // 1 day ago
      }
      setProfile(mockProfile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVouch = async (address: string, amount: number) => {
    try {
      console.log('Creating vouch:', { address, amount })
      // TODO: Implement Flow transaction
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      loadUserProfile()
    } catch (error) {
      console.error('Failed to create vouch:', error)
    }
  }

  const handleRevoke = async (address: string) => {
    try {
      console.log('Revoking vouch:', address)
      // TODO: Implement Flow transaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      loadUserProfile()
    } catch (error) {
      console.error('Failed to revoke vouch:', error)
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReputationCard profile={profile} />
                <VouchingInterface 
                  profile={profile}
                  onVouch={handleVouch}
                  onRevoke={handleRevoke}
                />
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                How RepVouch Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Start with Base Reputation</h3>
                  <p className="text-sm text-gray-600">
                    Every user begins with 10 base reputation points
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Vouch for Others</h3>
                  <p className="text-sm text-gray-600">
                    Lend your reputation to people you trust (up to 5 at once)
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Earn Benefits</h3>
                  <p className="text-sm text-gray-600">
                    Higher reputation unlocks voting, proposals, and exclusive features
                  </p>
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
    </div>
  )
}

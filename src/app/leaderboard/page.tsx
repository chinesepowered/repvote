'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react'
import { REPUTATION_LEVELS } from '@/types'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })

interface LeaderboardUser {
  address: string
  reputation: number
  level: string
  vouchCount: number
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      // Import flowHelpers dynamically to avoid SSR issues
      const { flowHelpers } = await import('@/lib/flowHelpers')
      
      // TODO: Implement proper leaderboard query from blockchain
      // For now, we'll create a placeholder implementation
      // In a real implementation, you'd query all users and sort by reputation
      
      // Mock leaderboard data for demo (will be replaced with real blockchain query)
      const mockLeaderboard: LeaderboardUser[] = [
        {
          address: "0x1234567890abcdef",
          reputation: 1250.5,
          level: "Legend",
          vouchCount: 25,
          rank: 1
        },
        {
          address: "0xabcdef1234567890", 
          reputation: 850.2,
          level: "Authority",
          vouchCount: 18,
          rank: 2
        },
        {
          address: "0xfedcba9876543210",
          reputation: 650.0,
          level: "Authority", 
          vouchCount: 15,
          rank: 3
        },
        {
          address: "0x2468ace013579bdf",
          reputation: 425.7,
          level: "Respected",
          vouchCount: 12,
          rank: 4
        },
        {
          address: "0x13579bdf2468ace0",
          reputation: 285.3,
          level: "Respected",
          vouchCount: 8,
          rank: 5
        },
        {
          address: "0x987654321fedcba0",
          reputation: 150.8,
          level: "Respected",
          vouchCount: 6,
          rank: 6
        },
        {
          address: "0x5a5a5a5a5a5a5a5a",
          reputation: 95.2,
          level: "Trusted",
          vouchCount: 4,
          rank: 7
        },
        {
          address: "0xb1b1b1b1b1b1b1b1",
          reputation: 78.5,
          level: "Trusted",
          vouchCount: 3,
          rank: 8
        }
      ]
      
      setLeaderboard(mockLeaderboard)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-yellow-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getLevelColor = (level: string) => {
    const reputationLevel = REPUTATION_LEVELS.find(l => l.name === level)
    return reputationLevel?.color || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reputation Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            Top reputation holders in the RepVouch community
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vouches
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user) => (
                    <tr key={user.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.address.slice(2, 4).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {user.address.slice(0, 8)}...{user.address.slice(-6)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Flow Address
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-lg font-semibold text-gray-900">
                            {user.reputation.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getLevelColor(user.level)}`}>
                          {user.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.vouchCount}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Top Performer
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {leaderboard[0]?.reputation.toFixed(1) || 0}
            </p>
            <p className="text-sm text-gray-500">Highest reputation</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Most Active
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...leaderboard.map(u => u.vouchCount)) || 0}
            </p>
            <p className="text-sm text-gray-500">Vouches given</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Total Users
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {leaderboard.length}
            </p>
            <p className="text-sm text-gray-500">Community members</p>
          </div>
        </div>
      </main>
    </div>
  )
}
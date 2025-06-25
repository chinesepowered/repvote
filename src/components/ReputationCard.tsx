'use client'

import { UserProfile, REPUTATION_LEVELS } from '@/types'
import { Star, TrendingUp, Users, Award } from 'lucide-react'

interface ReputationCardProps {
  profile: UserProfile | null
}

export default function ReputationCard({ profile }: ReputationCardProps) {
  if (!profile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  const totalReputation = profile.baseReputation + profile.vouchedReputation
  const currentLevel = REPUTATION_LEVELS
    .reverse()
    .find(level => totalReputation >= level.minReputation) || REPUTATION_LEVELS[0]
  
  const nextLevel = REPUTATION_LEVELS.find(level => level.minReputation > totalReputation)
  const progressToNext = nextLevel 
    ? ((totalReputation - currentLevel.minReputation) / (nextLevel.minReputation - currentLevel.minReputation)) * 100
    : 100

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Reputation</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${currentLevel.color}`}>
          {currentLevel.name}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">
              {totalReputation.toFixed(1)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Base: {profile.baseReputation}</div>
            <div className="text-sm text-gray-500">Vouched: {profile.vouchedReputation.toFixed(1)}</div>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to {nextLevel.name}</span>
              <span className="text-gray-900 font-medium">
                {totalReputation.toFixed(0)} / {nextLevel.minReputation}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${nextLevel.color}`}
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">{profile.vouchCount}</div>
            <div className="text-xs text-gray-500">Vouches Given</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {Object.keys(profile.vouchesReceived).length}
            </div>
            <div className="text-xs text-gray-500">Vouches Received</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {5 - Object.keys(profile.activeVouches).length}
            </div>
            <div className="text-xs text-gray-500">Available Slots</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Current Benefits</h3>
          <ul className="space-y-1">
            {currentLevel.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-2" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
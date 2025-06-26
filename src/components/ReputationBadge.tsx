'use client'

import { Star, Crown, Shield, Award, Zap } from 'lucide-react'
import { REPUTATION_LEVELS, ReputationLevel } from '@/types'

interface ReputationBadgeProps {
  reputation: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export default function ReputationBadge({ 
  reputation, 
  size = 'md', 
  showLabel = true,
  animated = false 
}: ReputationBadgeProps) {
  const currentLevel = REPUTATION_LEVELS
    .slice()
    .reverse()
    .find(level => reputation >= level.minReputation) || REPUTATION_LEVELS[0]

  const getBadgeIcon = (level: ReputationLevel) => {
    const iconProps = {
      className: `${getSizeClasses().icon} text-white`,
    }
    
    switch (level.name) {
      case 'Legend':
        return <Crown {...iconProps} />
      case 'Authority':
        return <Zap {...iconProps} />
      case 'Respected':
        return <Award {...iconProps} />
      case 'Trusted':
        return <Shield {...iconProps} />
      default:
        return <Star {...iconProps} />
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-8 h-8',
          icon: 'w-4 h-4',
          text: 'text-xs',
          badge: 'text-xs px-2 py-1'
        }
      case 'lg':
        return {
          container: 'w-16 h-16',
          icon: 'w-8 h-8',
          text: 'text-lg font-bold',
          badge: 'text-sm px-4 py-2'
        }
      default:
        return {
          container: 'w-12 h-12',
          icon: 'w-6 h-6',
          text: 'text-sm font-semibold',
          badge: 'text-sm px-3 py-1'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`
          ${sizeClasses.container} 
          rounded-full flex items-center justify-center
          ${currentLevel.color} 
          shadow-lg
          ${animated ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
        title={`${currentLevel.name} Level - ${reputation} reputation`}
      >
        {getBadgeIcon(currentLevel)}
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className={`${sizeClasses.text} text-gray-900`}>
            {currentLevel.name}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-500">
              {reputation.toFixed(1)} reputation
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function ReputationProgress({ 
  reputation, 
  showNextLevel = true 
}: { 
  reputation: number
  showNextLevel?: boolean 
}) {
  const currentLevel = REPUTATION_LEVELS
    .slice()
    .reverse()
    .find(level => reputation >= level.minReputation) || REPUTATION_LEVELS[0]
  
  const nextLevel = REPUTATION_LEVELS.find(level => level.minReputation > reputation)
  
  if (!nextLevel) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Max Level Achieved!</span>
          <ReputationBadge reputation={reputation} size="sm" showLabel={false} />
        </div>
        <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 w-full"></div>
        </div>
      </div>
    )
  }

  const progress = ((reputation - currentLevel.minReputation) / (nextLevel.minReputation - currentLevel.minReputation)) * 100
  const progressClamped = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <ReputationBadge reputation={reputation} size="sm" />
        {showNextLevel && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Next: {nextLevel.name}</div>
            <div className="text-xs font-medium text-gray-700">
              {reputation.toFixed(0)} / {nextLevel.minReputation}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${nextLevel.color}`}
            style={{ width: `${progressClamped}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {(nextLevel.minReputation - reputation).toFixed(1)} more to reach {nextLevel.name}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Star } from 'lucide-react'
import ReputationBadge from './ReputationBadge'

interface Achievement {
  id: string
  title: string
  description: string
  reputation: number
  type: 'level_up' | 'milestone' | 'first_vouch' | 'vouches_received'
  timestamp: number
}

interface AchievementNotificationProps {
  achievements: Achievement[]
  onDismiss: (id: string) => void
}

export default function AchievementNotification({ 
  achievements, 
  onDismiss 
}: AchievementNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.3 
            }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {achievement.type === 'level_up' ? (
                  <ReputationBadge 
                    reputation={achievement.reputation} 
                    size="sm" 
                    showLabel={false}
                    animated={true}
                  />
                ) : (
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    🎉 {achievement.title}
                  </h3>
                  <button
                    onClick={() => onDismiss(achievement.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  {achievement.description}
                </p>
                {achievement.reputation > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {achievement.reputation} reputation
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook to manage achievements
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const addAchievement = (achievement: Omit<Achievement, 'id' | 'timestamp'>) => {
    const newAchievement: Achievement = {
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

  // Helper function to check for level up
  const checkLevelUp = (oldReputation: number, newReputation: number) => {
    const levels = [0, 25, 100, 500, 1000]
    const oldLevel = levels.findIndex(level => oldReputation < level) - 1
    const newLevel = levels.findIndex(level => newReputation < level) - 1
    
    if (newLevel > oldLevel) {
      const levelNames = ['Newcomer', 'Trusted', 'Respected', 'Authority', 'Legend']
      addAchievement({
        title: `Level Up!`,
        description: `You've reached ${levelNames[newLevel]} level!`,
        reputation: newReputation,
        type: 'level_up'
      })
    }
  }

  // Helper function to check for milestones
  const checkMilestones = (reputation: number, vouchCount: number, vouchesReceived: number) => {
    // First vouch milestone
    if (vouchCount === 1) {
      addAchievement({
        title: 'First Vouch!',
        description: 'You vouched for your first community member',
        reputation: 0,
        type: 'first_vouch'
      })
    }

    // Reputation milestones
    const milestones = [50, 150, 250, 750]
    milestones.forEach(milestone => {
      if (reputation >= milestone && reputation < milestone + 10) {
        addAchievement({
          title: `${milestone} Reputation!`,
          description: `Your reputation has reached ${milestone} points`,
          reputation: reputation,
          type: 'milestone'
        })
      }
    })

    // Vouch received milestones
    if (vouchesReceived === 1) {
      addAchievement({
        title: 'First Vouch Received!',
        description: 'Someone vouched for you for the first time',
        reputation: 0,
        type: 'vouches_received'
      })
    }

    if (vouchesReceived === 5) {
      addAchievement({
        title: 'Community Trust!',
        description: 'You\'ve received vouches from 5 people',
        reputation: 0,
        type: 'vouches_received'
      })
    }
  }

  return {
    achievements,
    addAchievement,
    dismissAchievement,
    checkLevelUp,
    checkMilestones
  }
}
export interface UserProfile {
  userId: string
  address: string
  baseReputation: number
  vouchedReputation: number
  activeVouches: Record<string, number>
  vouchesReceived: Record<string, number>
  vouchCount: number
  createdAt: number
}

export interface Vouch {
  id: string
  voucherId: string
  voucheeId: string
  amount: number
  createdAt: number
  active: boolean
}

export interface ReputationLevel {
  name: string
  minReputation: number
  color: string
  benefits: string[]
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    name: "Newcomer",
    minReputation: 0,
    color: "bg-gray-500",
    benefits: ["Basic access", "Can receive vouches"]
  },
  {
    name: "Trusted",
    minReputation: 25,
    color: "bg-blue-500", 
    benefits: ["Can vouch for others", "Vote on proposals", "5 vouch slots"]
  },
  {
    name: "Respected",
    minReputation: 100,
    color: "bg-purple-500",
    benefits: ["Create proposals", "Higher vouch power", "Special badge"]
  },
  {
    name: "Authority", 
    minReputation: 500,
    color: "bg-yellow-500",
    benefits: ["Moderate discussions", "Exclusive features", "Gold badge"]
  },
  {
    name: "Legend",
    minReputation: 1000,
    color: "bg-red-500",
    benefits: ["All privileges", "Platform governance", "Legendary status"]
  }
]
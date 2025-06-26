'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, UserX, UserPlus, TrendingUp, Clock, ExternalLink } from 'lucide-react'
import ReputationBadge from './ReputationBadge'

interface Transaction {
  id: string
  type: 'vouch_created' | 'vouch_revoked' | 'user_registered' | 'reputation_updated'
  timestamp: number
  fromAddress?: string
  toAddress?: string
  amount?: number
  txHash?: string
  blockHeight?: number
}

interface LiveTransactionFeedProps {
  maxItems?: number
  autoRefresh?: boolean
}

export default function LiveTransactionFeed({ 
  maxItems = 10, 
  autoRefresh = true 
}: LiveTransactionFeedProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock transaction generation for demo
  useEffect(() => {
    if (!autoRefresh) return

    const generateMockTransaction = (): Transaction => {
      const types: Transaction['type'][] = ['vouch_created', 'vouch_revoked', 'user_registered', 'reputation_updated']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const mockAddresses = [
        '0x1234567890abcdef',
        '0xabcdef1234567890', 
        '0xfedcba9876543210',
        '0x2468ace013579bdf',
        '0x13579bdf2468ace0'
      ]

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        timestamp: Date.now(),
        fromAddress: type !== 'user_registered' ? mockAddresses[Math.floor(Math.random() * mockAddresses.length)] : undefined,
        toAddress: type === 'vouch_created' || type === 'vouch_revoked' ? mockAddresses[Math.floor(Math.random() * mockAddresses.length)] : undefined,
        amount: type === 'vouch_created' ? Math.random() * 10 + 1 : undefined,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockHeight: Math.floor(Math.random() * 1000000) + 5000000
      }
    }

    // Add initial transactions
    const initialTransactions = Array.from({ length: 5 }, generateMockTransaction)
    setTransactions(initialTransactions.sort((a, b) => b.timestamp - a.timestamp))

    // Simulate new transactions every 10-30 seconds
    const interval = setInterval(() => {
      const newTransaction = generateMockTransaction()
      setTransactions(prev => 
        [newTransaction, ...prev].slice(0, maxItems).sort((a, b) => b.timestamp - a.timestamp)
      )
    }, Math.random() * 20000 + 10000) // 10-30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, maxItems])

  // Function to add real transactions (called from other components)
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }
    
    setTransactions(prev => 
      [newTransaction, ...prev].slice(0, maxItems).sort((a, b) => b.timestamp - a.timestamp)
    )
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'vouch_created':
        return <UserCheck className="w-4 h-4 text-green-600" />
      case 'vouch_revoked':
        return <UserX className="w-4 h-4 text-red-600" />
      case 'user_registered':
        return <UserPlus className="w-4 h-4 text-blue-600" />
      case 'reputation_updated':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionDescription = (tx: Transaction) => {
    const shortFrom = tx.fromAddress?.slice(0, 6) + '...' + tx.fromAddress?.slice(-4)
    const shortTo = tx.toAddress?.slice(0, 6) + '...' + tx.toAddress?.slice(-4)

    switch (tx.type) {
      case 'vouch_created':
        return (
          <span>
            <span className="font-medium">{shortFrom}</span> vouched{' '}
            <span className="font-bold text-green-600">{tx.amount?.toFixed(1)}</span> for{' '}
            <span className="font-medium">{shortTo}</span>
          </span>
        )
      case 'vouch_revoked':
        return (
          <span>
            <span className="font-medium">{shortFrom}</span> revoked vouch for{' '}
            <span className="font-medium">{shortTo}</span>
          </span>
        )
      case 'user_registered':
        return (
          <span>
            New user <span className="font-medium">{shortFrom}</span> joined RepVouch
          </span>
        )
      case 'reputation_updated':
        return (
          <span>
            <span className="font-medium">{shortFrom}</span> reputation updated
          </span>
        )
      default:
        return 'Unknown transaction'
    }
  }

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'vouch_created':
        return 'border-l-green-500 bg-green-50'
      case 'vouch_revoked':
        return 'border-l-red-500 bg-red-50'
      case 'user_registered':
        return 'border-l-blue-500 bg-blue-50'
      case 'reputation_updated':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Live Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Waiting for transactions...</p>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`px-6 py-4 border-l-4 ${getTransactionColor(tx.type)} border-b border-gray-100 last:border-b-0`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {getTransactionDescription(tx)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                      
                      {tx.txHash && (
                        <a
                          href={`https://testnet.flowscan.org/transaction/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>View TX</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {transactions.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {transactions.length} recent transactions
          </p>
        </div>
      )}
    </div>
  )
}

// Export hook for other components to add transactions
export function useTransactionFeed() {
  const [feedRef, setFeedRef] = useState<{
    addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void
  } | null>(null)

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (feedRef) {
      feedRef.addTransaction(transaction)
    }
  }

  return { addTransaction, setFeedRef }
}
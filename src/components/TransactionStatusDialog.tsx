'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, ExternalLink, X, Copy, Check } from 'lucide-react'

interface TransactionStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  transaction: {
    type: 'vouch' | 'revoke' | 'accept' | 'remove'
    txId: string
    amount?: number
    message: string
  } | null
}

export default function TransactionStatusDialog({ 
  isOpen, 
  onClose, 
  transaction 
}: TransactionStatusDialogProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isOpen || !transaction) return null

  const flowscanUrl = `https://testnet.flowscan.io/tx/${transaction.txId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transaction.txId)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy transaction ID:', err)
    }
  }

  const getTitle = () => {
    switch (transaction.type) {
      case 'vouch':
        return '✅ Vouch Created Successfully!'
      case 'revoke':
        return '✅ Vouch Revoked Successfully!'
      case 'accept':
        return '🎉 Vouch Accepted Successfully!'
      case 'remove':
        return '✅ Received Vouch Removed Successfully!'
      default:
        return '✅ Transaction Successful!'
    }
  }

  const getIcon = () => {
    switch (transaction.type) {
      case 'accept':
        return '🎉'
      default:
        return '✅'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Complete
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          <div className="text-center">
            <div className="text-2xl mb-2">{getIcon()}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getTitle()}
            </h3>
            <p className="text-gray-600">
              {transaction.message}
            </p>
            {transaction.amount && transaction.type === 'accept' && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  +{transaction.amount} reputation points gained!
                </p>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Transaction ID
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                <code className="text-sm text-gray-800 font-mono flex-1 truncate">
                  {transaction.txId}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy transaction ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Flowscan Link */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                View on Blockchain Explorer
              </label>
              <a
                href={flowscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Flowscan Testnet
                    </div>
                    <div className="text-xs text-blue-600">
                      View transaction details
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
              </a>
            </div>
          </div>

          {/* Next Steps */}
          {transaction.type === 'vouch' && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <span className="font-medium">Next step:</span> The recipient needs to accept this vouch to receive the reputation benefit.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 
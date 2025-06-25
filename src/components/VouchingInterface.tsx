'use client'

import { useState } from 'react'
import { UserProfile } from '@/types'
import { Plus, Minus, Search, UserCheck } from 'lucide-react'

interface VouchingInterfaceProps {
  profile: UserProfile | null
  onVouch: (address: string, amount: number) => void
  onRevoke: (address: string) => void
}

export default function VouchingInterface({ profile, onVouch, onRevoke }: VouchingInterfaceProps) {
  const [selectedAddress, setSelectedAddress] = useState('')
  const [vouchAmount, setVouchAmount] = useState('')
  const [showVouchForm, setShowVouchForm] = useState(false)

  if (!profile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center text-gray-500">
          Connect your wallet to start vouching
        </div>
      </div>
    )
  }

  const maxVouchPower = (profile.baseReputation + profile.vouchedReputation) * 0.1
  const availableSlots = 5 - Object.keys(profile.activeVouches).length

  const handleVouch = () => {
    if (selectedAddress && vouchAmount) {
      onVouch(selectedAddress, parseFloat(vouchAmount))
      setSelectedAddress('')
      setVouchAmount('')
      setShowVouchForm(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Vouch for Others</h2>
        <div className="text-sm text-gray-500">
          {availableSlots} slots available
        </div>
      </div>

      {availableSlots > 0 ? (
        <>
          {!showVouchForm ? (
            <button
              onClick={() => setShowVouchForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Vouch</span>
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flow Address
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    placeholder="0x1234567890abcdef"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vouch Amount
                </label>
                <input
                  type="number"
                  value={vouchAmount}
                  onChange={(e) => setVouchAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max={maxVouchPower}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Max available: {maxVouchPower.toFixed(1)}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleVouch}
                  disabled={!selectedAddress || !vouchAmount || parseFloat(vouchAmount) > maxVouchPower}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Vouch
                </button>
                <button
                  onClick={() => setShowVouchForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No available vouch slots
        </div>
      )}

      {Object.keys(profile.activeVouches).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Active Vouches</h3>
          <div className="space-y-2">
            {Object.entries(profile.activeVouches).map(([address, amount]) => (
              <div key={address} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-mono text-sm text-gray-900">
                      {address.slice(0, 8)}...{address.slice(-6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Vouched: {amount.toFixed(1)} reputation
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRevoke(address)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                >
                  <Minus className="h-3 w-3" />
                  <span>Revoke</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(profile.vouchesReceived).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Vouches Received</h3>
          <div className="space-y-2">
            {Object.entries(profile.vouchesReceived).map(([address, amount]) => (
              <div key={address} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-mono text-sm text-gray-900">
                      {address.slice(0, 8)}...{address.slice(-6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Vouched: {amount.toFixed(1)} reputation
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
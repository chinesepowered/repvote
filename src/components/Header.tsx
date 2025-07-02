'use client'

import { useState, useEffect } from 'react'
import fcl from "@/lib/flow"
import { Coins, LogOut, User, Network } from 'lucide-react'

export default function Header() {
  const [user, setUser] = useState<{ loggedIn: boolean; addr?: string | null }>({ loggedIn: false, addr: null })
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [hasMounted])

  const signIn = () => {
    fcl.authenticate()
  }

  const signOut = () => {
    fcl.unauthenticate()
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">RepVouch</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </a>
            <a href="/leaderboard" className="text-gray-600 hover:text-gray-900 font-medium">
              Leaderboard
            </a>
            <a href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {!hasMounted ? (
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : user.loggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700 font-mono">
                    {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
'use client'

import dynamic from 'next/dynamic'
import { Coins, Users, Shield, Zap, Github, Twitter } from 'lucide-react'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coins className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About RepVouch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A decentralized reputation system built on Flow blockchain that enables 
            community-driven trust through vouching mechanics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The Problem
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Traditional reputation systems suffer from centralization, lack of transparency, 
                and inability to transfer trust across platforms. Users build reputation in 
                silos that don&apos;t communicate with each other.
              </p>
              <p>
                Innovation in decentralized economies is bottlenecked by slow grants, 
                siloed institutions, and invisible contributions. We need better ways to 
                identify and reward valuable community members.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Our Solution
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                RepVouch creates a transparent, transferable reputation system where 
                community members can vouch for each other by temporarily lending their 
                own reputation points.
              </p>
              <p>
                Built on Flow blockchain with Cadence smart contracts, RepVouch ensures 
                transparency, immutability, and true ownership of reputation data.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Join</h3>
              <p className="text-sm text-gray-600">
                Connect your Flow wallet and start with 10 base reputation points
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Vouch</h3>
              <p className="text-sm text-gray-600">
                Lend up to 10% of your reputation to people you trust (5 slots max)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build</h3>
              <p className="text-sm text-gray-600">
                Gain reputation through vouches and community contributions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlock</h3>
              <p className="text-sm text-gray-600">
                Higher reputation unlocks voting rights, proposals, and exclusive features
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Key Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Quadratic scaling prevents reputation monopolies</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Temporary vouching creates dynamic reputation flow</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Transparent and immutable on Flow blockchain</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Gamified progression with reputation levels</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Social proof through vouching history</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg border border-green-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Use Cases
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">Code reviewer reputation for open source projects</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">Community governance and voting rights</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">Grant allocation based on community trust</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">Scientific collaboration and peer review</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700">DAO membership and proposal creation</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Built for the Flow Hackathon
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            RepVouch was created for the &quot;Decentralized Economies, Governance & Science&quot; track, 
            demonstrating how blockchain technology can unlock coordination at the speed of the internet.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a 
              href="https://github.com/repvouch/repvouch"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
            <a 
              href="https://twitter.com/repvouch"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
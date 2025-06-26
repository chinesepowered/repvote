'use client'

import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, RotateCcw, Info, Users, GitBranch } from 'lucide-react'
import { UserProfile, REPUTATION_LEVELS } from '@/types'
import ReputationBadge from './ReputationBadge'

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string
  address: string
  reputation: number
  level: string
  vouchCount: number
  group: number
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode
  target: string | NetworkNode
  value: number
  type: 'vouch'
}

interface TrustNetworkVisualizationProps {
  isOpen: boolean
  onClose: () => void
  currentUser?: UserProfile | null
}

export default function TrustNetworkVisualization({
  isOpen,
  onClose,
  currentUser
}: TrustNetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 0,
    totalVouches: 0,
    avgReputation: 0,
    topUser: null as NetworkNode | null
  })

  // Generate mock network data
  const generateNetworkData = () => {
    const nodes: NetworkNode[] = [
      // Current user (if exists)
      ...(currentUser ? [{
        id: currentUser.address,
        address: currentUser.address,
        reputation: currentUser.baseReputation + currentUser.vouchedReputation,
        level: 'Current User',
        vouchCount: currentUser.vouchCount,
        group: 1
      }] : []),
      // Mock network users
      {
        id: '0x1234567890abcdef',
        address: '0x1234567890abcdef',
        reputation: 1250.5,
        level: 'Legend',
        vouchCount: 25,
        group: 5
      },
      {
        id: '0xabcdef1234567890',
        address: '0xabcdef1234567890',
        reputation: 850.2,
        level: 'Authority',
        vouchCount: 18,
        group: 4
      },
      {
        id: '0xfedcba9876543210',
        address: '0xfedcba9876543210',
        reputation: 650.0,
        level: 'Authority',
        vouchCount: 15,
        group: 4
      },
      {
        id: '0x2468ace013579bdf',
        address: '0x2468ace013579bdf',
        reputation: 425.7,
        level: 'Respected',
        vouchCount: 12,
        group: 3
      },
      {
        id: '0x13579bdf2468ace0',
        address: '0x13579bdf2468ace0',
        reputation: 285.3,
        level: 'Respected',
        vouchCount: 8,
        group: 3
      },
      {
        id: '0x987654321fedcba0',
        address: '0x987654321fedcba0',
        reputation: 150.8,
        level: 'Respected',
        vouchCount: 6,
        group: 3
      },
      {
        id: '0x5a5a5a5a5a5a5a5a',
        address: '0x5a5a5a5a5a5a5a5a',
        reputation: 95.2,
        level: 'Trusted',
        vouchCount: 4,
        group: 2
      },
      {
        id: '0xb1b1b1b1b1b1b1b1',
        address: '0xb1b1b1b1b1b1b1b1',
        reputation: 78.5,
        level: 'Trusted',
        vouchCount: 3,
        group: 2
      },
      {
        id: '0xc2c2c2c2c2c2c2c2',
        address: '0xc2c2c2c2c2c2c2c2',
        reputation: 45.0,
        level: 'Trusted',
        vouchCount: 2,
        group: 2
      },
      {
        id: '0xd3d3d3d3d3d3d3d3',
        address: '0xd3d3d3d3d3d3d3d3',
        reputation: 25.0,
        level: 'Trusted',
        vouchCount: 1,
        group: 2
      }
    ]

    const links: NetworkLink[] = [
      // High-reputation users vouching for others
      { source: '0x1234567890abcdef', target: '0xabcdef1234567890', value: 15.5, type: 'vouch' },
      { source: '0x1234567890abcdef', target: '0xfedcba9876543210', value: 12.0, type: 'vouch' },
      { source: '0x1234567890abcdef', target: '0x2468ace013579bdf', value: 8.5, type: 'vouch' },
      { source: '0xabcdef1234567890', target: '0x13579bdf2468ace0', value: 6.2, type: 'vouch' },
      { source: '0xabcdef1234567890', target: '0x987654321fedcba0', value: 4.8, type: 'vouch' },
      { source: '0xfedcba9876543210', target: '0x5a5a5a5a5a5a5a5a', value: 3.5, type: 'vouch' },
      { source: '0x2468ace013579bdf', target: '0xb1b1b1b1b1b1b1b1', value: 2.1, type: 'vouch' },
      { source: '0x13579bdf2468ace0', target: '0xc2c2c2c2c2c2c2c2', value: 1.8, type: 'vouch' },
      { source: '0x987654321fedcba0', target: '0xd3d3d3d3d3d3d3d3', value: 1.2, type: 'vouch' },
      
      // Add current user connections if they exist
      ...(currentUser && Object.keys(currentUser.activeVouches).length > 0 
        ? Object.entries(currentUser.activeVouches).map(([address, amount]) => ({
            source: currentUser.address,
            target: address,
            value: amount,
            type: 'vouch' as const
          }))
        : []
      ),
      
      // Cross-connections to show network effect
      { source: '0x5a5a5a5a5a5a5a5a', target: '0xb1b1b1b1b1b1b1b1', value: 0.8, type: 'vouch' },
      { source: '0xb1b1b1b1b1b1b1b1', target: '0xc2c2c2c2c2c2c2c2', value: 0.5, type: 'vouch' }
    ]

    return { nodes, links }
  }

  const getNodeColor = (node: NetworkNode) => {
    if (currentUser && node.id === currentUser.address) return '#3B82F6' // Blue for current user
    
    const reputationLevel = REPUTATION_LEVELS
      .slice()
      .reverse()
      .find(level => node.reputation >= level.minReputation) || REPUTATION_LEVELS[0]
    
    switch (reputationLevel.name) {
      case 'Legend': return '#EF4444'    // Red
      case 'Authority': return '#F59E0B' // Yellow
      case 'Respected': return '#8B5CF6' // Purple
      case 'Trusted': return '#10B981'   // Green
      default: return '#6B7280'          // Gray
    }
  }

  const getNodeRadius = (node: NetworkNode) => {
    const baseRadius = 8
    const maxRadius = 25
    const maxReputation = 1500
    return baseRadius + (node.reputation / maxReputation) * (maxRadius - baseRadius)
  }

  useEffect(() => {
    if (!isOpen || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 600
    const { nodes, links } = generateNetworkData()

    // Calculate network statistics
    const totalUsers = nodes.length
    const totalVouches = links.length
    const avgReputation = nodes.reduce((sum, node) => sum + node.reputation, 0) / totalUsers
    const topUser = nodes.reduce((max, node) => node.reputation > max.reputation ? node : max, nodes[0])
    
    setNetworkStats({ totalUsers, totalVouches, avgReputation, topUser })

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    const container = svg.append('g')

    // Create simulation
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(d => 50 + (d.value * 10))
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d as NetworkNode) + 5))

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value) * 2)
      .style('cursor', 'pointer')

    // Add link labels for vouch amounts
    const linkLabels = container.append('g')
      .selectAll('text')
      .data(links)
      .enter().append('text')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .text(d => d.value.toFixed(1))

    // Create nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', getNodeRadius)
      .attr('fill', getNodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // Add node labels
    const nodeLabels = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('dx', 0)
      .attr('dy', -getNodeRadius(nodes[0]) - 5)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .text(d => d.address.slice(0, 6) + '...')

    // Add hover effects
    node
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d) * 1.2)
          .attr('stroke-width', 3)
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d))
          .attr('stroke-width', 2)
      })
      .on('click', (event, d) => {
        setSelectedNode(d)
      })

    // Add link hover effects
    link
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 1)
          .attr('stroke', '#3B82F6')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.6)
          .attr('stroke', '#999')
      })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NetworkNode).x!)
        .attr('y1', d => (d.source as NetworkNode).y!)
        .attr('x2', d => (d.target as NetworkNode).x!)
        .attr('y2', d => (d.target as NetworkNode).y!)

      linkLabels
        .attr('x', d => ((d.source as NetworkNode).x! + (d.target as NetworkNode).x!) / 2)
        .attr('y', d => ((d.source as NetworkNode).y! + (d.target as NetworkNode).y!) / 2)

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      nodeLabels
        .attr('x', d => d.x!)
        .attr('y', d => d.y! - getNodeRadius(d) - 5)
    })

    // Cleanup on unmount
    return () => {
      simulation.stop()
    }
  }, [isOpen, currentUser])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.5
    )
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.7
    )
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trust Network Visualization</h2>
              <p className="text-gray-600">Interactive map of reputation relationships</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex">
            {/* Visualization */}
            <div className="flex-1 relative">
              <svg
                ref={svgRef}
                width="800"
                height="600"
                className="border-r border-gray-200"
              />
              
              {/* Controls */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 bg-white rounded-md shadow-md px-3 py-1">
                <span className="text-sm text-gray-600">
                  Zoom: {(zoomLevel * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 p-6 bg-gray-50">
              {/* Network Stats */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Total Users</span>
                    </div>
                    <span className="font-semibold">{networkStats.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Total Vouches</span>
                    </div>
                    <span className="font-semibold">{networkStats.totalVouches}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Avg Reputation</span>
                    </div>
                    <span className="font-semibold">{networkStats.avgReputation.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
                <div className="space-y-2">
                  {REPUTATION_LEVELS.map((level) => (
                    <div key={level.name} className="flex items-center space-x-2">
                      <div 
                        className={`w-4 h-4 rounded-full ${level.color}`}
                      ></div>
                      <span className="text-sm text-gray-700">{level.name}</span>
                      <span className="text-xs text-gray-500">({level.minReputation}+ rep)</span>
                    </div>
                  ))}
                  {currentUser && (
                    <div className="flex items-center space-x-2 border-t pt-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700 font-medium">You</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Node Info */}
              {selectedNode && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Address</span>
                      <p className="font-mono text-sm break-all">{selectedNode.address}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reputation</span>
                      <ReputationBadge 
                        reputation={selectedNode.reputation} 
                        size="sm" 
                        showLabel={false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Rep</span>
                      <span className="font-semibold">{selectedNode.reputation.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vouches Given</span>
                      <span className="font-semibold">{selectedNode.vouchCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-xs text-gray-500 mt-4">
                <p className="mb-2"><strong>Instructions:</strong></p>
                <p>• Click and drag nodes to move them</p>
                <p>• Scroll to zoom in/out</p>
                <p>• Click nodes to see details</p>
                <p>• Hover over lines to see vouch amounts</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
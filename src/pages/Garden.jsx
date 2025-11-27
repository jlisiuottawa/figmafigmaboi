import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Garden() {
  const { user, refreshUser } = useAuth()
  const [garden, setGarden] = useState({ plants: [], background: null })
  const [availableItems, setAvailableItems] = useState({ plants: [], backgrounds: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('garden') // 'garden', 'shop-plants', or 'shop-backgrounds'
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [draggedPlant, setDraggedPlant] = useState(null)
  const [plantPositions, setPlantPositions] = useState({})
  const gardenAreaRef = useRef(null)

  // Plant health state
  const [plantHealth, setPlantHealth] = useState(3)
  const [lastWatered, setLastWatered] = useState(null)

  useEffect(() => {
    loadGardenData()
    checkPlantHealth()
  }, [])

  const loadGardenData = async () => {
    try {
      setLoading(true)
      const [gardenData, plantsData, backgroundsData] = await Promise.all([
        api.getGarden(),
        api.getGardenItems('plant'),
        api.getGardenItems('background')
      ])
      
      setGarden(gardenData)
      setAvailableItems({
        plants: plantsData.items || [],
        backgrounds: backgroundsData.items || []
      })

      // Initialize plant positions from saved data
      const positions = {}
      gardenData.plants.forEach(plant => {
        positions[plant.id] = { x: plant.position_x || 0, y: plant.position_y || 0 }
      })
      setPlantPositions(positions)
    } catch (error) {
      console.error('Failed to load garden:', error)
      setError('Failed to load garden data')
    } finally {
      setLoading(false)
    }
  }

  const checkPlantHealth = async () => {
    try {
      const healthData = await api.checkPlantHealth()
      setPlantHealth(healthData.plantHealth)
      setLastWatered(healthData.lastWateredAt)
      
      if (healthData.plantsDeleted) {
        setError('Your plants died from lack of water! 😢 Water them daily to keep them healthy.')
        setTimeout(() => setError(null), 5000)
        // Reload garden to reflect deleted plants
        loadGardenData()
      }
    } catch (error) {
      console.error('Failed to check plant health:', error)
    }
  }

  const handleWaterPlants = async () => {
    try {
      setError(null)
      setSuccessMessage(null)

      const response = await api.waterPlants()
      
      if (response.alreadyWatered) {
        setSuccessMessage('Plants already watered today! Come back tomorrow. 💧')
      } else {
        setSuccessMessage(response.message)
      }
      
      setPlantHealth(response.plantHealth)
      setLastWatered(response.lastWateredAt)
      
      await refreshUser()
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Failed to water plants:', error)
      setError(error.message || 'Failed to water plants')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handlePurchase = async (item) => {
    try {
      setSuccessMessage(null)
      setError(null)

      await api.purchaseGardenItem(item.id, 0, 0)
      setSuccessMessage(`${item.name} purchased successfully! 🌱`)
      
      // Refresh garden and user data
      await Promise.all([
        loadGardenData(),
        refreshUser()
      ])

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Purchase failed:', error)
      setError(error.message || 'Failed to purchase item')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDragStart = (e, plant) => {
    setDraggedPlant(plant)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    if (!draggedPlant || !gardenAreaRef.current) return

    const rect = gardenAreaRef.current.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    try {
      // Save position to backend immediately
      await api.updatePlantPosition(draggedPlant.id, x, y)
      
      // Update local state
      setPlantPositions(prev => ({
        ...prev,
        [draggedPlant.id]: { x, y }
      }))

      setSuccessMessage('Plant placed! 🌱')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (error) {
      console.error('Failed to place plant:', error)
      setError(error.message || 'Failed to place plant')
      setTimeout(() => setError(null), 3000)
    }

    setDraggedPlant(null)
  }

  const handleRemovePlant = async (plantId) => {
    try {
      setError(null)
      setSuccessMessage(null)

      await api.removePlant(plantId)
      
      setSuccessMessage('Plant removed from garden! 🌱')
      
      // Clear position
      setPlantPositions(prev => {
        const updated = { ...prev }
        updated[plantId] = { x: 0, y: 0 }
        return updated
      })
      
      // Refresh garden data
      await loadGardenData()

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Failed to remove plant:', error)
      setError(error.message || 'Failed to remove plant')
      setTimeout(() => setError(null), 3000)
    }
  }

  const userSeeds = user?.seeds || 0

  // Calculate background image path, handling PDF rotation
  const getBackgroundStyle = () => {
    if (!garden.background || !garden.background.background_id) {
      return {}
    }

    const imagePath = garden.background.image_path
    
    // Check if it's a PDF background
    if (imagePath && imagePath.toLowerCase().endsWith('.pdf')) {
      return {
        backgroundImage: `url(${imagePath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: 'rotate(90deg)',
        transformOrigin: 'center center'
      }
    }

    return {
      backgroundImage: `url(${imagePath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20 flex items-center justify-center">
        <div className="text-xl">Loading garden...</div>
      </div>
    )
  }

  const healthBarWidth = (plantHealth / 3) * 100
  const healthColor = plantHealth === 3 ? 'bg-green-500' : plantHealth === 2 ? 'bg-yellow-500' : plantHealth === 1 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] to-[#0e1723] text-slate-100 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Garden 🌱</h1>
          <p className="text-slate-400">Grow and maintain your garden with seeds earned from tasks</p>
          <div className="mt-3 flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2 w-fit">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-yellow-400">{userSeeds}</span>
            <span className="text-slate-400">seeds</span>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('garden')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'garden'
                ? 'bg-brand-primary text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            🏡 Garden
          </button>
          <button
            onClick={() => setActiveTab('shop-plants')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'shop-plants'
                ? 'bg-brand-primary text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            🌿 Shop Plants
          </button>
          <button
            onClick={() => setActiveTab('shop-backgrounds')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'shop-backgrounds'
                ? 'bg-brand-primary text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            🖼️ Shop Backgrounds
          </button>
        </div>

        {/* Garden Tab */}
        {activeTab === 'garden' && (
          <div className="space-y-6">
            {/* Plant Health Meter */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Plant Health</h2>
                <button
                  onClick={handleWaterPlants}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  💧 Water Plants
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-full ${healthColor} transition-all duration-500`}
                    style={{ width: `${healthBarWidth}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{plantHealth}/3 bars</span>
                  {lastWatered && (
                    <span>Last watered: {new Date(lastWatered).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ⚠️ Water your plants daily! Each missed day reduces health by 1 bar. Plants die on the 3rd day without water. Consistent watering restores 1 bar per 3 consecutive days.
                </p>
              </div>
            </div>

            {/* Garden Display */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">Your Garden</h2>
              
              {garden.background && garden.background.background_id ? (
                <div
                  ref={gardenAreaRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative h-96 rounded-lg overflow-hidden cursor-crosshair border-2 border-slate-600"
                  style={getBackgroundStyle()}
                >
                  {/* Render planted items */}
                  {garden.plants.map(plant => {
                    const pos = plantPositions[plant.id] || { x: 0, y: 0 }
                    const isPlaced = pos.x !== 0 || pos.y !== 0
                    
                    if (!isPlaced) return null

                    return (
                      <div
                        key={plant.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, plant)}
                        className="absolute cursor-move group"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                      >
                        <img
                          src={plant.image_path}
                          alt={plant.name}
                          className="w-20 h-20 object-contain pointer-events-none"
                          title={plant.name}
                        />
                        <button
                          onClick={() => handleRemovePlant(plant.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                  
                  {/* Instructions overlay when no plants placed */}
                  {garden.plants.length > 0 && !garden.plants.some(p => {
                    const pos = plantPositions[p.id] || { x: 0, y: 0 }
                    return pos.x !== 0 || pos.y !== 0
                  }) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🌱</div>
                        <p className="text-lg font-semibold">Drag plants from below to place them!</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 rounded-lg bg-slate-900/50 border-2 border-dashed border-slate-700 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-5xl mb-3">🏞️</div>
                    <p>No background selected. Visit the shop to get one!</p>
                    <p className="text-sm mt-2">The Chill Background is free! 🎉</p>
                  </div>
                </div>
              )}
            </div>

            {/* Plants Inventory */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">Your Plants ({garden.plants.length})</h2>
              {garden.plants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {garden.plants.map(plant => {
                    const pos = plantPositions[plant.id] || { x: 0, y: 0 }
                    const isPlaced = pos.x !== 0 || pos.y !== 0
                    
                    return (
                      <div
                        key={plant.id}
                        draggable={garden.background && garden.background.background_id}
                        onDragStart={(e) => handleDragStart(e, plant)}
                        className={`bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-brand-primary/30 transition-all ${
                          garden.background && garden.background.background_id ? 'cursor-move' : 'cursor-not-allowed'
                        } ${isPlaced ? 'opacity-60' : ''}`}
                        title={garden.background && garden.background.background_id ? 'Drag to place in garden' : 'Select a background first'}
                      >
                        <div className="aspect-square bg-slate-800/50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={plant.image_path}
                            alt={plant.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <p className="text-xs font-medium text-center truncate">{plant.name}</p>
                        {isPlaced && (
                          <p className="text-xs text-green-400 text-center mt-1">✓ Placed</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-5xl mb-3">🌱</div>
                  <p>No plants yet. Visit the shop to start growing!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop-plants' && (
          <div className="space-y-6">
            {/* Plants Shop */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">🌿 Plants</h2>
              <p className="text-sm text-slate-400 mb-4">You can buy up to 4 of each plant type</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableItems.plants.map(plant => {
                  const canAfford = userSeeds >= plant.cost_seeds
                  const ownedCount = garden.plants.filter(p => p.item_id === plant.id).length
                  const canBuyMore = ownedCount < 4
                  const isGolden = plant.name.toLowerCase().includes('golden')
                  
                  return (
                    <div
                      key={plant.id}
                      className={`bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                        isGolden ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-slate-900/50' : 'border-slate-700/50 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={plant.image_path}
                            alt={plant.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className={`font-semibold mb-1 ${isGolden ? 'text-yellow-400' : 'text-white'}`}>
                            {plant.name} {isGolden && '✨'}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">{plant.description}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-yellow-400 font-semibold">
                                🌱 {plant.cost_seeds} seeds
                              </span>
                              {ownedCount > 0 && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Owned: {ownedCount}/4
                                </div>
                              )}
                            </div>
                            {!canBuyMore ? (
                              <span className="text-xs bg-slate-700/50 text-slate-400 px-3 py-1 rounded">
                                Max owned
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePurchase(plant)}
                                disabled={!canAfford}
                                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  canAfford
                                    ? 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'Buy' : 'Not enough seeds'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Shop Backgrounds Tab */}
        {activeTab === 'shop-backgrounds' && (
          <div className="space-y-6">
            {/* Backgrounds Shop */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4">🖼️ Backgrounds</h2>
              <p className="text-sm text-slate-400 mb-4">Choose your garden background (you can switch anytime)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableItems.backgrounds.map(background => {
                  const canAfford = userSeeds >= background.cost_seeds || background.cost_seeds === 0
                  const isActive = garden.background?.background_id === background.id
                  const isFree = background.cost_seeds === 0
                  
                  return (
                    <div
                      key={background.id}
                      className={`bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                        isActive ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-slate-700/50 hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                        <img
                          src={background.image_path}
                          alt={background.name}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            ✓ Active
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white mb-1">
                        {background.name} {isFree && '🎁'}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3">{background.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isFree ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isFree ? '🎁 FREE' : `🌱 ${background.cost_seeds} seeds`}
                        </span>
                        {isActive ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded">
                            Currently Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePurchase(background)}
                            disabled={!canAfford}
                            className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                              canAfford
                                ? 'bg-brand-primary hover:bg-brand-primary/80 text-white'
                                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isFree ? 'Select' : canAfford ? 'Buy & Select' : 'Not enough seeds'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

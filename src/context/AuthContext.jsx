import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import notificationService from '../services/notificationService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has a token and fetch user data
    const token = localStorage.getItem('energyAppToken')
    if (token) {
      api.setToken(token)
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      // Get full profile
      const response = await api.getProfile()
      setUser(response.profile)
      
      // Update streak on app load
      try {
        const streakData = await api.updateStreak()
        setUser(prev => ({ 
          ...prev, 
          streak: streakData.streak, 
          bestStreak: streakData.bestStreak 
        }))
      } catch (err) {
        console.error('Failed to update streak:', err)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Clear invalid token
      api.logout()
      localStorage.removeItem('energyAppToken')
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      await api.signup(userData)
      // Fetch full profile after signup
      const response = await api.getProfile()
      setUser(response.profile)
      
      // Request notification permission after signup
      requestNotificationPermission()
      
      return { success: true, user: response.profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      await api.login(email, password)
      // Fetch full profile after login
      const response = await api.getProfile()
      setUser(response.profile)
      
      // Request notification permission after login if not already granted
      requestNotificationPermission()
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const requestNotificationPermission = async () => {
    // Only request if browser supports notifications and permission hasn't been decided
    if (notificationService.shouldRequestPermission()) {
      try {
        const permission = await notificationService.requestPermission()
        if (permission === 'granted') {
          // Register service worker for persistent notifications
          if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered for notifications')
          }
        }
      } catch (error) {
        console.error('Failed to request notification permission:', error)
      }
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const updateUser = async (updates) => {
    // Update local state immediately
    setUser(prevUser => ({ ...prevUser, ...updates }))
    
    // Persist to backend if we have updates to progress or ecobuddy
    try {
      if (updates.seeds !== undefined || updates.level !== undefined || 
          updates.xp !== undefined || updates.points !== undefined ||
          updates.streak !== undefined || updates.totalSavings !== undefined ||
          updates.co2Saved !== undefined || updates.completedTaskIds !== undefined) {
        await api.updateProgress(updates)
      }
      
      if (updates.ecobuddy) {
        await api.updateEcoBuddy(updates.ecobuddy)
      }
    } catch (error) {
      console.error('Failed to persist user updates:', error)
    }
  }

  const refreshUser = async () => {
    // Fetch latest profile from server and update local state
    try {
      const response = await api.getProfile()
      setUser(response.profile)
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

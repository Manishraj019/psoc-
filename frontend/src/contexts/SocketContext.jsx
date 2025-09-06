import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, userType, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
        auth: {
          token: token
        }
      })

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        if (error.message.includes('Authentication error')) {
          toast.error('Authentication failed. Please login again.')
        }
      })

      // Team-specific events
      if (userType === 'team') {
        newSocket.on('submission:result', (data) => {
          console.log('Submission result:', data)
          if (data.status === 'approved') {
            toast.success(`Level ${data.levelNumber} approved! ${data.nextLevelUnlocked ? 'Next level unlocked!' : 'Congratulations!'}`)
          } else if (data.status === 'pending') {
            toast('Submission sent for review', { icon: '⏳' })
          }
        })

        newSocket.on('submission:reviewed', (data) => {
          console.log('Submission reviewed:', data)
          if (data.status === 'approved') {
            toast.success(`Level ${data.levelNumber} approved by admin!`)
          } else if (data.status === 'rejected') {
            toast.error(`Level ${data.levelNumber} rejected: ${data.reason}`)
          }
        })

        newSocket.on('level:unlocked', (data) => {
          console.log('Level unlocked:', data)
          toast.success(`Level ${data.nextLevelNumber} unlocked!`)
        })
      }

      // Admin-specific events
      if (userType === 'admin') {
        newSocket.on('submission:pending', (data) => {
          console.log('New pending submission:', data)
          toast(`New submission from ${data.teamName} for Level ${data.levelNumber}`, {
            icon: '📸',
            duration: 6000
          })
        })

        newSocket.on('submission:reviewed', (data) => {
          console.log('Submission reviewed:', data)
          // Admin can see all review results
        })

        newSocket.on('leaderboard:update', (data) => {
          console.log('Leaderboard updated:', data)
          // Could trigger leaderboard refresh
        })
      }

      // Game events (for all users)
      newSocket.on('game:started', (data) => {
        console.log('Game started:', data)
        toast.success('Game has started!', { duration: 5000 })
      })

      newSocket.on('game:paused', (data) => {
        console.log('Game paused:', data)
        toast('Game has been paused', { icon: '⏸️' })
      })

      newSocket.on('game:reset', (data) => {
        console.log('Game reset:', data)
        toast('Game has been reset', { icon: '🔄' })
      })

      newSocket.on('game:winner', (data) => {
        console.log('Winner announced:', data)
        toast.success(`🎉 ${data.teamName} has won the Photo Marathon!`, {
          duration: 10000
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    } else {
      // Clean up socket if not authenticated
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, token, userType])

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const value = {
    socket,
    isConnected,
    emitEvent,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

'use client'

// To show errors and warnings on the frontend itself.

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Warning {
  id: string
  message: string
  timestamp: Date
}

interface WarningContextType {
  warnings: Warning[]
  addWarning: (message: string) => void
  removeWarning: (id: string) => void
  clearWarnings: () => void
}

const WarningContext = createContext<WarningContextType | undefined>(undefined)

export const useWarnings = () => {
  const context = useContext(WarningContext)
  if (!context) {
    throw new Error('useWarnings must be used within a WarningProvider')
  }
  return context
}

interface WarningProviderProps {
  children: ReactNode
}

export const WarningProvider: React.FC<WarningProviderProps> = ({ children }) => {
  const [warnings, setWarnings] = useState<Warning[]>([])

  const addWarning = useCallback((message: string) => {
    const warning: Warning = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date()
    }
    setWarnings(prev => [...prev, warning])
  }, [])

  const removeWarning = useCallback((id: string) => {
    setWarnings(prev => prev.filter(warning => warning.id !== id))
  }, [])

  const clearWarnings = useCallback(() => {
    setWarnings([])
  }, [])

  return (
    <WarningContext.Provider value={{ warnings, addWarning, removeWarning, clearWarnings }}>
      {children}
    </WarningContext.Provider>
  )
}

export const WarningDisplay: React.FC = () => {
  const { warnings, removeWarning } = useWarnings()

  if (warnings.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {warnings.map(warning => (
        <div
          key={warning.id}
          className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg max-w-md"
        >
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Component Warning
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {warning.message}
              </p>
            </div>
            <button
              onClick={() => removeWarning(warning.id)}
              className="ml-3 text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

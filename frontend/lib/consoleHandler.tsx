'use client'

// To Show errors and warnings on the frontend itself

import { useWarnings } from './warnings'

export const useConsoleWarningHandler = () => {
  const { addWarning } = useWarnings()

  const setupConsoleOverride = () => {
    if (typeof window !== 'undefined') {
      const originalConsoleWarn = console.warn
      const originalConsoleError = console.error

      console.warn = (...args) => {
        const message = args.join(' ')
        
        // Check for React key warnings
        if (message.includes('Keys should be unique') || 
            message.includes('key') && message.includes('unique')) {
          addWarning('Component data may have duplicate entries. This could affect display performance.')
        }
        
        // Check for other React warnings
        if (message.includes('Warning: Each child in a list should have a unique "key" prop')) {
          addWarning('Some list items are missing unique identifiers. This may cause display issues.')
        }
        
        if (message.includes('Warning: Encountered two children with the same key')) {
          addWarning('Duplicate data entries detected. Some items may not display correctly.')
        }
        
        // Call original console.warn for development
        if (process.env.NODE_ENV === 'development') {
          originalConsoleWarn(...args)
        }
      }

      console.error = (...args) => {
        const message = args.join(' ')
        
        // Check for React key errors
        if (message.includes('Keys should be unique') || 
            message.includes('key') && (message.includes('unique') || message.includes('duplicate'))) {
          addWarning('Data processing detected duplicate entries. Some information may not display properly.')
        }
        
        // Call original console.error for development
        if (process.env.NODE_ENV === 'development') {
          originalConsoleError(...args)
        }
      }

      // Return cleanup function
      return () => {
        console.warn = originalConsoleWarn
        console.error = originalConsoleError
      }
    }
  }

  return { setupConsoleOverride }
}

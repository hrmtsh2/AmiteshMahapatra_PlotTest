'use client'

import { Loader2 } from 'lucide-react'

interface LoadingProgressProps {
  progress: number
  message?: string
}

export default function LoadingProgress({ progress, message = 'Processing...' }: LoadingProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {message}
        </span>
        <span className="text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

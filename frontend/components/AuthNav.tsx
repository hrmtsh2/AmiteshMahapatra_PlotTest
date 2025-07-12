'use client'

import { useAuth } from '@/lib/auth'
import { LogIn, UserPlus, User } from 'lucide-react'

export default function AuthNav() {
  const { isAuthenticated, user, login, signup, logout } = useAuth()

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-700">{user.name}</span>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={login}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
      >
        <LogIn className="h-4 w-4" />
        Login
      </button>
      <button
        onClick={signup}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Sign Up
      </button>
    </div>
  )
}

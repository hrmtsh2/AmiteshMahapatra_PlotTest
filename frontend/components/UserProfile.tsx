'use client'

import { useAuth } from '@/lib/auth'
import { LogOut, User, Mail, Shield } from 'lucide-react'

export default function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <User className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <div className="flex items-center text-gray-600 text-sm">
              <Mail className="h-4 w-4 mr-1" />
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <Shield className="h-4 w-4 mr-1" />
        Authenticated via Auth0
      </div>
    </div>
  )
}

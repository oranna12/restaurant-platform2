'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, Bell, LogOut, User, ChevronDown, Coins } from 'lucide-react'
import { Restaurant } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  restaurant: Restaurant
  user: SupabaseUser
}

export default function Header({ restaurant, user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Credits Badge - Mobile */}
        <div className="lg:hidden flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-orange-600">{restaurant.credits}</span>
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden lg:flex items-center gap-4 mr-auto">
          {/* Page Title - Can be dynamic */}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Credits - Desktop */}
          <div className="hidden lg:flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
            <Coins className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{restaurant.credits}</span>
            <span className="text-sm text-orange-500">קרדיטים</span>
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-orange-600" />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900 truncate">{user.email}</p>
                    <p className="text-sm text-gray-500 truncate">{restaurant.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>התנתקות</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

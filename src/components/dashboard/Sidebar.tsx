'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChefHat, 
  LayoutDashboard, 
  ImageIcon, 
  Menu, 
  GraduationCap,
  Settings,
  CreditCard,
  X,
  Images
} from 'lucide-react'
import { Restaurant } from '@/types/database'
import { useState } from 'react'

interface SidebarProps {
  restaurant: Restaurant
}

const menuItems = [
  {
    name: 'דשבורד',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'עריכת תמונות',
    href: '/images',
    icon: ImageIcon,
  },
  {
    name: 'גלריה',
    href: '/gallery',
    icon: Images,
  },
  {
    name: 'תפריט דיגיטלי',
    href: '/menu',
    icon: Menu,
  },
  {
    name: 'הכשרות ומבחנים',
    href: '/training',
    icon: GraduationCap,
  },
]

const bottomMenuItems = [
  {
    name: 'קרדיטים',
    href: '/credits',
    icon: CreditCard,
  },
  {
    name: 'הגדרות',
    href: '/settings',
    icon: Settings,
  },
]

export default function Sidebar({ restaurant }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{restaurant.name}</h1>
          <p className="text-xs text-gray-500">RestaurantOS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-orange-500' : ''}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-orange-500' : ''}`} />
              <span className="font-medium">{item.name}</span>
              {item.name === 'קרדיטים' && (
                <span className="mr-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {restaurant.credits}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-64 lg:flex-col bg-white border-l border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-white flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute left-2 top-2 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Toggle Button - Exposed via window for Header to use */}
      <button
        id="mobile-menu-toggle"
        className="hidden"
        onClick={() => setMobileOpen(true)}
      />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Camera, 
  QrCode, 
  GraduationCap, 
  TrendingUp, 
  Image as ImageIcon,
  FileText,
  Users,
  Coins,
  ArrowUpRight,
  Plus
} from 'lucide-react'

interface DashboardStats {
  totalImages: number
  totalMenus: number
  totalQuizzes: number
  credits: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalMenus: 0,
    totalQuizzes: 0,
    credits: 100
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const modules = [
    {
      title: 'סטודיו לתמונות',
      description: 'עריכת תמונות מנות ברמה מקצועית',
      icon: Camera,
      href: '/dashboard/images',
      color: 'orange',
      stats: `${stats.totalImages} תמונות`,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      title: 'תפריט דיגיטלי',
      description: 'צור תפריט עם QR ובוט AI',
      icon: QrCode,
      href: '/dashboard/menu',
      color: 'blue',
      stats: `${stats.totalMenus} תפריטים`,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'מערכת הכשרות',
      description: 'מבחנים אוטומטיים לעובדים',
      icon: GraduationCap,
      href: '/dashboard/training',
      color: 'green',
      stats: `${stats.totalQuizzes} מבחנים`,
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  const quickActions = [
    { label: 'ערוך תמונה', icon: Plus, href: '/dashboard/images', color: 'bg-orange-500' },
    { label: 'צור תפריט', icon: Plus, href: '/dashboard/menu', color: 'bg-blue-500' },
    { label: 'צור מבחן', icon: Plus, href: '/dashboard/training', color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">שלום! 👋</h1>
        <p className="text-orange-100 mb-6">
          מה נעשה היום?
        </p>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalImages}</p>
          <p className="text-sm text-gray-500 mt-1">תמונות נערכו</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMenus}</p>
          <p className="text-sm text-gray-500 mt-1">תפריטים פעילים</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
          <p className="text-sm text-gray-500 mt-1">עובדים הוכשרו</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.credits}</p>
          <p className="text-sm text-gray-500 mt-1">קרדיטים נותרו</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">הכלים שלך</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link
              key={index}
              href={module.href}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                  <span className="text-xs font-medium text-gray-400">{module.stats}</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-[-4px] group-hover:-translate-y-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started / Tips */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">💡 טיפים להתחלה מהירה</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl mb-2">📸</div>
            <h4 className="font-medium text-gray-900 mb-1">צלם בתאורה טובה</h4>
            <p className="text-sm text-gray-500">תמונות באור טבעי נותנות תוצאות טובות יותר</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-medium text-gray-900 mb-1">עדכן את התפריט</h4>
            <p className="text-sm text-gray-500">תפריט מעודכן מגביר אמון מהלקוחות</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl mb-2">🎓</div>
            <h4 className="font-medium text-gray-900 mb-1">הכשר את הצוות</h4>
            <p className="text-sm text-gray-500">עובדים מיומנים = שירות טוב יותר</p>
          </div>
        </div>
      </div>
    </div>
  )
}

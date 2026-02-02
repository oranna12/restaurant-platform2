'use client'

import { useState } from 'react'
import { 
  QrCode, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download,
  Loader2,
  FileText,
  Image as ImageIcon,
  Bot,
  Languages,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

interface MenuItem {
  id: string
  nameHe: string
  nameEn?: string
  descriptionHe?: string
  descriptionEn?: string
  price: number
  category: string
  imageUrl?: string
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'edit' | 'preview'>('upload')
  const [menuName, setMenuName] = useState('התפריט שלי')
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  const menuUrl = 'https://menu.restaurantos.com/your-restaurant'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock data - in production this would parse the uploaded menu
    setCategories([
      {
        id: '1',
        name: 'מנות פתיחה',
        items: [
          { id: '1', nameHe: 'חומוס הבית', price: 32, category: 'מנות פתיחה', isVegan: true },
          { id: '2', nameHe: 'סלט ירקות', price: 28, category: 'מנות פתיחה', isVegan: true },
        ]
      },
      {
        id: '2',
        name: 'מנות עיקריות',
        items: [
          { id: '3', nameHe: 'שניצל עוף', price: 58, category: 'מנות עיקריות' },
          { id: '4', nameHe: 'סטייק אנטריקוט', price: 120, category: 'מנות עיקריות' },
        ]
      }
    ])
    
    setIsProcessing(false)
    setActiveTab('edit')
  }

  const generateQR = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setQrGenerated(true)
    setIsProcessing(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">תפריט דיגיטלי</h1>
          <p className="text-gray-500 mt-1">צור תפריט עם QR ובוט AI שעונה ללקוחות</p>
        </div>
        {qrGenerated && (
          <button className="btn-primary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            צפה בתפריט
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'upload', label: 'העלאה', icon: Upload },
            { id: 'edit', label: 'עריכה', icon: Edit3 },
            { id: 'preview', label: 'תצוגה מקדימה', icon: Eye },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Menu */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="menu-upload"
                  />
                  <label htmlFor="menu-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="font-medium text-gray-900 mb-1">העלה תפריט</p>
                    <p className="text-sm text-gray-500">PDF, תמונה או מסמך Word</p>
                  </label>
                </div>

                {/* Upload Logo */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg"
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="font-medium text-gray-900 mb-1">העלה לוגו</p>
                    <p className="text-sm text-gray-500">PNG, JPG או SVG</p>
                  </label>
                </div>
              </div>

              {isProcessing && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">מעבד את התפריט...</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 טיפ:</strong> העלה תמונה ברורה של התפריט והמערכת תזהה אוטומטית את המנות והמחירים
                </p>
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              {/* Menu Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם התפריט
                </label>
                <input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="input max-w-md"
                />
              </div>

              {/* Categories */}
              {categories.length > 0 ? (
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.nameHe}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.isVegan && (
                                    <span className="badge-success">טבעוני</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-gray-900">₪{item.price}</span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          הוסף מנה
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    הוסף קטגוריה
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <FileText className="empty-state-icon" />
                  <h3 className="empty-state-title">אין תפריט עדיין</h3>
                  <p className="empty-state-description">
                    העלה תפריט או הוסף מנות ידנית
                  </p>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    הוסף מנה ראשונה
                  </button>
                </div>
              )}

              {categories.length > 0 && (
                <div className="flex justify-end gap-4">
                  <button className="btn-outline flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    תרגם לאנגלית (5 קרדיטים)
                  </button>
                  <button 
                    onClick={generateQR}
                    className="btn-primary flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    צור QR (10 קרדיטים)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {qrGenerated ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 inline-block">
                      <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-32 h-32 text-gray-800" />
                      </div>
                      <p className="font-medium text-gray-900 mb-4">{menuName}</p>
                      <button className="btn-outline flex items-center gap-2 mx-auto">
                        <Download className="w-4 h-4" />
                        הורד QR
                      </button>
                    </div>
                  </div>

                  {/* Link & Features */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קישור לתפריט
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={menuUrl}
                          readOnly
                          className="input flex-1"
                        />
                        <button 
                          onClick={copyLink}
                          className="btn-outline"
                        >
                          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <a 
                          href={menuUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Bot className="w-6 h-6 text-green-600" />
                        <h3 className="font-medium text-green-900">בוט AI פעיל</h3>
                      </div>
                      <p className="text-sm text-green-800">
                        הלקוחות שלך יכולים לשאול שאלות על התפריט ולקבל תשובות מיידיות
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Languages className="w-6 h-6 text-blue-600" />
                        <h3 className="font-medium text-blue-900">תרגום זמין</h3>
                      </div>
                      <p className="text-sm text-blue-800">
                        כפתור תרגום לאנגלית מופיע בתפריט עבור תיירים
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <QrCode className="empty-state-icon" />
                  <h3 className="empty-state-title">טרם נוצר QR</h3>
                  <p className="empty-state-description">
                    ערוך את התפריט ולחץ על "צור QR" כדי ליצור את דף התפריט
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

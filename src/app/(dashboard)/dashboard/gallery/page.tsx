'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Download, 
  Trash2, 
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  Check,
  Filter,
  Grid,
  LayoutGrid,
  Monitor,
  Smartphone,
  Instagram,
  Calendar,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SavedImage {
  id: string
  edited_url: string
  format: string
  created_at: string
}

const FORMAT_LABELS: Record<string, { name: string; icon: React.ElementType }> = {
  website: { name: 'אתר', icon: Monitor },
  wolt: { name: 'וולט', icon: Smartphone },
  instagram: { name: 'אינסטגרם', icon: Instagram },
}

export default function GalleryPage() {
  const [images, setImages] = useState<SavedImage[]>([])
  const [filteredImages, setFilteredImages] = useState<SavedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid')
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadImages()
  }, [])

  useEffect(() => {
    if (selectedFormat === 'all') {
      setFilteredImages(images)
    } else {
      setFilteredImages(images.filter(img => img.format === selectedFormat))
    }
  }, [selectedFormat, images])

  const loadImages = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!restaurant) return

      const { data: dbImages, error } = await supabase
        .from('images')
        .select('id, edited_url, format, created_at')
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading images:', error)
        return
      }

      setImages(dbImages || [])
      setFilteredImages(dbImages || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('האם למחוק את התמונה?')) return

    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImage(null)
    } catch (error) {
      console.error('Delete error:', error)
      alert('שגיאה במחיקת התמונה')
    }
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const downloadAll = async () => {
    for (const image of filteredImages) {
      await downloadImage(image.edited_url, `dish_${image.format}_${image.id}.png`)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between downloads
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">גלריית תמונות</h1>
            <p className="text-gray-500 mt-1">
              {filteredImages.length} תמונות {selectedFormat !== 'all' && `(${FORMAT_LABELS[selectedFormat]?.name})`}
            </p>
          </div>
        </div>
        
        {filteredImages.length > 0 && (
          <button
            onClick={downloadAll}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            הורד הכל
          </button>
        )}
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFormat === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              הכל ({images.length})
            </button>
            {Object.entries(FORMAT_LABELS).map(([key, { name, icon: Icon }]) => {
              const count = images.filter(img => img.format === key).length
              if (count === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFormat(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedFormat === key 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {name} ({count})
                </button>
              )
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('large')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'large' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <LayoutGrid className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : filteredImages.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.edited_url}
                alt="Dish"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Format Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  {FORMAT_LABELS[image.format] && (
                    <>
                      {(() => {
                        const Icon = FORMAT_LABELS[image.format].icon
                        return <Icon className="w-3 h-3" />
                      })()}
                      {FORMAT_LABELS[image.format].name}
                    </>
                  )}
                </span>
              </div>

              {/* Date Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(image.created_at)}
                </span>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadImage(image.edited_url, `dish_${image.format}_${image.id}.png`)
                  }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title="הורד"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteImage(image.id)
                  }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title="מחק"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">אין תמונות עדיין</h3>
          <p className="text-gray-500 mb-6">התחל לערוך תמונות ותראה אותן כאן</p>
          <Link href="/dashboard/images" className="btn-primary">
            לסטודיו התמונות
          </Link>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <img
              src={selectedImage.edited_url}
              alt="Dish"
              className="max-h-[70vh] w-auto mx-auto"
            />
            
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  {FORMAT_LABELS[selectedImage.format] && (
                    <>
                      {(() => {
                        const Icon = FORMAT_LABELS[selectedImage.format].icon
                        return <Icon className="w-4 h-4" />
                      })()}
                      {FORMAT_LABELS[selectedImage.format].name}
                    </>
                  )}
                </span>
                <span className="text-gray-500 text-sm">
                  {formatDate(selectedImage.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadImage(selectedImage.edited_url, `dish_${selectedImage.format}_${selectedImage.id}.png`)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  הורד
                </button>
                <button
                  onClick={() => deleteImage(selectedImage.id)}
                  className="btn-outline text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

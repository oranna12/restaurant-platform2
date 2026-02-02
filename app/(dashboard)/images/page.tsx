'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Loader2, 
  Download, 
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  Monitor,
  Smartphone,
  Instagram,
  Sun,
  Sunset,
  Moon,
  Camera,
  Eye,
  ArrowUp,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// === TYPES ===
interface ProcessedImage {
  id: string
  originalUrl: string
  originalFile?: File
  editedUrl?: string
  editedBase64?: string
  format: string
  background: string
  angle: string
  lighting: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'saved'
  error?: string
}

// === OPTIONS ===
const BACKGROUNDS = [
  { id: 'white-marble', name: 'שיש לבן', color: 'bg-gray-100', description: 'אלגנטי וקלאסי' },
  { id: 'dark-wood', name: 'עץ כהה', color: 'bg-amber-900', description: 'חם ומזמין' },
  { id: 'concrete', name: 'בטון אפור', color: 'bg-gray-400', description: 'מודרני ותעשייתי' },
  { id: 'black-slate', name: 'צפחה שחורה', color: 'bg-gray-800', description: 'דרמטי ויוקרתי' },
  { id: 'natural-linen', name: 'פשתן טבעי', color: 'bg-amber-100', description: 'טבעי וביתי' },
]

const ANGLES = [
  { id: 'top-down', name: 'מלמעלה', icon: ArrowUp, description: '90° - מבט על' },
  { id: '45-degree', name: 'זווית 45°', icon: Camera, description: 'הזווית הפופולרית' },
  { id: 'eye-level', name: 'גובה העין', icon: Eye, description: 'מבט ישיר' },
]

const LIGHTING = [
  { id: 'soft-studio', name: 'סטודיו רך', icon: Sun, description: 'תאורה אחידה ומחמיאה' },
  { id: 'natural', name: 'אור טבעי', icon: Sunset, description: 'כמו ליד חלון' },
  { id: 'dramatic', name: 'דרמטי', icon: Moon, description: 'צללים עמוקים' },
]

const FORMATS = [
  { id: 'website', name: 'אתר', icon: Square, ratio: '1:1', description: 'ריבועי - מושלם לאתר' },
  { id: 'wolt', name: 'וולט', icon: RectangleHorizontal, ratio: '16:9', description: 'רחב - לאפליקציות משלוחים' },
  { id: 'instagram', name: 'אינסטגרם', icon: RectangleVertical, ratio: '4:5', description: 'פורטרט - לפיד' },
]

export default function ImagesPage() {
  // State
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [credits, setCredits] = useState(100)
  
  // Selected options
  const [selectedBackground, setSelectedBackground] = useState('white-marble')
  const [selectedAngle, setSelectedAngle] = useState('45-degree')
  const [selectedLighting, setSelectedLighting] = useState('soft-studio')
  const [selectedFormat, setSelectedFormat] = useState('website')
  
  // Feedback state
  const [feedbackImageId, setFeedbackImageId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadCredits()
  }, [])

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('credits')
      .eq('owner_id', user.id)
      .single()

    if (restaurant) {
      setCredits(restaurant.credits)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ProcessedImage[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      originalUrl: URL.createObjectURL(file),
      originalFile: file,
      format: selectedFormat,
      background: selectedBackground,
      angle: selectedAngle,
      lighting: selectedLighting,
      status: 'pending'
    }))

    setImages(prev => [...newImages, ...prev])
  }, [selectedFormat, selectedBackground, selectedAngle, selectedLighting])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024
  })

  const processImage = async (imageId: string, feedback?: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image || !image.originalFile) return

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'processing' } : img
    ))

    try {
      const formData = new FormData()
      formData.append('image', image.originalFile)
      formData.append('format', image.format)
      formData.append('background', image.background)
      formData.append('angle', image.angle)
      formData.append('lighting', image.lighting)
      if (feedback) {
        formData.append('feedback', feedback)
      }

      const response = await fetch('/api/images/process', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process image')
      }

      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'completed', 
              editedUrl: `data:image/png;base64,${result.editedImageBase64}`,
              editedBase64: result.editedImageBase64
            }
          : img
      ))
      
      setCredits(result.creditsRemaining)
      setFeedbackImageId(null)
      setFeedbackText('')

    } catch (error) {
      console.error('Process error:', error)
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'failed', error: (error as Error).message }
          : img
      ))
    }
  }

  const saveImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image || !image.editedBase64) return

    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editedBase64: image.editedBase64,
          format: image.format
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save image')
      }

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, status: 'saved' } : img
      ))

      // Show success message
      alert('התמונה נשמרה בהצלחה!')

    } catch (error) {
      console.error('Save error:', error)
      alert('שגיאה בשמירת התמונה')
    }
  }

  const handleDislike = (imageId: string) => {
    setFeedbackImageId(imageId)
  }

  const submitFeedback = (imageId: string) => {
    if (feedbackText.trim()) {
      processImage(imageId, feedbackText)
    }
  }

  const processAllPending = async () => {
    setIsProcessing(true)
    const pendingImages = images.filter(img => img.status === 'pending')
    
    for (const image of pendingImages) {
      await processImage(image.id)
    }
    
    setIsProcessing(false)
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
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

  const pendingCount = images.filter(img => img.status === 'pending').length
  const creditsNeeded = pendingCount * 5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">סטודיו לתמונות</h1>
          <p className="text-gray-500 mt-1">העלו תמונות וקבלו אותן ערוכות ברמה מקצועית</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {credits} קרדיטים
        </div>
      </div>

      {/* Design Options */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
        <h2 className="font-bold text-gray-900 text-lg">🎨 הגדרות עיצוב</h2>
        
        {/* Backgrounds */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">רקע</h3>
          <div className="grid grid-cols-5 gap-3">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedBackground === bg.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-12 ${bg.color} rounded-lg mb-2`} />
                <p className="text-sm font-medium text-gray-900">{bg.name}</p>
                <p className="text-xs text-gray-500">{bg.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Angles */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">זווית צילום</h3>
          <div className="grid grid-cols-3 gap-3">
            {ANGLES.map((angle) => (
              <button
                key={angle.id}
                onClick={() => setSelectedAngle(angle.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedAngle === angle.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedAngle === angle.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <angle.icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{angle.name}</p>
                    <p className="text-xs text-gray-500">{angle.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lighting */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">תאורה</h3>
          <div className="grid grid-cols-3 gap-3">
            {LIGHTING.map((light) => (
              <button
                key={light.id}
                onClick={() => setSelectedLighting(light.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedLighting === light.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedLighting === light.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <light.icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{light.name}</p>
                    <p className="text-xs text-gray-500">{light.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">פורמט תמונה</h3>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedFormat === format.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedFormat === format.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <format.icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{format.name}</p>
                    <p className="text-xs text-gray-500">{format.ratio} - {format.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            {isDragActive ? 'שחררו כאן' : 'גררו תמונות לכאן'}
          </p>
          <p className="text-gray-500 text-sm">
            או לחצו לבחירת קבצים (PNG, JPG עד 10MB)
          </p>
        </div>
      </div>

      {/* Images Queue */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">תמונות ({images.length})</h2>
            {pendingCount > 0 && (
              <button
                onClick={processAllPending}
                disabled={isProcessing || credits < creditsNeeded}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מעבד...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ערוך הכל ({creditsNeeded} קרדיטים)
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square">
                  <img
                    src={image.editedUrl || image.originalUrl}
                    alt="Dish"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Overlay */}
                  {image.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                        <p className="font-medium">מעבד את התמונה...</p>
                      </div>
                    </div>
                  )}

                  {image.status === 'failed' && (
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <X className="w-10 h-10 mx-auto mb-2" />
                        <p className="font-medium">שגיאה</p>
                        <p className="text-sm opacity-80">{image.error}</p>
                      </div>
                    </div>
                  )}

                  {image.status === 'saved' && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        נשמר
                      </span>
                    </div>
                  )}

                  {/* Settings badges */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {FORMATS.find(f => f.id === image.format)?.name}
                    </span>
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {BACKGROUNDS.find(b => b.id === image.background)?.name}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <div className="p-4">
                  {image.status === 'pending' && (
                    <button
                      onClick={() => processImage(image.id)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      ערוך (5 קרדיטים)
                    </button>
                  )}

                  {image.status === 'completed' && feedbackImageId !== image.id && (
                    <div className="space-y-3">
                      <p className="text-center text-gray-600 font-medium">מה דעתך על התוצאה?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveImage(image.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          מעולה!
                        </button>
                        <button
                          onClick={() => handleDislike(image.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          לא אהבתי
                        </button>
                      </div>
                    </div>
                  )}

                  {image.status === 'completed' && feedbackImageId === image.id && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">מה לשפר?</p>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="לדוגמה: הרקע כהה מדי, התאורה חזקה..."
                        className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitFeedback(image.id)}
                          disabled={!feedbackText.trim()}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          נסה שוב
                        </button>
                        <button
                          onClick={() => setFeedbackImageId(null)}
                          className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl font-medium transition-colors"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  )}

                  {image.status === 'saved' && (
                    <button
                      onClick={() => downloadImage(image.editedUrl!, `dish_${image.format}_${image.id}.png`)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      הורד תמונה
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">אין תמונות עדיין</h3>
          <p className="text-gray-500">העלו תמונות של מנות כדי להתחיל</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-900 mb-3">💡 טיפים לתוצאות מושלמות</h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>• צלמו את המנה באור טבעי כשאפשר</li>
          <li>• ודאו שהצלחת במרכז התמונה</li>
          <li>• נסו זוויות שונות לאותה מנה</li>
          <li>• רקע שיש לבן מתאים לרוב המנות</li>
        </ul>
      </div>
    </div>
  )
}

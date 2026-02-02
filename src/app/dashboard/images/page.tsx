'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Loader2, 
  Download, 
  RefreshCw, 
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  Monitor,
  Smartphone,
  Instagram,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react'

interface ImageFormat {
  id: string
  name: string
  icon: React.ElementType
  aspectRatio: string
  description: string
}

interface ProcessedImage {
  id: string
  file: File
  originalUrl: string
  editedUrl?: string
  editedBase64?: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'reviewing' | 'saved' | 'failed'
  error?: string
  feedback?: string
}

const IMAGE_FORMATS: ImageFormat[] = [
  {
    id: 'website',
    name: 'אתר',
    icon: Monitor,
    aspectRatio: '1:1',
    description: 'מנה גדולה, מושלם לאתר'
  },
  {
    id: 'wolt',
    name: 'וולט',
    icon: Smartphone,
    aspectRatio: '16:9',
    description: 'פורמט רחב לאפליקציות משלוחים'
  },
  {
    id: 'instagram',
    name: 'אינסטגרם',
    icon: Instagram,
    aspectRatio: '4:5',
    description: 'מותאם לפיד של אינסטגרם'
  }
]

export default function ImagesPage() {
  const [selectedFormat, setSelectedFormat] = useState<string>('website')
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [credits, setCredits] = useState(100)
  const [error, setError] = useState<string | null>(null)
  
  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    imageId: string | null
    feedback: string
  }>({ isOpen: false, imageId: null, feedback: '' })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ProcessedImage[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file: file,
      originalUrl: URL.createObjectURL(file),
      format: selectedFormat,
      status: 'pending'
    }))

    setImages(prev => [...newImages, ...prev])
  }, [selectedFormat])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 10 * 1024 * 1024
  })

  const processImage = async (imageId: string, additionalFeedback?: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, status: 'processing', error: undefined } : img
    ))
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', image.file)
      formData.append('format', image.format)
      if (additionalFeedback) {
        formData.append('feedback', additionalFeedback)
      }

      const response = await fetch('/api/images/process', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process image')
      }

      // After processing, show the image for review (not saved yet)
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              status: 'reviewing',  // Changed from 'completed' to 'reviewing'
              editedUrl: result.editedImageUrl,
              editedBase64: result.editedImageBase64
            } 
          : img
      ))
      
      setCredits(result.creditsRemaining)

    } catch (err: any) {
      console.error('Process error:', err)
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'failed', error: err.message } 
          : img
      ))
      setError(err.message)
    }
  }

  const handleLike = async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    // Save to storage
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: imageId,
          editedBase64: image.editedBase64,
          format: image.format
        })
      })

      if (response.ok) {
        setImages(prev => prev.map(img => 
          img.id === imageId ? { ...img, status: 'saved' } : img
        ))
      }
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  const handleDislike = (imageId: string) => {
    setFeedbackModal({
      isOpen: true,
      imageId: imageId,
      feedback: ''
    })
  }

  const submitFeedbackAndReprocess = async () => {
    if (!feedbackModal.imageId || !feedbackModal.feedback.trim()) return

    const imageId = feedbackModal.imageId
    const feedback = feedbackModal.feedback

    // Close modal
    setFeedbackModal({ isOpen: false, imageId: null, feedback: '' })

    // Reprocess with feedback
    await processImage(imageId, feedback)
  }

  const processAllPending = async () => {
    setIsProcessing(true)
    setError(null)
    const pendingImages = images.filter(img => img.status === 'pending')
    
    for (const image of pendingImages) {
      await processImage(image.id)
    }
    
    setIsProcessing(false)
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const downloadImage = async (image: ProcessedImage) => {
    if (!image.editedBase64 && !image.editedUrl) return

    try {
      let blob: Blob

      if (image.editedBase64) {
        const byteCharacters = atob(image.editedBase64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'image/png' })
      } else if (image.editedUrl) {
        const response = await fetch(image.editedUrl)
        blob = await response.blob()
      } else {
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited_${image.format}_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const pendingCount = images.filter(img => img.status === 'pending').length
  const creditsNeeded = pendingCount * 5

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">סטודיו לתמונות</h1>
          <p className="text-gray-500 mt-1">העלו תמונות של מנות וקבלו אותן ערוכות ברמה מקצועית</p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {credits} קרדיטים
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mr-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Format Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">בחר פורמט</h2>
        <div className="grid grid-cols-3 gap-4">
          {IMAGE_FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 rounded-xl border-2 transition-all text-right ${
                selectedFormat === format.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedFormat === format.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <format.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{format.name}</p>
                  <p className="text-xs text-gray-500">{format.aspectRatio}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{format.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
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
            <h2 className="font-semibold text-gray-900">
              תמונות ({images.length})
            </h2>
            {pendingCount > 0 && (
              <button
                onClick={processAllPending}
                disabled={isProcessing || credits < creditsNeeded}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2"
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-xl overflow-hidden bg-gray-100"
              >
                {/* Image */}
                <div className="aspect-square">
                  <img
                    src={image.editedBase64 
                      ? `data:image/png;base64,${image.editedBase64}` 
                      : image.editedUrl || image.originalUrl
                    }
                    alt="Dish"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Processing Overlay */}
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">מעבד עם AI...</p>
                    </div>
                  </div>
                )}

                {/* Review Actions - Like/Dislike */}
                {image.status === 'reviewing' && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm text-center mb-3">מה דעתך על התוצאה?</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleDislike(image.id)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span>לא אהבתי</span>
                      </button>
                      <button
                        onClick={() => handleLike(image.id)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>מעולה!</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Badge */}
                {image.status === 'saved' && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" />
                      נשמר
                    </div>
                  </div>
                )}

                {/* Failed Overlay */}
                {image.status === 'failed' && (
                  <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                    <div className="text-center text-white p-2">
                      <X className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">{image.error || 'שגיאה'}</p>
                      <button
                        onClick={() => processImage(image.id)}
                        className="mt-2 bg-white text-red-500 px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        נסה שוב
                      </button>
                    </div>
                  </div>
                )}

                {/* Hover Actions for pending/saved */}
                {(image.status === 'pending' || image.status === 'saved') && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {image.status === 'pending' && (
                      <button
                        onClick={() => processImage(image.id)}
                        disabled={credits < 5}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Sparkles className="w-5 h-5 text-orange-500" />
                      </button>
                    )}
                    {image.status === 'saved' && (
                      <button 
                        onClick={() => downloadImage(image)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                      >
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                )}

                {/* Format Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {IMAGE_FORMATS.find(f => f.id === image.format)?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין תמונות עדיין</h3>
          <p className="text-gray-500">
            העלו תמונות של מנות כדי להתחיל
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-900 mb-2">💡 טיפים לתוצאות הכי טובות</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• צלמו את המנה מלמעלה או בזווית של 45°</li>
          <li>• ודאו שהצלחת נמצאת במרכז התמונה</li>
          <li>• השתמשו באור טבעי כשאפשר</li>
          <li>• הימנעו מצללים חזקים על המנה</li>
        </ul>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">מה לא היה טוב?</h3>
            <p className="text-gray-500 text-sm mb-4">
              ספר לנו מה לשפר והמערכת תעבד את התמונה מחדש
            </p>
            
            <textarea
              value={feedbackModal.feedback}
              onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="לדוגמה: הרקע חשוך מדי, המנה נחתכה, התאורה לא טבעית..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none h-32"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setFeedbackModal({ isOpen: false, imageId: null, feedback: '' })}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={submitFeedbackAndReprocess}
                disabled={!feedbackModal.feedback.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                שלח ועבד מחדש
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

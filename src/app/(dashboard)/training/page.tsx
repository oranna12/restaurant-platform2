'use client'

import { useState } from 'react'
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  Plus, 
  Play,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Trash2,
  Send,
  BookOpen
} from 'lucide-react'

interface TrainingMaterial {
  id: string
  title: string
  fileUrl: string
  fileType: string
  createdAt: string
}

interface Quiz {
  id: string
  title: string
  type: 'entry' | 'final'
  questionsCount: number
  passingScore: number
  completedCount: number
  passedCount: number
}

interface QuizResult {
  id: string
  employeeName: string
  quizTitle: string
  score: number
  passed: boolean
  completedAt: string
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'materials' | 'quizzes' | 'results'>('materials')
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'מבחן כניסה',
      type: 'entry',
      questionsCount: 10,
      passingScore: 70,
      completedCount: 5,
      passedCount: 4
    },
    {
      id: '2',
      title: 'מבחן סיום',
      type: 'final',
      questionsCount: 20,
      passingScore: 80,
      completedCount: 3,
      passedCount: 3
    }
  ])
  const [results, setResults] = useState<QuizResult[]>([
    { id: '1', employeeName: 'יוסי כהן', quizTitle: 'מבחן כניסה', score: 85, passed: true, completedAt: '2024-01-15' },
    { id: '2', employeeName: 'דנה לוי', quizTitle: 'מבחן כניסה', score: 60, passed: false, completedAt: '2024-01-14' },
    { id: '3', employeeName: 'יוסי כהן', quizTitle: 'מבחן סיום', score: 92, passed: true, completedAt: '2024-01-16' },
  ])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newMaterial: TrainingMaterial = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      createdAt: new Date().toISOString()
    }
    
    setMaterials(prev => [...prev, newMaterial])
    setIsProcessing(false)
  }

  const generateQuiz = async (type: 'entry' | 'final') => {
    if (materials.length === 0) {
      alert('יש להעלות חומרי הדרכה לפני יצירת מבחן')
      return
    }

    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: type === 'entry' ? 'מבחן כניסה חדש' : 'מבחן סיום חדש',
      type,
      questionsCount: type === 'entry' ? 10 : 20,
      passingScore: type === 'entry' ? 70 : 80,
      completedCount: 0,
      passedCount: 0
    }
    
    setQuizzes(prev => [...prev, newQuiz])
    setIsProcessing(false)
    setActiveTab('quizzes')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">מערכת הכשרות</h1>
          <p className="text-gray-500 mt-1">העלה חומרי הדרכה וצור מבחנים אוטומטיים לעובדים</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              <p className="text-xs text-gray-500">חומרי הדרכה</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              <p className="text-xs text-gray-500">מבחנים</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.filter(r => r.passed).length}</p>
              <p className="text-xs text-gray-500">עברו בהצלחה</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500">סה"כ מבחנים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'materials', label: 'חומרי הדרכה', icon: BookOpen },
            { id: 'quizzes', label: 'מבחנים', icon: FileText },
            { id: 'results', label: 'תוצאות', icon: Users },
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
          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="material-upload"
                />
                <label htmlFor="material-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">העלה חומרי הדרכה</p>
                  <p className="text-sm text-gray-500">PDF, Word או קובץ טקסט</p>
                </label>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                </div>
              )}

              {/* Materials List */}
              {materials.length > 0 ? (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div 
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{material.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(material.createdAt).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין חומרי הדרכה עדיין
                </div>
              )}

              {/* Generate Quiz Buttons */}
              {materials.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => generateQuiz('entry')}
                    disabled={isProcessing}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">צור מבחן כניסה</p>
                        <p className="text-xs text-gray-500">10 שאלות בסיסיות</p>
                      </div>
                    </div>
                    <p className="text-sm text-orange-500 font-medium">15 קרדיטים</p>
                  </button>

                  <button
                    onClick={() => generateQuiz('final')}
                    disabled={isProcessing}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">צור מבחן סיום</p>
                        <p className="text-xs text-gray-500">20 שאלות מתקדמות</p>
                      </div>
                    </div>
                    <p className="text-sm text-orange-500 font-medium">15 קרדיטים</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          quiz.type === 'entry' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {quiz.type === 'entry' ? (
                            <Play className="w-6 h-6 text-blue-600" />
                          ) : (
                            <GraduationCap className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{quiz.title}</p>
                          <p className="text-sm text-gray-500">
                            {quiz.questionsCount} שאלות • ציון עובר: {quiz.passingScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">{quiz.completedCount}</p>
                          <p className="text-xs text-gray-500">השלימו</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">{quiz.passedCount}</p>
                          <p className="text-xs text-gray-500">עברו</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="btn-outline text-sm py-2 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            צפה
                          </button>
                          <button className="btn-primary text-sm py-2 flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            שלח לעובד
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FileText className="empty-state-icon" />
                  <h3 className="empty-state-title">אין מבחנים עדיין</h3>
                  <p className="empty-state-description">
                    העלה חומרי הדרכה וצור מבחן אוטומטי
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {results.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">עובד</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">מבחן</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ציון</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">סטטוס</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">תאריך</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{result.employeeName}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{result.quizTitle}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {result.score}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {result.passed ? (
                              <span className="badge-success flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                עבר
                              </span>
                            ) : (
                              <span className="badge-error flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                נכשל
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(result.completedAt).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Users className="empty-state-icon" />
                  <h3 className="empty-state-title">אין תוצאות עדיין</h3>
                  <p className="empty-state-description">
                    שלח מבחנים לעובדים כדי לראות תוצאות
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

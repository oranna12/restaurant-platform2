import Link from 'next/link'
import { ChefHat, Camera, QrCode, GraduationCap, ArrowLeft, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RestaurantOS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                התחברות
              </Link>
              <Link 
                href="/register" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                התחל בחינם
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            מופעל על ידי בינה מלאכותית
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            כל מה שהמסעדה שלך צריכה
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              במקום אחד
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            עריכת תמונות מקצועית ברמת סטודיו, תפריטים דיגיטליים חכמים עם QR, 
            ומערכת הכשרות אוטומטית לצוות שלך
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors flex items-center justify-center gap-2 group"
            >
              התחל בחינם
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-medium text-lg transition-colors"
            >
              גלה את הכלים
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ 100 קרדיטים חינם &nbsp; ✓ ללא כרטיס אשראי &nbsp; ✓ התחל תוך דקה
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              שלושה כלים עוצמתיים
            </h2>
            <p className="text-gray-600 text-lg">
              כל מה שצריך כדי לקחת את המסעדה לשלב הבא
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Image Editor */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border border-orange-100">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                סטודיו לתמונות
              </h3>
              <p className="text-gray-600 mb-4">
                העלו תמונה רגילה של מנה וקבלו תמונה ברמה של צילום מקצועי - 
                עם רקע שיש, תאורה מושלמת ופוזיציה מדויקת
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  פורמט לאתר / וולט / אינסטגרם
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  שמירה על הצלחת והמנה המקוריים
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  תוצאות תוך שניות
                </li>
              </ul>
            </div>

            {/* Feature 2: Digital Menu */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                תפריט דיגיטלי + QR
              </h3>
              <p className="text-gray-600 mb-4">
                העלו את התפריט וקבלו דף תפריט מעוצב עם קוד QR ייחודי - 
                כולל בוט AI שעונה ללקוחות על שאלות מהתפריט
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  תרגום אוטומטי לאנגלית
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  בוט AI שמכיר את התפריט
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  עדכון תפריט בזמן אמת
                </li>
              </ul>
            </div>

            {/* Feature 3: Training */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                מערכת הכשרות
              </h3>
              <p className="text-gray-600 mb-4">
                העלו חומרי הדרכה והמערכת תייצר אוטומטית מבחן כניסה 
                ומבחן סיום לעובדים חדשים
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  מבחן כניסה + מבחן סיום
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  מעקב ציונים והתקדמות
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  שאלות מותאמות אוטומטית
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              תמחור פשוט וגמיש
            </h2>
            <p className="text-gray-600 text-lg">
              שלמו רק על מה שאתם משתמשים
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 text-center border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">מערכת קרדיטים</h3>
              <p className="text-gray-600">קנו קרדיטים והשתמשו בהם לכל הכלים</p>
            </div>
            <div className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">עריכת תמונה</span>
                  <span className="font-bold text-gray-900">5 קרדיטים</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">יצירת תפריט QR</span>
                  <span className="font-bold text-gray-900">10 קרדיטים</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">יצירת מבחן</span>
                  <span className="font-bold text-gray-900">15 קרדיטים</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">תרגום תפריט</span>
                  <span className="font-bold text-gray-900">5 קרדיטים</span>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors"
                >
                  התחל עם 100 קרדיטים חינם
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">RestaurantOS</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 RestaurantOS. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

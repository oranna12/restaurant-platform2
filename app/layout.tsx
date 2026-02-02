import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'RestaurantOS - פלטפורמת הניהול למסעדות',
  description: 'עריכת תמונות מקצועית, תפריטים דיגיטליים עם QR, ומערכת הכשרות חכמה',
  keywords: ['מסעדות', 'תפריט דיגיטלי', 'QR', 'עריכת תמונות', 'הכשרות'],
  authors: [{ name: 'RestaurantOS' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={`${heebo.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

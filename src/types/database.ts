// Database Types - will be auto-generated later with Supabase CLI
// For now, manual types

export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ImageFormat = 'website' | 'wolt' | 'instagram' | 'square'
export type QuizType = 'entry' | 'final'
export type TransactionType = 
  | 'initial' 
  | 'purchase' 
  | 'image_edit' 
  | 'menu_create' 
  | 'quiz_create' 
  | 'translation' 
  | 'chatbot' 
  | 'refund'

export interface Restaurant {
  id: string
  name: string
  logo_url: string | null
  owner_id: string
  credits: number
  slug: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Image {
  id: string
  restaurant_id: string
  original_url: string
  edited_url: string | null
  format: ImageFormat
  status: ImageStatus
  error_message: string | null
  credits_used: number
  created_at: string
  processed_at: string | null
}

export interface Menu {
  id: string
  restaurant_id: string
  name: string
  content_json: any
  qr_code_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  menu_id: string
  category: string | null
  name_he: string
  name_en: string | null
  description_he: string | null
  description_en: string | null
  price: number | null
  image_url: string | null
  is_available: boolean
  allergens: string[] | null
  is_vegan: boolean
  is_vegetarian: boolean
  is_gluten_free: boolean
  sort_order: number
  created_at: string
}

export interface TrainingMaterial {
  id: string
  restaurant_id: string
  title: string
  content: string | null
  file_url: string | null
  file_type: string | null
  created_at: string
}

export interface Quiz {
  id: string
  restaurant_id: string
  type: QuizType
  title: string | null
  questions_json: QuizQuestion[]
  passing_score: number
  time_limit_minutes: number
  is_active: boolean
  created_at: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number // index of correct option
  explanation?: string
}

export interface QuizResult {
  id: string
  quiz_id: string
  restaurant_id: string
  employee_name: string
  employee_email: string | null
  score: number
  passed: boolean
  answers_json: any
  started_at: string
  completed_at: string | null
}

export interface CreditTransaction {
  id: string
  restaurant_id: string
  amount: number
  transaction_type: TransactionType
  description: string | null
  balance_after: number
  created_at: string
}

// Credit costs
export const CREDIT_COSTS = {
  IMAGE_EDIT: 5,
  MENU_CREATE: 10,
  QUIZ_CREATE: 15,
  TRANSLATION: 5,
  CHATBOT_QUESTION: 0.1,
} as const

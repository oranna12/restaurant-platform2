-- =============================================
-- RestaurantOS - Initial Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. RESTAURANTS TABLE
-- =============================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 100, -- קרדיטים התחלתיים
    slug VARCHAR(100) UNIQUE, -- לכתובת URL ייחודית לתפריט
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- =============================================
-- 2. IMAGES TABLE
-- =============================================
CREATE TYPE image_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE image_format AS ENUM ('website', 'wolt', 'instagram', 'square');

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    edited_url TEXT,
    format image_format DEFAULT 'website',
    status image_status DEFAULT 'pending',
    error_message TEXT,
    credits_used INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_images_restaurant ON images(restaurant_id);
CREATE INDEX idx_images_status ON images(status);

-- =============================================
-- 3. MENUS TABLE
-- =============================================
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'תפריט ראשי',
    content_json JSONB, -- מבנה התפריט
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);

-- =============================================
-- 4. MENU ITEMS TABLE
-- =============================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    category VARCHAR(100),
    name_he VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description_he TEXT,
    description_en TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    allergens TEXT[], -- מערך אלרגנים
    is_vegan BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- =============================================
-- 5. TRAINING MATERIALS TABLE
-- =============================================
CREATE TABLE training_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_url TEXT,
    file_type VARCHAR(50), -- pdf, doc, txt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_materials_restaurant ON training_materials(restaurant_id);

-- =============================================
-- 6. QUIZZES TABLE
-- =============================================
CREATE TYPE quiz_type AS ENUM ('entry', 'final');

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    type quiz_type NOT NULL,
    title VARCHAR(255),
    questions_json JSONB NOT NULL, -- שאלות ותשובות
    passing_score INTEGER DEFAULT 70, -- ציון עובר באחוזים
    time_limit_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_restaurant ON quizzes(restaurant_id);

-- =============================================
-- 7. QUIZ RESULTS TABLE
-- =============================================
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255),
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers_json JSONB, -- תשובות העובד
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_restaurant ON quiz_results(restaurant_id);

-- =============================================
-- 8. CREDIT TRANSACTIONS TABLE
-- =============================================
CREATE TYPE transaction_type AS ENUM (
    'initial',      -- קרדיטים התחלתיים
    'purchase',     -- רכישה
    'image_edit',   -- עריכת תמונה
    'menu_create',  -- יצירת תפריט
    'quiz_create',  -- יצירת מבחן
    'translation',  -- תרגום
    'chatbot',      -- שאלה לצ'אטבוט
    'refund'        -- החזר
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- חיובי = הוספה, שלילי = שימוש
    transaction_type transaction_type NOT NULL,
    description TEXT,
    balance_after INTEGER, -- יתרה אחרי הפעולה
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_restaurant ON credit_transactions(restaurant_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Restaurants: owners can only see their own
CREATE POLICY "Users can view own restaurants" ON restaurants
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own restaurants" ON restaurants
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own restaurants" ON restaurants
    FOR UPDATE USING (auth.uid() = owner_id);

-- Images: restaurant owners only
CREATE POLICY "Users can manage own images" ON images
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

-- Menus: restaurant owners can manage, public can view active
CREATE POLICY "Users can manage own menus" ON menus
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can view active menus" ON menus
    FOR SELECT USING (is_active = true);

-- Menu Items: same as menus
CREATE POLICY "Users can manage own menu items" ON menu_items
    FOR ALL USING (
        menu_id IN (
            SELECT m.id FROM menus m
            JOIN restaurants r ON m.restaurant_id = r.id
            WHERE r.owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can view menu items" ON menu_items
    FOR SELECT USING (
        menu_id IN (SELECT id FROM menus WHERE is_active = true)
    );

-- Training Materials: restaurant owners only
CREATE POLICY "Users can manage own training materials" ON training_materials
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

-- Quizzes: restaurant owners only
CREATE POLICY "Users can manage own quizzes" ON quizzes
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

-- Quiz Results: restaurant owners can view all, employees can insert
CREATE POLICY "Users can view own quiz results" ON quiz_results
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can submit quiz results" ON quiz_results
    FOR INSERT WITH CHECK (true);

-- Credit Transactions: restaurant owners only
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
    );

-- =============================================
-- 10. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
    p_restaurant_id UUID,
    p_amount INTEGER,
    p_type transaction_type,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_credits INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO v_current_credits
    FROM restaurants
    WHERE id = p_restaurant_id
    FOR UPDATE;
    
    -- Check if enough credits
    IF v_current_credits < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct credits
    v_new_balance := v_current_credits - p_amount;
    
    UPDATE restaurants
    SET credits = v_new_balance
    WHERE id = p_restaurant_id;
    
    -- Log transaction
    INSERT INTO credit_transactions (
        restaurant_id, amount, transaction_type, description, balance_after
    ) VALUES (
        p_restaurant_id, -p_amount, p_type, p_description, v_new_balance
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_restaurant_id UUID,
    p_amount INTEGER,
    p_type transaction_type,
    p_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    UPDATE restaurants
    SET credits = credits + p_amount
    WHERE id = p_restaurant_id
    RETURNING credits INTO v_new_balance;
    
    -- Log transaction
    INSERT INTO credit_transactions (
        restaurant_id, amount, transaction_type, description, balance_after
    ) VALUES (
        p_restaurant_id, p_amount, p_type, p_description, v_new_balance
    );
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create restaurant for new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
BEGIN
    -- Create a default restaurant for the new user
    INSERT INTO restaurants (owner_id, name, credits)
    VALUES (NEW.id, 'המסעדה שלי', 100)
    RETURNING id INTO v_restaurant_id;
    
    -- Log initial credits
    INSERT INTO credit_transactions (
        restaurant_id, amount, transaction_type, description, balance_after
    ) VALUES (
        v_restaurant_id, 100, 'initial', 'קרדיטים התחלתיים', 100
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create restaurant on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 11. STORAGE BUCKETS (run in Supabase dashboard)
-- =============================================
-- Note: Create these buckets manually in Supabase dashboard:
-- 1. restaurant-logos (public)
-- 2. menu-images (public)
-- 3. original-images (private)
-- 4. edited-images (public)
-- 5. training-files (private)
-- 6. qr-codes (public)

-- 🚀 Supabase Performance Optimization SQL
-- Copy and run this in your Supabase SQL Editor to make the website much faster!

-- 1. Create indexes for the patients table
-- This speeds up sorting by newest patients and filtering by status
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients (status);

-- 2. Create index for the funds table
-- This speeds up the join between patients and funds
CREATE INDEX IF NOT EXISTS idx_funds_patient_id ON funds (patient_id);

-- 3. Create index for the admins table
-- This makes login faster by speeding up email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

-- 3.1 Add Email Verification Columns to admins table
-- Run these if you haven't added these columns yet
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- 3.2 Add Academic, Payment Holder Info & RBAC
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dept TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS batch TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS session TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS student_id_url TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE funds ADD COLUMN IF NOT EXISTS payment_holder_info TEXT;

-- 4. Create index for documents (if implemented)
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents (patient_id);

-- 5. VACUUM and ANALYZE to update statistics (Postgres optimization)
ANALYZE patients;
ANALYZE funds;
ANALYZE admins;

-- 6. Create Donations table for daily fund tracking
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookup by fund
CREATE INDEX IF NOT EXISTS idx_donations_fund_id ON donations (fund_id);

-- 7. Create Documents table for medical reports/prescriptions
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT, -- 'report', 'prescription', etc.
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster document lookup
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents (patient_id);

-- ✅ Done! Your database is now optimized for speed, funds, and document management.

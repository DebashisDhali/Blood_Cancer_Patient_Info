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

-- 4. Create index for documents (if implemented)
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents (patient_id);

-- 5. VACUUM and ANALYZE to update statistics (Postgres optimization)
ANALYZE patients;
ANALYZE funds;
ANALYZE admins;

-- ✅ Done! Your database is now optimized for speed.

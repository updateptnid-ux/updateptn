-- ============================================
-- AFFILIATE SYSTEM MIGRATION
-- Created: 2026-01-06
-- Description: Complete affiliate tracking system
-- ============================================

-- 1. Tabel Affiliates (Mitra Afiliasi)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL, -- Format: PTN-USER123
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  
  -- Informasi Mitra
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT, -- Sekolah/Organisasi
  
  -- Komisi & Pembayaran
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- Default 10%
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawals DECIMAL(12,2) DEFAULT 0.00,
  pending_balance DECIMAL(12,2) DEFAULT 0.00,
  
  -- Bank Info untuk withdrawal
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  
  -- Stats
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  
  -- Timestamps
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 2. Tabel Referrals (Tracking siapa yang direferensikan)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL,
  
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email TEXT,
  
  -- Conversion tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  first_purchase_id UUID, -- Link ke payments table
  conversion_date TIMESTAMPTZ,
  
  -- Attribution
  source TEXT, -- instagram, tiktok, whatsapp, website, etc
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- IP & Device tracking (untuk fraud prevention)
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days', -- Cookie 90 hari
  
  UNIQUE(affiliate_code, referred_email)
);

-- 3. Tabel Commissions (Riwayat Komisi)
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  payment_id UUID, -- Link ke payments table
  
  -- Transaction details
  order_id TEXT NOT NULL,
  customer_email TEXT,
  
  -- Commission calculation
  transaction_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Prevent duplicate commissions
  UNIQUE(payment_id)
);

-- 4. Tabel Withdrawals (Penarikan Dana)
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  
  -- Bank details (snapshot at withdrawal time)
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  
  -- Processing
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Proof of payment
  proof_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);

CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_code ON public.referrals(affiliate_code);

CREATE INDEX idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_payment_id ON public.commissions(payment_id);

CREATE INDEX idx_withdrawals_affiliate_id ON public.withdrawals(affiliate_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Affiliates Policies
CREATE POLICY "Users can view their own affiliate account"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate account"
  ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate account"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);

-- Referrals Policies
CREATE POLICY "Affiliates can view their own referrals"
  ON public.referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = referrals.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

-- Commissions Policies
CREATE POLICY "Affiliates can view their own commissions"
  ON public.commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = commissions.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

-- Withdrawals Policies
CREATE POLICY "Affiliates can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = withdrawals.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can create withdrawal requests"
  ON public.withdrawals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.affiliates
      WHERE affiliates.id = affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Format: PTN-USER123 (random 3 digits + 3 letters)
    new_code := 'PTN-' || 
                UPPER(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.affiliates WHERE affiliate_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate affiliate code on insert
CREATE OR REPLACE FUNCTION set_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_affiliate_code
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION set_affiliate_code();

-- Trigger: Update affiliate stats on referral conversion
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    UPDATE public.affiliates
    SET 
      total_conversions = total_conversions + 1,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_stats
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Trigger: Update affiliate earnings on commission approval
CREATE OR REPLACE FUNCTION update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.affiliates
    SET 
      total_earnings = total_earnings + NEW.commission_amount,
      pending_balance = pending_balance + NEW.commission_amount,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_earnings
  AFTER UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_earnings();

-- Trigger: Update affiliate balance on withdrawal completion
CREATE OR REPLACE FUNCTION update_affiliate_withdrawals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.affiliates
    SET 
      total_withdrawals = total_withdrawals + NEW.amount,
      pending_balance = pending_balance - NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_withdrawals
  AFTER UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_withdrawals();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample affiliate (comment out in production)
-- INSERT INTO public.affiliates (user_id, full_name, email, phone, institution, status, affiliate_code)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with real user_id
--   'John Doe',
--   'affiliate@example.com',
--   '081234567890',
--   'SMA Negeri 1 Jakarta',
--   'active',
--   'PTN-ABC123'
-- );

COMMENT ON TABLE public.affiliates IS 'Mitra afiliasi Update PTN';
COMMENT ON TABLE public.referrals IS 'Tracking referral dan konversi';
COMMENT ON TABLE public.commissions IS 'Riwayat komisi afiliasi';
COMMENT ON TABLE public.withdrawals IS 'Penarikan dana afiliasi';

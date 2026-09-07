-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bagian 1: Pengalaman Pengguna (UX & Akurasi)
  ease_of_navigation INTEGER CHECK (ease_of_navigation >= 1 AND ease_of_navigation <= 5),
  prediction_accuracy INTEGER CHECK (prediction_accuracy >= 1 AND prediction_accuracy <= 5),
  accuracy_reason TEXT,
  has_technical_issue BOOLEAN DEFAULT false,
  technical_issue_detail TEXT,
  
  -- Bagian 2: Nilai Produk
  most_attractive_feature TEXT,
  next_action TEXT, -- 'improve_scores', 'search_majors', 'practice_tests', 'no_action'
  
  -- Bagian 3: Niat Membeli
  premium_interest INTEGER CHECK (premium_interest >= 1 AND premium_interest <= 5),
  expected_price TEXT, -- '0-50k', '50k-100k', '100k-200k', '200k-500k', '500k+'
  
  -- Bagian 4: Penutup
  willing_to_be_contacted BOOLEAN DEFAULT false,
  contact_info TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can submit feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Add comment
COMMENT ON TABLE public.feedback IS 'Customer feedback survey responses for product validation';

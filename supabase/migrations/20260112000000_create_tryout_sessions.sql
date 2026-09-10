-- Create tryout_sessions table for pause/resume functionality
-- Allows users to pause and resume try-outs mid-session

CREATE TABLE IF NOT EXISTS tryout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_id UUID NOT NULL,
  
  -- Session state
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'expired')),
  
  -- Progress tracking
  current_question_index INTEGER DEFAULT 0,
  active_subtest_index INTEGER DEFAULT 0,
  
  -- User answers and interactions
  answers JSONB DEFAULT '{}'::jsonb, -- { "question_id": "A" }
  flagged_questions JSONB DEFAULT '{}'::jsonb, -- { "question_id": true }
  question_time_spent JSONB DEFAULT '{}'::jsonb, -- { "question_id": 120 }
  
  -- Timer state
  time_remaining_seconds INTEGER NOT NULL, -- Remaining time when paused
  total_duration_seconds INTEGER NOT NULL, -- Original duration
  
  -- Target selection (for SNBT)
  selected_targets JSONB DEFAULT '[]'::jsonb, -- [{ univ, prodi, pg }]
  
  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Auto-expire after 7 days
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active session per user per tryout
  UNIQUE(user_id, tryout_id, status)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS tryout_sessions_user_id_idx ON tryout_sessions(user_id);
CREATE INDEX IF NOT EXISTS tryout_sessions_tryout_id_idx ON tryout_sessions(tryout_id);
CREATE INDEX IF NOT EXISTS tryout_sessions_status_idx ON tryout_sessions(status);
CREATE INDEX IF NOT EXISTS tryout_sessions_expires_at_idx ON tryout_sessions(expires_at);

-- Enable RLS
ALTER TABLE tryout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
  ON tryout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON tryout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON tryout_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON tryout_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tryout_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tryout_sessions_updated_at
  BEFORE UPDATE ON tryout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_tryout_sessions_updated_at();

-- Auto-expire old sessions (run daily via pg_cron or manual cleanup)
-- Sessions expire after 7 days of inactivity
CREATE OR REPLACE FUNCTION expire_old_tryout_sessions()
RETURNS void AS $$
BEGIN
  UPDATE tryout_sessions
  SET status = 'expired'
  WHERE status IN ('in_progress', 'paused')
    AND (expires_at < NOW() OR last_activity_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON tryout_sessions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment
COMMENT ON TABLE tryout_sessions IS 'Stores in-progress try-out sessions for pause/resume functionality';

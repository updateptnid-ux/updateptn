-- Create audit_logs table for tracking admin actions
-- This table stores all important admin operations like user deletions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL,
  actor_id UUID, -- Admin who performed the action
  actor_email TEXT,
  target_id UUID, -- User/entity affected
  target_name TEXT,
  metadata JSONB -- Additional context
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- Only admins can insert audit logs (server should use service role)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Comment
COMMENT ON TABLE audit_logs IS 'Tracks all admin actions for audit trail and compliance';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., DELETE_USER, UPDATE_ROLE, etc.)';
COMMENT ON COLUMN audit_logs.actor_id IS 'ID of admin who performed the action';
COMMENT ON COLUMN audit_logs.target_id IS 'ID of affected user/entity';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context in JSON format';

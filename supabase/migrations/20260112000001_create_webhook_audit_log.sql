-- Create webhook audit log for Midtrans payment security
-- Tracks all webhook attempts for forensics and debugging

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Webhook metadata
  source TEXT DEFAULT 'midtrans', -- Future: support other gateways
  order_id TEXT,
  transaction_status TEXT,
  
  -- Security validation
  signature_valid BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Request details
  raw_payload JSONB,
  headers JSONB,
  
  -- Processing result
  processing_status TEXT CHECK (processing_status IN ('success', 'failed', 'rejected', 'duplicate')),
  error_message TEXT,
  
  -- Timing
  processed_in_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying and monitoring
CREATE INDEX IF NOT EXISTS webhook_logs_order_id_idx ON webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS webhook_logs_signature_valid_idx ON webhook_logs(signature_valid);
CREATE INDEX IF NOT EXISTS webhook_logs_processing_status_idx ON webhook_logs(processing_status);
CREATE INDEX IF NOT EXISTS webhook_logs_created_at_idx ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_logs_ip_address_idx ON webhook_logs(ip_address);

-- Enable RLS (admin-only access)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- System can insert logs (service_role)
-- No UPDATE/DELETE policies (immutable audit log)

GRANT SELECT ON webhook_logs TO authenticated;
GRANT INSERT ON webhook_logs TO service_role;

COMMENT ON TABLE webhook_logs IS 'Audit log for payment webhook notifications';

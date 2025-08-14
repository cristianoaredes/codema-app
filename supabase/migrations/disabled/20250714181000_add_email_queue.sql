-- Create email queue table for email notifications
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  email_type VARCHAR(100) NOT NULL,
  
  -- Scheduling and delivery
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX idx_email_queue_type ON email_queue(email_type);
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at);

-- RLS Policies - only admins can manage email queue
CREATE POLICY "Admins can manage email queue"
ON email_queue FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin')
  )
);

CREATE POLICY "System can insert emails"
ON email_queue FOR INSERT
WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to process email queue (placeholder for email service integration)
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  email_record RECORD;
BEGIN
  -- Get pending emails scheduled for now or earlier
  FOR email_record IN
    SELECT * FROM email_queue
    WHERE status = 'pending'
    AND scheduled_for <= now()
    AND attempts < max_attempts
    ORDER BY scheduled_for ASC
    LIMIT 10
  LOOP
    -- Update status to sending
    UPDATE email_queue 
    SET status = 'sending', 
        attempts = attempts + 1,
        updated_at = now()
    WHERE id = email_record.id;
    
    -- Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    -- For now, we'll just mark as sent after a delay
    
    -- Simulate email sending success
    UPDATE email_queue 
    SET status = 'sent', 
        sent_at = now(),
        updated_at = now()
    WHERE id = email_record.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retry failed emails
CREATE OR REPLACE FUNCTION retry_failed_emails()
RETURNS INTEGER AS $$
DECLARE
  retried_count INTEGER := 0;
BEGIN
  -- Reset failed emails that haven't reached max attempts
  UPDATE email_queue 
  SET status = 'pending',
      failed_at = NULL,
      error_message = NULL,
      updated_at = now()
  WHERE status = 'failed'
  AND attempts < max_attempts
  AND failed_at < now() - INTERVAL '1 hour'; -- Wait 1 hour before retry
  
  GET DIAGNOSTICS retried_count = ROW_COUNT;
  
  RETURN retried_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old emails
CREATE OR REPLACE FUNCTION cleanup_old_emails()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete emails older than 30 days
  DELETE FROM email_queue 
  WHERE created_at < now() - INTERVAL '30 days'
  AND status IN ('sent', 'failed', 'cancelled');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add notification_preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT jsonb_build_object(
  'mandato_alerts', true,
  'reuniao_notifications', true,
  'email_convocacoes', true,
  'whatsapp_notifications', false,
  'system_updates', true,
  'weekly_digest', false
);

-- Add comment to the column
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences for various system alerts';

-- Create index for better query performance on notification preferences
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences 
ON public.profiles USING GIN (notification_preferences);

-- Grant permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (notification_preferences) ON public.profiles TO authenticated;
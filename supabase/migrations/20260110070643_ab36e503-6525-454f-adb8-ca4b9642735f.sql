-- Add skills column to team_members table for tags/skills display
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Create admin_settings table for storing admin configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read settings (for validation purposes)
CREATE POLICY "Authenticated users can read settings" ON public.admin_settings
FOR SELECT TO authenticated USING (true);

-- Create activity_logs table for admin logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view logs" ON public.admin_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert logs
CREATE POLICY "Admins can insert logs" ON public.admin_logs
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('signup_code', 'TEAM2026'),
  ('session_timeout', '180'),
  ('max_login_attempts', '6'),
  ('min_password_length', '8'),
  ('require_uppercase', 'true'),
  ('require_number', 'true')
ON CONFLICT (setting_key) DO NOTHING;
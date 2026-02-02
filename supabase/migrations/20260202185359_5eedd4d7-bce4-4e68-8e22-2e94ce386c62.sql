-- Create table to track which tools users have access to
CREATE TABLE public.user_tool_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS
ALTER TABLE public.user_tool_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own access
CREATE POLICY "Users can view their own tool access"
ON public.user_tool_access
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all tool access
CREATE POLICY "Admins can manage tool access"
ON public.user_tool_access
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create a setting to track if tool locking is enabled globally
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('tools_locked', 'true')
ON CONFLICT (setting_key) DO NOTHING;
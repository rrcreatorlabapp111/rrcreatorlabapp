-- Create team_members table for managing team/employees
CREATE TABLE public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'member',
    position text,
    avatar_url text,
    status text NOT NULL DEFAULT 'pending',
    permissions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(email, invited_by)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all team members
CREATE POLICY "Admins can manage all team members"
ON public.team_members
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Policy: Users can view team members they invited
CREATE POLICY "Users can view team members they invited"
ON public.team_members
FOR SELECT
USING (invited_by = auth.uid());

-- Policy: Users can view themselves as team members
CREATE POLICY "Users can view themselves as team members"
ON public.team_members
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can update their own team member profile
CREATE POLICY "Users can update their own team member profile"
ON public.team_members
FOR UPDATE
USING (user_id = auth.uid());

-- Policy: Moderators can view all team members
CREATE POLICY "Moderators can view all team members"
ON public.team_members
FOR SELECT
USING (has_role(auth.uid(), 'moderator'));

-- Create updated_at trigger for team_members
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add RLS policy to allow authenticated users to insert their own team_member entry
CREATE POLICY "Users can insert themselves as team members"
ON public.team_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);
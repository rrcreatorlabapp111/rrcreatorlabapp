-- Add policy to allow all authenticated users to view team members
CREATE POLICY "All authenticated users can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (status = 'active');
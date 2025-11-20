-- Update RLS policy to ensure only admins can update rental request status
-- Drop the existing policy that allows clinic users to update their own requests
DROP POLICY IF EXISTS "clinic update own rental requests" ON public.rental_requests;

-- Create new policy that only allows admins to update rental requests
CREATE POLICY "Only admins can update rental requests"
ON public.rental_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
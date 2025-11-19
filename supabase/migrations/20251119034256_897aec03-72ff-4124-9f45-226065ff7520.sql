-- Create rental_requests table
CREATE TABLE public.rental_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village_name TEXT NOT NULL,
  rental_duration TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'returned')),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all rental requests
CREATE POLICY "admin can read all rental requests"
ON public.rental_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Clinic users can view only their own rental requests
CREATE POLICY "clinic read own rental requests"
ON public.rental_requests
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Admins can update all rental requests
CREATE POLICY "admin can update all rental requests"
ON public.rental_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Clinic users can update only their own rental requests
CREATE POLICY "clinic update own rental requests"
ON public.rental_requests
FOR UPDATE
USING (user_id = auth.uid());

-- Policy: Authenticated users can insert rental requests
CREATE POLICY "authenticated users can insert rental requests"
ON public.rental_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can delete rental requests
CREATE POLICY "admin can delete rental requests"
ON public.rental_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rental_requests_updated_at
BEFORE UPDATE ON public.rental_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
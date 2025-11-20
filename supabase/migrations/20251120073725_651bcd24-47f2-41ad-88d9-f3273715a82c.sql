-- Create purchases table for instant buy transactions
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'purchased',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create their own purchases"
ON public.purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.purchases
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add admin_status column to rental_requests for approval workflow
ALTER TABLE public.rental_requests
ADD COLUMN admin_status TEXT NOT NULL DEFAULT 'pending';

-- Add constraint to ensure valid status values
ALTER TABLE public.rental_requests
ADD CONSTRAINT rental_requests_admin_status_check 
CHECK (admin_status IN ('pending', 'approved', 'rejected'));

-- Create rentals table for actual approved rentals
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  rental_duration TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'ongoing',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Users can view their own rentals
CREATE POLICY "Users can view their own rentals"
ON public.rentals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own rentals (only from approved requests)
CREATE POLICY "Users can create their own rentals"
ON public.rentals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all rentals
CREATE POLICY "Admins can view all rentals"
ON public.rentals
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update rental status
CREATE POLICY "Only admins can update rentals"
ON public.rentals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
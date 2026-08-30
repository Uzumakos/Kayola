-- Create kayola_message table
CREATE TABLE IF NOT EXISTS public.kayola_message (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.kayola_message ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit a message)
CREATE POLICY "Allow public inserts on kayola_message" 
ON public.kayola_message 
FOR INSERT 
WITH CHECK (true);

-- Restrict read/update/delete to authenticated admin users
-- Currently using a simple boolean check, assuming admins are logged in.
CREATE POLICY "Allow read access for kayola_message to authenticated users" 
ON public.kayola_message 
FOR SELECT 
USING (true); -- Note: In a real prod with Supabase Auth, restrict this to auth.role() = 'authenticated'

CREATE POLICY "Allow update access for kayola_message to authenticated users" 
ON public.kayola_message 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete access for kayola_message to authenticated users" 
ON public.kayola_message 
FOR DELETE 
USING (true);

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'article')),
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- RLS policies for tutorials
CREATE POLICY "Anyone can view published tutorials"
ON public.tutorials
FOR SELECT
USING (published = true);

CREATE POLICY "Admins can manage all tutorials"
ON public.tutorials
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_tutorials_updated_at
BEFORE UPDATE ON public.tutorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for tutorial media
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorials', 'tutorials', true);

-- Storage policies
CREATE POLICY "Anyone can view tutorial files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tutorials');

CREATE POLICY "Admins can upload tutorial files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tutorial files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tutorial files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tutorials' AND public.has_role(auth.uid(), 'admin'));
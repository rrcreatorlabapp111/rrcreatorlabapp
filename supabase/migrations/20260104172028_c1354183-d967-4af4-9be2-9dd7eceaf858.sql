-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create saved_content table for scripts, tags, ideas, etc.
CREATE TABLE public.saved_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('script', 'tags', 'ideas', 'plan')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_content
ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;

-- Saved content policies
CREATE POLICY "Users can view their own saved content"
ON public.saved_content FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved content"
ON public.saved_content FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved content"
ON public.saved_content FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved content"
ON public.saved_content FOR DELETE
USING (auth.uid() = user_id);

-- Create growth_stats table for tracking analytics over time
CREATE TABLE public.growth_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  platform TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, platform)
);

-- Enable RLS on growth_stats
ALTER TABLE public.growth_stats ENABLE ROW LEVEL SECURITY;

-- Growth stats policies
CREATE POLICY "Users can view their own growth stats"
ON public.growth_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own growth stats"
ON public.growth_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth stats"
ON public.growth_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own growth stats"
ON public.growth_stats FOR DELETE
USING (auth.uid() = user_id);

-- Create activity_log table for recent actions
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follower', 'view', 'like', 'comment', 'share', 'milestone')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log policies
CREATE POLICY "Users can view their own activity"
ON public.activity_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
ON public.activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity"
ON public.activity_log FOR DELETE
USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_content_updated_at
  BEFORE UPDATE ON public.saved_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE mcq_difficulty AS ENUM ('Easy', 'Medium', 'Hard');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT UNIQUE NOT NULL, -- e.g., 'C003'
  course_name TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Units table
CREATE TABLE public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  unit_id_code TEXT NOT NULL, -- e.g., 'U1'
  unit_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chapters table
CREATE TABLE public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  chapter_id_code TEXT NOT NULL, -- e.g., 'CH1'
  chapter_title TEXT NOT NULL,
  notes_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Topics table
CREATE TABLE public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  topic_id_code TEXT, -- e.g., 'T001'
  topic_title TEXT NOT NULL,
  content TEXT,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MCQs table
CREATE TABLE public.mcqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  answer_index INTEGER NOT NULL,
  difficulty mcq_difficulty DEFAULT 'Medium',
  knowledge_id TEXT,
  validated BOOLEAN DEFAULT FALSE,
  validation_report JSONB,
  approved BOOLEAN DEFAULT FALSE,
  unit_code TEXT,
  chapter_code TEXT,
  section TEXT,
  change_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view all courses." ON public.courses FOR SELECT USING (true);
CREATE POLICY "Users can view all units." ON public.units FOR SELECT USING (true);
CREATE POLICY "Users can view all chapters." ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Users can view all topics." ON public.topics FOR SELECT USING (true);

-- Automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Create a debug table to capture errors
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    event_type TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Drop existing triggers to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Super Robust Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_role TEXT;
BEGIN
    -- Capture the role from metadata safely
    target_role := NEW.raw_user_meta_data->>'role';
    
    -- Log the attempt
    INSERT INTO public.debug_logs (user_id, event_type, metadata)
    VALUES (NEW.id, 'SIGNUP_ATTEMPT', jsonb_build_object('email', NEW.email, 'role', target_role));

    -- Perform the insert inside a nested block to catch errors
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            NEW.id, 
            NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            CASE 
                WHEN target_role = 'admin' THEN 'admin'::user_role
                WHEN target_role = 'staff' THEN 'staff'::user_role
                ELSE 'student'::user_role
            END
        );
        
        INSERT INTO public.debug_logs (user_id, event_type)
        VALUES (NEW.id, 'PROFILE_CREATED_SUCCESS');

    EXCEPTION WHEN OTHERS THEN
        -- LOG THE REAL ERROR MESSAGE HERE
        INSERT INTO public.debug_logs (user_id, event_type, error_message, metadata)
        VALUES (
            NEW.id, 
            'PROFILE_CREATION_FAILED', 
            SQLERRM, 
            jsonb_build_object('sqlstate', SQLSTATE, 'data', NEW.raw_user_meta_data)
        );
    END;

    -- CRITICAL: Always return NEW so the user creation in auth.users doesn't fail!
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Give public permission to view logs (for debugging)
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view logs" ON public.debug_logs FOR SELECT USING (true);

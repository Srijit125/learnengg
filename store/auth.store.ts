import { create } from "zustand";
import { supabase } from "@/utils/supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "student" | "staff";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
};

type AuthState = {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (session: Session | null) => Promise<void>;
  fetchProfile: (uid: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,

  setSession: async (session) => {
    set({ session, isAuthenticated: !!session, isLoading: true });
    if (session?.user) {
      await get().fetchProfile(session.user.id);
    } else {
      set({ user: null, isLoading: false });
    }
  },

  fetchProfile: async (uid) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (error) {
        // Even if fetch fails, we must stop loading
        set({ user: null });
      } else if (data) {
        set({ user: data as UserProfile });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

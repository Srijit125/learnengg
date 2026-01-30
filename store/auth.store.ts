import { create } from 'zustand';

export type UserRole = 'admin'| 'student';

type User = {
    id: string;
    name: string;
    role: UserRole;
}

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;

    loginAsAdmin: ()=> void;
    loginAsStudent: ()=> void;
    logout: ()=> void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    loginAsAdmin: () => set({
        user: {
            id: "ADMIN_001",
            name: "Admin User",
            role: "admin"
        },
        isAuthenticated: true
    }),

    loginAsStudent: () => set({
        user: {
            id: "cbae9003-9c6c-4cb9-a658-7ebf7cc7cb23",
            name: "Student User",
            role: "student"
        },
        isAuthenticated: true
    }),

    logout: () => set({
        user: null,
        isAuthenticated: false
    })
}));
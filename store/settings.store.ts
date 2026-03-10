import { create } from "zustand";

interface UserPreferences {
    themeMode: "light" | "dark" | "system";
    notifications: boolean;
    emailUpdates: boolean;
    autoPlay: boolean;
    fontSize: "small" | "medium" | "large";
    language: string;
}

interface SettingsState {
    preferences: UserPreferences;
    setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
    resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    themeMode: "light",
    notifications: true,
    emailUpdates: false,
    autoPlay: true,
    fontSize: "medium",
    language: "English",
};

export const useSettingsStore = create<SettingsState>((set) => ({
    preferences: DEFAULT_PREFERENCES,
    setPreference: (key, value) => {
        set((state) => ({
            preferences: {
                ...state.preferences,
                [key]: value,
            },
        }));
    },
    resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
}));

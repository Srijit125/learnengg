import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserPreferences {
    darkMode: boolean;
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
    darkMode: false,
    notifications: true,
    emailUpdates: false,
    autoPlay: true,
    fontSize: "medium",
    language: "English",
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            preferences: DEFAULT_PREFERENCES,
            setPreference: (key, value) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        [key]: value,
                    },
                })),
            resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
        }),
        {
            name: "user-settings",
            storage: createJSONStorage(() =>
                Platform.OS === 'web' ? localStorage : AsyncStorage
            ),
        }
    )
);

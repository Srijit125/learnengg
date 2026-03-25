import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    // Sync session with auth store
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }: { data: { session: Session | null } }) => {
        console.log("Initial session fetched:", !!session);
        await useAuthStore.getState().setSession(session);
        setIsReady(true);
      });

    // NativeWind v4 web dark mode requires the 'dark' class on the HTML tag
    // since we set darkMode: "class" in tailwind.config.js
    if (Platform.OS === 'web') {
      const isDark = colorScheme === 'dark';
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        useAuthStore.getState().setSession(session);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const [loaded, error] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  console.log("RootLayout state:", { loaded, error, isReady, isLoading, isAuthenticated, role: user?.role });

  if ((!loaded && !error) || !isReady || isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
  }

  if (user?.role === "admin") {
    return (
      <Stack>
        <Stack.Screen
          name="(admin)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
  }

  if (user?.role === "contentTeam") {
    return (
      <Stack>
        <Stack.Screen
          name="(contentTeam)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="(student)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default RootLayout;

import { useAuthStore } from "@/store/auth.store";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { supabase } from "@/utils/supabase";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Sync session with auth store
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        useAuthStore.getState().setSession(session);
        setIsReady(true);
      });

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

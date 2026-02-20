import { useAuthStore, UserRole } from "@/store/auth.store";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { useRouter } from "expo-router";

const LoginScreen = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async () => {
    setErrorMsg(null);
    if (!email || !password || (isSignUp && !fullName)) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        });
        console.log("Signup data", data);
        console.log("Signup error", error);
        if (error) throw error;
        alert("Check your email for confirmation!");
        if (data) {
          // Insert user to profiles table in DB
          const { data: profile, error } = await supabase
            .from('profiles')
            .insert([
              { id: data.user?.id, email: data.user?.email, full_name: data.user?.user_metadata.full_name, role: data.user?.user_metadata.role },
            ])
            .select().single()
          console.log("Profile data", profile);
          console.log("Profile error", error);
          if (profile.role) {
            router.replace("/(admin)");
          } else {
            router.replace("/(student)");
          }
        }
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Explicit navigation fallback
        setTimeout(() => {
          const user = useAuthStore.getState().user;
          if (user?.role === "admin") {
            router.replace("/(admin)");
          } else {
            router.replace("/(student)");
          }
        }, 500);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: "admin" as UserRole,
      title: "Admin",
      icon: "shield-crown",
      iconColor: "#667eea",
    },
    {
      role: "student" as UserRole,
      title: "Student",
      icon: "school",
      iconColor: "#10b981",
    },
  ];

  return (
    <LinearGradient
      colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons
                name="school-outline"
                size={48}
                color="#ffffff"
              />
            </LinearGradient>
          </View>
          <Text style={styles.title}>E-Learning Platform</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create an account" : "Welcome back!"}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, !isSignUp && styles.activeTab]}
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
              Login
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, isSignUp && styles.activeTab]}
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          {errorMsg && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {isSignUp && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignUp && (
            <>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.roleContainer}>
                {roleCards.map((card) => {
                  const isSelected = selectedRole === card.role;
                  return (
                    <Pressable
                      key={card.role}
                      style={[
                        styles.roleCard,
                        isSelected && {
                          borderColor: card.iconColor,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => setSelectedRole(card.role)}
                    >
                      <MaterialCommunityIcons
                        name={card.icon as any}
                        size={24}
                        color={isSelected ? card.iconColor : "#94a3b8"}
                      />
                      <Text
                        style={[
                          styles.roleCardText,
                          isSelected && { color: card.iconColor },
                        ]}
                      >
                        {card.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              loading && styles.authButtonDisabled,
              pressed && !loading && { opacity: 0.9 },
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.authButtonGradient}
            >
              <Text style={styles.authButtonText}>
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Continue"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: "100%",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#1e293b",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  roleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    cursor: "pointer",
  },
  roleCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  authButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    cursor: "pointer",
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  authButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});

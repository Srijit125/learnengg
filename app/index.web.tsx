import { useAuthStore, UserRole } from "@/store/auth.store";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
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
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: "center", maxWidth: 500, width: "100%", alignSelf: "center" }}>
        <View className="items-center mb-8">
          <View className="mb-4">
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              className="w-20 h-20 rounded-2xl justify-center items-center shadow-lg"
            >
              <MaterialCommunityIcons
                name="school-outline"
                size={48}
                color="#ffffff"
              />
            </LinearGradient>
          </View>
          <Text className="text-3xl font-bold text-[#1e293b] mb-1">E-Learning Platform</Text>
          <Text className="text-base text-[#64748b] font-medium">
            {isSignUp ? "Create an account" : "Welcome back!"}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-[#e2e8f0] rounded-xl p-1 mb-6 w-full">
          <Pressable
            className={`flex-1 py-2.5 items-center rounded-lg ${!isSignUp ? "bg-white shadow-sm" : ""}`}
            onPress={() => setIsSignUp(false)}
          >
            <Text className={`text-sm font-semibold ${!isSignUp ? "text-[#1e293b]" : "text-[#64748b]"}`}>
              Login
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 items-center rounded-lg ${isSignUp ? "bg-white shadow-sm" : ""}`}
            onPress={() => setIsSignUp(true)}
          >
            <Text className={`text-sm font-semibold ${isSignUp ? "text-[#1e293b]" : "text-[#64748b]"}`}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-3xl p-6 w-full shadow-xl">
          {errorMsg && (
            <View className="bg-[#fee2e2] p-3 rounded-lg mb-4">
              <Text className="text-[#b91c1c] text-sm text-center">{errorMsg}</Text>
            </View>
          )}
          <View className="bg-[#fee2e2] p-3 rounded-lg mb-4">
            <Text className="text-[#1c5bb9] text-sm text-center">Admin: admin@learnengg.com Password: fountain</Text>
            <Text className="text-[#1c5bb9] text-sm text-center">Student: student@gmail.com Password: fountain</Text>
          </View>

          {isSignUp && (
            <>
              <Text className="text-sm font-semibold text-[#475569] mb-2 mt-4">Full Name</Text>
              <TextInput
                className="bg-[#f8fafc] rounded-xl px-4 py-3 text-base text-[#1e293b] border border-[#e2e8f0]"
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </>
          )}

          <Text className="text-sm font-semibold text-[#475569] mb-2 mt-4">Email Address</Text>
          <TextInput
            className="bg-[#f8fafc] rounded-xl px-4 py-3 text-base text-[#1e293b] border border-[#e2e8f0]"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text className="text-sm font-semibold text-[#475569] mb-2 mt-4">Password</Text>
          <TextInput
            className="bg-[#f8fafc] rounded-xl px-4 py-3 text-base text-[#1e293b] border border-[#e2e8f0]"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignUp && (
            <>
              <Text className="text-sm font-semibold text-[#475569] mb-2 mt-4">I am a:</Text>
              <View className="flex-row gap-3 mt-2 w-full">
                {roleCards.map((card) => {
                  const isSelected = selectedRole === card.role;
                  return (
                    <Pressable
                      key={card.role}
                      className={`flex-1 flex-row items-center justify-center bg-[#f8fafc] p-3 rounded-xl gap-2 border ${isSelected ? "border-2" : "border-[#e2e8f0]"}`}
                      style={isSelected ? { borderColor: card.iconColor } : undefined}
                      onPress={() => setSelectedRole(card.role)}
                    >
                      <MaterialCommunityIcons
                        name={card.icon as any}
                        size={24}
                        color={isSelected ? card.iconColor : "#94a3b8"}
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: isSelected ? card.iconColor : "#64748b" }}
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
            className={`mt-8 rounded-2xl overflow-hidden shadow-lg ${loading ? "opacity-70" : ""}`}
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              className="flex-row items-center justify-center py-4 gap-2"
            >
              <Text className="text-white text-lg font-bold">
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Continue"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View className="mt-8 items-center">
          <Text className="text-xs text-[#94a3b8] text-center">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default LoginScreen;

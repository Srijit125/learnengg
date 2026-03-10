import { UserRole } from "@/store/auth.store";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const LoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        });
        if (error) throw error;
        Alert.alert("Success", "Check your email for confirmation!");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: "admin" as UserRole,
      title: "Admin",
      icon: "shield-crown",
      gradient: ["#667eea", "#764ba2"] as const,
      iconColor: "#667eea",
    },
    {
      role: "student" as UserRole,
      title: "Student",
      icon: "school",
      gradient: ["#10b981", "#059669"] as const,
      iconColor: "#10b981",
    },
  ];

  return (
    <LinearGradient
      colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: "center" }}>
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

          <View className="bg-white rounded-3xl p-6 w-full shadow-md">
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
              keyboardType="email-address"
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
                  {loading
                    ? "Processing..."
                    : isSignUp
                      ? "Sign Up"
                      : "Continue"}
                </Text>
                {!loading && (
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#ffffff"
                  />
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <View className="mt-8 items-center">
            <Text className="text-xs text-[#94a3b8] text-center">
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;

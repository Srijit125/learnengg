import {
  StyleSheet,
  Text,
  View,
  Pressable, // Changed from TouchableOpacity
  Dimensions,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, UserRole } from '@/store/auth.store';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin);
  const loginAsStudent = useAuthStore((s) => s.loginAsStudent);
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>("admin");

  const handleLogin = () => {
    console.log('Logging in as:', selectedRole);
    if (selectedRole === 'admin') {
      loginAsAdmin();
      router.replace('/(admin)');
    } else if (selectedRole === 'student') {
      loginAsStudent();
      router.replace('/(student)');
    }
  };

  const roleCards = [
    {
      role: 'admin' as UserRole,
      title: 'Admin',
      subtitle: 'Manage courses and students',
      icon: 'shield-crown',
      gradient: ['#667eea', '#764ba2'] as const,
      iconColor: '#667eea',
      fallbackBg: '#667eea',
    },
    {
      role: 'student' as UserRole,
      title: 'Student',
      subtitle: 'Access courses and quizzes',
      icon: 'school',
      gradient: ['#10b981', '#059669'] as const,
      iconColor: '#10b981',
      fallbackBg: '#10b981',
    },
  ];

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
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
          <Text style={styles.subtitle}>Choose your role to continue</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.roleContainer}>
          {roleCards.map((card) => {
            const isSelected = selectedRole === card.role;
            return (
              <Pressable
                key={card.role}
                style={({ pressed }) => [
                  styles.roleCard,
                  isSelected && styles.roleCardSelected,
                  pressed && { opacity: 0.7 },
                  !isSelected && { backgroundColor: '#ffffff' } // Visible background
                ]}
                onPress={() => {
                  console.log('Selected role:', card.role);
                  setSelectedRole(card.role);
                }}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={isSelected ? (card.gradient as [string, string]) : (['#ffffff', '#ffffff'] as const)}
                  style={[
                    styles.roleCardGradient,
                    isSelected && { backgroundColor: card.fallbackBg } // Fallback for gradient
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      !isSelected && { backgroundColor: '#f1f5f9' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={card.icon as any}
                      size={40}
                      color={isSelected ? '#ffffff' : card.iconColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleTitle,
                      isSelected && styles.roleTitleSelected,
                    ]}
                  >
                    {card.title}
                  </Text>
                  <Text
                    style={[
                      styles.roleSubtitle,
                      isSelected && styles.roleSubtitleSelected,
                    ]}
                  >
                    {card.subtitle}
                  </Text>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#ffffff"
                      />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Login Button */}
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            !selectedRole && styles.loginButtonDisabled,
            pressed && selectedRole && { opacity: 0.9 },
          ]}
          onPress={handleLogin}
          disabled={!selectedRole}
        >
          <LinearGradient
            pointerEvents="none"
            colors={
              selectedRole
                ? ['#667eea', '#764ba2'] as const
                : ['#cbd5e1', '#94a3b8'] as const
            }
            style={[
              styles.loginButtonGradient,
              selectedRole 
                ? { backgroundColor: '#667eea' } 
                : { backgroundColor: '#cbd5e1' }
            ]}
          >
            <Text style={styles.loginButtonText}>Continue</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#ffffff"
            />
          </LinearGradient>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    width: '100%',
    alignItems: 'stretch',
  },
  roleCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    cursor: 'pointer',
  },
  roleCardSelected: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  roleCardGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  roleTitleSelected: {
    color: '#ffffff',
  },
  roleSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  roleSubtitleSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    cursor: 'pointer',
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94a3b8',
    textAlign: 'center',
  },
});

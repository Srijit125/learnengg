import { Drawer } from "expo-router/drawer";
import React from 'react';
import CustomDrawerContent from '@/components/Dashboard/CustomDrawerContent';

export default function RootLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1e293b',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      <Drawer.Screen
        name="index" 
        options={{
          drawerLabel: 'Dashboard',
          title: 'Analytics Dashboard',
        }}
      />
      <Drawer.Screen
        name="quiz" 
        options={{
          drawerLabel: 'Quiz',
          title: 'Quiz',
        }}
      />
    </Drawer>
  )
}

import React from 'react';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/Dashboard/CustomDrawerContent';

export default function ContentTeamLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

import { Drawer } from "expo-router/drawer";
import React from 'react'

export default function RootLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index" 
        options={{
          drawerLabel: 'Home',
          title: 'Dashboard',
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

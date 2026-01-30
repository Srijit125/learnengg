import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '@/components/Dashboard/CustomDrawerContent';

// Import your screen components
import DashboardScreen from './screens/DashboardScreen';
import QuizScreen from './screens/QuizScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
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
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Analytics Dashboard',
          }}
        />
        <Drawer.Screen
          name="Quiz"
          component={QuizScreen}
          options={{
            title: 'Quiz',
          }}
        />
        {/* Add more screens as needed */}
        <Drawer.Screen
          name="Performance"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Performance' }}
        />
        <Drawer.Screen
          name="Progress"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Progress' }}
        />
        <Drawer.Screen
          name="Activity"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Activity' }}
        />
        <Drawer.Screen
          name="Reports"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Reports' }}
        />
        <Drawer.Screen
          name="Strengths"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Strengths' }}
        />
        <Drawer.Screen
          name="Weaknesses"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Weaknesses' }}
        />
        <Drawer.Screen
          name="Preferences"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Preferences' }}
        />
        <Drawer.Screen
          name="Export"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Export Data' }}
        />
        <Drawer.Screen
          name="Help"
          component={DashboardScreen} // Replace with actual component
          options={{ title: 'Help' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

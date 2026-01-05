import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { DesignTokens } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: DesignTokens.colors.primary,
        tabBarInactiveTintColor: DesignTokens.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: DesignTokens.colors.white,
          borderTopWidth: 1,
          borderTopColor: DesignTokens.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: DesignTokens.fonts.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

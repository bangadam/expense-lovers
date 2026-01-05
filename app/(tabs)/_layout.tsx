import React from 'react';
import { Tabs } from 'expo-router';
import { Home, History, Calendar } from 'lucide-react-native';
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
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

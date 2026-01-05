import { BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// Use Ionicons instead of UI Kitten Icon (React 19 compatibility)
const HomeIcon = (props: any) => (
  <Ionicons name="home-outline" size={24} color={props.style?.tintColor || '#8F9BB3'} />
);
const HistoryIcon = (props: any) => (
  <Ionicons name="time-outline" size={24} color={props.style?.tintColor || '#8F9BB3'} />
);
const SettingsIcon = (props: any) => (
  <Ionicons name="settings-outline" size={24} color={props.style?.tintColor || '#8F9BB3'} />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state }) => (
        <BottomNavigation
          selectedIndex={state.index}
          onSelect={(index) => navigation.navigate(state.routeNames[index])}
        >
          <BottomNavigationTab title="Home" icon={HomeIcon} />
          <BottomNavigationTab title="History" icon={HistoryIcon} />
          <BottomNavigationTab title="Settings" icon={SettingsIcon} />
        </BottomNavigation>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

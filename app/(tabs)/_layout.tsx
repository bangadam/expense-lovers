import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import { Tabs } from 'expo-router';
import React from 'react';

const HomeIcon = (props: any) => <Icon {...props} name="home-outline" />;
const HistoryIcon = (props: any) => <Icon {...props} name="clock-outline" />;
const SettingsIcon = (props: any) => <Icon {...props} name="settings-outline" />;

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

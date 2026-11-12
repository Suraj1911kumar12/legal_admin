import React from 'react';
import { Tabs } from 'expo-router';
import { AppBottomNavigation } from '@/components/ui/AppBottomNavigation';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <AppBottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="matters" options={{ title: 'My Matters' }} />
      <Tabs.Screen name="assistant" options={{ title: 'AI Help' }} />
      <Tabs.Screen name="lawyers" options={{ title: 'Lawyers' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

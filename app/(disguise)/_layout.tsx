import { Stack } from 'expo-router';

export default function DisguiseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="cart" options={{ presentation: 'card' }} />
      <Stack.Screen name="search" options={{ presentation: 'card' }} />
      <Stack.Screen name="wishlist" options={{ presentation: 'card' }} />
      <Stack.Screen name="orders" options={{ presentation: 'card' }} />
      <Stack.Screen name="profile" options={{ presentation: 'card' }} />
      <Stack.Screen name="support" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

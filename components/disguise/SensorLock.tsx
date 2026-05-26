import { useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// ─────────────────────────────────────────────────────────────────────────────
// Sensor Lock
// Instantly exits the stealth app if the device is shaken or put face down.
// ─────────────────────────────────────────────────────────────────────────────

const SHAKE_THRESHOLD = 2.5; // G-force threshold for a shake
const FACE_DOWN_THRESHOLD = -0.8; // Z-axis gravity (1 is face up, -1 is face down)

export default function SensorLock() {
  const router = useRouter();

  useEffect(() => {
    // Set update interval to 200ms
    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // 1. Detect Shake
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > SHAKE_THRESHOLD) {
        triggerLock('Shake detected');
        return;
      }

      // 2. Detect Face Down (Z axis points away from screen)
      if (z < FACE_DOWN_THRESHOLD) {
        triggerLock('Face down detected');
        return;
      }
    });

    return () => subscription.remove();
  }, []);

  const triggerLock = (reason: string) => {
    console.log(`[SensorLock] Locking app: ${reason}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.replace('/(disguise)');
  };

  return null;
}

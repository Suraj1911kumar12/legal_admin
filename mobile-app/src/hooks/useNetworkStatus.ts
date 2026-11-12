import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const checkInitial = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!mounted) return;
        setIsConnected(state.isConnected ?? true);
        setIsInternetReachable(state.isInternetReachable ?? state.isConnected ?? true);
      } catch {
        // assume online if check unsupported
      }
    };

    checkInitial();

    const subscription = Network.addNetworkStateListener((state) => {
      if (!mounted) return;
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? state.isConnected ?? true);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return {
    isOnline: isConnected && isInternetReachable,
    isConnected,
    isInternetReachable
  };
}

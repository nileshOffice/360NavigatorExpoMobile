import "@/global.css";

import { usePingServerMutation } from "@/src/auth/applicationApi";
import GlobalApiAlert from "@/src/auth/components/GlobalApiAlert";
import BootScreen from "@/src/common/components/app_components/BootScreen";
import { ensureCryptoConfigured } from "@/src/auth/session";
import { ToastProvider } from "@/src/common/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { persistor, store } from "@/src/lib/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Keep the native splash visible until encryption keys are loaded,
// instead of showing a blank white screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

function SessionHeartbeat() {
  const sessionId = useAppSelector((state) => state.auth.currentUser?.sessionId);
  const userId = useAppSelector((state) => state.auth.currentUser?.userId);
  const roleId = useAppSelector((state) => state.auth.currentUser?.roleId);
  const isNavigationAllowed = useAppSelector(
    (state) => state.auth.currentUser?.isNavigationAllowed,
  );
  const [pingServer] = usePingServerMutation();

  useEffect(() => {
    if (!sessionId || !isNavigationAllowed) {
      return;
    }

    const ping = () => {
      // Don't wake the radio while the app is in the background.
      if (AppState.currentState !== "active") {
        return;
      }

      pingServer({
        id21: sessionId,
        id22: Number(userId),
        id23: Number(roleId),
      })
        .unwrap()
        .catch((error) => {
          if (__DEV__) {
            console.warn("Heartbeat failed:", error);
          }
        });
    };

    const intervalId = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [sessionId, userId, roleId, isNavigationAllowed, pingServer]);

  return null;
}

/** Loads the AES key/IV before any screen is rendered. */
function AppInitializer({ onReady }: { onReady: () => void }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Ready either way: Login retries if this failed (e.g. offline).
    ensureCryptoConfigured(dispatch).finally(onReady);
  }, [dispatch, onReady]);

  return null;
}

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);
  const handleReady = useCallback(() => setInitialized(true), []);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [initialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<BootScreen />} persistor={persistor}>
          {/* ToastProvider is outside the sheet provider so its toast is drawn
              above any open bottom sheet (sheets render in the sheet
              provider's own host). */}
          <ToastProvider>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <SessionHeartbeat />
              <GlobalApiAlert />

              {initialized ? (
                <Stack screenOptions={{ headerShown: false }} />
              ) : (
                <>
                  {/* Logo while the encryption keys load (previously blank). */}
                  <BootScreen />
                  <AppInitializer onReady={handleReady} />
                </>
              )}
            </BottomSheetModalProvider>
          </ToastProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

import "@/global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useLazyLoadApplicationDataQuery } from "./auth/applicationApi";
import { persistor, store } from "./lib/store/store";

// Separate component so hooks run inside <Provider>
function AppInitializer({ onReady }: { onReady: () => void }) {
  const [loadApplicationData] = useLazyLoadApplicationDataQuery();

  useEffect(() => {
    console.log("[App] Starting loadApplicationData...");
    loadApplicationData()
      .unwrap()
      .then((data) => {
        // console.log("[App] Encryption initialized", data);
        onReady();
      })
      .catch((error) => {
        // console.error("[App] Failed to initialize encryption", error);
        onReady(); // proceed even if initialization fails
      });
  }, []);

  return null;
}

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <BottomSheetModalProvider>
            {!initialized && <AppInitializer onReady={() => setInitialized(true)} />}
            {initialized && (
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            )}
          </BottomSheetModalProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

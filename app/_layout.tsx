import "@/global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { useLazyLoadApplicationDataQuery } from "./auth/applicationApi";
import { store } from "./lib/store/store";

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
    <Provider store={store}>
      {!initialized && <AppInitializer onReady={() => setInitialized(true)} />}
      {initialized && (
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      )}
    </Provider>
  );
}

import "@/global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useLazyLoadApplicationDataQuery, usePingServerMutation } from "./auth/applicationApi";
import { persistor, RootState, store } from "./lib/store/store";

import {
  logout,
  setSessionExpired,
} from '@/app/auth/authSlice';
import { useRouter } from "expo-router";
import SessionExpiredDialog from "./auth/components/SessionExpiredDialog";
import { ToastProvider } from "./common/components/ui/toast";



function SessionHeartbeat() {
  const currentUser = useSelector(
    (state: RootState) => state.auth.currentUser
  );

  const sessionExpired = useSelector(
    (state: RootState) => state.auth.sessionExpired
  );

  const [pingServer] = usePingServerMutation();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (sessionExpired) {
        return;
      }

      if (
        !currentUser?.sessionId ||
        !currentUser?.isNavigationAllowed
      ) {
        return;
      }

      const idDto = {
        id21: currentUser.sessionId,
        id22: Number(currentUser.userId),
        id23: Number(currentUser.roleId),
      };

      pingServer(idDto)
        .unwrap()
        .catch((error) => {
          console.error('Heartbeat failed:', error);
        });
    }, 120000); // 2 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [
    currentUser,
    sessionExpired,
    pingServer,
  ]);

  return null;
}




// Separate component so hooks run inside <Provider>
function AppInitializer({ onReady }: { onReady: () => void }) {
  const [loadApplicationData] = useLazyLoadApplicationDataQuery();

  const sessionExpired = useSelector(
    (state: RootState) => state.auth.sessionExpired
  );

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!sessionExpired) return;

    SessionExpiredDialog(() => {
      dispatch(logout());
      dispatch(setSessionExpired(false));

      router.replace('/');
    });
  }, [sessionExpired, dispatch, router]);

  useEffect(() => {
    loadApplicationData()
      .unwrap()
      .then(() => {
        onReady();
      })
      .catch(() => {
        onReady();
      });
  }, []);

  return null;
}


function SessionExpiredHandler() {
  const sessionExpired = useSelector(
    (state: RootState) => state.auth.sessionExpired
  );

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!sessionExpired) return;

    SessionExpiredDialog(() => {
      dispatch(logout());
      dispatch(setSessionExpired(false));

      router.replace('/');
    });
  }, [sessionExpired, dispatch, router]);

  return null;
}

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BottomSheetModalProvider>
              <ToastProvider>

             <SessionHeartbeat />

            {/* Always mounted */}
            <SessionExpiredHandler />

            {!initialized && (
              <AppInitializer
                onReady={() => setInitialized(true)}
              />
            )}

            {initialized && (
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            )}
            </ToastProvider>
          </BottomSheetModalProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

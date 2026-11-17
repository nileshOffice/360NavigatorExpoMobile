import { setLastVisitedRoute } from "@/src/auth/authSlice";
import AppLayout from "@/src/common/layouts/AppLayout";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { colors } from "@/src/theme/colors";
import { Stack, usePathname } from "expo-router";
import { useEffect } from "react";

export const unstable_settings = {
  // Ensures a deep link / restored route always has Home underneath it,
  // so the Android back button never exits the app unexpectedly.
  initialRouteName: "index",
};

export default function Layout() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/main")) {
      dispatch(setLastVisitedRoute(pathname));
    }
  }, [dispatch, pathname]);

  return (
    <AppLayout>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Multi-step wizards handle back themselves (step-by-step). */}
        <Stack.Screen name="create-asset" options={{ gestureEnabled: false }} />
        <Stack.Screen name="update-asset" options={{ gestureEnabled: false }} />
      </Stack>
    </AppLayout>
  );
}

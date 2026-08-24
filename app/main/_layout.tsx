import { Slot, usePathname } from "expo-router";
import { useEffect } from "react";
import { setLastVisitedRoute } from "../auth/authSlice";
import AppLayout from "../common/layouts/AppLayout";
import { useAppDispatch } from "../lib/store/hooks";

export default function Layout() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/main')) {
      dispatch(setLastVisitedRoute(pathname));
    }
  }, [dispatch, pathname]);

  return (
    <AppLayout >
      <Slot />
      
    </AppLayout>
  );
}
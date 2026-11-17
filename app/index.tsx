import { APP_ROUTES, isRestorableRoute } from "@/src/common/config/routes";
import { useAppSelector } from "@/src/lib/store/hooks";
import { Redirect, type Href } from "expo-router";

export default function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const lastVisitedRoute = useAppSelector((state) => state.auth.lastVisitedRoute);

  if (!isAuthenticated) {
    return <Redirect href={APP_ROUTES.auth} />;
  }

  // Only restore list screens. Wizard screens depend on in-memory state and
  // routes persisted by older builds may no longer exist.
  const destination = isRestorableRoute(lastVisitedRoute)
    ? (lastVisitedRoute as Href)
    : APP_ROUTES.main;

  return <Redirect href={destination} />;
}

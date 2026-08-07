import { Slot } from "expo-router";
import AppLayout from "../common/layouts/AppLayout";

export default function Layout() {
  return (
    <AppLayout>
      <Slot />
    </AppLayout>
  );
}
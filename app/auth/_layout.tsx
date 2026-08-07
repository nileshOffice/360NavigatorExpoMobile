import { Slot } from "expo-router";
import AuthLayout from "../common/layouts/AuthLayout";

export default function Layout() {
  return (
    <AuthLayout>
      <Slot />
    </AuthLayout>
  );
}
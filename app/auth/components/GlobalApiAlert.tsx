
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/lib/store/store";
import { logout, setSessionExpired } from "@/app/auth/authSlice";
import { clearApiAlert } from "@/app/common/hooks/apiErrorSlice";

const GlobalApiAlert = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const alert = useSelector(
    (state: RootState) => state.apiError.alert
  );

  const visibleRef = useRef(false);

  useEffect(() => {
    if (!alert || visibleRef.current) {
      return;
    }

    visibleRef.current = true;

    Alert.alert(
      alert.title,
      alert.message,
      [
        {
          text: alert.confirmText ?? "OK",
          onPress: () => {
            visibleRef.current = false;

            dispatch(clearApiAlert());

            if (alert.action === "logout") {
              dispatch(setSessionExpired(false));
              dispatch(logout());
              router.replace("/auth");
            }
          },
        },
      ],
      {
        cancelable: false,
        onDismiss: () => {
          visibleRef.current = false;
        },
      }
    );
  }, [alert, dispatch, router]);

  return null;
};

export default GlobalApiAlert;

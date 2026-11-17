import { resetSessionState } from "@/src/auth/session";
import { APP_ROUTES } from "@/src/common/config/routes";
import { clearApiAlert } from "@/src/common/hooks/apiErrorSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

/** Shows API errors raised by the base query as a native alert (one at a time). */
const GlobalApiAlert = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const alert = useAppSelector((state) => state.apiError.alert);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!alert || visibleRef.current) {
      return;
    }

    visibleRef.current = true;

    const close = () => {
      visibleRef.current = false;
      dispatch(clearApiAlert());
    };

    Alert.alert(
      alert.title,
      alert.message,
      [
        {
          text: alert.confirmText ?? "OK",
          onPress: () => {
            close();

            if (alert.action === "logout") {
              resetSessionState(dispatch);
              router.replace(APP_ROUTES.auth);
            }
          },
        },
      ],
      {
        cancelable: false,
        // Android only: fired if the dialog is dismissed by the system.
        onDismiss: close,
      },
    );
  }, [alert, dispatch, router]);

  return null;
};

export default GlobalApiAlert;

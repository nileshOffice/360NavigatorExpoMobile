import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { HeaderState, setHeader } from "./headerSlice";

type ScreenHeader = Omit<HeaderState, "backPressed">;

/**
 * Sets the shared app header whenever the screen gains focus.
 *
 * Screens stay mounted in the Stack when another screen is pushed on top,
 * so a plain mount/unmount effect would leave the wrong header showing after
 * navigating back. Running on focus fixes that.
 */
export function useScreenHeader({
  title,
  showBack,
  showMenu,
  showLogo,
  backAction,
}: ScreenHeader) {
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      dispatch(setHeader({ title, showBack, showMenu, showLogo, backAction }));
    }, [dispatch, title, showBack, showMenu, showLogo, backAction]),
  );
}

/**
 * For screens using `backAction: "custom"` (multi-step wizards).
 *
 * Calls `onBack` when the header back arrow is pressed OR the Android
 * hardware/gesture back is used, but only while this screen is focused and
 * only once per press.
 */
export function useHeaderBackHandler(onBack: () => void) {
  const backPressed = useAppSelector((state) => state.header.backPressed);
  const lastHandled = useRef(backPressed);
  const isFocused = useRef(false);
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onBackRef.current();
          return true;
        },
      );

      return () => {
        isFocused.current = false;
        subscription.remove();
      };
    }, []),
  );

  useEffect(() => {
    if (backPressed === lastHandled.current) {
      return;
    }

    lastHandled.current = backPressed;

    if (isFocused.current) {
      onBackRef.current();
    }
  }, [backPressed]);
}

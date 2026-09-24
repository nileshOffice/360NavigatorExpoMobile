
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import Toast, {
    ToastType,
} from "./Toast";

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState extends ToastOptions {
  visible: boolean;
  type: ToastType;
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    options: ToastOptions
  ) => void;

  success: (options: ToastOptions) => void;
  danger: (options: ToastOptions) => void;
  warning: (options: ToastOptions) => void;

  hideToast: () => void;
}

const ToastContext =
  createContext<ToastContextType | undefined>(
    undefined
  );

export const ToastProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "success",
    title: undefined,
    message: "",
    duration: 3000,
  });

  const hideToast = useCallback(() => {
    setToast((previous) => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const showToast = useCallback(
    (
      type: ToastType,
      options: ToastOptions
    ) => {
      setToast({
        visible: true,
        type,
        title: options.title,
        message: options.message,
        duration: options.duration ?? 3000,
      });
    },
    []
  );

  const success = useCallback(
    (options: ToastOptions) => {
      showToast("success", options);
    },
    [showToast]
  );

  const danger = useCallback(
    (options: ToastOptions) => {
      showToast("danger", options);
    },
    [showToast]
  );

  const warning = useCallback(
    (options: ToastOptions) => {
      showToast("warning", options);
    },
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      success,
      danger,
      warning,
      hideToast,
    }),
    [
      showToast,
      success,
      danger,
      warning,
      hideToast,
    ]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
};
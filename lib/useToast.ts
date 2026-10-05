"use client";

import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" = "success"
    ) => {
      setToast({ message, type });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  return {
    toast,
    showToast,
  };
}
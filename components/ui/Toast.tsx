"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error";
};

export function Toast({
  message,
  type = "success",
}: ToastProps) {
  return (
    <div
      className={`fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-medium shadow-lg ${
        type === "success"
          ? "bg-primary text-on-primary"
          : "bg-danger text-white"
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}
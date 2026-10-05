import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "text";
};


export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "w-full py-4 px-5 rounded font-bold text-[17px] text-center transition-colors";
  const styles = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-surface-2 text-text border border-border",
    text: "bg-transparent text-primary py-2 underline-offset-2",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

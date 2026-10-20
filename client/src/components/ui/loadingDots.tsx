import type { FC } from "react";

type LoadingDotsProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-[3px] w-[3px]",
  md: "h-1 w-1",
  lg: "h-1.5 w-1.5",
};

const gapClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

export const LoadingDots: FC<LoadingDotsProps> = ({ size = "md", className = "" }) => {
  return (
    <span className={`inline-flex items-center ${gapClasses[size]} ${className}`}>
      <span className={`${sizeClasses[size]} rounded-full bg-[#282828]/50 animate-bounce [animation-delay:-0.32s]`} />
      <span className={`${sizeClasses[size]} rounded-full bg-[#282828]/50 animate-bounce [animation-delay:-0.16s]`} />
      <span className={`${sizeClasses[size]} rounded-full bg-[#282828]/50 animate-bounce`} />
    </span>
  );
}


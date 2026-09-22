import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

export default function Container({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 ${className}`}
    >
      {children}
    </Component>
  );
}

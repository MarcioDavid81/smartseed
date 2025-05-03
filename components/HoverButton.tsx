"use client";

import { useState } from "react";

interface HoverButtonProps {
  children: React.ReactNode;
  className?: string;
  hoverColor?: string;
  baseColor?: string;
  duration?: number;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  children,
  className = "",
  hoverColor = "bg-green",
  baseColor = "bg-transparent",
  duration = 300,
  onClick,
  title,
  disabled,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      className={`relative flex items-center overflow-hidden px-4 py-1 font-medium border-2 border-green rounded-md text-sm ${baseColor} text-gray-800 hover:text-gray-50 transition-all duration-300 ease-in-out ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      <span className="relative flex items-center gap-2 z-10">{children}</span>
      <div
        className={`absolute top-0 left-0 w-0 h-full ${hoverColor} transition-all duration-300 ease-in-out hover:w-full`}
        style={{
          width: isHovered ? "100%" : 0,
          transitionDuration: `${duration}ms`,
        }}
      />
    </button>
  );
};

export default HoverButton;

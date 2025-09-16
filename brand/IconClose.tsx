import React from 'react';

interface IconCloseProps {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const IconClose: React.FC<IconCloseProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`lsg-transition ${className}`}
      style={{ color }}
    >
      <path
        d="M24 8L8 24M8 8L24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconClose;

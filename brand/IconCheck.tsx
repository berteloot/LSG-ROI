import React from 'react';

interface IconCheckProps {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}

const IconCheck: React.FC<IconCheckProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  filled = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={filled ? 'currentColor' : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      className={`lsg-transition ${className}`}
      style={{ color }}
    >
      {filled ? (
        <path
          d="M26 8L12 22L6 16"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M26 8L12 22L6 16"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default IconCheck;

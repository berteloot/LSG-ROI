import React from 'react';

interface IconArrowProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const IconArrow: React.FC<IconArrowProps> = ({
  direction = 'right',
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'up':
        return 'rotate-90';
      case 'down':
        return '-rotate-90';
      case 'left':
        return 'rotate-180';
      case 'right':
      default:
        return 'rotate-0';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`lsg-transition ${getRotation()} ${className}`}
      style={{ color }}
    >
      <path
        d="M6 16H26M26 16L18 8M26 16L18 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconArrow;

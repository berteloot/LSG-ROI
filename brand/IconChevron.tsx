import React from 'react';

interface IconChevronProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const IconChevron: React.FC<IconChevronProps> = ({
  direction = 'down',
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'up':
        return 'rotate-180';
      case 'left':
        return 'rotate-90';
      case 'right':
        return '-rotate-90';
      case 'down':
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
        d="M8 12L16 20L24 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconChevron;

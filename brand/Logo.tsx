import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'main' | 'stacked' | 'shorthand';
  size?: number;
  color?: string;
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'main',
  size = 32,
  color = 'var(--c-lean-blue)',
  className = '',
  showText = true
}) => {
  const logoStyles = {
    width: size,
    height: size,
    color: color,
  };

  const textStyles = {
    color: color,
    fontSize: `${size * 0.4}px`,
    fontWeight: 600,
    letterSpacing: '-0.025em',
  };

  const renderChevron = () => (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: color }}
      className="lsg-transition"
    >
      <path
        d="M8 12L16 20L24 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const renderMainLogo = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
        alt="Lean Solutions Group Logo"
        width={180}
        height={20}
        className="lsg-transition"
        style={{ filter: color !== 'var(--c-lean-blue)' ? 'hue-rotate(180deg) saturate(1.2)' : 'none' }}
      />
    </div>
  );

  const renderStackedLogo = () => (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Image
        src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
        alt="Lean Solutions Group Logo"
        width={size * 2}
        height={size * 0.5}
        className="lsg-transition"
      />
    </div>
  );

  const renderShorthandLogo = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
        alt="LSG Logo"
        width={size * 2.5}
        height={size * 0.6}
        className="lsg-transition"
      />
    </div>
  );

  switch (variant) {
    case 'stacked':
      return renderStackedLogo();
    case 'shorthand':
      return renderShorthandLogo();
    case 'main':
    default:
      return renderMainLogo();
  }
};

export default Logo;

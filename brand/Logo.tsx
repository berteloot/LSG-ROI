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
      <div className="flex items-center gap-2">
        <Image
          src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
          alt="Lean Solutions Group Logo"
          width={size * 2}
          height={size}
          className="lsg-transition"
          style={{ filter: color !== 'var(--c-lean-blue)' ? 'hue-rotate(180deg) saturate(1.2)' : 'none' }}
        />
      </div>
      {showText && (
        <div className="flex items-center gap-2">
          <span style={textStyles} className="font-semibold">
            Lean Solutions Group
          </span>
          <span className="text-xs" style={{ color: color, opacity: 0.7 }}>
            ®
          </span>
        </div>
      )}
    </div>
  );

  const renderStackedLogo = () => (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
          alt="Lean Solutions Group Logo"
          width={size * 1.5}
          height={size * 0.75}
          className="lsg-transition"
        />
      </div>
      {showText && (
        <div className="flex flex-col items-center">
          <span style={{ ...textStyles, fontSize: `${size * 0.35}px` }} className="font-semibold">
            Lean Solutions
          </span>
          <span style={{ ...textStyles, fontSize: `${size * 0.35}px` }} className="font-semibold">
            Group
          </span>
        </div>
      )}
    </div>
  );

  const renderShorthandLogo = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Image
          src="/LSG_Logo_Horizontal_RGB_Lean Blue.png"
          alt="LSG Logo"
          width={size * 1.2}
          height={size * 0.6}
          className="lsg-transition"
        />
      </div>
      {showText && (
        <span style={{ ...textStyles, fontSize: `${size * 0.5}px` }} className="font-bold">
          LSG
        </span>
      )}
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

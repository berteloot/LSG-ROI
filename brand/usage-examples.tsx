import React from 'react';
import Logo from './Logo';
import IconChevron from './IconChevron';
import IconArrow from './IconArrow';
import IconCheck from './IconCheck';
import IconClose from './IconClose';

// Button Components
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false
}) => {
  const baseClasses = 'lsg-transition lsg-hover-lift lsg-focus-ring font-semibold rounded-lg border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-lean-blue text-white hover:bg-momentum-blue',
    secondary: 'bg-trust-navy text-white hover:bg-midnight-core',
    accent: 'bg-solar-orange text-white hover:opacity-90',
    outline: 'border-2 border-lean-blue text-lean-blue bg-transparent hover:bg-lean-blue hover:text-white',
    ghost: 'text-lean-blue bg-transparent hover:bg-lean-blue hover:bg-opacity-10'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Card Components
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const baseClasses = 'lsg-reveal rounded-xl p-6';
  
  const variantClasses = {
    default: 'bg-paper-offwhite border border-soft-slate',
    elevated: 'bg-white shadow-lg border-0',
    outlined: 'bg-transparent border-2 border-lean-blue'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Chip Components
interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const AccentChip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'lsg-transition inline-flex items-center rounded-full font-medium';
  
  const variantClasses = {
    default: 'bg-soft-slate text-midnight-core',
    accent: 'bg-aqua-breeze text-trust-navy',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// Input Components
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  disabled = false,
  error
}) => {
  const baseClasses = 'lsg-transition w-full px-4 py-3 border-2 rounded-lg focus:outline-none lsg-focus-ring';
  const stateClasses = error 
    ? 'border-red-300 bg-red-50 focus:border-red-500' 
    : 'border-soft-slate bg-paper-offwhite focus:border-lean-blue focus:bg-white';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 lsg-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

// Badge Components
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = ''
}) => {
  const baseClasses = 'lsg-transition inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    info: 'bg-lean-blue text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Navigation Components
interface NavItemProps {
  children: React.ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  children,
  active = false,
  href,
  onClick,
  className = ''
}) => {
  const baseClasses = 'lsg-transition px-4 py-2 rounded-lg font-medium cursor-pointer';
  const stateClasses = active 
    ? 'bg-lean-blue text-white' 
    : 'text-midnight-core hover:bg-soft-slate';

  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${stateClasses} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Example Usage Component
export const BrandShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-8 bg-paper-offwhite min-h-screen">
      {/* Logo Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-midnight-core">Logo Variants</h2>
        <div className="flex flex-wrap gap-8 items-center">
          <Logo variant="main" size={48} />
          <Logo variant="stacked" size={48} />
          <Logo variant="shorthand" size={48} />
        </div>
      </section>

      {/* Button Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-midnight-core">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton variant="primary">Primary</PrimaryButton>
          <PrimaryButton variant="secondary">Secondary</PrimaryButton>
          <PrimaryButton variant="accent">Accent</PrimaryButton>
          <PrimaryButton variant="outline">Outline</PrimaryButton>
          <PrimaryButton variant="ghost">Ghost</PrimaryButton>
        </div>
      </section>

      {/* Card Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-midnight-core">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <h3 className="font-semibold text-midnight-core mb-2">Default Card</h3>
            <p className="text-midnight-core">This is a default card with subtle styling.</p>
          </Card>
          <Card variant="elevated">
            <h3 className="font-semibold text-midnight-core mb-2">Elevated Card</h3>
            <p className="text-midnight-core">This card has a shadow for emphasis.</p>
          </Card>
          <Card variant="outlined">
            <h3 className="font-semibold text-midnight-core mb-2">Outlined Card</h3>
            <p className="text-midnight-core">This card has a colored border.</p>
          </Card>
        </div>
      </section>

      {/* Icons Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-midnight-core">Icons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <IconChevron direction="down" size={32} color="var(--c-lean-blue)" />
          <IconArrow direction="right" size={32} color="var(--c-momentum-blue)" />
          <IconCheck size={32} color="var(--c-solar-orange)" />
          <IconClose size={32} color="var(--c-trust-navy)" />
        </div>
      </section>

      {/* Motion Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-midnight-core">Motion</h2>
        <div className="flex flex-wrap gap-4">
          <div className="lsg-reveal p-4 bg-lean-blue text-white rounded-lg">
            Reveal Animation
          </div>
          <div className="lsg-emphasize p-4 bg-momentum-blue text-white rounded-lg">
            Emphasize Animation
          </div>
          <div className="lsg-volume p-4 bg-trust-navy text-white rounded-lg">
            Volume Animation
          </div>
        </div>
      </section>
    </div>
  );
};

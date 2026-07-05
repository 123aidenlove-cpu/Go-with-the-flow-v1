import React, { KeyboardEvent } from 'react';
import { AudioManager } from '../../utils/audioManager';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    AudioManager.playClick();
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      AudioManager.playClick();
      if (onClick) {
        onClick();
      }
    }
  };

  // Base styles
  let baseStyle = 'inline-flex items-center justify-center font-display font-bold rounded-full transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300';
  
  if (disabled) {
    baseStyle += ' opacity-50 cursor-not-allowed pointer-events-none';
  } else {
    baseStyle += ' active:scale-95 hover:scale-[1.02]';
  }

  // Variant classes
  let variantStyle = '';
  if (variant === 'primary') {
    // Vibrant Blue with 3D drop shadow
    variantStyle = 'bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 active:border-b-0 active:mt-[4px] shadow-md';
  } else if (variant === 'secondary') {
    // Warm Accent/Orange
    variantStyle = 'bg-orange-500 hover:bg-orange-400 text-white border-b-4 border-orange-700 active:border-b-0 active:mt-[4px] shadow-md';
  } else if (variant === 'ghost') {
    // Semi-transparent / light border
    variantStyle = 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300';
  }

  // Size classes
  let sizeStyle = '';
  if (size === 'sm') {
    sizeStyle = 'px-4 py-1.5 text-sm';
  } else if (size === 'md') {
    sizeStyle = 'px-6 py-3 text-base';
  } else if (size === 'lg') {
    sizeStyle = 'px-8 py-4 text-xl tracking-wide';
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
    >
      {children}
    </button>
  );
};

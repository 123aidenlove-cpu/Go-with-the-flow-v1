import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  id,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      id={id}
      onClick={handleClick}
      className={`bg-white shadow-xl rounded-2xl border border-slate-100 p-6 ${
        onClick ? 'cursor-pointer hover:shadow-2xl transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

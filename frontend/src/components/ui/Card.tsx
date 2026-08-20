import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  isInteractive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`foundry-card overflow-hidden ${isInteractive ? 'cursor-pointer hover:border-[#106BA3]' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 py-2.5 border-b border-[#293742] bg-[#182026]/50 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2 border-t border-[#293742] bg-[#182026]/30 text-xs text-[#A7B6C2]">
          {footer}
        </div>
      )}
    </div>
  );
};

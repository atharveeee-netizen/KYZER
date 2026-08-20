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
      className={`foundry-card overflow-hidden ${isInteractive ? 'cursor-pointer hover:border-hairline-strong' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 py-2.5 border-b border-hairline bg-surface-elevated/40 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2 border-t border-hairline bg-surface-elevated/20 text-xs text-body">
          {footer}
        </div>
      )}
    </div>
  );
};

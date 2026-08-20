import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Badge, BadgeVariant } from './Badge';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  badge?: { text: string; variant: BadgeVariant };
  icon?: React.ReactNode;
  statusColor?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  badge,
  icon,
  statusColor = 'primary',
}) => {
  const colorMap = {
    primary: 'text-intent-primary',
    success: 'text-intent-success',
    warning: 'text-intent-warning',
    danger: 'text-intent-danger',
  };

  return (
    <div className="foundry-card p-4 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {badge ? (
          <Badge variant={badge.variant} size="xs">{badge.text}</Badge>
        ) : icon ? (
          <span className="text-muted">{icon}</span>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${colorMap[statusColor]}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-mono text-muted">{subValue}</div>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted border-t border-hairline pt-2">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-intent-danger" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-intent-success" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-muted" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

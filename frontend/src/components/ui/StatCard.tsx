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
    primary: 'text-[#106BA3]',
    success: 'text-[#0D8050]',
    warning: 'text-[#D9822B]',
    danger: 'text-[#C23030]',
  };

  return (
    <div className="foundry-card p-3.5 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7B6C2]">
          {label}
        </span>
        {badge ? (
          <Badge variant={badge.variant} size="xs">{badge.text}</Badge>
        ) : icon ? (
          <span className="text-[#A7B6C2]">{icon}</span>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${colorMap[statusColor]}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs font-mono text-[#A7B6C2]">{subValue}</div>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#A7B6C2] border-t border-[#293742] pt-1.5">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-[#C23030]" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-[#0D8050]" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-[#A7B6C2]" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

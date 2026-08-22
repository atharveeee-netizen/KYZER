import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ArrowLeftRight, 
  Camera, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export type NavViewId = 'command' | 'network' | 'intelligence' | 'operations' | 'scenario' | 'ingestion';

interface TacticalNavRailProps {
  activeView: NavViewId;
  onViewChange: (view: NavViewId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: NavViewId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const TacticalNavRail: React.FC<TacticalNavRailProps> = ({
  activeView,
  onViewChange,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'command',
      label: 'Overview',
      sublabel: 'District status & needs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'Facilities Map',
      sublabel: '18 centres & live routes',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'Inventory',
      sublabel: 'Batches & expiry dates',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'operations',
      label: 'Redistribution',
      sublabel: 'Nearby stock transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'ingestion',
      label: 'Logbook Scan',
      sublabel: 'Digitize paper records',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#161616] border-r border-[#393939] flex flex-col justify-between select-none transition-all duration-150 z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-none transition-colors text-left border-l-2 ${
                isActive
                  ? 'bg-[#262626] text-white border-[#0F62FE] font-medium'
                  : 'text-[#C6C6C6] hover:text-white hover:bg-[#262626]/60 border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#0F62FE]' : 'text-[#8D8D8D]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  <span className="text-[11px] text-[#8D8D8D] font-light truncate">{item.sublabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Footer */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#393939]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#8D8D8D] hover:text-white hover:bg-[#262626] rounded-none transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </nav>
  );
};

import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ArrowLeftRight, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Landmark
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
      label: 'Dashboard',
      sublabel: 'District supply status',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'Facilities Map',
      sublabel: '18 centres & transit',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'Inventory',
      sublabel: 'Stock on hand & batches',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'operations',
      label: 'Redistribution',
      sublabel: 'Peer stock transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'ingestion',
      label: 'Logbook Scan',
      sublabel: 'Paper register entry',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#FFFFFF] dark:bg-[#242424] border-r border-[#D6D6D6] dark:border-[#3A3A3A] flex flex-col justify-between select-none transition-all duration-120 z-20 shrink-0 font-sans ${
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[2px] transition-colors text-left border-l-3 ${
                isActive
                  ? 'bg-[#174A7C]/10 dark:bg-[#174A7C]/25 text-[#174A7C] dark:text-[#6EA8D8] border-[#174A7C] dark:border-[#6EA8D8] font-medium'
                  : 'text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#2D2D2D] border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#174A7C] dark:text-[#6EA8D8]' : 'text-[#70757A]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] truncate">{item.sublabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Footer */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#D6D6D6] dark:border-[#3A3A3A]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#70757A] hover:text-[#202124] dark:hover:text-white hover:bg-[#F7F7F7] dark:hover:bg-[#2D2D2D] rounded-[2px] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </nav>
  );
};

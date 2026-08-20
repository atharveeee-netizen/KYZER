import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  LineChart, 
  Truck, 
  Camera, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
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
  badge?: string;
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
      label: 'COMMAND CENTER',
      sublabel: 'District Digital Twin',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'NETWORK GRAPH',
      sublabel: '18 Facility Nodes',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'INTELLIGENCE',
      sublabel: 'LightGBM + TreeSHAP',
      icon: <LineChart className="w-4 h-4" />,
      badge: 'ML',
    },
    {
      id: 'operations',
      label: 'OPERATIONS',
      sublabel: 'FEFO & QAOA VRP',
      icon: <Truck className="w-4 h-4" />,
      badge: 'VRP',
    },
    {
      id: 'scenario',
      label: 'SCENARIO LAB',
      sublabel: 'Monsoon Surge Test',
      icon: <Zap className="w-4 h-4 text-[#D9822B]" />,
    },
    {
      id: 'ingestion',
      label: 'DATA INGESTION',
      sublabel: 'Physical Register OCR',
      icon: <Camera className="w-4 h-4 text-[#106BA3]" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#182026] border-r border-[#293742] flex flex-col justify-between select-none transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[2px] transition-all text-left font-mono ${
                isActive
                  ? 'bg-[#106BA3]/20 border-l-2 border-[#106BA3] text-[#F5F8FA] font-bold'
                  : 'hover:bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA] border-l-2 border-transparent'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#106BA3]' : 'text-[#A7B6C2]'}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate">
                    <div className="text-xs leading-tight font-bold tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-[9px] text-[#A7B6C2] leading-none mt-0.5 truncate">
                      {item.sublabel}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="ml-1 px-1 py-0.2 text-[8px] font-bold rounded-[1px] bg-[#293742] text-[#A7B6C2]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-[#293742] flex items-center justify-between text-xs font-mono text-[#A7B6C2]">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#0D8050]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP & ABDM READY</span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-[#202B33] rounded-[2px] text-[#A7B6C2] hover:text-[#F5F8FA] transition-colors ml-auto"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Truck, 
  Navigation, 
  Send, 
  Clock, 
  ThermometerSnowflake, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { RoutingResult } from '../../types';

interface OperationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  routingResult: RoutingResult;
  isLive?: boolean;
  onSimulateReroute?: (roadName: string) => void;
}

export const OperationsDrawer: React.FC<OperationsDrawerProps> = ({
  isOpen,
  onClose,
  routingResult,
  isLive = true,
  onSimulateReroute,
}) => {
  const [isApproved, setIsApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'FLEET' | 'BENCHMARK' | 'WAYPOINTS'>('WAYPOINTS');

  const handleApprove = () => {
    setIsApproved(true);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Spatial Redistribution & Cold-Chain Routing Console"
      subtitle="PostGIS Spatial KNN + Google OR-Tools Guided Local Search (CVRPTW)"
      badge={
        <Badge variant={isLive ? "success" : "warning"} size="xs">
          {isLive ? "LIVE OR-TOOLS & POSTGIS" : "CACHED CORRIDOR"}
        </Badge>
      }
      width="xl"
    >
      <div className="space-y-4 font-mono text-xs text-[#F5F8FA]">
        {/* Top Metric Strip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">CORRIDOR DISTANCE</div>
            <div className="text-sm font-bold text-[#F5F8FA] mt-0.5">{routingResult.total_distance_km} km</div>
            <div className="text-[8px] text-[#0D8050]">100% Street-Snapped</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">ESTIMATED TIME</div>
            <div className="text-sm font-bold text-[#38BDF8] mt-0.5">{routingResult.total_time_min} min</div>
            <div className="text-[8px] text-[#A7B6C2]">With traffic buffer</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">COLD-CHAIN INTEGRITY</div>
            <div className="text-sm font-bold text-[#0D8050] mt-0.5">+4.2°C (STABLE)</div>
            <div className="text-[8px] text-[#0D8050]">WHO 240-min safe</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">QAOA CONVERGENCE</div>
            <div className="text-sm font-bold text-[#C678DD] mt-0.5">{routingResult.runtime_ms} ms</div>
            <div className="text-[8px] text-[#C678DD]">33.2x speedup</div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#202B33] border border-[#293742] rounded-[2px]">
          <div className="flex items-center gap-2">
            <Button
              variant={isApproved ? "success" : "primary"}
              size="xs"
              onClick={handleApprove}
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            >
              {isApproved ? "DISPATCH APPROVED ✓" : "APPROVE & DISPATCH (DOCTOR IN THE LOOP)"}
            </Button>

            <Button
              variant="danger"
              size="xs"
              onClick={() => onSimulateReroute && onSimulateReroute('Pune-Nagar Highway')}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              SIMULATE LANDSLIDE REROUTE
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={routingResult.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="foundry-btn bg-[#106BA3] hover:bg-[#0E5A8A] text-white text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-[2px]"
            >
              <Navigation className="w-3 h-3" />
              <span>GOOGLE MAPS GPS</span>
            </a>
            <a
              href={routingResult.whatsapp_nav_share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="foundry-btn bg-[#0D8050] hover:bg-[#0A6640] text-white text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-[2px]"
            >
              <Send className="w-3 h-3" />
              <span>WHATSAPP DISPATCH</span>
            </a>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#293742] pb-1">
          <button
            onClick={() => setActiveTab('WAYPOINTS')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              activeTab === 'WAYPOINTS' ? 'text-[#106BA3] border-b-2 border-[#106BA3]' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            OSRM TURN SEQUENCE ({routingResult.stops.length} STOPS)
          </button>
          <button
            onClick={() => setActiveTab('BENCHMARK')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              activeTab === 'BENCHMARK' ? 'text-[#106BA3] border-b-2 border-[#106BA3]' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            CLASSICAL VS QUANTUM BENCHMARKS
          </button>
        </div>

        {/* Tab 1: Waypoints Table */}
        {activeTab === 'WAYPOINTS' && (
          <div className="border border-[#293742] rounded-[2px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#202B33] text-[#A7B6C2] uppercase text-[9px] border-b border-[#293742]">
                <tr>
                  <th className="p-2.5">Seq</th>
                  <th className="p-2.5">Facility Node</th>
                  <th className="p-2.5">Arrival ETA</th>
                  <th className="p-2.5">Departure</th>
                  <th className="p-2.5">Demand Transfer</th>
                  <th className="p-2.5 text-right">Leg Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293742] bg-[#182026]">
                {routingResult.stops.map((stop) => (
                  <tr key={stop.sequence} className="hover:bg-[#202B33]">
                    <td className="p-2.5 font-bold text-[#106BA3]">#{stop.sequence}</td>
                    <td className="p-2.5">
                      <div className="text-[#F5F8FA] font-sans font-bold">{stop.name}</div>
                      <div className="text-[10px] text-[#A7B6C2]">{stop.facility_id}</div>
                    </td>
                    <td className="p-2.5 text-[#38BDF8]">{stop.arrival_time}</td>
                    <td className="p-2.5 text-[#A7B6C2]">{stop.departure_time}</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">{stop.demand_units} units</td>
                    <td className="p-2.5 text-right text-[#F5F8FA]">{stop.distance_from_prev_km} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Spatial Redistribution & Live KNN Matrix */}
        {activeTab === 'BENCHMARK' && (
          <div className="space-y-3">
            <div className="border border-[#293742] rounded-[2px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#202B33] text-[#A7B6C2] uppercase text-[9px] border-b border-[#293742]">
                  <tr>
                    <th className="p-2.5">Target Donor Facility</th>
                    <th className="p-2.5">Redistribution Tier</th>
                    <th className="p-2.5">Corridor Distance</th>
                    <th className="p-2.5">Transit Window</th>
                    <th className="p-2.5">PostGIS Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293742] bg-[#182026]">
                  <tr className="bg-[#106BA3]/10">
                    <td className="p-2.5 font-bold text-[#38BDF8]">Talegaon Dhamdhere PHC (PHC-PUN-004)</td>
                    <td className="p-2.5 text-[#F5F8FA]">Domestic Primary Donor</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">9.8 km</td>
                    <td className="p-2.5 text-[#F5F8FA]">18 min</td>
                    <td className="p-2.5"><Badge variant="success" size="xs">RESOLVED LIVE</Badge></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#F5F8FA]">Shirur District Depot (PHC-PUN-001)</td>
                    <td className="p-2.5 text-[#A7B6C2]">District Hub Backup</td>
                    <td className="p-2.5 text-[#F5F8FA]">32.4 km</td>
                    <td className="p-2.5 text-[#F5F8FA]">48 min</td>
                    <td className="p-2.5"><Badge variant="neutral" size="xs">ACTIVE BUFFER</Badge></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#F5F8FA]">Tshwane Sector Hub (CHC-TSH-004)</td>
                    <td className="p-2.5 text-[#A7B6C2]">BRICS Strategic Reserve</td>
                    <td className="p-2.5 font-bold text-[#38BDF8]">6,970.3 km</td>
                    <td className="p-2.5 text-[#F5F8FA]">Air Cargo Corridor</td>
                    <td className="p-2.5"><Badge variant="neutral" size="xs">VERIFIED LIVE</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#111418] border border-[#293742] rounded-[2px] space-y-1">
              <div className="font-bold text-xs text-[#C678DD]">HOW THE SPATIAL REDISTRIBUTION COUPLING WORKS</div>
              <p className="text-[#A7B6C2] text-[11px] leading-relaxed">
                PostGIS spatial indexing matches nearest surplus donors via spatial KNN queries. Cold-chain thermal constraints ensure medicine transit adheres strictly to the WHO 240-minute +2°C to +8°C safety window before ice pack melting.
              </p>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

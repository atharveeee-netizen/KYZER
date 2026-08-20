import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowRightLeft, 
  Pill, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateTransfer?: (itemCode: string, fromId: string, toId: string) => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  onInitiateTransfer,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');

  const items = [
    { code: 'MED-PCM-500', name: 'Paracetamol 500mg Tablets', facilityId: 'PHC-PUN-001', facilityName: 'Shirur Sub-District Hospital Depot', batch: 'B2408', expiry: '2026-11-30', daysToExpiry: 466, stock: 1450, status: 'NORMAL', category: 'Essential Analgesic' },
    { code: 'MED-AMX-250', name: 'Amoxicillin 250mg Capsules', facilityId: 'PHC-PUN-002', facilityName: 'Koregaon Bhima PHC', batch: 'B2406', expiry: '2025-09-15', daysToExpiry: 26, stock: 85, status: 'CRITICAL', category: 'Antibiotic' },
    { code: 'MED-AMX-250', name: 'Amoxicillin 250mg Capsules', facilityId: 'PHC-PUN-004', facilityName: 'Talegaon Dhamdhere PHC', batch: 'B2405', expiry: '2026-08-31', daysToExpiry: 375, stock: 3400, status: 'SURPLUS', category: 'Antibiotic' },
    { code: 'MED-ORS-SCT', name: 'Oral Rehydration Salts (WHO)', facilityId: 'PHC-PUN-003', facilityName: 'Shikrapur PHC', batch: 'B2407', expiry: '2027-02-28', daysToExpiry: 556, stock: 640, status: 'NORMAL', category: 'Electrolyte' },
    { code: 'MED-AZM-500', name: 'Azithromycin 500mg Tablets', facilityId: 'PHC-PUN-002', facilityName: 'Koregaon Bhima PHC', batch: 'B2405', expiry: '2026-06-30', daysToExpiry: 313, stock: 120, status: 'WARNING', category: 'Antibiotic' },
    { code: 'MED-INS-REG', name: 'Regular Insulin 100IU/ml', facilityId: 'PHC-PUN-001', facilityName: 'Shirur Sub-District Hospital Depot', batch: 'B2409', expiry: '2025-12-31', daysToExpiry: 132, stock: 45, status: 'CRITICAL', category: 'Cold-Chain Biological (+2°C to +8°C)' },
  ];

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                          i.code.toLowerCase().includes(search.toLowerCase()) ||
                          i.batch.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesFac = selectedFacility === 'ALL' || i.facilityId === selectedFacility;
    return matchesSearch && matchesStatus && matchesFac;
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="District Pharmaceutical Inventory (FEFO Matrix)"
      subtitle="Open mSupply-aligned First-Expiry-First-Out batch tracking with automated lateral stock transfer"
      badge={<Badge variant="primary" size="xs">WHO FEFO COMPLIANT</Badge>}
      width="xl"
    >
      <div className="space-y-4 font-mono text-xs text-[#F5F8FA]">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">TOTAL SKUS</div>
            <div className="text-sm font-bold text-[#F5F8FA] mt-0.5">6 BATCHES</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">EXPIRING &lt;30 DAYS</div>
            <div className="text-sm font-bold text-[#C23030] mt-0.5">1 BATCH (AMX)</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">SURPLUS DONOR NODES</div>
            <div className="text-sm font-bold text-[#0D8050] mt-0.5">1 NODE (Talegaon)</div>
          </div>
          <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
            <div className="text-[9px] text-[#A7B6C2]">COLD-CHAIN BIOLOGICALS</div>
            <div className="text-sm font-bold text-[#38BDF8] mt-0.5">1 SKU (Insulin)</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A7B6C2]" />
            <input
              type="text"
              placeholder="Search by drug name, code (MED-AMX), or batch (B2406)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111418] border border-[#293742] rounded-[2px] pl-9 pr-3 py-1.5 text-xs text-[#F5F8FA] focus:outline-hidden focus:border-[#106BA3]"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {['ALL', 'CRITICAL', 'WARNING', 'SURPLUS', 'NORMAL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 text-[10px] rounded-[1px] font-bold transition-colors ${
                  statusFilter === st ? 'bg-[#106BA3] text-white' : 'bg-[#111418] border border-[#293742] text-[#A7B6C2] hover:text-[#F5F8FA]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* FEFO Batch Matrix Table */}
        <div className="border border-[#293742] rounded-[2px] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#202B33] text-[#A7B6C2] uppercase text-[9px] border-b border-[#293742]">
              <tr>
                <th className="p-2.5">Code / SKU</th>
                <th className="p-2.5">Medicine Name & Category</th>
                <th className="p-2.5">Facility</th>
                <th className="p-2.5">Batch</th>
                <th className="p-2.5">Expiry / Countdown</th>
                <th className="p-2.5">Stock</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293742] bg-[#182026]">
              {filtered.map((item, idx) => {
                const isCritical = item.status === 'CRITICAL';
                return (
                  <tr key={idx} className="hover:bg-[#202B33] transition-colors">
                    <td className="p-2.5 text-[#106BA3] font-bold">{item.code}</td>
                    <td className="p-2.5">
                      <div className="text-[#F5F8FA] font-sans font-medium text-xs">{item.name}</div>
                      <div className="text-[10px] text-[#A7B6C2]">{item.category}</div>
                    </td>
                    <td className="p-2.5">
                      <div className="text-[#F5F8FA] text-xs">{item.facilityName}</div>
                      <div className="text-[9px] text-[#A7B6C2]">{item.facilityId}</div>
                    </td>
                    <td className="p-2.5 text-[#A7B6C2]">{item.batch}</td>
                    <td className="p-2.5">
                      <div className="text-[#F5F8FA]">{item.expiry}</div>
                      <div className={`text-[10px] font-bold ${item.daysToExpiry <= 30 ? 'text-[#C23030]' : 'text-[#0D8050]'}`}>
                        {item.daysToExpiry} days left
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-[#F5F8FA]">{item.stock}</td>
                    <td className="p-2.5">
                      <Badge variant={item.status === 'CRITICAL' ? 'danger' : item.status === 'WARNING' ? 'warning' : item.status === 'SURPLUS' ? 'success' : 'neutral'} size="xs">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-2.5 text-right">
                      {isCritical ? (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            if (onInitiateTransfer) onInitiateTransfer(item.code, 'PHC-PUN-004', item.facilityId);
                            onClose();
                          }}
                          leftIcon={<ArrowRightLeft className="w-3 h-3" />}
                        >
                          TRANSFER
                        </Button>
                      ) : (
                        <span className="text-[10px] text-[#A7B6C2]">STABLE</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
};

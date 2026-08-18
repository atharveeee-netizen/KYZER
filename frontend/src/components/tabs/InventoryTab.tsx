import React, { useState } from 'react';
import { Search, Filter, ArrowRightLeft, ShieldCheck, AlertCircle, CheckCircle2, Pill } from 'lucide-react';
import { HealthFacility } from '../../types';

interface InventoryTabProps {
  facilities: HealthFacility[];
}

interface InventoryRow {
  id: string;
  item_code: string;
  item_name: string;
  facility_id: string;
  facility_name: string;
  batch_number: string;
  stock_quantity: number;
  expiry_date: string;
  status: 'CRITICAL' | 'WARNING' | 'SURPLUS' | 'NORMAL';
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ facilities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('ALL');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Generate realistic inventory rows across facilities
  const inventoryData: InventoryRow[] = [
    {
      id: 'inv-1',
      item_code: 'MED-PCM-500',
      item_name: 'Paracetamol 500mg Tablets',
      facility_id: 'PHC-PUN-001',
      facility_name: 'PHC Shirur',
      batch_number: 'B2408',
      stock_quantity: 145,
      expiry_date: '2026-11-30',
      status: 'CRITICAL'
    },
    {
      id: 'inv-2',
      item_code: 'MED-PCM-500',
      item_name: 'Paracetamol 500mg Tablets',
      facility_id: 'PHC-PUN-002',
      facility_name: 'PHC Khed',
      batch_number: 'B2404',
      stock_quantity: 2450,
      expiry_date: '2026-10-15',
      status: 'SURPLUS'
    },
    {
      id: 'inv-3',
      item_code: 'MED-AMX-250',
      item_name: 'Amoxicillin 250mg Capsules',
      facility_id: 'PHC-PUN-001',
      facility_name: 'PHC Shirur',
      batch_number: 'B2406',
      stock_quantity: 320,
      expiry_date: '2026-09-30',
      status: 'WARNING'
    },
    {
      id: 'inv-4',
      item_code: 'MED-ORS-SFT',
      item_name: 'ORS Electrolyte Sachet (WHO)',
      facility_id: 'PHC-PUN-003',
      facility_name: 'PHC Junnar',
      batch_number: 'B2407',
      stock_quantity: 85,
      expiry_date: '2027-01-15',
      status: 'CRITICAL'
    },
    {
      id: 'inv-5',
      item_code: 'MED-PCM-500',
      item_name: 'Paracetamol 500mg Tablets',
      facility_id: 'DH-DEPOT-001',
      facility_name: 'Aundh Central Depot',
      batch_number: 'B2401',
      stock_quantity: 25000,
      expiry_date: '2027-06-30',
      status: 'NORMAL'
    }
  ];

  const filtered = inventoryData.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFac = selectedFacilityFilter === 'ALL' || item.facility_id === selectedFacilityFilter;
    return matchesSearch && matchesFac;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
            First-Expiry-First-Out (FEFO) Database
          </span>
          <h1 className="text-2xl font-display text-ink mt-1">Multi-Facility Pharmaceutical Inventory</h1>
          <p className="text-xs text-muted">
            Audits batch expiries, cold-chain compliance, and triggers automated stock rebalancing.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-active text-white text-xs font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Manual Reallocate</span>
        </button>
      </div>

      {transferSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-xs text-semantic-success font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Stock transfer of 500 units from PHC Khed ➔ PHC Shirur queued for driver dispatch!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-card border border-hairline rounded-lg p-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search medicine name, item code (e.g. MED-PCM-500), or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-canvas-soft border border-hairline rounded-md pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
          <select
            value={selectedFacilityFilter}
            onChange={(e) => setSelectedFacilityFilter(e.target.value)}
            className="bg-canvas-soft border border-hairline rounded-md px-3 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="ALL">All Facilities (18)</option>
            {facilities.map(f => (
              <option key={f.facility_id} value={f.facility_id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-surface-card border border-hairline rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-hairline font-mono text-[10px] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Item Code</th>
                <th className="px-4 py-3 font-medium">Medicine Name</th>
                <th className="px-4 py-3 font-medium">Facility</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Expiry Date (FEFO)</th>
                <th className="px-4 py-3 font-medium">Current Stock</th>
                <th className="px-4 py-3 font-medium">Risk Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline font-mono text-xs text-ink">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-canvas-soft/60 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-primary">{item.item_code}</td>
                  <td className="px-4 py-3.5 font-sans text-body font-medium">{item.item_name}</td>
                  <td className="px-4 py-3.5 font-sans text-muted">{item.facility_name}</td>
                  <td className="px-4 py-3.5 text-muted">{item.batch_number}</td>
                  <td className="px-4 py-3.5 text-muted">{item.expiry_date}</td>
                  <td className="px-4 py-3.5 font-bold text-ink">{item.stock_quantity.toLocaleString()} units</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-pill font-semibold ${
                        item.status === 'CRITICAL'
                          ? 'bg-red-100 text-semantic-error'
                          : item.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'SURPLUS'
                          ? 'bg-green-100 text-semantic-success'
                          : 'bg-surface-strong text-muted'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="px-2.5 py-1 bg-surface-card hover:bg-canvas-soft border border-hairline rounded-md text-ink font-sans text-[11px] font-medium transition-colors"
                    >
                      Reallocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-canvas border-t border-hairline text-[11px] text-muted flex items-center justify-between font-sans">
          <span>Displaying {filtered.length} medicine records across district inventory.</span>
          <span className="font-mono text-ink">FEFO Algorithm Active</span>
        </div>
      </div>

      {/* Transfer Stock Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-hairline rounded-lg max-w-md w-full p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              <h3 className="text-base font-display text-ink">Reallocate Emergency Stock</h3>
            </div>
            <p className="text-xs text-body">
              Transfer verified surplus medicines from donor clinics to prevent stockouts while maintaining the 1.5x safety stock guardrail.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-muted block mb-1">Donor Facility (Surplus)</label>
                <select className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-xs font-mono text-ink">
                  <option>PHC Khed (Surplus: 2,450 units | Buffer: 1.8x)</option>
                  <option>Aundh Central Depot (Surplus: 25,000 units)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted block mb-1">Recipient Facility (Deficit)</label>
                <select className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-xs font-mono text-ink">
                  <option>PHC Shirur (P0 Critical: 145 units left)</option>
                  <option>PHC Junnar (P1 Warning: 310 units left)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted block mb-1">Transfer Quantity (Units)</label>
                <input
                  type="number"
                  defaultValue={500}
                  className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-xs font-mono text-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-3 py-1.5 text-xs text-body hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferSuccess(true);
                }}
                className="bg-primary hover:bg-primary-active text-white text-xs font-medium px-4 py-1.5 rounded-md"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

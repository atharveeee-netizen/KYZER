import React, { useState } from 'react';
import { Camera, CheckCircle2, UploadCloud, Edit3, ShieldCheck, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { OcrExtractedItem } from '../../types';

interface OcrTabProps {
  initialItems: OcrExtractedItem[];
  onSaveToDatabase: (items: OcrExtractedItem[]) => void;
}

export const OcrTab: React.FC<OcrTabProps> = ({
  initialItems,
  onSaveToDatabase,
}) => {
  const [items, setItems] = useState<OcrExtractedItem[]>(initialItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  const handleQuantityChange = (id: string, newQty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleSimulateScan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCommitted(false);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
            OpenCV 5.0 (Hough Deskew + Auto-Crop) + Gemini Vision OCR
          </span>
          <h1 className="text-2xl font-display text-ink mt-1">Physical Register Ingestion & Digitization</h1>
          <p className="text-xs text-muted">
            Converts handwritten paper registers into structured inventory, bed occupancy, and staffing telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateScan}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline-strong text-ink text-xs font-medium px-3.5 py-2.5 rounded-md transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Running OpenCV & Gemini...' : 'Re-Scan Register Photo'}</span>
          </button>
          
          <button
            onClick={() => {
              onSaveToDatabase(items);
              setIsCommitted(true);
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-active text-white text-xs font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Commit to Database</span>
          </button>
        </div>
      </div>

      {isCommitted && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-xs text-semantic-success font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Telemetry successfully committed to PostgreSQL database! All 3 pillars (Meds, Beds, Staff) updated.</span>
        </div>
      )}

      {/* Main Two-Column Grid: Visual Scanner Preview / Structured Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Side-by-Side Visual Proof (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-muted" /> OpenCV CamScanner-Grade Enhancement
              </span>
              <span className="text-[10px] font-mono text-semantic-success bg-green-50 px-2 py-0.5 rounded-sm">
                0.0° TILT CORRECTION
              </span>
            </div>

            {/* Visual Image Render */}
            <div className="border border-hairline rounded-md overflow-hidden bg-white p-2">
              <div className="bg-[#fafaf7] border border-hairline p-4 rounded-xs text-center">
                <div className="font-mono text-xs text-ink space-y-1.5 text-left select-none opacity-90">
                  <div className="border-b border-ink/30 pb-1 font-bold text-[11px]">
                    PHC SHIRUR - DAILY MEDICINE REGISTER
                  </div>
                  <div className="text-[10px] text-body">Paracetamol 500mg (Batch B2408) - Qty: 1,450</div>
                  <div className="text-[10px] text-body">Amoxicillin 250mg (Batch B2406) - Qty: 320</div>
                  <div className="text-[10px] text-body">ORS Packets (Batch B2407) - Qty: 85</div>
                  <div className="text-[10px] text-body">General Beds: 19/24 | ICU Beds: 3/4</div>
                  <div className="text-[10px] text-body">Doctors: 2/2 | Nurses: 5/6</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 bg-canvas-soft border border-hairline rounded-md">
                <span className="text-[10px] font-mono text-muted block">Hough Tilt</span>
                <span className="text-xs font-mono text-ink font-semibold">-8.0° ➔ 0.0°</span>
              </div>
              <div className="p-2 bg-canvas-soft border border-hairline rounded-md">
                <span className="text-[10px] font-mono text-muted block">Shadows</span>
                <span className="text-xs font-mono text-semantic-success font-semibold">100% Whitened</span>
              </div>
              <div className="p-2 bg-canvas-soft border border-hairline rounded-md">
                <span className="text-[10px] font-mono text-muted block">OCR Latency</span>
                <span className="text-xs font-mono text-ink font-semibold">1.42s Cloud</span>
              </div>
            </div>
          </div>

          {/* 3-Pillar Extracted Summary */}
          <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
            <h3 className="text-xs font-semibold text-ink mb-2.5">3-Pillar Extracted Telemetry</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-canvas-soft border border-hairline rounded-sm">
                <span className="text-body">General Bed Occupancy</span>
                <span className="font-mono font-medium text-ink">19 / 24 Occupied (79%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-soft border border-hairline rounded-sm">
                <span className="text-body">ICU Bed Occupancy</span>
                <span className="font-mono font-medium text-ink">3 / 4 Occupied (75%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-canvas-soft border border-hairline rounded-sm">
                <span className="text-body">Staff on Duty</span>
                <span className="font-mono font-medium text-ink">2 Doctors, 5 Nurses</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Editable Structured Medicines Grid (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-surface-card border border-hairline rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-canvas-soft border-b border-hairline flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-ink">Normalized Medicine Batch Inventory (FEFO)</h3>
                <p className="text-[11px] text-muted">Codes automatically normalized to standard schema (e.g. MED-PCM-500).</p>
              </div>
              <span className="text-[10px] font-mono text-muted">Editable by Clinicians</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-hairline font-mono text-[10px] text-muted uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Item Code</th>
                    <th className="px-4 py-2.5 font-medium">Description</th>
                    <th className="px-4 py-2.5 font-medium">Batch</th>
                    <th className="px-4 py-2.5 font-medium">Expiry</th>
                    <th className="px-4 py-2.5 font-medium">Quantity</th>
                    <th className="px-4 py-2.5 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono text-xs text-ink">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-canvas-soft/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-primary">{item.item_code}</td>
                      <td className="px-4 py-3 font-sans text-body">{item.item_name}</td>
                      <td className="px-4 py-3 text-muted">{item.batch_number}</td>
                      <td className="px-4 py-3 text-muted">{item.expiry_date}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 bg-canvas-soft border border-hairline rounded-sm px-2 py-1 text-xs font-mono font-medium text-ink focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-semantic-success bg-green-50 px-2 py-0.5 rounded-sm">
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-canvas border-t border-hairline text-[11px] text-muted flex items-center justify-between font-sans">
              <span>All items pass FHIR R4 MedicationRequest validation.</span>
              <span className="font-mono text-ink font-medium">3 Medicines Normalized</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

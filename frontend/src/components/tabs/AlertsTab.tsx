import React, { useState } from 'react';
import { Bell, Volume2, Play, CheckCircle2, Phone, MessageSquare, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { SystemAlert } from '../../types';

interface AlertsTabProps {
 alerts: SystemAlert[];
 onAcknowledgeAlert: (id: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
 alerts,
 onAcknowledgeAlert,
}) => {
 const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
 const [selectedLanguage, setSelectedLanguage] = useState<'mr' | 'hi' | 'en'>('mr');

 const handleToggleAudio = (id: string, text: string) => {
 if (playingAudioId === id) {
 window.speechSynthesis?.cancel();
 setPlayingAudioId(null);
 return;
 }

 setPlayingAudioId(id);
 if ('speechSynthesis' in window) {
 window.speechSynthesis.cancel();
 const utterance = new SpeechSynthesisUtterance(text);
 if (selectedLanguage === 'hi' || selectedLanguage === 'mr') {
 utterance.lang = 'hi-IN';
 } else {
 utterance.lang = 'en-IN';
 }
 utterance.rate = 0.9; // Low-literacy friendly pace
 utterance.onend = () => setPlayingAudioId(null);
 utterance.onerror = () => setPlayingAudioId(null);
 window.speechSynthesis.speak(utterance);
 } else {
 setTimeout(() => setPlayingAudioId(null), 3000);
 }
 };

 return (
 <div className="p-6 max-w-7xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
 <div>
 <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
 Server-Sent Events (SSE) + Web Audio Multilingual API
 </span>
 <h1 className="text-2xl font-display text-ink mt-1">Real-Time Emergency Stockout Alert Feed</h1>
 <p className="text-xs text-muted">
 Live automated dispatch notifications with synthesized Marathi, Hindi, and English voice notes for frontline staff.
 </p>
 </div>

 {/* Language Selection Pills */}
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted font-mono">Voice Language:</span>
 <div className="flex items-center bg-canvas-soft border border-hairline rounded-md p-0.5 text-xs">
 <button
 onClick={() => setSelectedLanguage('mr')}
 className={`px-2.5 py-1 rounded-xs transition-colors ${
 selectedLanguage === 'mr' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
 }`}
 >
 मराठी (MR)
 </button>
 <button
 onClick={() => setSelectedLanguage('hi')}
 className={`px-2.5 py-1 rounded-xs transition-colors ${
 selectedLanguage === 'hi' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
 }`}
 >
 हिन्दी (HI)
 </button>
 <button
 onClick={() => setSelectedLanguage('en')}
 className={`px-2.5 py-1 rounded-xs transition-colors ${
 selectedLanguage === 'en' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
 }`}
 >
 English (EN)
 </button>
 </div>
 </div>
 </div>

 {/* Alert Stream List */}
 <div className="space-y-4">
 {alerts.map((alert) => {
 const isPlaying = playingAudioId === alert.id;
 const activeText =
 selectedLanguage === 'mr'
 ? alert.description_mr
 : selectedLanguage === 'hi'
 ? alert.description_hi
 : alert.description_en;

 return (
 <div
 key={alert.id}
 className={`p-5 rounded-lg border bg-surface-card transition-all ${
 alert.severity === 'P0'
 ? 'border-red-200 shadow-xs'
 : 'border-hairline shadow-xs'
 }`}
 >
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
 <div className="flex items-start gap-3">
 <div
 className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
 alert.severity === 'P0'
 ? 'bg-red-50 text-semantic-error'
 : 'bg-amber-50 text-amber-600'
 }`}
 >
 <ShieldAlert className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span
 className={`text-[10px] font-mono px-2 py-0.5 rounded-pill font-bold ${
 alert.severity === 'P0'
 ? 'bg-red-100 text-semantic-error'
 : 'bg-amber-100 text-amber-800'
 }`}
 >
 {alert.severity} CRITICAL ALERT
 </span>
 <span className="text-xs font-mono text-muted">{alert.facility_name}</span>
 <span className="text-[11px] font-mono text-muted-soft"> {alert.timestamp}</span>
 </div>
 <h2 className="text-base font-semibold text-ink">{alert.title}</h2>
 </div>
 </div>

 {/* Audio Playback Button */}
 <button
 onClick={() => handleToggleAudio(alert.id, activeText)}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-colors shrink-0 ${
 isPlaying
 ? 'bg-primary text-white shadow-xs'
 : 'bg-canvas-soft hover:bg-surface-strong border border-hairline text-ink'
 }`}
 >
 <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
 <span>{isPlaying ? 'Playing Audio...' : `Play Voice Note (${selectedLanguage.toUpperCase()})`}</span>
 </button>
 </div>

 {/* Dynamic Multilingual Body */}
 <div className="bg-canvas-soft border border-hairline rounded-md p-3.5 mb-4 text-xs leading-relaxed text-body font-sans">
 <p>{activeText}</p>
 </div>

 {/* Action Bar */}
 <div className="flex items-center justify-between pt-2 border-t border-hairline text-xs">
 <div className="flex items-center gap-4 text-muted font-mono text-[11px]">
 <span>Facility ID: {alert.facility_id}</span>
 <span>Dispatched: WhatsApp + SMS</span>
 </div>

 <div className="flex items-center gap-2">
 <a
 href="https://api.whatsapp.com"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline rounded-md text-ink font-medium transition-colors"
 >
 <MessageSquare className="w-3.5 h-3.5 text-semantic-success" />
 <span>WhatsApp</span>
 </a>

 {!alert.acknowledged ? (
 <button
 onClick={() => onAcknowledgeAlert(alert.id)}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-ink hover:bg-black text-canvas rounded-md font-medium transition-colors"
 >
 <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
 <span>Acknowledge</span>
 </button>
 ) : (
 <span className="text-[11px] font-mono text-semantic-success flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
 </span>
 )}
 </div>
 </div>

 </div>
 );
 })}
 </div>

 </div>
 );
};

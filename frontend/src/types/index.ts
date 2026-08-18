export type CountryCode = 'IND' | 'ZAF' | 'BRA';

export type RiskTier = 'P0_CRITICAL' | 'P1_WARNING' | 'P2_SURPLUS' | 'P3_NORMAL';

export interface HealthFacility {
 facility_id: string;
 name: string;
 country: CountryCode;
 district: string;
 latitude: number;
 longitude: number;
 facility_type: 'DISTRICT_HOSPITAL' | 'PRIMARY_HEALTH_CENTRE' | 'COMMUNITY_HEALTH_CENTRE';
 total_beds: number;
 occupied_beds: number;
 icu_beds_total: number;
 icu_beds_occupied: number;
 doctors_present: number;
 nurses_present: number;
 current_stock_pcm500: number;
 days_to_stockout: number;
 risk_tier: RiskTier;
 cascade_risk_score: number;
}

export interface ForecastDay {
 day: string;
 p10: number;
 p50: number;
 p90: number;
}

export interface ShapDriver {
 feature_name: string;
 shap_value: number;
 readable_desc: string;
 direction: 'UP' | 'DOWN';
}

export interface RouteStop {
 sequence: number;
 facility_id: string;
 name: string;
 arrival_time: string;
 departure_time: string;
 demand_units: number;
 distance_from_prev_km: number;
}

export interface RoutingResult {
 scale_tier: string;
 algorithm: string;
 total_distance_km: number;
 total_time_min: number;
 cold_chain_compliant: boolean;
 runtime_ms: number;
 stops: RouteStop[];
 google_maps_url: string;
 whatsapp_nav_share_url: string;
 quantum_mode: string;
}

export type TimelinePillType = 'thinking' | 'grep' | 'read' | 'edit' | 'done';

export interface AgentTimelineStep {
 id: string;
 agent_name: string;
 pill_type: TimelinePillType;
 pill_label: string;
 action_summary: string;
 telemetry_code: string;
 elapsed_ms: number;
 status: 'PENDING' | 'RUNNING' | 'COMPLETED';
}

export interface OcrExtractedItem {
 id: string;
 item_code: string;
 item_name: string;
 batch_number: string;
 quantity: number;
 expiry_date: string;
 confidence: number;
}

export interface SystemAlert {
 id: string;
 facility_id: string;
 facility_name: string;
 severity: 'P0' | 'P1' | 'P2';
 timestamp: string;
 title: string;
 description_en: string;
 description_mr: string;
 description_hi: string;
 audio_url_mr?: string;
 audio_url_hi?: string;
 acknowledged: boolean;
}

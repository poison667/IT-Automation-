export type ViewTab = 
  | 'dashboard'
  | 'marketplace'
  | 'jobs'
  | 'assets'
  | 'monitoring'
  | 'data'
  | 'documents'
  | 'analytics'
  | 'automations'
  | 'ai'
  | 'reports'
  | 'billing'
  | 'settings';

export type ServiceCategory = 
  | 'ALL'
  | 'WEBSITE'
  | 'SEO'
  | 'PERFORMANCE'
  | 'ACCESSIBILITY'
  | 'SECURITY'
  | 'DATA'
  | 'DOCUMENTS'
  | 'ANALYTICS'
  | 'AI';

export interface ServiceDefinition {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  tier: 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE';
  cost_credits: number;
  estimated_runtime_sec: number;
  authorization_required: boolean;
  inputs_schema: {
    type: string;
    required?: string[];
    properties?: Record<string, {
      type: string;
      title?: string;
      default?: any;
      enum?: string[];
      format?: string;
      minimum?: number;
      maximum?: number;
    }>;
  };
}

export interface Job {
  id: string;
  service_id: string;
  asset_id?: string;
  status: 'QUEUED' | 'RUNNING' | 'ANALYZING' | 'QUALITY_CHECK' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress_pct: number;
  current_stage: string;
  execution_cost: number;
  input_params: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: 'URL' | 'DOMAIN' | 'API_ENDPOINT' | 'DATASET';
  target_uri: string;
  is_verified: boolean;
  verification_token: string;
  created_at: string;
}

export interface MonitoringCheck {
  id: string;
  name: string;
  check_type: 'HTTP' | 'SSL' | 'DNS' | 'DOM' | 'API';
  target_url: string;
  interval_seconds: number;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'PAUSED';
  uptime_pct: number;
  latency_p95_ms: number;
  last_check_at?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  root_cause?: string;
  started_at: string;
  resolved_at?: string;
}

export interface ReportItem {
  id: string;
  job_id: string;
  title: string;
  category: string;
  summary: Record<string, any>;
  integrity_sha256: string;
  created_at: string;
}

export interface UserContext {
  id: string;
  email: string;
  full_name: string;
  role: string;
  org_id: string;
  org_name: string;
  plan: string;
  credit_balance: number;
}

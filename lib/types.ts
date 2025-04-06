export interface Shift {
  id: string;
  shift_name: string;
  shift_timing: string;
  created_at: string;
}

export interface Line {
  id: string;
  line: string;
  created_at: string;
}

export interface MachineSpeed {
  id: string;
  size: string;
  speed: number;
  created_at: string;
}

export interface DowntimeReason {
  id: string;
  delaytype: string;
  delayhead: string;
  delaydescription: string | null;
  created_at: string;
}

export interface ProductDetails {
  id: string;
  product_description: string;
  product_code: string;
  created_at: string;
}

export interface Operator {
  id: string;
  operator_name: string;
  assistant_operator: string | null;
  shift_id: string;
  role: string;
}

export interface ProductionData {
  id: string;
  line: string;
  size: string;
  product_id: string;
  machine_speed_id: string;
  operator_id: string;
  assistant_operator_id: string | null;
  rm_operator1_id: string | null;
  rm_operator2_id: string | null;
  shift_incharge_id: string | null;
  quality_operator_id: string | null;
  shift_id: string;
  line_id: string;
  planned_start: string;
  planned_end: string;
  ideal_cycle_time: number;
  actual_cycle_time: number;
  theoretical_production_count: number;
  good_production_count: number;
  machine_waste: number;
  manual_waste: number;
  actual_production: number;
}

export interface Downtime {
  id: string;
  production_data_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  delay_reason_id: string;
  is_planned: boolean;
}

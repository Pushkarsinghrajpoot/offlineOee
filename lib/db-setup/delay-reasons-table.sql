-- Create delay_types table
CREATE TABLE IF NOT EXISTS delay_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delay_heads table
CREATE TABLE IF NOT EXISTS delay_heads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  head_name TEXT UNIQUE NOT NULL,
  delay_type_id UUID REFERENCES delay_types(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delay_reasons table
CREATE TABLE IF NOT EXISTS delay_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason_name TEXT UNIQUE NOT NULL,
  delay_head_id UUID REFERENCES delay_heads(id),
  delay_type_id UUID REFERENCES delay_types(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delay_heads_type_id ON delay_heads(delay_type_id);
CREATE INDEX IF NOT EXISTS idx_delay_reasons_head_id ON delay_reasons(delay_head_id);
CREATE INDEX IF NOT EXISTS idx_delay_reasons_type_id ON delay_reasons(delay_type_id);

-- Insert initial data for delay types
INSERT INTO delay_types (type_name)
VALUES 
  ('Planned'),
  ('Unplanned'),
  ('Maintenance'),
  ('Quality Check'),
  ('Plant Shutdown')
ON CONFLICT (type_name) DO NOTHING;

-- Insert initial data for delay heads (with their corresponding types)
WITH 
  planned_id AS (SELECT id FROM delay_types WHERE type_name = 'Planned'),
  unplanned_id AS (SELECT id FROM delay_types WHERE type_name = 'Unplanned'),
  maintenance_id AS (SELECT id FROM delay_types WHERE type_name = 'Maintenance'),
  quality_id AS (SELECT id FROM delay_types WHERE type_name = 'Quality Check'),
  shutdown_id AS (SELECT id FROM delay_types WHERE type_name = 'Plant Shutdown')
INSERT INTO delay_heads (head_name, delay_type_id)
VALUES 
  -- Planned heads
  ('Production', (SELECT id FROM planned_id)),
  ('Maintenance', (SELECT id FROM planned_id)),
  ('Quality', (SELECT id FROM planned_id)),
  ('Management', (SELECT id FROM planned_id)),
  
  -- Unplanned heads
  ('Machine', (SELECT id FROM unplanned_id)),
  ('Material', (SELECT id FROM unplanned_id)),
  ('Personnel', (SELECT id FROM unplanned_id)),
  ('External', (SELECT id FROM unplanned_id)),
  
  -- Maintenance heads
  ('Preventive', (SELECT id FROM maintenance_id)),
  ('Corrective', (SELECT id FROM maintenance_id)),
  ('Predictive', (SELECT id FROM maintenance_id)),
  ('Emergency', (SELECT id FROM maintenance_id)),
  
  -- Quality Check heads
  ('Process', (SELECT id FROM quality_id)),
  ('Product', (SELECT id FROM quality_id)),
  ('Material', (SELECT id FROM quality_id)),
  ('Equipment', (SELECT id FROM quality_id)),
  
  -- Plant Shutdown heads
  ('Scheduled', (SELECT id FROM shutdown_id)),
  ('Emergency', (SELECT id FROM shutdown_id)),
  ('Regulatory', (SELECT id FROM shutdown_id)),
  ('Utility', (SELECT id FROM shutdown_id))
ON CONFLICT (head_name) DO NOTHING;

-- Insert initial data for delay reasons
WITH
  production_head AS (SELECT id FROM delay_heads WHERE head_name = 'Production'),
  maintenance_head AS (SELECT id FROM delay_heads WHERE head_name = 'Maintenance'),
  quality_head AS (SELECT id FROM delay_heads WHERE head_name = 'Quality'),
  management_head AS (SELECT id FROM delay_heads WHERE head_name = 'Management'),
  
  machine_head AS (SELECT id FROM delay_heads WHERE head_name = 'Machine'),
  material_head AS (SELECT id FROM delay_heads WHERE head_name = 'Material'),
  personnel_head AS (SELECT id FROM delay_heads WHERE head_name = 'Personnel'),
  external_head AS (SELECT id FROM delay_heads WHERE head_name = 'External'),
  
  preventive_head AS (SELECT id FROM delay_heads WHERE head_name = 'Preventive'),
  corrective_head AS (SELECT id FROM delay_heads WHERE head_name = 'Corrective'),
  predictive_head AS (SELECT id FROM delay_heads WHERE head_name = 'Predictive'),
  emergency_maint_head AS (SELECT id FROM delay_heads WHERE head_name = 'Emergency'),
  
  process_head AS (SELECT id FROM delay_heads WHERE head_name = 'Process'),
  product_head AS (SELECT id FROM delay_heads WHERE head_name = 'Product'),
  material_qual_head AS (SELECT id FROM delay_heads WHERE head_name = 'Material'),
  equipment_head AS (SELECT id FROM delay_heads WHERE head_name = 'Equipment'),
  
  scheduled_head AS (SELECT id FROM delay_heads WHERE head_name = 'Scheduled'),
  emergency_shut_head AS (SELECT id FROM delay_heads WHERE head_name = 'Emergency'),
  regulatory_head AS (SELECT id FROM delay_heads WHERE head_name = 'Regulatory'),
  utility_head AS (SELECT id FROM delay_heads WHERE head_name = 'Utility'),
  
  planned_id AS (SELECT id FROM delay_types WHERE type_name = 'Planned'),
  unplanned_id AS (SELECT id FROM delay_types WHERE type_name = 'Unplanned'),
  maintenance_id AS (SELECT id FROM delay_types WHERE type_name = 'Maintenance'),
  quality_id AS (SELECT id FROM delay_types WHERE type_name = 'Quality Check'),
  shutdown_id AS (SELECT id FROM delay_types WHERE type_name = 'Plant Shutdown')
  
INSERT INTO delay_reasons (reason_name, delay_head_id, delay_type_id)
VALUES
  -- Planned reasons
  ('Scheduled Maintenance', (SELECT id FROM maintenance_head), (SELECT id FROM planned_id)),
  ('Shift Change', (SELECT id FROM production_head), (SELECT id FROM planned_id)),
  ('Break Time', (SELECT id FROM production_head), (SELECT id FROM planned_id)),
  ('Team Meeting', (SELECT id FROM management_head), (SELECT id FROM planned_id)),
  
  -- Unplanned reasons
  ('Machine Breakdown', (SELECT id FROM machine_head), (SELECT id FROM unplanned_id)),
  ('Material Shortage', (SELECT id FROM material_head), (SELECT id FROM unplanned_id)),
  ('Power Failure', (SELECT id FROM external_head), (SELECT id FROM unplanned_id)),
  ('Emergency', (SELECT id FROM external_head), (SELECT id FROM unplanned_id)),
  
  -- Maintenance reasons
  ('Preventive Maintenance', (SELECT id FROM preventive_head), (SELECT id FROM maintenance_id)),
  ('Repair Work', (SELECT id FROM corrective_head), (SELECT id FROM maintenance_id)),
  ('Part Replacement', (SELECT id FROM corrective_head), (SELECT id FROM maintenance_id)),
  ('Calibration', (SELECT id FROM preventive_head), (SELECT id FROM maintenance_id)),
  
  -- Quality Check reasons
  ('Product Testing', (SELECT id FROM product_head), (SELECT id FROM quality_id)),
  ('Quality Audit', (SELECT id FROM process_head), (SELECT id FROM quality_id)),
  ('Sample Inspection', (SELECT id FROM product_head), (SELECT id FROM quality_id)),
  ('Parameter Adjustment', (SELECT id FROM equipment_head), (SELECT id FROM quality_id)),
  
  -- Plant Shutdown reasons
  ('Power Outage', (SELECT id FROM utility_head), (SELECT id FROM shutdown_id)),
  ('Facility Maintenance', (SELECT id FROM scheduled_head), (SELECT id FROM shutdown_id)),
  ('Holiday', (SELECT id FROM scheduled_head), (SELECT id FROM shutdown_id)),
  ('Emergency Shutdown', (SELECT id FROM emergency_shut_head), (SELECT id FROM shutdown_id))
ON CONFLICT (reason_name) DO NOTHING;

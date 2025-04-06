-- Create delay_entries table
CREATE TABLE IF NOT EXISTS delay_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  tpc INTEGER NOT NULL,
  machine_waste INTEGER NOT NULL,
  final_waste INTEGER NOT NULL,
  gpc INTEGER NOT NULL,
  waste_reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downtimes table with reference to delay_entries
CREATE TABLE IF NOT EXISTS downtimes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delay_entry_id UUID NOT NULL REFERENCES delay_entries(id) ON DELETE CASCADE,
  dt_start TIME NOT NULL,
  dt_end TIME NOT NULL,
  dt_in_min INTEGER NOT NULL,
  type_of_dt TEXT NOT NULL,
  applicator TEXT NOT NULL,
  delay_head TEXT NOT NULL,
  delay_reason TEXT NOT NULL,
  remarks TEXT,
  shift TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downtimes_delay_entry_id ON downtimes(delay_entry_id);

-- Insert operators
INSERT INTO operator (id, operator_name) VALUES
  ('1f5c3c7c-9c91-4c1a-9f4d-0d7ce8a3d9a1', 'John Smith'),
  ('2a6d4d8d-0d92-5d2b-0e8d-1e8d9b4e0a2b', 'Maria Garcia'),
  ('3b7e5e9e-1e03-6e3c-1f9e-2f9e0c5f1b3c', 'David Johnson'),
  ('4c8f6f0f-2f14-7f4d-2g0f-3g0f1d6g2c4d', 'Sarah Lee'),
  ('5d9g7g1g-3g25-8g5e-3h1g-4h1g2e7h3d5e', 'Michael Brown'),
  ('6e0h8h2h-4h36-9h6f-4i2h-5i2h3f8i4e6f', 'Lisa Chen'),
  ('7f1i9i3i-5i47-0i7g-5j3i-6j3i4g9j5f7g', 'Robert Wilson'),
  ('8g2j0j4j-6j58-1j8h-6k4j-7k4j5h0k6g8h', 'Emily Davis')
ON CONFLICT (operator_name) DO NOTHING;

-- Insert machine speeds
INSERT INTO machine_speed (id, size, speed) VALUES
  ('9h3k1k5k-7k69-2k9i-7l5k-8l5k6i1l7h9i', '200ml', 120),
  ('0i4l2l6l-8l70-3l0j-8m6l-9m6l7j2m8i0j', '500ml', 100),
  ('1j5m3m7m-9m81-4m1k-9n7m-0n7m8k3n9j1k', '750ml', 80),
  ('2k6n4n8n-0n92-5n2l-0o8n-1o8n9l4o0k2l', '1000ml', 60)
ON CONFLICT (size) DO NOTHING;

-- Insert product details
INSERT INTO product_details (id, product_description, product_code) VALUES
  ('3l7o5o9o-1o03-6o3m-1p9o-2p9o0m5p1l3m', 'Mineral Water', 'MW001'),
  ('4m8p6p0p-2p14-7p4n-2q0p-3q0p1n6q2m4n', 'Sparkling Water', 'SW001'),
  ('5n9q7q1q-3q25-8q5o-3r1q-4r1q2o7r3n5o', 'Flavored Water - Lemon', 'FW001'),
  ('6o0r8r2r-4r36-9r6p-4s2r-5s2r3p8s4o6p', 'Flavored Water - Orange', 'FW002'),
  ('7p1s9s3s-5s47-0s7q-5t3s-6t3s4q9t5p7q', 'Energy Drink', 'ED001')
ON CONFLICT (product_code) DO NOTHING;

-- Insert shift times
INSERT INTO shift_time (id, shift_name, shift_timing) VALUES
  ('8q2t0t4t-6t58-1t8r-6u4t-7u4t5r0u6q8r', 'Morning', '06:00-14:00'),
  ('9r3u1u5u-7u69-2u9s-7v5u-8v5u6s1v7r9s', 'Afternoon', '14:00-22:00'),
  ('0s4v2v6v-8v70-3v0t-8w6v-9w6v7t2w8s0t', 'Night', '22:00-06:00')
ON CONFLICT (shift_name) DO NOTHING;

-- Insert delay reasons
INSERT INTO delay_reasons (id, delaytype, delayhead, delaydescription) VALUES
  ('1t5w3w7w-9w81-4w1u-9x7w-0x7w8u3x9t1u', 'Planned', 'Maintenance', 'Scheduled maintenance'),
  ('2u6x4x8x-0x92-5x2v-0y8x-1y8x9v4y0u2v', 'Planned', 'Break', 'Regular break time'),
  ('3v7y5y9y-1y03-6y3w-1z9y-2z9y0w5z1v3w', 'Unplanned', 'Machine', 'Machine breakdown'),
  ('4w8z6z0z-2z14-7z4x-2a0z-3a0z1x6a2w4x', 'Unplanned', 'Material', 'Material shortage'),
  ('5x9a7a1a-3a25-8a5y-3b1a-4b1a2y7b3x5y', 'Unplanned', 'Quality', 'Quality issues');

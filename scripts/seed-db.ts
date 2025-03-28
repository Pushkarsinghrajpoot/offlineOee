import { supabase } from '../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

async function seedDatabase() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.from('rpc').select(`sql=${statement}`);
      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();

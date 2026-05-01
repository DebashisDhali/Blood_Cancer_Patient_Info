require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const adminId = 'ddcbeb14-d80e-4ee5-955d-bc4dfc22f9e9';
  console.log('Testing with Admin ID:', adminId);

  let query = supabase.from('patients').select('*, funds(id, target_amount, collected_amount)').order('created_at', { ascending: false });
  query = query.eq('admin_id', adminId);

  const { data, error } = await query;
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Patients fetched count:', data.length);
    console.log('Patients:', data.map(p => p.name));
  }
}

test();

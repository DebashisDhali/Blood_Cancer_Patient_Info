const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pqacqzrewugadmenyikx.supabase.co',
  'sb_publishable_CPTy6-7f6NMKluomHkITtA_BnVwA7oo'
);

async function checkFundsTable() {
  console.log('Trying to insert a basic fund to see column names...');
  const { data, error } = await supabase
    .from('funds')
    .insert([{ target_amount: 1, currency: 'BDT' }])
    .select();

  if (error) {
    console.error('Error inserting basic fund:', error.message);
  } else {
    console.log('Success! Columns in funds table are:', Object.keys(data[0]));
    
    // Cleanup
    await supabase.from('funds').delete().eq('id', data[0].id);
  }
}

checkFundsTable();

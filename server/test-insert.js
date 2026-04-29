const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pqacqzrewugadmenyikx.supabase.co',
  'sb_publishable_CPTy6-7f6NMKluomHkITtA_BnVwA7oo'
);

async function testInsert() {
  console.log('Trying to insert patient...');
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      name: 'Test Patient',
      age: 30,
      gender: 'male',
      blood_type: 'O+',
      cancer_type: 'Leukemia',
      status: 'in-treatment'
    }])
    .select();

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Success:', data);
  }
}

testInsert();

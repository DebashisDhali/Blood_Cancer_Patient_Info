const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pqacqzrewugadmenyikx.supabase.co',
  'sb_publishable_CPTy6-7f6NMKluomHkITtA_BnVwA7oo'
);

async function testUpdate() {
  console.log('Trying to update patient...');
  const { data, error } = await supabase
    .from('patients')
    .update({ age: 31 })
    .eq('id', '6427468c-5689-474b-a4ab-390d3f27bfec')
    .select();

  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Success:', data);
  }
}

testUpdate();

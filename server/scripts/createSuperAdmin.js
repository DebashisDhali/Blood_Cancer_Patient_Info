/**
 * Run this script ONCE to create the super admin account.
 * Command: node server/scripts/createSuperAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcryptjs = require('bcryptjs');
const supabase = require('../config/supabaseClient');

async function createSuperAdmin() {
  const email    = 'dhalisurjo387@gmail.com';
  const username = 'superadmin';
  const password = '1413279350';
  const role     = 'super_admin';

  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existing) {
      console.log('✅ Super admin already exists:', existing.email, '| Role:', existing.role);
      // Ensure role is correct
      if (existing.role !== 'super_admin') {
        await supabase.from('admins').update({ role: 'super_admin', is_verified: true }).eq('id', existing.id);
        console.log('🔄 Role upgraded to super_admin.');
      }
      process.exit(0);
    }

    // Hash password
    const password_hash = await bcryptjs.hash(password, 12);

    // Insert super admin (pre-verified, no email needed)
    const { data, error } = await supabase
      .from('admins')
      .insert([{
        username,
        email,
        password_hash,
        role,
        is_verified: true,
        verification_token: null
      }])
      .select('id, username, email, role');

    if (error) throw error;

    console.log('🎉 Super Admin created successfully!');
    console.log('   Email    :', data[0].email);
    console.log('   Username :', data[0].username);
    console.log('   Role     :', data[0].role);
    console.log('   Login at  : /login');
  } catch (err) {
    console.error('❌ Error creating super admin:', err.message);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();

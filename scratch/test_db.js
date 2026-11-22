const fs = require('fs');
const dotenv = fs.readFileSync('.env', 'utf-8');
const env = {};
dotenv.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

console.log('Testing V2 DB connection:');
console.log('URL:', env.VITE_SUPABASE_V2_URL);

const { createClient } = require('@supabase/supabase-js');
const client = createClient(env.VITE_SUPABASE_V2_URL, env.VITE_SUPABASE_V2_ANON_KEY);

async function test() {
  console.log('Querying lan_su_rong_v2_submissions...');
  const { data, error, count } = await client
    .from('lan_su_rong_v2_submissions')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('ERROR from Supabase V2:', error);
  } else {
    console.log('SUCCESS! Row count:', count, 'Data rows:', data);
  }

  console.log('\nTrying test insert...');
  const testRow = {
    participant_code: 'KC-TEST-99',
    group_code: 'CG-MT',
    phieu_id: 'Phiếu 1',
    dot: 'Kiem_chung',
    full_name: 'Test Participant',
    answers: { test: 5 },
    open_answers: {},
    interview_answers: {},
    submitted_at: new Date().toISOString()
  };

  const insertRes = await client
    .from('lan_su_rong_v2_submissions')
    .upsert(testRow, { onConflict: 'participant_code' });

  if (insertRes.error) {
    console.error('INSERT ERROR:', insertRes.error);
  } else {
    console.log('INSERT SUCCESS!');
    // Delete test row
    await client
      .from('lan_su_rong_v2_submissions')
      .delete()
      .eq('participant_code', 'KC-TEST-99');
    console.log('Cleaned up test row.');
  }
}

test();

const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function main() {
  const queryRes = await fetch('https://api.instantdb.com/admin/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSTANT_ADMIN_TOKEN}`,
      'App-Id': INSTANT_APP_ID,
    },
    body: JSON.stringify({ query: { standings: {} } }),
  });
  const { standings } = await queryRes.json();
  console.log(`Total standings rows: ${standings.length}`);

  const stale = standings.filter(s => !s.semester);
  console.log(`Stale (no semester): ${stale.length}`);

  if (stale.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  const steps = stale.map(s => ['delete', 'standings', s.id]);

  const txRes = await fetch('https://api.instantdb.com/admin/transact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSTANT_ADMIN_TOKEN}`,
      'App-Id': INSTANT_APP_ID,
    },
    body: JSON.stringify({ steps }),
  });
  const txResult = await txRes.json();
  console.log('InstantDB response:', txRes.status, JSON.stringify(txResult).substring(0, 300));
}

main().catch(err => { console.error(err); process.exit(1); });

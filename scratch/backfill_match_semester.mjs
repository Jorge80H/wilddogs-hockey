const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

function semesterOf(dateMs) {
  const d = new Date(dateMs);
  const half = d.getUTCMonth() < 6 ? 1 : 2;
  return `${d.getUTCFullYear()}-S${half}`;
}

async function main() {
  const queryRes = await fetch('https://api.instantdb.com/admin/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSTANT_ADMIN_TOKEN}`,
      'App-Id': INSTANT_APP_ID,
    },
    body: JSON.stringify({ query: { matches: {} } }),
  });
  const { matches } = await queryRes.json();
  console.log(`Total matches: ${matches.length}`);

  const missing = matches.filter(m => !m.semester);
  console.log(`Missing semester: ${missing.length}`);

  const steps = missing.map(m => ['update', 'matches', m.id, { semester: semesterOf(m.date) }]);

  if (steps.length === 0) {
    console.log('Nothing to backfill.');
    return;
  }

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

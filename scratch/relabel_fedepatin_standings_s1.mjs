// One-off correction: the Fedepatin standings synced on 2026-08-22 got
// stamped semester=2026-S2 (sync-time semester) even though every S2 match
// still has result:null — the 36 rows actually reflect S1's finished
// tournament. Re-key them under -fp-2026-S1 (matching what the sync scripts
// would have produced had they run before the S1/S2 calendar boundary) and
// delete the stale S2-keyed rows so future correct S2 standings (once real
// S2 games are played and synced) don't collide with this leftover data.
const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

function seedUUID(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  const hex = (n) => Math.abs(n).toString(16).padStart(8, '0').substring(0, 8);
  const h1 = hex(hash);
  const h2 = hex(hash * 31 + 7);
  const h3 = hex(hash * 37 + 13);
  const h4 = hex(hash * 41 + 17);
  return `${h1}-${h2.substring(0,4)}-4${h3.substring(1,4)}-a${h4.substring(1,4)}-${h2}${h3.substring(0,4)}`;
}

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
  const fpS2 = standings.filter(s => s.league === 'fedepatin' && s.semester === '2026-S2');
  console.log(`Fedepatin 2026-S2 rows to relabel: ${fpS2.length}`);

  const now = Date.now();
  const steps = [];
  for (const s of fpS2) {
    steps.push(['delete', 'standings', s.id]);
    const key = (s.division || '') + '-' + (s.teamName || '') + '-fp-2026-S1';
    const newUuid = seedUUID('standing-' + key);
    steps.push(['update', 'standings', newUuid, {
      teamName: s.teamName,
      division: s.division,
      position: s.position,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
      league: 'fedepatin',
      semester: '2026-S1',
      updatedAt: now,
    }]);
  }

  if (steps.length === 0) {
    console.log('Nothing to relabel.');
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

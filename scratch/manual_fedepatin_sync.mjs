const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

const SUPABASE_URL_MATCHES = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/matches?select=*,match_teams(*,teams(*)),categories(*,divisions(*))&limit=500";
const SUPABASE_URL_STANDINGS = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*),categories(*,divisions(*))&limit=500";
const SUPABASE_APIKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE";

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

// Semestre calendario: meses 1-6 (UTC) -> S1, meses 7-12 (UTC) -> S2.
// Debe coincidir exactamente con client/src/lib/semester.ts y con el nodo
// "Build InstantDB Transaction" de los workflows de n8n.
function semesterOf(dateMs) {
  const d = new Date(dateMs);
  const half = d.getUTCMonth() < 6 ? 1 : 2;
  return `${d.getUTCFullYear()}-S${half}`;
}

async function fetchSupabase(url) {
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_APIKEY, Authorization: `Bearer ${SUPABASE_APIKEY}` },
  });
  return res.json();
}

async function main() {
  const now = Date.now();
  const nowSemester = semesterOf(now);
  const steps = [];

  console.log('Fetching matches from Supabase...');
  const rawMatches = await fetchSupabase(SUPABASE_URL_MATCHES);
  console.log(`Retrieved ${rawMatches.length} matches.`);

  let matchesCount = 0;
  for (const g of rawMatches) {
    if (!g.match_teams) continue;
    const isWildDogsGame = g.match_teams.some(mt => mt.teams && mt.teams.name &&
      (mt.teams.name.toUpperCase().includes('CONDORS') || mt.teams.name.toUpperCase().includes('WILD DOGS')));
    if (!isWildDogsGame) continue;

    const home = g.match_teams.find(mt => mt.side === 'home');
    const away = g.match_teams.find(mt => mt.side === 'away');
    const homeName = home && home.teams ? home.teams.name : 'Unknown';
    const awayName = away && away.teams ? away.teams.name : 'Unknown';
    const homeScore = home ? home.score_regular : null;
    const awayScore = away ? away.score_regular : null;
    const isHome = homeName.toUpperCase().includes('CONDORS') || homeName.toUpperCase().includes('WILD DOGS');
    const opponent = isHome ? awayName : homeName;
    const played = g.status === 'locked' || g.status === 'played' || g.status === 'finished';

    let result = null;
    if (played && homeScore !== null && awayScore !== null) {
      const wdScore = isHome ? homeScore : awayScore;
      const opScore = isHome ? awayScore : homeScore;
      result = wdScore > opScore ? 'win' : wdScore < opScore ? 'loss' : 'draw';
    }

    let divName = '';
    if (g.categories && g.categories.divisions) divName = g.categories.divisions.name;
    const catName = g.categories ? g.categories.name : '';
    const fullDivision = divName ? divName + ' - ' + catName : catName;

    const uuid = seedUUID('fp-match-' + g.id);
    // Mirrors the n8n workflow's Parse Matches + Build Transaction: split
    // match_date into date/time components and reconstruct a clean UTC
    // ISO string, rather than trusting the raw Supabase string's format.
    const datePart = g.match_date ? g.match_date.split('T')[0] : null;
    const timePart = g.match_date ? g.match_date.split('T')[1].substring(0, 5) : null;
    const rawDate = datePart && timePart ? `${datePart}T${timePart}:00Z` : null;
    const dateMs = rawDate ? new Date(rawDate).getTime() : now;

    steps.push(['update', 'matches', uuid, {
      gameId: String(g.id),
      date: dateMs,
      opponent,
      location: g.venue || null,
      homeScore: played ? homeScore : null,
      awayScore: played ? awayScore : null,
      result,
      notes: fullDivision + (g.notes ? ' - ' + g.notes : ''),
      isHome,
      status: g.status || 'unknown',
      league: 'fedepatin',
      semester: semesterOf(dateMs),
      createdAt: now,
      updatedAt: now,
    }]);
    matchesCount++;
  }
  console.log(`Prepared ${matchesCount} matches for update.`);

  console.log('Fetching standings from Supabase...');
  const rawStandings = await fetchSupabase(SUPABASE_URL_STANDINGS);
  console.log(`Retrieved ${rawStandings.length} standings.`);

  let standingsCount = 0;
  for (const s of rawStandings) {
    const teamName = s.teams ? s.teams.name : 'Unknown';
    let divName = '';
    if (s.categories && s.categories.divisions) divName = s.categories.divisions.name;
    const catName = s.categories ? s.categories.name : '';
    const fullDivision = divName ? divName + ' - ' + catName : catName;

    const key = fullDivision + '-' + teamName + '-fp-' + nowSemester;
    const uuid = seedUUID('standing-' + key);

    steps.push(['update', 'standings', uuid, {
      teamName,
      division: fullDivision,
      position: s.rank || 0,
      played: s.played || 0,
      won: s.wins || 0,
      drawn: s.draws || 0,
      lost: s.losses || 0,
      goalsFor: s.goals_for || 0,
      goalsAgainst: s.goals_against || 0,
      goalDifference: s.goal_diff || 0,
      points: s.points || 0,
      league: 'fedepatin',
      semester: nowSemester,
      updatedAt: now,
    }]);
    standingsCount++;
  }
  console.log(`Prepared ${standingsCount} standings for update.`);

  console.log(`Total steps: ${steps.length}`);

  const txRes = await fetch('https://api.instantdb.com/admin/transact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${INSTANT_ADMIN_TOKEN}`,
      'App-Id': INSTANT_APP_ID,
    },
    body: JSON.stringify({ steps }),
  });
  const txResult = await txRes.json();
  console.log('InstantDB response:', txRes.status, JSON.stringify(txResult).substring(0, 300));
}

main().catch(err => { console.error(err); process.exit(1); });

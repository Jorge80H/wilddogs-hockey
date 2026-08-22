const INSTANT_APP_ID = process.env.INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;
const SEASON_ID = 11252;

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

function extractJsonArray(html, varName) {
  const re = new RegExp(varName.replace('.', '\\.') + '=\\[');
  const match = html.match(re);
  if (!match) return null;
  const startIdx = match.index + varName.length + 1;
  let depth = 0, endIdx = startIdx;
  for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '[') depth++;
    if (html[i] === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
  }
  const rawJson = html.substring(startIdx, endIdx)
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return JSON.parse(rawJson);
}

async function main() {
  const loginRes = await fetch('https://web.api.digitalshift.ca/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://www.fedehockey.com',
      'Referer': 'https://www.fedehockey.com/',
    },
    body: JSON.stringify({ client_service_id: '6ccfbd36-4966-4d24-89f7-f5a2f4f0e83a' }),
  });
  const loginData = await loginRes.json();
  const ticket = loginData.ticket.hash;
  console.log('Logged in, ticket obtained');

  const authHeaders = {
    'Authorization': `ticket="${ticket}"`,
    'Origin': 'https://www.fedehockey.com',
    'Referer': 'https://www.fedehockey.com/',
  };

  const scheduleRes = await fetch(`https://web.api.digitalshift.ca/partials/stats/schedule/table?season_id=${SEASON_ID}`, { headers: authHeaders });
  const scheduleHtml = (await scheduleRes.json()).content;
  const scheduleGames = extractJsonArray(scheduleHtml, 'ctrl.schedule') || [];

  const scoresRes = await fetch(`https://web.api.digitalshift.ca/partials/stats/scores/table?season_id=${SEASON_ID}`, { headers: authHeaders });
  const scoresHtml = (await scoresRes.json()).content;
  const scoresGames = extractJsonArray(scoresHtml, 'ctrl.scores') || [];

  const standingsRes = await fetch(`https://web.api.digitalshift.ca/partials/stats/standings/table?season_id=${SEASON_ID}&league_toggle=division`, { headers: authHeaders });
  const standingsHtml = (await standingsRes.json()).content;

  console.log(`Schedule games: ${scheduleGames.length}, Scores games: ${scoresGames.length}`);

  const wdSchedule = scheduleGames.filter(g => (g.home_team||'').toUpperCase().includes('WILD DOGS') || (g.away_team||'').toUpperCase().includes('WILD DOGS'));
  const wdScores = scoresGames.filter(g => (g.home_team||'').toUpperCase().includes('WILD DOGS') || (g.away_team||'').toUpperCase().includes('WILD DOGS'));

  console.log(`Wild Dogs schedule games: ${wdSchedule.length}, Wild Dogs scores games: ${wdScores.length}`);

  const matches = [];
  for (const g of wdSchedule) {
    const isHome = (g.home_team || '').toUpperCase().includes('WILD DOGS');
    const opponent = isHome ? g.away_team : g.home_team;
    const played = g.status !== 'Not Started';
    let result = null;
    if (played) {
      const wdScore = isHome ? g.home_score : g.away_score;
      const opScore = isHome ? g.away_score : g.home_score;
      result = wdScore > opScore ? 'win' : wdScore < opScore ? 'loss' : 'draw';
    }
    matches.push({
      type: 'match', gameId: g.game_id, date: g.date, time: g.time, division: g.home_division,
      opponent, location: g.facility || null, homeScore: played ? g.home_score : null,
      awayScore: played ? g.away_score : null, result, status: g.status, isHome,
      notes: g.notes || g.schedule_notes || null,
    });
  }
  for (const g of wdScores) {
    const isHome = (g.home_team || '').toUpperCase().includes('WILD DOGS');
    const opponent = isHome ? g.away_team : g.home_team;
    const homeScore = parseInt(g.home_score) || 0;
    const awayScore = parseInt(g.away_score) || 0;
    const wdScore = isHome ? homeScore : awayScore;
    const opScore = isHome ? awayScore : homeScore;
    const result = wdScore > opScore ? 'win' : wdScore < opScore ? 'loss' : 'draw';
    matches.push({
      type: 'match', gameId: (g.game_id || g.id || '').toString().replace('g-', ''), date: g.date, time: g.time,
      division: g.home_division || g.away_division, opponent, location: g.facility || null,
      homeScore, awayScore, result, status: g.status || 'Final', isHome,
      notes: g.notes || g.schedule_notes || null,
    });
  }

  // Standings parsing (same regex logic as workflow)
  const results = [];
  const divMatches = [...standingsHtml.matchAll(/<h2 class="h3">(.*?)<\/h2>/g)].map(m => ({ name: m[1], index: m.index }));
  for (let d = 0; d < divMatches.length; d++) {
    const divName = divMatches[d].name;
    const startIdx = divMatches[d].index;
    const endIdx = d + 1 < divMatches.length ? divMatches[d + 1].index : standingsHtml.length;
    const section = standingsHtml.substring(startIdx, endIdx);
    const tableMatch = section.match(/<table class="stats-table standings[^"]*"[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) continue;
    const tbodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (!tbodyMatch) continue;
    const rows = [...tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(c => c[1].trim());
      if (cells.length < 11) continue;
      const ariaMatch = cells[1].match(/aria-label="(.*?) team page"/);
      const teamName = ariaMatch ? ariaMatch[1] : cells[1].replace(/<[^>]*>/g, '').trim();
      results.push({
        type: 'standing', division: divName, teamName,
        position: parseInt(cells[0]) || 0, played: parseInt(cells[2]) || 0,
        won: parseInt(cells[3]) || 0, lost: parseInt(cells[4]) || 0, drawn: parseInt(cells[5]) || 0,
        points: parseInt(cells[6]) || 0, goalsFor: parseInt(cells[8]) || 0, goalsAgainst: parseInt(cells[9]) || 0,
        goalDifference: parseInt((cells[10]||'').replace(/[^\d-]/g, '')) || 0,
      });
    }
  }

  console.log(`Standings rows: ${results.length}`);

  const now = Date.now();
  const steps = [];
  const seen = new Set();
  for (const d of matches) {
    if (seen.has(String(d.gameId))) continue;
    seen.add(String(d.gameId));
    const uuid = seedUUID('fh-match-' + d.gameId);
    const timeStr = d.time || '00:00';
    const rawDate = d.date ? `${d.date}T${timeStr}:00-05:00` : null;
    const dateMs = rawDate ? new Date(rawDate).getTime() : now;
    steps.push(['update', 'matches', uuid, {
      gameId: String(d.gameId), date: dateMs, opponent: d.opponent, location: d.location,
      homeScore: d.homeScore, awayScore: d.awayScore, result: d.result, isHome: d.isHome || false,
      notes: (d.division || '') + (d.notes ? ' - ' + d.notes : ''), status: d.status || 'unknown',
      league: 'fedehockey', createdAt: now, updatedAt: now,
    }]);
  }
  for (const d of results) {
    const key = (d.division||'') + '-' + (d.teamName||'') + '-fh';
    const uuid = seedUUID('standing-' + key);
    steps.push(['update', 'standings', uuid, {
      teamName: d.teamName, division: d.division, position: d.position, played: d.played,
      won: d.won, drawn: d.drawn, lost: d.lost, goalsFor: d.goalsFor, goalsAgainst: d.goalsAgainst,
      goalDifference: d.goalDifference, points: d.points, league: 'fedehockey', updatedAt: now,
    }]);
  }

  console.log(`Total steps to write: ${steps.length}`);

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
  console.log('InstantDB response:', txRes.status, JSON.stringify(txResult).substring(0, 500));
}

main().catch(err => { console.error(err); process.exit(1); });

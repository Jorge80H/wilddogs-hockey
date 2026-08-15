process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

const isFedepatin = (m) => {
  if (m.league === "fedepatin") return true;
  if (m.league === "Fede Patin") return true;
  if (m.league === "fedehockey") return false;
  if (m.league === "Fede Hockey") return false;
  const loc = (m.location || "").toLowerCase();
  return loc.includes("fedepatin") || loc.includes("skate") || loc.includes("parque la colina");
};

const matchCat = (m) => {
  const notesStr = m.notes || m.division || "";
  if (!notesStr) return "General";
  
  if (isFedepatin(m)) {
    const parts = notesStr.split(" - ");
    const lastPart = parts[parts.length - 1].trim();
    if (!lastPart.toLowerCase().includes("sub") && !lastPart.toLowerCase().includes("juvenil")) {
      const dashParts = notesStr.split("-");
      const dashedLast = dashParts[dashParts.length - 1].trim();
      if (dashedLast.length > 20) return "General";
      return dashedLast || "General";
    }
    return lastPart || "General";
  }
  
  const p = notesStr.split(" - ")[0].trim();
  if (p.length > 20) return "General";
  return p || "General";
};

async function run() {
  const response = await fetch(`https://api.instantdb.com/admin/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'App-Id': APP_ID
    },
    body: JSON.stringify({
      matches: {},
      standings: {}
    })
  });

  const data = await response.json();
  const matches = data.matches || [];
  const standings = data.standings || [];

  console.log("Analyzing matches...");
  const dirtyMatches = [];
  for (const m of matches) {
    const cat = matchCat(m);
    if (cat.length > 20 || cat.toLowerCase().includes("arquero") || cat.toLowerCase().includes("forfeit")) {
      dirtyMatches.push({
        id: m.id,
        gameId: m.gameId,
        opponent: m.opponent,
        notes: m.notes,
        division: m.division,
        league: m.league,
        resolvedCat: cat
      });
    }
  }
  console.log("Dirty Matches:", JSON.stringify(dirtyMatches, null, 2));

  console.log("\nAnalyzing standings...");
  const dirtyStandings = [];
  for (const s of standings) {
    const cat = matchCat(s);
    if (cat.length > 20 || cat.toLowerCase().includes("arquero") || cat.toLowerCase().includes("forfeit")) {
      dirtyStandings.push({
        id: s.id,
        teamName: s.teamName,
        division: s.division,
        league: s.league,
        resolvedCat: cat
      });
    }
  }
  console.log("Dirty Standings:", JSON.stringify(dirtyStandings, null, 2));
}

run();

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
      query: {
        matches: {},
        standings: {}
      }
    })
  });

  const data = await response.json();
  if (data.type === "param-missing" || data.message) {
    console.error("InstantDB error:", data);
    return;
  }
  const matches = data.matches || [];
  const standings = data.standings || [];

  console.log(`Retrieved ${matches.length} matches and ${standings.length} standings.`);

  console.log("\n=== MATCH CATEGORIES ===");
  const matchCats = new Map();
  for (const m of matches) {
    const cat = matchCat(m);
    if (!matchCats.has(cat)) matchCats.set(cat, []);
    matchCats.get(cat).push({ opponent: m.opponent, notes: m.notes, division: m.division });
  }
  for (const [cat, items] of matchCats.entries()) {
    console.log(`Category: "${cat}" (count: ${items.length})`);
    console.log(`  Sample:`, items[0]);
  }

  console.log("\n=== STANDINGS CATEGORIES ===");
  const standingCats = new Map();
  for (const s of standings) {
    const cat = matchCat(s);
    if (!standingCats.has(cat)) standingCats.set(cat, []);
    standingCats.get(cat).push({ teamName: s.teamName, division: s.division });
  }
  for (const [cat, items] of standingCats.entries()) {
    console.log(`Category: "${cat}" (count: ${items.length})`);
    console.log(`  Sample:`, items[0]);
  }
}

run();

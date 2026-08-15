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
        standings: {}
      }
    })
  });

  const data = await response.json();
  const standings = data.standings || [];

  const generalStandings = [];
  for (const s of standings) {
    const cat = matchCat(s);
    if (cat === "General") {
      generalStandings.push(s);
    }
  }

  console.log(`Found ${generalStandings.length} standings in General category.`);
  console.log("Sample general standings:", JSON.stringify(generalStandings, null, 2));
}

run();

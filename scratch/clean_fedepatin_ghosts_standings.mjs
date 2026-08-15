process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

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

  const deleteSteps = [];
  for (const s of standings) {
    const leagueName = (s.league || "").toLowerCase().replace(" ", "");
    if (leagueName === 'fedepatin' && (!s.division || s.division.trim() === '')) {
      console.log(`Deleting ghost standing: ID=${s.id}, TeamName=${s.teamName}, Division="${s.division}", League="${s.league}"`);
      deleteSteps.push(['delete', 'standings', s.id]);
    }
  }

  if (deleteSteps.length === 0) {
    console.log("No ghost standings found.");
    return;
  }

  console.log(`Deleting ${deleteSteps.length} ghost standings...`);
  const transactRes = await fetch(`https://api.instantdb.com/admin/transact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'App-Id': APP_ID
    },
    body: JSON.stringify({
      steps: deleteSteps
    })
  });

  const result = await transactRes.json();
  console.log("Cleanup Transaction complete!", result);
}

run();

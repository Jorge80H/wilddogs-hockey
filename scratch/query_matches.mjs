
process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;


async function queryData() {
  const response = await fetch(`https://api.instantdb.com/admin/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'App-Id': APP_ID
    },
    body: JSON.stringify({
      matches: {
        $: { limit: 10 }
      },
      standings: {
        $: { limit: 10 }
      }
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }

  console.log('Matches (first 10):', JSON.stringify(data.matches || [], null, 2));
  console.log('Standings (first 10):', JSON.stringify(data.standings || [], null, 2));

  // Search for the fake match: Sub 8, April 18
  const allMatchesQuery = await fetch(`https://api.instantdb.com/admin/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'App-Id': APP_ID
    },
    body: JSON.stringify({
      matches: {}
    })
  });
  const allMatchesData = await allMatchesQuery.json();
  const allMatches = allMatchesData.matches || [];
  
  const sub8Match = allMatches.find(m => {
     const notes = (m.notes || "").toLowerCase();
     const opponent = (m.opponent || "").toLowerCase();
     const d = new Date(m.date);
     const isApril18 = d.getFullYear() === 2026 && d.getMonth() === 3 && d.getDate() === 18;
     return (notes.includes("sub 8") || notes.includes("sub-8")) && isApril18;
  });

  if (sub8Match) {
    console.log('FOUND FAKE MATCH:', JSON.stringify(sub8Match, null, 2));
  } else {
    console.log('Fake match not found with strict date check. Checking all April 18 matches...');
    const april18Matches = allMatches.filter(m => {
        const d = new Date(m.date);
        return d.getFullYear() === 2026 && d.getMonth() === 3 && d.getDate() === 18;
    });
    console.log('All matches on April 18:', JSON.stringify(april18Matches, null, 2));
  }
}

queryData();


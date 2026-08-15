
// Native fetch is available in Node 18+

process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function query(collection) {
    const response = await fetch(`https://api.instantdb.com/admin/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'App-Id': APP_ID,
        },
        body: JSON.stringify({
            [collection]: {}
        })
    });
    return response.json();
}

async function main() {
    console.log("Checking DB...");
    const matches = await query('matches');
    console.log(`Matches Count: ${matches.matches ? matches.matches.length : 0}`);
    
    const standings = await query('standings');
    console.log(`Standings Count: ${standings.standings ? standings.standings.length : 0}`);

    if (matches.matches) {
        console.log("\nSample Matches:");
        matches.matches.slice(0, 5).forEach(m => {
            console.log(`- ID: ${m.gameId}, Date: ${new Date(m.date).toISOString()}, Opponent: ${m.opponent}, Division/Notes: ${m.notes}`);
        });
        
        const ghostMatch = matches.matches.find(m => {
            const date = new Date(m.date);
            return date.getUTCFullYear() === 2026 && date.getUTCMonth() === 3 && date.getUTCDate() === 19; // April 18/19 depending on TZ
        });
        console.log("\nSearching for April 18/19 matches:");
        matches.matches.filter(m => {
            const d = new Date(m.date);
            return d.toISOString().startsWith('2026-04-1');
        }).forEach(m => {
            console.log(`- ID: ${m.gameId}, ISO: ${new Date(m.date).toISOString()}, Opponent: ${m.opponent}, Notes: ${m.notes}`);
        });
    }
}

main().catch(console.error);

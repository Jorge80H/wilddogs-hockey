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
            query: { [collection]: {} }
        })
    });
    return response.json();
}

async function main() {
    const data = await query('matches');
    const matches = data.matches || [];
    
    console.log("Matches on April 18-19, 2026:");
    matches.filter(m => {
        const d = new Date(m.date);
        return d.getUTCFullYear() === 2026 && d.getUTCMonth() === 3 && (d.getUTCDate() === 18 || d.getUTCDate() === 19);
    }).forEach(m => {
        console.log(`- ${new Date(m.date).toISOString()} | League: ${m.league} | Opponent: ${m.opponent} | Notes: ${m.notes} | ID: ${m.gameId || 'N/A'}`);
    });
}
main().catch(console.error);

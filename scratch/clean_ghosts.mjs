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

async function transact(steps) {
    const response = await fetch(`https://api.instantdb.com/admin/transact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'App-Id': APP_ID,
        },
        body: JSON.stringify({ steps })
    });
    return response.json();
}

async function main() {
    console.log("Fetching matches...");
    const data = await query('matches');
    if (!data.matches) return;

    let steps = [];

    data.matches.forEach(m => {
        // Find ghost records (missing league)
        // These are old records that were created with wrong TZ logic and no league field
        if (!m.league || String(m.league).trim() === '') {
            console.log(`Deleting ghost record: ID=${m.id}, GameID=${m.gameId}, Opponent=${m.opponent}, Date=${new Date(m.date).toISOString()}`);
            steps.push([
                "delete",
                "matches",
                m.id
            ]);
        }
    });

    if (steps.length > 0) {
        console.log(`Executing ${steps.length} deletion steps...`);
        const res = await transact(steps);
        console.log("Transaction Result:", res);
    } else {
        console.log("No ghost records with undefined league found.");
    }
}

main().catch(console.error);

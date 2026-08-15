
// Native fetch in Node 18+

process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function main() {
    const response = await fetch(`https://api.instantdb.com/admin/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'App-Id': APP_ID,
        },
        body: JSON.stringify({
            query: {
                users: {},
                categories: {},
                matches: {},
                standings: {}
            }
        })
    });
    const data = await response.json();
    console.log("Full DB State:", JSON.stringify(data, null, 2));
}

main().catch(console.error);

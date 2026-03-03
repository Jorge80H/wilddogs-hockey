const { init } = require('@instantdb/react');

const APP_ID = '27acc1e8-fce9-4800-a9cd-c769cea6844f';
const db = init({ appId: APP_ID });

async function getMatches() {
    const query = { matches: {} };
    const res = await db.queryOnce(query);
    console.log("Matches:", JSON.stringify(res.data.matches, null, 2));
}

getMatches().catch(console.error);

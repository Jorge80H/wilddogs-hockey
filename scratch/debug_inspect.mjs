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
        matches: {},
        standings: {}
      }
    })
  });

  const data = await response.json();
  console.log("Response data keys:", Object.keys(data));
  console.log("Full response data:", JSON.stringify(data, null, 2));
}

run();

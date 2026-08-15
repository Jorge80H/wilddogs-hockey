
import { i } from "@instantdb/react";

process.loadEnvFile();
const APP_ID = process.env.INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function checkCollections() {
  const response = await fetch(`https://api.instantdb.com/admin/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'App-Id': APP_ID
    },
    body: JSON.stringify({
      matches: { $: {} },
      standings: { $: {} }
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }

  console.log('Matches Count:', data.matches?.length || 0);
  console.log('Standings Count:', data.standings?.length || 0);
  
  if (data.matches?.length > 0) {
    console.log('Sample Match:', JSON.stringify(data.matches[0], null, 2));
  }
}

checkCollections();

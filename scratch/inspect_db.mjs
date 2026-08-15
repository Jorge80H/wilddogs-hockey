const APP_ID = "27acc1e8-fce9-4800-a9cd-c769cea6844f";

async function inspect() {
    const response = await fetch("https://api.instantdb.com/runtime/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            app_id: APP_ID,
            query: { 
                matches: {},
                standings: {}
            }
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

inspect().catch(console.error);

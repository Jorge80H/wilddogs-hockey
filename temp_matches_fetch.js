const https = require('https');

const data = JSON.stringify({
    app_id: "27acc1e8-fce9-4800-a9cd-c769cea6844f",
    query: { matches: {} }
});

const options = {
    hostname: 'api.instantdb.com',
    path: '/runtime/query',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            const matches = parsed.matches || [];
            console.log("Total matches:", matches.length);
            const notStarted = matches.filter(m => m.status === "Not Started").length;
            console.log("Not Started count:", notStarted);
            const past = matches.filter(m => m.date < Date.now());
            console.log("Past by date count:", past.length);
            console.log("First Past match:", past[0] || "None");
            console.log("First match overall:", matches[0] || "None");
        } catch (e) {
            console.error("Error parsing:", body.substring(0, 100));
        }
    });
});

req.on('error', console.error);
req.write(data);
req.end();

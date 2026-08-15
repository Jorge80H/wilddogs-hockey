const https = require('https');

const queryData = JSON.stringify({
    app_id: "27acc1e8-fce9-4800-a9cd-c769cea6844f",
    query: { 
        matches: {},
        standings: {}
    }
});

const options = {
    hostname: 'api.instantdb.com',
    path: '/runtime/query',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': queryData.length
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error("Error parsing:", body.substring(0, 100));
        }
    });
});

req.on('error', console.error);
req.write(queryData);
req.end();

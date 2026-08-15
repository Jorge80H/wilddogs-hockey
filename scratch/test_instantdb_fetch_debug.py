import urllib.request
import urllib.error
import json

url = "https://api.instantdb.com/runtime/query"
data = {
    "app_id": "27acc1e8-fce9-4800-a9cd-c769cea6844f",
    "query": { "matches": {} }
}
data_bytes = json.dumps(data).encode('utf-8')

headers = {
    "Content-Type": "application/json",
    "Content-Length": str(len(data_bytes))
}

req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as response:
        body = response.read().decode('utf-8')
        print("Response Code:", response.getcode())
        print("Response Body length:", len(body))
        print("Response Body preview:", body[:500])
        res_data = json.loads(body)
        matches = res_data.get("matches", [])
        print(f"Total matches: {len(matches)}")
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

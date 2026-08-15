import urllib.request
import json
import os

def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

_load_env()

url = "https://api.instantdb.com/admin/query"
data = {
    "query": { "standings": {} }
}
data_bytes = json.dumps(data).encode('utf-8')

headers = {
    "Content-Type": "application/json",
    "Content-Length": str(len(data_bytes)),
    "App-Id": os.environ["INSTANT_APP_ID"],
    "Authorization": f"Bearer {os.environ['INSTANT_ADMIN_TOKEN']}"
}

req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as response:
        body = response.read().decode('utf-8')
        res_data = json.loads(body)
        standings = res_data.get("standings", [])
        
        fedepatin_standings = [s for s in standings if s.get("league") == "fedepatin"]
        print(f"Fedepatin standings in DB: {len(fedepatin_standings)}")
        for s in fedepatin_standings:
            print(f"Team: {s.get('teamName'):<20} | Division in DB: {s.get('division'):<15} | Position: {s.get('position')}")
            
except Exception as e:
    print("Error:", e)

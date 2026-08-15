import urllib.request
import urllib.error
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
    "query": { "matches": {}, "standings": {} }
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
        print("Response Code:", response.getcode())
        res_data = json.loads(body)
        matches = res_data.get("matches", [])
        standings = res_data.get("standings", [])
        print(f"Total matches in InstantDB: {len(matches)}")
        print(f"Total standings in InstantDB: {len(standings)}")
        
        fedepatin_matches = [m for m in matches if m.get("league") == "fedepatin"]
        fedehockey_matches = [m for m in matches if m.get("league") == "fedehockey"]
        
        print(f"Fedepatin matches: {len(fedepatin_matches)}")
        print(f"Fedehockey matches: {len(fedehockey_matches)}")
        
        if fedepatin_matches:
            print("\nFirst 3 Fedepatin matches in InstantDB:")
            for m in fedepatin_matches[:3]:
                print(json.dumps(m, indent=2))
        else:
            print("\nNo Fedepatin matches found in InstantDB.")
            
        # Let's count status of fedepatin matches
        if fedepatin_matches:
            statuses = {}
            for m in fedepatin_matches:
                st = m.get("status")
                statuses[st] = statuses.get(st, 0) + 1
            print("\nFedepatin matches statuses:", statuses)
            
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

import urllib.request
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
        res_data = json.loads(response.read().decode())
        matches = res_data.get("matches", [])
        print(f"Total matches in InstantDB: {len(matches)}")
        
        fedepatin_matches = [m for m in matches if m.get("league") == "fedepatin"]
        fedehockey_matches = [m for m in matches if m.get("league") == "fedehockey"]
        other_matches = [m for m in matches if m.get("league") not in ["fedepatin", "fedehockey"]]
        
        print(f"Fedepatin matches: {len(fedepatin_matches)}")
        print(f"Fedehockey matches: {len(fedehockey_matches)}")
        print(f"Other matches: {len(other_matches)}")
        
        if fedepatin_matches:
            print("\nFirst 3 Fedepatin matches in InstantDB:")
            for m in fedepatin_matches[:3]:
                print(json.dumps(m, indent=2))
        else:
            print("\nNo Fedepatin matches found in InstantDB.")
            
except Exception as e:
    print("Error:", e)

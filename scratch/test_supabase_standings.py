import urllib.request
import json

url = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*)&limit=500"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total standings retrieved: {len(data)}")
        
        # Let's inspect a few standings records
        for i, standing in enumerate(data[:10]):
            team = standing.get('teams', {})
            team_name = team.get('name', 'Unknown')
            print(f"Standing {i+1}: Rank={standing.get('rank')}, Team={team_name}, Points={standing.get('points')}, Category={standing.get('category_id')}")
            
except Exception as e:
    print("Error:", e)

import urllib.request
import urllib.error
import json

url = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*),categories(*,divisions(*))&limit=500"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total standings retrieved: {len(data)}")
        
        # Let's inspect a few standings records with join
        for i, standing in enumerate(data[:5]):
            team = standing.get('teams', {})
            team_name = team.get('name', 'Unknown')
            category = standing.get('categories', {})
            category_name = category.get('name', 'Unknown')
            division = category.get('divisions', {}) if category else {}
            division_name = division.get('name', 'Unknown') if division else 'Unknown'
            
            print(f"Standing {i+1}: Rank={standing.get('rank')}, Team={team_name}, Points={standing.get('points')}")
            print(f"  -> Category: {category_name}, Division: {division_name}")
            
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

import urllib.request
import json

url = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/matches?select=*,match_teams(*,teams(*)),categories(*,divisions(*))&limit=500"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total matches retrieved: {len(data)}")
        
        # Collect all team names
        team_names = set()
        condors_games = 0
        wilddogs_games = 0
        
        for match in data:
            match_teams = match.get('match_teams', [])
            for mt in match_teams:
                team = mt.get('teams')
                if team:
                    name = team.get('name')
                    if name:
                        team_names.add(name)
                        if "CONDORS" in name.upper():
                            condors_games += 1
                        if "WILD DOGS" in name.upper() or "WILDDOGS" in name.upper():
                            wilddogs_games += 1
                            
        print(f"Total unique teams in Supabase: {len(team_names)}")
        print("Team names:", sorted(list(team_names)))
        print(f"Condors matches found: {condors_games}")
        print(f"Wild Dogs matches found: {wilddogs_games}")
        
except Exception as e:
    print("Error:", e)

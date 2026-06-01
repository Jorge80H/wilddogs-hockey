import urllib.request
import json
import uuid
import hashlib
import time

# Credentials
INSTANT_APP_ID = "27acc1e8-fce9-4800-a9cd-c769cea6844f"
INSTANT_ADMIN_TOKEN = "450f5899-e79f-4895-817d-109d61592977"

SUPABASE_URL_MATCHES = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/matches?select=*,match_teams(*,teams(*)),categories(*,divisions(*))&limit=500"
SUPABASE_URL_STANDINGS = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*),categories(*,divisions(*))&limit=500"

SUPABASE_HEADERS = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b2dleHNxaHZsZ2dlZWRmaHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQzNjgsImV4cCI6MjA4NzIwMDM2OH0.RuTf-Sz9Fgp9-KlUahzEMKR3RhvA6vJ-d4lL-m4-7wE"
}

def seed_uuid(seed):
    # Generates a deterministic UUID v4-like from a string seed matching JS
    h_val = 0
    for ch in seed:
        c = ord(ch)
        h_val = ((h_val << 5) - h_val) + c
        # Force to 32-bit signed integer: hash = hash & hash
        h_val = (h_val & 0xFFFFFFFF)
        if h_val >= 0x80000000:
            h_val -= 0x100000000

    def get_hex(n):
        val = abs(int(n))
        h_str = hex(val)[2:]  # Remove '0x'
        h_str = h_str.zfill(8)
        return h_str[:8]

    h1 = get_hex(h_val)
    h2 = get_hex(h_val * 31 + 7)
    h3 = get_hex(h_val * 37 + 13)
    h4 = get_hex(h_val * 41 + 17)

    return f"{h1}-{h2[0:4]}-4{h3[1:4]}-a{h4[1:4]}-{h2}{h3[0:4]}"

def fetch_supabase(url):
    req = urllib.request.Request(url, headers=SUPABASE_HEADERS)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def sync():
    now = int(time.time() * 1000)
    steps = []
    
    print("Fetching matches from Supabase...")
    raw_matches = fetch_supabase(SUPABASE_URL_MATCHES)
    print(f"Retrieved {len(raw_matches)} matches.")
    
    matches_count = 0
    for g in raw_matches:
        match_teams = g.get('match_teams')
        if not match_teams:
            continue
            
        # Wild Dogs plays as 'CONDORS' or 'WILD DOGS'
        is_wilddogs_game = False
        for mt in match_teams:
            team = mt.get('teams')
            if team and team.get('name'):
                name = team['name'].upper()
                if 'CONDORS' in name or 'WILD DOGS' in name:
                    is_wilddogs_game = True
                    break
                    
        if not is_wilddogs_game:
            continue
            
        home = next((mt for mt in match_teams if mt.get('side') == 'home'), None)
        away = next((mt for mt in match_teams if mt.get('side') == 'away'), None)
        
        home_name = home['teams']['name'] if home and home.get('teams') else 'Unknown'
        away_name = away['teams']['name'] if away and away.get('teams') else 'Unknown'
        home_score = home.get('score_regular') if home else None
        away_score = away.get('score_regular') if away else None
        
        is_home = 'CONDORS' in home_name.upper() or 'WILD DOGS' in home_name.upper()
        opponent = away_name if is_home else home_name
        played = g.get('status') in ['locked', 'played', 'finished']
        
        result = None
        if played and home_score is not None and away_score is not None:
            wd_score = home_score if is_home else away_score
            op_score = away_score if is_home else home_score
            if wd_score > op_score:
                result = 'win'
            elif wd_score < op_score:
                result = 'loss'
            else:
                result = 'draw'
                
        div_name = ''
        category = g.get('categories')
        if category:
            divisions = category.get('divisions')
            if divisions:
                div_name = divisions.get('name', '')
                
        cat_name = category.get('name', '') if category else ''
        full_division = f"{div_name} - {cat_name}" if div_name else cat_name
        
        uuid_str = seed_uuid('fp-match-' + str(g['id']))
        raw_date = g.get('match_date')
        if raw_date:
            try:
                cleaned_date = raw_date
                if cleaned_date.endswith('Z'):
                    cleaned_date = cleaned_date[:-1] + '+00:00'
                parts = cleaned_date.split('T')
                if len(parts) == 2:
                    time_part = parts[1]
                    if '+' not in time_part and '-' not in time_part:
                        cleaned_date = cleaned_date + '+00:00'
                
                import datetime
                dt = datetime.datetime.fromisoformat(cleaned_date)
                date_ms = int(dt.timestamp() * 1000)
            except Exception as e:
                print(f"Error parsing date {raw_date}: {e}")
                date_ms = now
        else:
            date_ms = now
            
        steps.append(['update', 'matches', uuid_str, {
            "gameId": str(g['id']),
            "date": date_ms,
            "opponent": opponent,
            "location": g.get('venue'),
            "homeScore": home_score if played else None,
            "awayScore": away_score if played else None,
            "result": result,
            "notes": (full_division) + (f" - {g.get('notes')}" if g.get('notes') else ""),
            "isHome": is_home,
            "status": g.get('status', 'unknown'),
            "league": "fedepatin",
            "createdAt": now,
            "updatedAt": now
        }])
        matches_count += 1
        
    print(f"Prepared {matches_count} matches for update.")
    
    print("\nFetching standings from Supabase with categories and divisions...")
    raw_standings = fetch_supabase(SUPABASE_URL_STANDINGS)
    print(f"Retrieved {len(raw_standings)} standings.")
    
    standings_count = 0
    for s in raw_standings:
        team = s.get('teams')
        team_name = team.get('name', 'Unknown') if team else 'Unknown'
        
        category = s.get('categories')
        div_name = ''
        if category:
            divisions = category.get('divisions')
            if divisions:
                div_name = divisions.get('name', '')
                
        cat_name = category.get('name', '') if category else ''
        full_division = f"{div_name} - {cat_name}" if div_name else cat_name
        
        # Unique key includes the actual division to avoid collision!
        key = f"{full_division}-{team_name}-fp"
        uuid_str = seed_uuid('standing-' + key)
        
        steps.append(['update', 'standings', uuid_str, {
            "teamName": team_name,
            "division": full_division,
            "position": s.get('rank', 0),
            "played": s.get('played', 0),
            "won": s.get('wins', 0),
            "drawn": s.get('draws', 0),
            "lost": s.get('losses', 0),
            "goalsFor": s.get('goals_for', 0),
            "goalsAgainst": s.get('goals_against', 0),
            "goalDifference": s.get('goal_diff', 0),
            "points": s.get('points', 0),
            "league": "fedepatin",
            "updatedAt": now
        }])
        standings_count += 1
        
    print(f"Prepared {standings_count} standings for update.")
    
    # Transact to InstantDB
    url = "https://api.instantdb.com/admin/transact"
    payload = json.dumps({"steps": steps}).encode('utf-8')
    headers = {
        "Content-Type": "application/json",
        "Content-Length": str(len(payload)),
        "App-Id": INSTANT_APP_ID,
        "Authorization": f"Bearer {INSTANT_ADMIN_TOKEN}"
    }
    
    print("\nSending transaction to InstantDB...")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("Transaction complete!")
            print("Result:", res_body)
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Response:", e.read().decode('utf-8'))
    except Exception as e:
        print("Error sending transaction:", e)

if __name__ == '__main__':
    sync()

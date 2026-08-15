import json

file_path = r"C:\Users\jorge\.gemini\antigravity\brain\76e18b21-e628-4bcc-896a-f7dbe129d0e4\.system_generated\steps\62\output.txt"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

workflow = data["data"]
nodes = workflow["nodes"]
connections = workflow["connections"]

# Let's find Node 3 ("Get Standings") and update url
node_3 = next((n for n in nodes if n["id"] == "3"), None)
if node_3:
    print("Found Node 3, updating URL...")
    node_3["parameters"]["url"] = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*),categories(*,divisions(*))&limit=500"

# Let's find Node 5 ("Parse Standings") and update jsCode
node_5 = next((n for n in nodes if n["id"] == "5"), None)
if node_5:
    print("Found Node 5, updating jsCode...")
    node_5["parameters"]["jsCode"] = """const results = [];
const items = $input.all();

for (const item of items) {
  const s = item.json;
  
  const teamName = s.teams ? s.teams.name : 'Unknown';
  
  let divName = '';
  if (s.categories && s.categories.divisions) {
      divName = s.categories.divisions.name;
  } else if (s.teams && s.teams.categories && s.teams.categories.divisions) {
      divName = s.teams.categories.divisions.name;
  }
  
  let catName = '';
  if (s.categories) {
      catName = s.categories.name;
  } else if (s.teams && s.teams.categories) {
      catName = s.teams.categories.name;
  }
  
  const fullDivision = divName ? divName + ' - ' + catName : catName;
  
  results.push({
    json: {
      type: 'standing',
      division: fullDivision,
      teamName: teamName,
      position: s.rank || 0,
      played: s.played || 0,
      won: s.wins || 0,
      drawn: s.draws || 0,
      lost: s.losses || 0,
      goalsFor: s.goals_for || 0,
      goalsAgainst: s.goals_against || 0,
      goalDifference: s.goal_diff || 0,
      points: s.points || 0
    }
  });
}
return results;"""

# Write nodes and connections to separate files so we can load them or view them
with open("scratch/updated_nodes.json", "w", encoding="utf-8") as out:
    json.dump(nodes, out, indent=2)

with open("scratch/updated_connections.json", "w", encoding="utf-8") as out:
    json.dump(connections, out, indent=2)

print("Nodes and connections updated and written to scratch/ directory.")

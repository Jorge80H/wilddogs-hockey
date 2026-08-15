import json

file_path = r"C:\Users\jorge\.gemini\antigravity\brain\76e18b21-e628-4bcc-896a-f7dbe129d0e4\.system_generated\steps\62\output.txt"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

workflow = data["data"]
nodes = workflow["nodes"]
connections = workflow["connections"]

# Let's clean the nodes array: remove read-only fields like 'id', 'createdAt', 'updatedAt' from nodes
cleaned_nodes = []
for node in nodes:
    cleaned_node = {
        "name": node.get("name"),
        "type": node.get("type"),
        "typeVersion": node.get("typeVersion"),
        "position": node.get("position"),
        "parameters": node.get("parameters", {})
    }
    
    # If the node has credentials, keep them
    if "credentials" in node:
        cleaned_node["credentials"] = node["credentials"]
        
    cleaned_nodes.append(cleaned_node)

# Let's update URL of Get Standings in cleaned_nodes
get_standings_node = next((n for n in cleaned_nodes if n["name"] == "Get Standings"), None)
if get_standings_node:
    print("Updating Get Standings URL...")
    get_standings_node["parameters"]["url"] = "https://pzogexsqhvlggeedfhsh.supabase.co/rest/v1/standings_aggregate?select=*,teams(*),categories(*,divisions(*))&limit=500"

# Let's update jsCode of Parse Standings in cleaned_nodes
parse_standings_node = next((n for n in cleaned_nodes if n["name"] == "Parse Standings"), None)
if parse_standings_node:
    print("Updating Parse Standings JS code...")
    parse_standings_node["parameters"]["jsCode"] = """const results = [];
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

# Write cleaned nodes to scratch
with open("scratch/cleaned_nodes.json", "w", encoding="utf-8") as out:
    json.dump(cleaned_nodes, out, indent=2)

print("Cleaned nodes written to scratch/cleaned_nodes.json")

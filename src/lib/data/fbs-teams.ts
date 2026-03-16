export interface FBSTeam {
  name: string;
  mascot: string;
  conference: string;
}

export const FBS_TEAMS: FBSTeam[] = [
  // ── SEC (16) ──────────────────────────────────────────────
  { name: "Alabama", mascot: "Crimson Tide", conference: "SEC" },
  { name: "Arkansas", mascot: "Razorbacks", conference: "SEC" },
  { name: "Auburn", mascot: "Tigers", conference: "SEC" },
  { name: "Florida", mascot: "Gators", conference: "SEC" },
  { name: "Georgia", mascot: "Bulldogs", conference: "SEC" },
  { name: "Kentucky", mascot: "Wildcats", conference: "SEC" },
  { name: "LSU", mascot: "Tigers", conference: "SEC" },
  { name: "Mississippi State", mascot: "Bulldogs", conference: "SEC" },
  { name: "Missouri", mascot: "Tigers", conference: "SEC" },
  { name: "Oklahoma", mascot: "Sooners", conference: "SEC" },
  { name: "Ole Miss", mascot: "Rebels", conference: "SEC" },
  { name: "South Carolina", mascot: "Gamecocks", conference: "SEC" },
  { name: "Tennessee", mascot: "Volunteers", conference: "SEC" },
  { name: "Texas", mascot: "Longhorns", conference: "SEC" },
  { name: "Texas A&M", mascot: "Aggies", conference: "SEC" },
  { name: "Vanderbilt", mascot: "Commodores", conference: "SEC" },

  // ── Big Ten (18) ──────────────────────────────────────────
  { name: "Illinois", mascot: "Fighting Illini", conference: "Big Ten" },
  { name: "Indiana", mascot: "Hoosiers", conference: "Big Ten" },
  { name: "Iowa", mascot: "Hawkeyes", conference: "Big Ten" },
  { name: "Maryland", mascot: "Terrapins", conference: "Big Ten" },
  { name: "Michigan", mascot: "Wolverines", conference: "Big Ten" },
  { name: "Michigan State", mascot: "Spartans", conference: "Big Ten" },
  { name: "Minnesota", mascot: "Golden Gophers", conference: "Big Ten" },
  { name: "Nebraska", mascot: "Cornhuskers", conference: "Big Ten" },
  { name: "Northwestern", mascot: "Wildcats", conference: "Big Ten" },
  { name: "Ohio State", mascot: "Buckeyes", conference: "Big Ten" },
  { name: "Oregon", mascot: "Ducks", conference: "Big Ten" },
  { name: "Penn State", mascot: "Nittany Lions", conference: "Big Ten" },
  { name: "Purdue", mascot: "Boilermakers", conference: "Big Ten" },
  { name: "Rutgers", mascot: "Scarlet Knights", conference: "Big Ten" },
  { name: "UCLA", mascot: "Bruins", conference: "Big Ten" },
  { name: "USC", mascot: "Trojans", conference: "Big Ten" },
  { name: "Washington", mascot: "Huskies", conference: "Big Ten" },
  { name: "Wisconsin", mascot: "Badgers", conference: "Big Ten" },

  // ── Big 12 (16) ───────────────────────────────────────────
  { name: "Arizona", mascot: "Wildcats", conference: "Big 12" },
  { name: "Arizona State", mascot: "Sun Devils", conference: "Big 12" },
  { name: "Baylor", mascot: "Bears", conference: "Big 12" },
  { name: "BYU", mascot: "Cougars", conference: "Big 12" },
  { name: "Cincinnati", mascot: "Bearcats", conference: "Big 12" },
  { name: "Colorado", mascot: "Buffaloes", conference: "Big 12" },
  { name: "Houston", mascot: "Cougars", conference: "Big 12" },
  { name: "Iowa State", mascot: "Cyclones", conference: "Big 12" },
  { name: "Kansas", mascot: "Jayhawks", conference: "Big 12" },
  { name: "Kansas State", mascot: "Wildcats", conference: "Big 12" },
  { name: "Oklahoma State", mascot: "Cowboys", conference: "Big 12" },
  { name: "TCU", mascot: "Horned Frogs", conference: "Big 12" },
  { name: "Texas Tech", mascot: "Red Raiders", conference: "Big 12" },
  { name: "UCF", mascot: "Knights", conference: "Big 12" },
  { name: "Utah", mascot: "Utes", conference: "Big 12" },
  { name: "West Virginia", mascot: "Mountaineers", conference: "Big 12" },

  // ── ACC (17) ──────────────────────────────────────────────
  { name: "Boston College", mascot: "Eagles", conference: "ACC" },
  { name: "California", mascot: "Golden Bears", conference: "ACC" },
  { name: "Clemson", mascot: "Tigers", conference: "ACC" },
  { name: "Duke", mascot: "Blue Devils", conference: "ACC" },
  { name: "Florida State", mascot: "Seminoles", conference: "ACC" },
  { name: "Georgia Tech", mascot: "Yellow Jackets", conference: "ACC" },
  { name: "Louisville", mascot: "Cardinals", conference: "ACC" },
  { name: "Miami", mascot: "Hurricanes", conference: "ACC" },
  { name: "NC State", mascot: "Wolfpack", conference: "ACC" },
  { name: "North Carolina", mascot: "Tar Heels", conference: "ACC" },
  { name: "Notre Dame", mascot: "Fighting Irish", conference: "ACC" },
  { name: "Pitt", mascot: "Panthers", conference: "ACC" },
  { name: "SMU", mascot: "Mustangs", conference: "ACC" },
  { name: "Stanford", mascot: "Cardinal", conference: "ACC" },
  { name: "Syracuse", mascot: "Orange", conference: "ACC" },
  { name: "Virginia", mascot: "Cavaliers", conference: "ACC" },
  { name: "Virginia Tech", mascot: "Hokies", conference: "ACC" },
  { name: "Wake Forest", mascot: "Demon Deacons", conference: "ACC" },

  // ── American (14) ────────────────────────────────────────
  { name: "Army", mascot: "Black Knights", conference: "American" },
  { name: "Charlotte", mascot: "49ers", conference: "American" },
  { name: "East Carolina", mascot: "Pirates", conference: "American" },
  { name: "FAU", mascot: "Owls", conference: "American" },
  { name: "Memphis", mascot: "Tigers", conference: "American" },
  { name: "Navy", mascot: "Midshipmen", conference: "American" },
  { name: "North Texas", mascot: "Mean Green", conference: "American" },
  { name: "Rice", mascot: "Owls", conference: "American" },
  { name: "South Florida", mascot: "Bulls", conference: "American" },
  { name: "Temple", mascot: "Owls", conference: "American" },
  { name: "Tulane", mascot: "Green Wave", conference: "American" },
  { name: "Tulsa", mascot: "Golden Hurricane", conference: "American" },
  { name: "UAB", mascot: "Blazers", conference: "American" },
  { name: "UTSA", mascot: "Roadrunners", conference: "American" },

  // ── Conference USA (10) ──────────────────────────────────
  { name: "FIU", mascot: "Panthers", conference: "Conference USA" },
  { name: "Jacksonville State", mascot: "Gamecocks", conference: "Conference USA" },
  { name: "Kennesaw State", mascot: "Owls", conference: "Conference USA" },
  { name: "Liberty", mascot: "Flames", conference: "Conference USA" },
  { name: "Louisiana Tech", mascot: "Bulldogs", conference: "Conference USA" },
  { name: "Middle Tennessee", mascot: "Blue Raiders", conference: "Conference USA" },
  { name: "New Mexico State", mascot: "Aggies", conference: "Conference USA" },
  { name: "Sam Houston", mascot: "Bearkats", conference: "Conference USA" },
  { name: "Western Kentucky", mascot: "Hilltoppers", conference: "Conference USA" },
  { name: "UTEP", mascot: "Miners", conference: "Conference USA" },

  // ── MAC (12) ─────────────────────────────────────────────
  { name: "Akron", mascot: "Zips", conference: "MAC" },
  { name: "Ball State", mascot: "Cardinals", conference: "MAC" },
  { name: "Bowling Green", mascot: "Falcons", conference: "MAC" },
  { name: "Buffalo", mascot: "Bulls", conference: "MAC" },
  { name: "Central Michigan", mascot: "Chippewas", conference: "MAC" },
  { name: "Eastern Michigan", mascot: "Eagles", conference: "MAC" },
  { name: "Kent State", mascot: "Golden Flashes", conference: "MAC" },
  { name: "Miami (OH)", mascot: "RedHawks", conference: "MAC" },
  { name: "Northern Illinois", mascot: "Huskies", conference: "MAC" },
  { name: "Ohio", mascot: "Bobcats", conference: "MAC" },
  { name: "Toledo", mascot: "Rockets", conference: "MAC" },
  { name: "Western Michigan", mascot: "Broncos", conference: "MAC" },

  // ── Mountain West (12) ───────────────────────────────────
  { name: "Air Force", mascot: "Falcons", conference: "Mountain West" },
  { name: "Boise State", mascot: "Broncos", conference: "Mountain West" },
  { name: "Colorado State", mascot: "Rams", conference: "Mountain West" },
  { name: "Fresno State", mascot: "Bulldogs", conference: "Mountain West" },
  { name: "Hawaii", mascot: "Rainbow Warriors", conference: "Mountain West" },
  { name: "Nevada", mascot: "Wolf Pack", conference: "Mountain West" },
  { name: "New Mexico", mascot: "Lobos", conference: "Mountain West" },
  { name: "San Diego State", mascot: "Aztecs", conference: "Mountain West" },
  { name: "San Jose State", mascot: "Spartans", conference: "Mountain West" },
  { name: "UNLV", mascot: "Rebels", conference: "Mountain West" },
  { name: "Utah State", mascot: "Aggies", conference: "Mountain West" },
  { name: "Wyoming", mascot: "Cowboys", conference: "Mountain West" },

  // ── Sun Belt (14) ────────────────────────────────────────
  { name: "Appalachian State", mascot: "Mountaineers", conference: "Sun Belt" },
  { name: "Arkansas State", mascot: "Red Wolves", conference: "Sun Belt" },
  { name: "Coastal Carolina", mascot: "Chanticleers", conference: "Sun Belt" },
  { name: "Georgia Southern", mascot: "Eagles", conference: "Sun Belt" },
  { name: "Georgia State", mascot: "Panthers", conference: "Sun Belt" },
  { name: "James Madison", mascot: "Dukes", conference: "Sun Belt" },
  { name: "Louisiana", mascot: "Ragin' Cajuns", conference: "Sun Belt" },
  { name: "Louisiana-Monroe", mascot: "Warhawks", conference: "Sun Belt" },
  { name: "Marshall", mascot: "Thundering Herd", conference: "Sun Belt" },
  { name: "Old Dominion", mascot: "Monarchs", conference: "Sun Belt" },
  { name: "South Alabama", mascot: "Jaguars", conference: "Sun Belt" },
  { name: "Southern Miss", mascot: "Golden Eagles", conference: "Sun Belt" },
  { name: "Texas State", mascot: "Bobcats", conference: "Sun Belt" },
  { name: "Troy", mascot: "Trojans", conference: "Sun Belt" },

  // ── Independent (1) ──────────────────────────────────────
  { name: "UConn", mascot: "Huskies", conference: "Independent" },
];

export function getConferences(): string[] {
  const conferences = new Set(FBS_TEAMS.map((team) => team.conference));
  return Array.from(conferences).sort();
}

export function getTeamsByConference(conference: string): FBSTeam[] {
  return FBS_TEAMS.filter((team) => team.conference === conference);
}

/**
 * Real-life inspired college football social media post patterns.
 * Used as few-shot examples to train the AI generator for authentic social content.
 *
 * Covers: fan reactions, analyst takes, rival trolling, recruiting/portal,
 * NIL reactions, rankings controversy, gameday atmosphere, insider breaking news,
 * funny/viral posts, and serious film/stat analysis.
 */

export interface SocialPostPattern {
  id: number;
  category: string;
  body: string;
  type: "fan" | "analyst" | "troll" | "insider" | "media" | "recruiting";
  contextTags: string[];
  engagement: { likes: [number, number]; reposts: [number, number] };
}

export const SOCIAL_MEDIA_DB: SocialPostPattern[] = [
  // ── FAN REACTIONS ──
  {
    id: 1,
    category: "fan_reactions",
    body: "{coach} is HIM. I don't wanna hear ANYTHING from the haters. {school} is BACK.",
    type: "fan",
    contextTags: ["post_win", "blowout"],
    engagement: { likes: [200, 1500], reposts: [30, 200] },
  },
  {
    id: 2,
    category: "fan_reactions",
    body: "Fire {coach}. Fire the DC. Fire the OC. Fire the strength coach. Fire the guy who waters the field. Burn it all down.",
    type: "fan",
    contextTags: ["post_loss", "blowout"],
    engagement: { likes: [500, 5000], reposts: [100, 800] },
  },
  {
    id: 3,
    category: "fan_reactions",
    body: "I'm a {school} fan. I will ALWAYS be a {school} fan. But I am not having fun right now.",
    type: "fan",
    contextTags: ["post_loss", "mid_season_struggle"],
    engagement: { likes: [300, 3000], reposts: [50, 400] },
  },
  {
    id: 4,
    category: "fan_reactions",
    body: "WE WANT BAMA. AND I'M NOT JOKING THIS TIME.",
    type: "fan",
    contextTags: ["post_win", "blowout", "hype"],
    engagement: { likes: [400, 4000], reposts: [80, 600] },
  },
  {
    id: 5,
    category: "fan_reactions",
    body: "{school} {userScore}-{opponentScore} over {opponent}. The vibes are immaculate. See you all next Saturday.",
    type: "fan",
    contextTags: ["post_win"],
    engagement: { likes: [150, 1200], reposts: [20, 150] },
  },
  {
    id: 6,
    category: "fan_reactions",
    body: "Everyone who said {player} was washed owes that man an apology. ON THE ROAD. Against {opponent}. Put some respect on that name.",
    type: "fan",
    contextTags: ["post_win", "player_performance"],
    engagement: { likes: [600, 5000], reposts: [100, 700] },
  },
  {
    id: 7,
    category: "fan_reactions",
    body: "I am once again asking {school} to not give me a heart attack in the 4th quarter",
    type: "fan",
    contextTags: ["close_game", "in_game"],
    engagement: { likes: [300, 2500], reposts: [40, 300] },
  },
  {
    id: 8,
    category: "fan_reactions",
    body: "I knew we were gonna lose. I said it all week. Nobody listened. I'm not even mad. (I am extremely mad.)",
    type: "fan",
    contextTags: ["post_loss", "upset"],
    engagement: { likes: [400, 3500], reposts: [60, 500] },
  },
  {
    id: 9,
    category: "fan_reactions",
    body: "{school} fans when we're winning: 110,000 people in the stadium. {school} fans when we're losing: \"I've always been more of a basketball school guy\"",
    type: "fan",
    contextTags: ["post_loss", "mid_season_struggle"],
    engagement: { likes: [500, 4000], reposts: [80, 600] },
  },
  {
    id: 10,
    category: "fan_reactions",
    body: "My wife just asked why I'm staring at the ceiling at 2am. I told her I'm still thinking about that 3rd and 7 play call. She's considering divorce. I'm considering it too if {coach} keeps calling screens on 3rd and long.",
    type: "fan",
    contextTags: ["post_loss", "play_calling"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 11,
    category: "fan_reactions",
    body: "Rename the Heisman after {player}. I'm dead serious. What we just witnessed was the greatest individual performance in {school} history.",
    type: "fan",
    contextTags: ["post_win", "player_performance", "hype"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 12,
    category: "fan_reactions",
    body: "That's my QUARTERBACK. That's MY quarterback. He came to {school} when nobody believed. And now look at him. What a story.",
    type: "fan",
    contextTags: ["post_win", "player_performance", "emotional"],
    engagement: { likes: [700, 6000], reposts: [120, 900] },
  },
  {
    id: 13,
    category: "fan_reactions",
    body: "I'm not overreacting. I'm reacting the CORRECT amount. {school} just lost to a team that lost to an FCS school. This is a FIVE ALARM FIRE.",
    type: "fan",
    contextTags: ["post_loss", "upset", "overreaction"],
    engagement: { likes: [700, 5000], reposts: [120, 800] },
  },

  // ── ANALYST / MEDIA TAKES ──
  {
    id: 14,
    category: "analyst_media",
    body: "{school} might be the most complete team in the country right now. The defense is elite, the QB is playing like a Heisman contender, and the schedule sets up perfectly for a playoff run.",
    type: "analyst",
    contextTags: ["mid_season", "rankings", "hype"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 15,
    category: "analyst_media",
    body: "I've been saying this for weeks: {school} is not as good as their record suggests. That {opponent} game exposed everything. The offensive line can't pass protect, and {coach} is out of answers.",
    type: "analyst",
    contextTags: ["post_loss", "upset", "criticism"],
    engagement: { likes: [800, 7000], reposts: [150, 1200] },
  },
  {
    id: 16,
    category: "analyst_media",
    body: "College football is the greatest sport on earth and I will not be taking questions at this time. {school} vs {opponent}. In overtime. On a last-second play. Nothing else comes close.",
    type: "media",
    contextTags: ["post_game", "upset", "overtime"],
    engagement: { likes: [2000, 15000], reposts: [400, 3000] },
  },
  {
    id: 17,
    category: "analyst_media",
    body: "Updated playoff projections after Week {week}: Things are about to get VERY interesting. Multiple teams with legit claims and only so many spots. This is going to be a wild finish.",
    type: "analyst",
    contextTags: ["rankings", "playoff", "mid_season"],
    engagement: { likes: [1500, 12000], reposts: [300, 2500] },
  },
  {
    id: 18,
    category: "analyst_media",
    body: "Week {week} was absolutely UNHINGED. Upsets everywhere. College football Season of Chaos continues.",
    type: "media",
    contextTags: ["weekly_recap", "chaos"],
    engagement: { likes: [2000, 15000], reposts: [500, 4000] },
  },
  {
    id: 19,
    category: "analyst_media",
    body: "Unpopular opinion: {school} is going to lose to {opponent} this weekend. {opponent} matches up well schematically. Give me the upset.",
    type: "analyst",
    contextTags: ["prediction", "preview", "hot_take"],
    engagement: { likes: [400, 3500], reposts: [60, 500] },
  },
  {
    id: 20,
    category: "analyst_media",
    body: "What {coach} just did at {school} — rebuilding this roster, changing the culture, winning in Year 2 — is one of the most impressive coaching jobs I've seen. The man can flat-out coach.",
    type: "media",
    contextTags: ["coaching_praise", "season_review"],
    engagement: { likes: [500, 4000], reposts: [80, 600] },
  },
  {
    id: 21,
    category: "analyst_media",
    body: "Okay so we're just going to pretend that {school}'s win over {opponent} was impressive? They beat a team that might not go bowling. Resume. Matters.",
    type: "analyst",
    contextTags: ["rankings", "resume_debate", "criticism"],
    engagement: { likes: [600, 5000], reposts: [100, 800] },
  },

  // ── RIVAL TROLLING ──
  {
    id: 22,
    category: "rival_trolling",
    body: "{opponent} fans really thought this was their year. It's ALWAYS next year with y'all.",
    type: "troll",
    contextTags: ["rivalry", "post_win", "schadenfreude"],
    engagement: { likes: [500, 4000], reposts: [80, 600] },
  },
  {
    id: 23,
    category: "rival_trolling",
    body: "Scoreboard. {school} {userScore} - {opponent} {opponentScore}. See you next year. Or don't. I don't care. Actually I do. Because we OWN you.",
    type: "troll",
    contextTags: ["rivalry", "post_win"],
    engagement: { likes: [600, 5000], reposts: [100, 700] },
  },
  {
    id: 24,
    category: "rival_trolling",
    body: "Thinking about how {opponent} paid all that NIL money just to lose to us. Beautiful ROI. Chef's kiss.",
    type: "troll",
    contextTags: ["nil", "rivalry", "post_win"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 25,
    category: "rival_trolling",
    body: "{opponent} fans deleting tweets at a record pace rn. Y'all were REAL quiet in that 4th quarter.",
    type: "troll",
    contextTags: ["post_win", "comeback", "rivalry"],
    engagement: { likes: [500, 4500], reposts: [80, 600] },
  },
  {
    id: 26,
    category: "rival_trolling",
    body: "Living rent free in {opponent}'s head since forever. They hate us cause they ain't us.",
    type: "troll",
    contextTags: ["rivalry", "general"],
    engagement: { likes: [300, 2000], reposts: [40, 250] },
  },
  {
    id: 27,
    category: "rival_trolling",
    body: "{opponent} really scheduled 3 FCS teams, went 2-1 against them, and wants to talk trash. You can't make this up.",
    type: "troll",
    contextTags: ["rivalry", "schedule_strength", "humor"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },

  // ── RECRUITING / PORTAL ──
  {
    id: 28,
    category: "recruiting",
    body: "BOOM! 5-star {position} has COMMITTED to {school}! This changes EVERYTHING for the class. {coach} is cooking.",
    type: "recruiting",
    contextTags: ["commitment", "top_recruit"],
    engagement: { likes: [1000, 10000], reposts: [200, 2000] },
  },
  {
    id: 29,
    category: "recruiting",
    body: "BREAKING: Top recruit has DECOMMITTED from {school}. This one stings. Multiple schools already in contact.",
    type: "recruiting",
    contextTags: ["decommitment", "recruiting_drama"],
    engagement: { likes: [800, 7000], reposts: [200, 1500] },
  },
  {
    id: 30,
    category: "recruiting",
    body: "The transfer portal is open and it's already CHAOS. Phones are ringing EVERYWHERE.",
    type: "insider",
    contextTags: ["portal", "transfer"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 31,
    category: "recruiting",
    body: "{school} fans: \"We don't need the portal, we develop our guys.\" {school} after going {record}: *aggressively refreshing the portal page*",
    type: "fan",
    contextTags: ["portal", "humor"],
    engagement: { likes: [600, 5000], reposts: [100, 700] },
  },
  {
    id: 32,
    category: "recruiting",
    body: "Can confirm: portal target will be visiting {school} this weekend. Mutual interest is HIGH. This one could move fast. Stay tuned.",
    type: "insider",
    contextTags: ["recruiting", "visit"],
    engagement: { likes: [400, 3500], reposts: [60, 500] },
  },

  // ── FUNNY / VIRAL ──
  {
    id: 33,
    category: "funny_viral",
    body: "Being a {school} fan is a 12-step program and I'm on step 1 which is watching us lose to unranked teams in November every single year",
    type: "fan",
    contextTags: ["humor", "self_deprecating", "post_loss"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 34,
    category: "funny_viral",
    body: "{school}'s offense today: Run up the middle for 2 yards. Run up the middle for 1 yard. Incomplete pass into triple coverage. Punt. Repeat for 4 quarters. That'll be $85 for your ticket please.",
    type: "fan",
    contextTags: ["humor", "post_loss", "play_calling"],
    engagement: { likes: [1500, 12000], reposts: [300, 2000] },
  },
  {
    id: 35,
    category: "funny_viral",
    body: "My therapist: \"What triggers your anxiety?\" Me: \"{school} having a 4th quarter lead\"",
    type: "fan",
    contextTags: ["humor", "close_game"],
    engagement: { likes: [800, 7000], reposts: [150, 1200] },
  },
  {
    id: 36,
    category: "funny_viral",
    body: "Stages of being a {school} fan: 1. Preseason optimism 2. Week 3 reality check 3. False hope after a quality win 4. November collapse 5. \"We'll be scary next year\" 6. Repeat",
    type: "fan",
    contextTags: ["humor", "self_deprecating"],
    engagement: { likes: [1200, 10000], reposts: [250, 1800] },
  },
  {
    id: 37,
    category: "funny_viral",
    body: "I would simply not throw an interception on 3rd and 2 in the red zone in a one-score game. But that's just me. I'm different.",
    type: "fan",
    contextTags: ["humor", "post_loss", "in_game"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 38,
    category: "funny_viral",
    body: "My dad, a {school} alum, just turned the TV off, said \"I'm done with this program,\" then sat back down and turned it back on 45 seconds later. Generational trauma is real.",
    type: "fan",
    contextTags: ["humor", "post_loss"],
    engagement: { likes: [2000, 15000], reposts: [400, 3000] },
  },
  {
    id: 39,
    category: "funny_viral",
    body: "College football is the only sport where you can be ranked #4, win every game, and somehow be ranked #6 two weeks later. Make it make sense.",
    type: "fan",
    contextTags: ["humor", "rankings"],
    engagement: { likes: [2000, 15000], reposts: [400, 3000] },
  },
  {
    id: 40,
    category: "funny_viral",
    body: "Ref just made a call where nothing happened. My blood pressure is 400/200. I'm typing this from the afterlife.",
    type: "fan",
    contextTags: ["humor", "in_game", "officiating"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 41,
    category: "funny_viral",
    body: "\"What's your toxic trait?\" I convince myself {school} is going to win the natty every single year based on absolutely nothing and then act shocked when we go 7-5.",
    type: "fan",
    contextTags: ["humor", "self_deprecating", "preseason"],
    engagement: { likes: [1500, 12000], reposts: [300, 2000] },
  },

  // ── INSIDER / BREAKING NEWS ──
  {
    id: 42,
    category: "insider_breaking",
    body: "Sources: {school} is expected to make a major coaching move. Deal is in the finalizing stage. Announcement could come soon. More details coming.",
    type: "insider",
    contextTags: ["coaching_hire", "breaking_news"],
    engagement: { likes: [2000, 20000], reposts: [500, 5000] },
  },
  {
    id: 43,
    category: "insider_breaking",
    body: "I'm told {school}'s starter suffered an injury in practice this week. Status for Saturday's game vs {opponent} is uncertain.",
    type: "insider",
    contextTags: ["injury", "breaking_news"],
    engagement: { likes: [500, 4000], reposts: [100, 800] },
  },
  {
    id: 44,
    category: "insider_breaking",
    body: "Just spoke with someone in the {school} building. The mood after tonight's loss is \"angry, not defeated.\" Players-only meeting happened. This group isn't folding. Not yet.",
    type: "insider",
    contextTags: ["post_loss", "locker_room", "insider_info"],
    engagement: { likes: [500, 4000], reposts: [80, 600] },
  },
  {
    id: 45,
    category: "insider_breaking",
    body: "Hearing {school} is making a STRONG push for a portal target. NIL package is believed to be significant. Decision expected soon.",
    type: "insider",
    contextTags: ["portal", "nil", "transfer"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 46,
    category: "insider_breaking",
    body: "Per source close to the program: {coach} met with administration today. Both sides want to continue the relationship but there are \"things to work out.\" Reading between the lines...",
    type: "insider",
    contextTags: ["coaching_rumors", "job_security"],
    engagement: { likes: [600, 5000], reposts: [120, 900] },
  },

  // ── NIL REACTIONS ──
  {
    id: 47,
    category: "nil_reactions",
    body: "So let me get this straight. {school} can drop huge money on a quarterback from the portal but I still have to pay $12 for a parking pass at the stadium? Make it make sense.",
    type: "fan",
    contextTags: ["nil", "humor", "complaint"],
    engagement: { likes: [1500, 12000], reposts: [300, 2000] },
  },
  {
    id: 48,
    category: "nil_reactions",
    body: "NIL is ruining college football. Also me: \"Why didn't we offer that guy more money?? We're getting out-bid by {opponent}!\"",
    type: "fan",
    contextTags: ["nil", "humor", "hypocrisy"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 49,
    category: "nil_reactions",
    body: "The {school} NIL collective just announced a new partnership that should significantly boost their recruiting budget. The arms race continues.",
    type: "media",
    contextTags: ["nil", "collective", "recruiting"],
    engagement: { likes: [300, 2500], reposts: [40, 300] },
  },
  {
    id: 50,
    category: "nil_reactions",
    body: "Old CFB: \"I play for the love of the game.\" New CFB: Player announces school choice after reviewing final NIL offers. I'm not saying which is better. I'm just saying it's different.",
    type: "media",
    contextTags: ["nil", "commentary"],
    engagement: { likes: [600, 5000], reposts: [100, 800] },
  },

  // ── RANKINGS REACTIONS ──
  {
    id: 51,
    category: "rankings_reactions",
    body: "{school} beats {opponent} by {margin} and DROPS in the rankings?? The committee is a JOKE. What do we have to do??",
    type: "fan",
    contextTags: ["rankings", "disrespect"],
    engagement: { likes: [800, 7000], reposts: [150, 1200] },
  },
  {
    id: 52,
    category: "rankings_reactions",
    body: "The playoff committee when {school} wins: \"But who have they REALLY beaten?\" The committee when their rival wins: \"QUALITY. DOMINANT. IMPRESSIVE.\"",
    type: "fan",
    contextTags: ["rankings", "bias", "humor"],
    engagement: { likes: [1200, 10000], reposts: [250, 1800] },
  },
  {
    id: 53,
    category: "rankings_reactions",
    body: "AP Poll just dropped. {school} at #{ranking}. I'm going to say this calmly and rationally: THEY SHOULD BE AT LEAST 4 SPOTS HIGHER AND THE VOTERS ARE COWARDS.",
    type: "fan",
    contextTags: ["rankings", "poll_reaction"],
    engagement: { likes: [600, 5000], reposts: [100, 700] },
  },

  // ── SERIOUS ANALYST / FILM ──
  {
    id: 54,
    category: "serious_analyst",
    body: "Watched the {school}-{opponent} film. The QB is seeing the field differently since Week {week}. Pre-snap reads are faster, he's manipulating the safety with his eyes, and the RPO game is lethal. This offense is evolving.",
    type: "analyst",
    contextTags: ["film_breakdown", "scheme_analysis"],
    engagement: { likes: [400, 3000], reposts: [60, 500] },
  },
  {
    id: 55,
    category: "serious_analyst",
    body: "{school}'s defense is running a TON of single-high Cover 3 with aggressive press. It works because the LB can cover ground sideline to sideline. But when teams go 4-wide, they're vulnerable in the slot.",
    type: "analyst",
    contextTags: ["scheme_analysis", "preview"],
    engagement: { likes: [300, 2000], reposts: [40, 300] },
  },
  {
    id: 56,
    category: "serious_analyst",
    body: "Something I noticed on film: {school} is using max protection on early downs, which tells me they don't trust the OL in standard sets. {coach} is scheming around a weakness, and it's working — but it limits the route tree.",
    type: "analyst",
    contextTags: ["film_breakdown", "scheme_analysis", "criticism"],
    engagement: { likes: [200, 1500], reposts: [30, 200] },
  },
  {
    id: 57,
    category: "serious_analyst",
    body: "The gap between {school}'s EPA on scripted plays vs unscripted plays is staggering. {coach} is a great game-planner. But when the other team adjusts, this offense stalls. That's an in-game coaching problem.",
    type: "analyst",
    contextTags: ["stats", "advanced_analytics", "criticism"],
    engagement: { likes: [300, 2500], reposts: [50, 400] },
  },

  // ── GAMEDAY ATMOSPHERE ──
  {
    id: 58,
    category: "gameday_atmosphere",
    body: "Just pulled into the parking lot. It's 7 AM. The game doesn't start until 7 PM. There are already 500 people here. College football, man. Nothing like it.",
    type: "fan",
    contextTags: ["gameday", "tailgate", "atmosphere"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 59,
    category: "gameday_atmosphere",
    body: "The atmosphere at the stadium right now is UNREAL. You literally cannot hear yourself think. {opponent} has no idea what they just walked into.",
    type: "fan",
    contextTags: ["gameday", "atmosphere", "in_game"],
    engagement: { likes: [800, 6000], reposts: [150, 1000] },
  },
  {
    id: 60,
    category: "gameday_atmosphere",
    body: "Night game. Sold out. Unranked {school} vs ranked {opponent}. Trap game energy is OFF THE CHARTS. Prayers up for {opponent}'s sideline because this crowd is about to be a factor.",
    type: "fan",
    contextTags: ["gameday", "atmosphere", "night_game"],
    engagement: { likes: [600, 5000], reposts: [100, 700] },
  },
  {
    id: 61,
    category: "gameday_atmosphere",
    body: "Tailgate report: brisket is hitting, the bloody marys are flowing, we've already had 3 cornhole arguments, and my uncle is loudly guaranteeing a 42-10 win. God I love Saturdays.",
    type: "fan",
    contextTags: ["gameday", "tailgate", "humor"],
    engagement: { likes: [500, 4000], reposts: [80, 600] },
  },
  {
    id: 62,
    category: "gameday_atmosphere",
    body: "Just walked into this stadium for the first time. NOTHING prepares you for this in person. The size. The noise. The tradition. I'm not crying. You're crying. (I'm crying.)",
    type: "fan",
    contextTags: ["gameday", "atmosphere", "first_visit"],
    engagement: { likes: [1000, 8000], reposts: [200, 1500] },
  },
  {
    id: 63,
    category: "gameday_atmosphere",
    body: "Sunset over the stadium. 4th quarter. {school} up big. The whole crowd singing the fight song. Screenshot this. Frame it. This is the peak.",
    type: "fan",
    contextTags: ["gameday", "atmosphere", "emotional", "post_win"],
    engagement: { likes: [1200, 10000], reposts: [250, 1800] },
  },
];

/**
 * Select social post patterns that match the given game context.
 */
export function selectSocialPatterns(
  result: "W" | "L",
  context: {
    isBlowout?: boolean;
    isUpset?: boolean;
    isRivalry?: boolean;
    ranking?: number | null;
    week?: number;
  }
): SocialPostPattern[] {
  return SOCIAL_MEDIA_DB.filter((p) => {
    const tags = p.contextTags;

    // Filter out wrong-result posts
    if (result === "W" && tags.includes("post_loss") && !tags.includes("post_win")) return false;
    if (result === "L" && tags.includes("post_win") && !tags.includes("post_loss")) return false;

    // Don't show rivalry trolling if not a rivalry game
    if (p.category === "rival_trolling" && !context.isRivalry) return false;

    return true;
  });
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Masthead from "@/components/masthead";
import NavBar from "@/components/navbar";
import BreakingTicker from "@/components/breaking-ticker";
import { SettingsProvider } from "@/components/settings/settings-context";
import SettingsDrawer from "@/components/settings/settings-drawer";
import { TutorialProvider } from "@/components/tutorial/tutorial-context";
import TutorialWizard from "@/components/tutorial/tutorial-wizard";
import type { SeasonState } from "@/lib/state/schema";

function buildTickerItems(
  school: string,
  conference: string,
  coachName: string,
  state: SeasonState | null
): string[] {
  const items: string[] = [];

  if (!state || state.weekResults.length === 0) {
    return [
      `${school} opens the season — can Coach ${coachName} deliver?`,
      `${conference} preseason predictions are in. Where does ${school} land?`,
      `Recruiting heats up across the ${conference} as the season approaches.`,
      `All eyes on ${school} as the new era under Coach ${coachName} begins.`,
      "Transfer portal activity surging across college football.",
      `${conference} media days set the stage for a wild season ahead.`,
    ];
  }

  const { record, ranking, streak, fanSentiment, hotSeatLevel, playoffProjection, seasonMomentum, conferenceRecord } = state;
  const lastResult = state.weekResults[state.weekResults.length - 1];
  const week = lastResult.week;

  // Latest game result
  if (lastResult) {
    const isWin = lastResult.userScore > lastResult.opponentScore;
    if (isWin) {
      items.push(`${school} takes down ${lastResult.opponent} ${lastResult.userScore}-${lastResult.opponentScore} in Week ${week}.`);
    } else {
      items.push(`${school} falls to ${lastResult.opponent} ${lastResult.opponentScore}-${lastResult.userScore} in Week ${week}.`);
    }
  }

  // Record & ranking
  if (ranking) {
    items.push(`#${ranking} ${school} moves to ${record.wins}-${record.losses} on the season.`);
  } else {
    items.push(`${school} sits at ${record.wins}-${record.losses} through Week ${week}.`);
  }

  // Streak
  if (streak.count >= 2) {
    items.push(`${school} ${streak.type === "W" ? "riding" : "mired in"} a ${streak.count}-game ${streak.type === "W" ? "win" : "losing"} streak.`);
  }

  // Conference record
  if (conferenceRecord.wins + conferenceRecord.losses > 0) {
    items.push(`${school} ${conferenceRecord.wins}-${conferenceRecord.losses} in ${conference} play.`);
  }

  // Fan sentiment & hot seat
  if (fanSentiment === "furious") {
    items.push(`Fan frustration boiling over in ${school} — message boards on fire.`);
  } else if (fanSentiment === "ecstatic") {
    items.push(`${school} faithful electric — best vibes in years around the program.`);
  } else if (fanSentiment === "restless") {
    items.push(`Restless energy building among ${school} fans. Is change coming?`);
  }

  if (hotSeatLevel === "volcanic") {
    items.push(`REPORT: Coach ${coachName}'s seat getting dangerously hot at ${school}.`);
  } else if (hotSeatLevel === "hot") {
    items.push(`Sources say the temperature is rising on Coach ${coachName}'s seat.`);
  }

  // Playoff projection
  if (playoffProjection === "in") {
    items.push(`CFP Watch: ${school} projected IN the playoff field after Week ${week}.`);
  } else if (playoffProjection === "bubble") {
    items.push(`CFP Bubble: ${school} on the outside looking in — every game is a must-win.`);
  }

  // Momentum
  if (seasonMomentum === "surging") {
    items.push(`Momentum building: ${school} trending up at the right time.`);
  } else if (seasonMomentum === "freefall") {
    items.push(`${school} in freefall — can Coach ${coachName} stop the bleeding?`);
  }

  // Recruiting flavor — school-specific
  if (state.biggestWin) {
    items.push(`Signature win over ${state.biggestWin} paying dividends on the recruiting trail.`);
  }
  if (state.worstLoss) {
    items.push(`Rival programs using ${school}'s loss to ${state.worstLoss} as a recruiting weapon.`);
  }

  // CFB universe headlines — broad, varied, rotating pool
  const universeItems = [
    "SOURCES: Three Power Four programs quietly pursuing the same 5-star QB prospect.",
    "Inside the portal: 30+ starters have entered since Monday. The reshuffling has begun.",
    "Report: SEC program offering NIL packages north of $3M for elite transfer linemen.",
    "Coaching carousel heating up — two ADs confirmed to be making calls this week.",
    "CFP committee chairman: 'Strength of schedule will matter more than ever in final rankings.'",
    "The 5-star who flipped last night: inside the midnight phone call that changed everything.",
    "Big Ten defensive coordinator quietly emerging as top head coaching candidate nationwide.",
    "BREAKING: High-profile OC leaving for head coaching role — buyout confirmed at $4.5M.",
    "NIL collective arms race: which conferences are actually winning the money battle.",
    "Sleeper program quietly assembling a portal class that has scouts buzzing.",
    "Offensive line depth crisis spreading across the sport — who's most exposed?",
    "Analyst: 'The team that wins the portal window wins the national title. Period.'",
    "Five programs in serious trouble if their starting QB goes down. You know who they are.",
    "The backup QB who's about to become the most recruited transfer in the country.",
    "Behind the scenes: what coaches actually say about each other in recruiting visits.",
    "AP voter admits: 'Eye test is beating box scores in our ballots right now.'",
    "The most underrated 3-star in this class could be the steal of the decade.",
    "Home field chaos: three venues with crowd noise issues that are getting flagged by officials.",
    "Injury report watch: starting corners going down across the country — passing game about to explode.",
    "This week's biggest mismatch: two programs with wildly different trajectories collide Saturday.",
    `${conference} officiating crew under league review after controversial Week ${week} calls.`,
    "Portal insider: 'The dam breaks after the regular season. Everyone's looking for an exit.'",
    "The program no one is talking about that's quietly 3-deep at every skill position.",
    "Behind the numbers: why yards per play matters more than total offense in the playoff era.",
    "Defensive coordinator who's been turning down head coaching offers — for now.",
    "RUMOR MILL: Star receiver's relationship with his OC described as 'complicated' by source.",
    "Which current coordinators are playing for their jobs in the final month of the season?",
    "Night game atmosphere rankings: the venues that actually terrify visiting teams.",
    "The 4-star who didn't get a single offer from his home state. Now everyone wants him.",
    "Stadium expansion projects: who's building, who's waiting, and who can't afford to.",
  ];

  // Pick 3-4 universe items deterministically based on week + record to give variety
  const seed = (week * 7 + record.wins * 3 + record.losses * 11) % universeItems.length;
  for (let i = 0; i < 4; i++) {
    items.push(universeItems[(seed + i * 8) % universeItems.length]);
  }

  return items;
}

export default async function DynastyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dynastyId: string }>;
}) {
  const { dynastyId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: dynasty } = await supabase
    .from("dynasties")
    .select("id, user_id, school, conference, coach_name, prestige")
    .eq("id", dynastyId)
    .single();

  if (!dynasty || dynasty.user_id !== user.id) {
    redirect("/");
  }

  // Fetch current (active) season for settings context
  const { data: season } = await supabase
    .from("seasons")
    .select("id, year, current_week, season_state")
    .eq("dynasty_id", dynastyId)
    .neq("current_week", -1)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  const seasonState = season?.season_state as SeasonState | null;

  const dynastyInfo = {
    id: dynasty.id as string,
    school: dynasty.school as string,
    conference: dynasty.conference as string,
    coachName: dynasty.coach_name as string,
    prestige: dynasty.prestige as string,
  };

  const seasonInfo = season
    ? {
        id: season.id as string,
        year: season.year as number,
        currentWeek: season.current_week as number,
        record: seasonState?.record ?? { wins: 0, losses: 0 },
      }
    : null;

  // Build dynamic ticker items from season state
  const tickerItems = buildTickerItems(
    dynasty.school as string,
    dynasty.conference as string,
    dynasty.coach_name as string,
    seasonState
  );

  // Derive last result from streak direction (most recent game)
  const lastResult = seasonState?.weekResults && seasonState.weekResults.length > 0
    ? seasonState.weekResults[seasonState.weekResults.length - 1].result
    : null;

  return (
    <SettingsProvider dynasty={dynastyInfo} initialSeason={seasonInfo}>
      <TutorialProvider>
        <Masthead
          school={dynasty.school as string}
          coachName={dynasty.coach_name as string}
          fanSentiment={seasonState?.fanSentiment ?? null}
          hotSeatLevel={seasonState?.hotSeatLevel ?? null}
          seasonMomentum={seasonState?.seasonMomentum ?? null}
          lastResult={lastResult}
          record={seasonState?.record ?? null}
        />
        <NavBar dynastyId={dynastyId} />
        <BreakingTicker items={tickerItems} />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <SettingsDrawer />
        <TutorialWizard />
      </TutorialProvider>
    </SettingsProvider>
  );
}

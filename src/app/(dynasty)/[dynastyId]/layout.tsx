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

  // Recruiting flavor
  items.push(`Recruiting impact: ${school}'s ${record.wins}-${record.losses} record shaping the recruiting pitch.`);

  if (state.biggestWin) {
    items.push(`Signature win over ${state.biggestWin} continues to resonate on the trail.`);
  }

  if (state.worstLoss) {
    items.push(`Loss to ${state.worstLoss} still a talking point with recruits.`);
  }

  // Portal/transfer flavor
  items.push(`Transfer portal buzz: ${conference} programs making moves for next season.`);

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

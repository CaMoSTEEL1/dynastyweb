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

  return (
    <SettingsProvider dynasty={dynastyInfo} initialSeason={seasonInfo}>
      <TutorialProvider>
        <Masthead />
        <NavBar dynastyId={dynastyId} />
        <BreakingTicker />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <SettingsDrawer />
        <TutorialWizard />
      </TutorialProvider>
    </SettingsProvider>
  );
}

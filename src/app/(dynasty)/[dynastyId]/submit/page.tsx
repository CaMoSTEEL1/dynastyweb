import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/section-header";
import InputHub from "@/components/input/input-hub";
import type { SeasonState } from "@/lib/state/schema";

export default async function SubmitPage({
  params,
}: {
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
    .select("id, school, conference, user_id")
    .eq("id", dynastyId)
    .single();

  if (!dynasty || dynasty.user_id !== user.id) {
    redirect("/");
  }

  const { data: season } = await supabase
    .from("seasons")
    .select("id, year, current_week, season_state")
    .eq("dynasty_id", dynastyId)
    .neq("current_week", -1)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  if (!season) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h2 className="font-headline text-lg uppercase tracking-wider text-ink">
          No Active Season
        </h2>
        <p className="mt-2 font-serif italic text-sm text-ink2">
          Start a new season from Settings before filing a weekly report.
        </p>
      </div>
    );
  }

  const seasonState = season.season_state as SeasonState | null;
  const completedWeeks = seasonState?.weekResults?.length ?? 0;
  const currentWeek = completedWeeks + 1;
  const isFirstWeek = completedWeeks === 0;

  return (
    <div>
      <SectionHeader
        title={isFirstWeek ? "START YOUR SEASON" : "FILE YOUR REPORT"}
        subtitle={`Week ${currentWeek} — ${dynasty.school as string}`}
        className="mb-4"
      />
      <p className="mb-8 font-serif text-sm italic text-ink2">
        {isFirstWeek
          ? "Your dynasty starts here. Drop in a screenshot or tell us the score — the media universe begins the moment you file."
          : "Your game is over. Now the media universe catches up. Drop in the tape and The Wire will handle the rest."}
      </p>
      <InputHub
        dynastyId={dynastyId}
        currentWeek={currentWeek}
        school={dynasty.school as string}
        conference={dynasty.conference as string}
      />
    </div>
  );
}

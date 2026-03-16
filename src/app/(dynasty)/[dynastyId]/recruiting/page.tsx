"use client";

import { useEffect, useState, useCallback, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { ClassRanking } from "@/components/recruiting/class-ranking";
import { AddRecruitForm } from "@/components/recruiting/add-recruit-form";
import { RecruitBoard } from "@/components/recruiting/recruit-board";
import { mapRowToRecruit } from "@/lib/recruiting/types";
import type { Recruit } from "@/lib/recruiting/types";

interface RecruitingPageProps {
  params: Promise<{ dynastyId: string }>;
}

export default function RecruitingPage({ params }: RecruitingPageProps) {
  const { dynastyId } = use(params);
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSeasonAndRecruits = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .select("id")
      .eq("dynasty_id", dynastyId)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (seasonError || !season) {
      setError("No active season found for this dynasty.");
      setLoading(false);
      return;
    }

    setSeasonId(season.id as string);

    const { data: recruitRows, error: recruitError } = await supabase
      .from("recruits")
      .select("*")
      .eq("dynasty_id", dynastyId)
      .eq("season_id", season.id)
      .order("stars", { ascending: false })
      .order("name", { ascending: true });

    if (recruitError) {
      setError("Failed to load recruits.");
      setLoading(false);
      return;
    }

    const mapped = (recruitRows ?? []).map((row) =>
      mapRowToRecruit(row as Record<string, unknown>)
    );
    setRecruits(mapped);
    setLoading(false);
  }, [dynastyId, supabase]);

  useEffect(() => {
    fetchSeasonAndRecruits();
  }, [fetchSeasonAndRecruits]);

  const handleRefresh = useCallback(() => {
    fetchSeasonAndRecruits();
  }, [fetchSeasonAndRecruits]);

  if (loading) {
    return (
      <div>
        <SectionHeader
          title="RECRUITING"
          subtitle="Building the next generation"
        />
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-serif italic text-ink3">
            Loading recruiting board...
          </p>
        </div>
      </div>
    );
  }

  if (error || !seasonId) {
    return (
      <div>
        <SectionHeader
          title="RECRUITING"
          subtitle="Building the next generation"
        />
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-serif text-dw-red">
            {error ?? "No active season found. Create a season to begin recruiting."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="RECRUITING"
        subtitle="Building the next generation"
      />

      <div className="mt-6 space-y-6">
        <ClassRanking recruits={recruits} />

        <AddRecruitForm
          dynastyId={dynastyId}
          seasonId={seasonId}
          onAdded={handleRefresh}
        />

        <RecruitBoard
          recruits={recruits}
          dynastyId={dynastyId}
          seasonId={seasonId}
          onUpdate={handleRefresh}
        />
      </div>
    </div>
  );
}

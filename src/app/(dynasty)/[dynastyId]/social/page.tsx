"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialFeed } from "@/components/social/social-feed";
import { TrendingPanel } from "@/components/social/trending-panel";
import { ThreadModal } from "@/components/social/thread-modal";
import { SocialPostCard } from "@/components/social/social-post-card";
import { CoachCompose } from "@/components/social/coach-compose";
import type { CoachPostRow } from "@/components/social/coach-compose";
import type { SocialPost } from "@/lib/social/types";
import type { SocialPostsContent, RecruitSocialPost } from "@/lib/ai/generators";

type ActiveTab = "fan" | "coach" | "recruit";

const FAN_TIMESTAMPS = [
  "1m ago", "2m ago", "3m ago", "5m ago", "7m ago", "10m ago",
  "14m ago", "18m ago", "22m ago", "28m ago", "34m ago", "40m ago",
];

function hydrateFanPost(
  raw: SocialPostsContent["posts"][number],
  index: number
): SocialPost {
  return {
    id: `social_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    handle: raw.handle,
    displayName: raw.displayName,
    type: raw.type,
    body: raw.body,
    likes: raw.likes,
    reposts: raw.reposts,
    timestamp: FAN_TIMESTAMPS[index] ?? `${45 + index * 5}m ago`,
    verified: raw.type === "analyst" || raw.type === "insider",
    avatarInitial: raw.displayName.charAt(0).toUpperCase(),
  };
}

function hydrateCoachPost(row: CoachPostRow, coachName: string, handle: string): SocialPost {
  return {
    id: row.id,
    handle,
    displayName: coachName,
    type: "coach",
    body: row.body,
    likes: row.likes,
    reposts: row.reposts,
    timestamp: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    verified: true,
    avatarInitial: coachName.charAt(0).toUpperCase(),
  };
}

function hydrateRecruitPost(post: RecruitSocialPost, index: number): SocialPost {
  return {
    id: `recruit_${Date.now()}_${index}`,
    handle: post.handle,
    displayName: post.displayName,
    type: "recruit",
    body: post.body,
    likes: post.likes,
    reposts: post.reposts,
    timestamp: FAN_TIMESTAMPS[index] ?? `${45 + index * 5}m ago`,
    verified: false,
    avatarInitial: post.displayName.charAt(0).toUpperCase(),
    stars: post.stars,
    position: post.position,
  };
}

function getCoachHandle(coachName: string): string {
  const lastName = coachName.trim().split(" ").pop() ?? coachName;
  return `@Coach${lastName}`;
}

interface DynastyRow {
  school: string;
  coach_name: string;
}

interface SeasonRow {
  id: string;
}

interface SubmissionRow {
  id: string;
  week: number;
  raw_input: Record<string, unknown>;
}

export default function SocialPage() {
  const params = useParams<{ dynastyId: string }>();
  const dynastyId = params.dynastyId;

  const [activeTab, setActiveTab] = useState<ActiveTab>("fan");

  // Fan feed state
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [threadPost, setThreadPost] = useState<SocialPost | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [sessionContext, setSessionContext] = useState<{
    school: string;
    coachName: string;
    week: number;
  } | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  // Coach feed state
  const [coachPosts, setCoachPosts] = useState<SocialPost[]>([]);
  const [coachLoaded, setCoachLoaded] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);

  // Recruit posts state
  const [recruitPosts, setRecruitPosts] = useState<SocialPost[]>([]);
  const [recruitLoaded, setRecruitLoaded] = useState(false);
  const [recruitLoading, setRecruitLoading] = useState(false);

  const loadSocialData = useCallback(async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: dynasty } = await supabase
        .from("dynasties")
        .select("school, coach_name")
        .eq("id", dynastyId)
        .single<DynastyRow>();

      if (!dynasty) {
        setLoading(false);
        return;
      }

      const { data: season } = await supabase
        .from("seasons")
        .select("id")
        .eq("dynasty_id", dynastyId)
        .order("year", { ascending: false })
        .limit(1)
        .single<SeasonRow>();

      if (!season) {
        setLoading(false);
        return;
      }

      setSeasonId(season.id);

      const { data: submission } = await supabase
        .from("weekly_submissions")
        .select("id, week, raw_input")
        .eq("season_id", season.id)
        .eq("status", "complete")
        .order("week", { ascending: false })
        .limit(1)
        .single<SubmissionRow>();

      if (!submission) {
        setLoading(false);
        return;
      }

      setSubmissionId(submission.id);
      setSessionContext({
        school: dynasty.school,
        coachName: dynasty.coach_name,
        week: submission.week,
      });

      // Load fan social posts from content_cache
      const { data: cachedRows } = await supabase
        .from("content_cache")
        .select("content")
        .eq("weekly_submission_id", submission.id)
        .eq("content_type", "social_posts")
        .limit(1);

      const cached = cachedRows?.[0] ?? null;
      const socialContent = cached?.content as SocialPostsContent | null;

      if (
        socialContent &&
        Array.isArray(socialContent.posts) &&
        socialContent.posts.length > 0
      ) {
        if (socialContent.error) {
          setError("Social feed generation failed. Click below to try again.");
        } else {
          const hydrated = socialContent.posts.map((p, i) => hydrateFanPost(p, i));
          setPosts(hydrated);
        }
      }
    } catch (err) {
      console.error("Failed to load social data:", err);
      setError("Failed to load social data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [dynastyId]);

  const loadCoachPosts = useCallback(async () => {
    if (coachLoaded || coachLoading || !seasonId || !sessionContext) return;
    setCoachLoading(true);

    try {
      const supabase = createClient();
      const { data: rows } = await supabase
        .from("coach_posts")
        .select("id, body, likes, reposts, created_at, week")
        .eq("dynasty_id", dynastyId)
        .eq("season_id", seasonId)
        .order("created_at", { ascending: false });

      const handle = getCoachHandle(sessionContext.coachName);
      const hydrated = (rows ?? []).map((row) =>
        hydrateCoachPost(row as CoachPostRow, sessionContext.coachName, handle)
      );
      setCoachPosts(hydrated);
      setCoachLoaded(true);
    } catch (err) {
      console.error("Failed to load coach posts:", err);
    } finally {
      setCoachLoading(false);
    }
  }, [coachLoaded, coachLoading, seasonId, sessionContext, dynastyId]);

  const loadRecruitPosts = useCallback(async () => {
    if (recruitLoaded || recruitLoading || !seasonId || !sessionContext) return;
    setRecruitLoading(true);

    try {
      const supabase = createClient();

      // Load from all completed submissions this season
      const { data: submissionIds } = await supabase
        .from("weekly_submissions")
        .select("id")
        .eq("season_id", seasonId)
        .eq("status", "complete");

      if (!submissionIds || submissionIds.length === 0) {
        setRecruitLoaded(true);
        setRecruitLoading(false);
        return;
      }

      const ids = submissionIds.map((s: { id: string }) => s.id);

      const { data: cacheRows } = await supabase
        .from("content_cache")
        .select("content")
        .in("weekly_submission_id", ids)
        .eq("content_type", "recruit_social_posts");

      const allPosts: SocialPost[] = [];
      let idx = 0;
      for (const row of cacheRows ?? []) {
        const content = row.content as { posts?: RecruitSocialPost[] };
        if (Array.isArray(content.posts)) {
          for (const post of content.posts) {
            allPosts.push(hydrateRecruitPost(post, idx++));
          }
        }
      }

      setRecruitPosts(allPosts);
      setRecruitLoaded(true);
    } catch (err) {
      console.error("Failed to load recruit posts:", err);
    } finally {
      setRecruitLoading(false);
    }
  }, [recruitLoaded, recruitLoading, seasonId, sessionContext]);

  useEffect(() => {
    void loadSocialData();
  }, [loadSocialData]);

  // Load tab data lazily when switching tabs
  useEffect(() => {
    if (activeTab === "coach") void loadCoachPosts();
    if (activeTab === "recruit") void loadRecruitPosts();
  }, [activeTab, loadCoachPosts, loadRecruitPosts]);

  const handleRegenerate = useCallback(async () => {
    if (!submissionId) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/social/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, dynastyId }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = (await res.json()) as SocialPostsContent;
      if (data.error || !Array.isArray(data.posts) || data.posts.length === 0) {
        setError("Generation failed again. Please try once more.");
      } else {
        const hydrated = data.posts.map((p, i) => hydrateFanPost(p, i));
        setPosts(hydrated);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }, [submissionId, dynastyId]);

  const handlePostClick = useCallback((post: SocialPost) => {
    setThreadPost(post);
  }, []);

  const handleCloseThread = useCallback(() => {
    setThreadPost(null);
  }, []);

  const handleVisibleCountChange = useCallback((count: number) => {
    setVisibleCount(count);
  }, []);

  const handleCoachPost = useCallback((post: CoachPostRow) => {
    if (!sessionContext) return;
    const handle = getCoachHandle(sessionContext.coachName);
    const hydrated = hydrateCoachPost(post, sessionContext.coachName, handle);
    setCoachPosts((prev) => [hydrated, ...prev]);
  }, [sessionContext]);

  if (loading) {
    return (
      <div>
        <SectionHeader
          title="THE WIRE"
          subtitle="What they're saying across the internet"
        />
        <div className="mt-8 flex items-center justify-center py-16">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && activeTab === "fan") {
    return (
      <div>
        <SectionHeader
          title="THE WIRE"
          subtitle="What they're saying across the internet"
        />
        <div className="mt-8 rounded border border-dw-red/30 bg-dw-red/10 px-6 py-12 text-center">
          <p className="font-serif text-dw-red">{error}</p>
          {submissionId && (
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={regenerating}
              className="mt-4 rounded border border-dw-red/40 bg-dw-red/10 px-4 py-2 font-sans text-xs uppercase tracking-wider text-dw-red transition-colors hover:bg-dw-red/20 disabled:opacity-50"
            >
              {regenerating ? "Regenerating..." : "Regenerate Feed"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="THE WIRE"
        subtitle="What they're saying across the internet"
        variant="social"
      />

      {/* Tab navigation — spring-physics indicator pill */}
      <div className="mt-4 mb-6 flex gap-1 rounded border border-dw-border bg-paper3 p-1">
        {(["fan", "coach", "recruit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative flex-1 rounded px-3 py-2 font-sans text-xs uppercase tracking-wider transition-colors",
              activeTab === tab ? "text-ink" : "text-ink3 hover:text-ink2"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded bg-paper shadow-sm"
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">
              {tab === "fan" ? "Fan Feed" : tab === "coach" ? "Coach Feed" : "Recruits"}
            </span>
          </button>
        ))}
      </div>

      {/* Fan Feed */}
      {activeTab === "fan" && (
        <>
          {posts.length === 0 ? (
            <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
              <p className="font-serif text-ink2">
                The social feeds are warming up. Complete a week to see what fans,
                rivals, and analysts have to say about your program.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                {visibleCount < posts.length ? (
                  <>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dw-red opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-dw-red" />
                    </span>
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider text-dw-red">
                      Live
                    </span>
                    <span className="font-sans text-xs text-ink3">
                      &middot; {visibleCount} of {posts.length}
                    </span>
                  </>
                ) : (
                  <span className="font-sans text-xs text-ink3">
                    {posts.length} posts
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="order-2 lg:order-1 min-w-0 flex-1">
                  <SocialFeed
                    posts={posts}
                    onPostClick={handlePostClick}
                    onVisibleCountChange={handleVisibleCountChange}
                  />
                </div>

                <div className="order-1 lg:order-2 w-full shrink-0 lg:w-64">
                  <div className="lg:sticky lg:top-24">
                    <TrendingPanel posts={posts} visibleCount={visibleCount} />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Coach Feed */}
      {activeTab === "coach" && (
        <div className="space-y-4">
          {sessionContext && seasonId && (
            <CoachCompose
              coachName={sessionContext.coachName}
              dynastyId={dynastyId}
              seasonId={seasonId}
              week={sessionContext.week}
              onPost={handleCoachPost}
            />
          )}

          {coachLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
              </div>
            </div>
          )}

          {!coachLoading && coachPosts.length === 0 && (
            <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
              <p className="font-serif text-ink2">
                Your coach feed is empty. Share what&apos;s on your mind above.
              </p>
            </div>
          )}

          {coachPosts.map((post, i) => (
            <SocialPostCard key={post.id} post={post} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Recruits Feed */}
      {activeTab === "recruit" && (
        <div className="space-y-4">
          {recruitLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
              </div>
            </div>
          )}

          {!recruitLoading && recruitPosts.length === 0 && (
            <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
              <p className="font-serif text-ink2">
                No recruit posts yet. Submit a week with recruit activity (offers, commits,
                decommits) to see posts from prospects.
              </p>
            </div>
          )}

          {recruitPosts.map((post, i) => (
            <SocialPostCard key={post.id} post={post} delay={i * 0.05} />
          ))}
        </div>
      )}

      <ThreadModal
        post={threadPost}
        onClose={handleCloseThread}
        sessionContext={sessionContext}
      />
    </div>
  );
}

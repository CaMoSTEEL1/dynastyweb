"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialFeed } from "@/components/social/social-feed";
import { TrendingPanel } from "@/components/social/trending-panel";
import { ThreadModal } from "@/components/social/thread-modal";
import type { SocialPost } from "@/lib/social/types";
import type { SocialPostsContent } from "@/lib/ai/generators";

const TIMESTAMPS = [
  "1m ago", "2m ago", "3m ago", "5m ago", "7m ago", "10m ago",
  "14m ago", "18m ago", "22m ago", "28m ago", "34m ago", "40m ago",
];

function hydratePost(
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
    timestamp: TIMESTAMPS[index] ?? `${45 + index * 5}m ago`,
    verified: raw.type === "analyst" || raw.type === "insider",
    avatarInitial: raw.displayName.charAt(0).toUpperCase(),
  };
}

interface DynastyRow {
  school: string;
  coach_name: string;
}

interface SeasonRow {
  id: string;
}

interface SubmissionRow {
  week: number;
  raw_input: Record<string, unknown>;
}

export default function SocialPage() {
  const params = useParams<{ dynastyId: string }>();
  const dynastyId = params.dynastyId;

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadPost, setThreadPost] = useState<SocialPost | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [sessionContext, setSessionContext] = useState<{
    school: string;
    coachName: string;
    week: number;
  } | null>(null);

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

      const { data: submission } = await supabase
        .from("weekly_submissions")
        .select("id, week, raw_input")
        .eq("season_id", season.id)
        .eq("status", "complete")
        .order("week", { ascending: false })
        .limit(1)
        .single<SubmissionRow & { id: string }>();

      if (!submission) {
        setLoading(false);
        return;
      }

      setSessionContext({
        school: dynasty.school,
        coachName: dynasty.coach_name,
        week: submission.week,
      });

      // Load social posts from content_cache
      const { data: cached } = await supabase
        .from("content_cache")
        .select("content")
        .eq("weekly_submission_id", submission.id)
        .eq("content_type", "social_posts")
        .limit(1)
        .single();

      const socialContent = cached?.content as SocialPostsContent | null;

      if (
        socialContent &&
        Array.isArray(socialContent.posts) &&
        socialContent.posts.length > 0
      ) {
        const hydrated = socialContent.posts.map((p, i) => hydratePost(p, i));
        setPosts(hydrated);
      }
    } catch (err) {
      console.error("Failed to load social data:", err);
    } finally {
      setLoading(false);
    }
  }, [dynastyId]);

  useEffect(() => {
    void loadSocialData();
  }, [loadSocialData]);

  const handlePostClick = useCallback((post: SocialPost) => {
    setThreadPost(post);
  }, []);

  const handleCloseThread = useCallback(() => {
    setThreadPost(null);
  }, []);

  const handleVisibleCountChange = useCallback((count: number) => {
    setVisibleCount(count);
  }, []);

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

  if (posts.length === 0) {
    return (
      <div>
        <SectionHeader
          title="THE WIRE"
          subtitle="What they're saying across the internet"
        />
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-serif text-ink2">
            The social feeds are warming up. Complete a week to see what fans,
            rivals, and analysts have to say about your program.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="THE WIRE"
        subtitle="What they're saying across the internet"
      />

      <div className="mt-2 mb-4 flex items-center gap-2">
        <span className="font-sans text-xs text-ink3">
          {visibleCount} of {posts.length} posts loaded
        </span>
        {visibleCount < posts.length && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dw-green" />
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <SocialFeed
            posts={posts}
            onPostClick={handlePostClick}
            onVisibleCountChange={handleVisibleCountChange}
          />
        </div>

        <div className="w-full shrink-0 lg:w-64">
          <div className="sticky top-24">
            <TrendingPanel posts={posts} visibleCount={visibleCount} />
          </div>
        </div>
      </div>

      <ThreadModal
        post={threadPost}
        onClose={handleCloseThread}
        sessionContext={sessionContext}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SocialPost } from "@/lib/social/types";
import { SocialPostCard } from "./social-post-card";

const TYPE_PRIORITY: Record<SocialPost["type"], number> = {
  fan: 0,
  rival: 1,
  analyst: 2,
  insider: 3,
  reddit: 4,
  coach: 5,
  recruit: 6,
};

interface SocialFeedProps {
  posts: SocialPost[];
  onPostClick: (post: SocialPost) => void;
  onVisibleCountChange?: (count: number) => void;
}

export function SocialFeed({ posts, onPostClick, onVisibleCountChange }: SocialFeedProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  const sortedPosts = [...posts].sort(
    (a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]
  );

  const reveal = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1;
      return next > sortedPosts.length ? sortedPosts.length : next;
    });
  }, [sortedPosts.length]);

  useEffect(() => {
    if (sortedPosts.length === 0) return;

    const firstTimer = setTimeout(() => {
      setVisibleCount(1);
    }, 300);

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= sortedPosts.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [sortedPosts.length, reveal]);

  useEffect(() => {
    onVisibleCountChange?.(visibleCount);
  }, [visibleCount, onVisibleCountChange]);

  const visiblePosts = sortedPosts.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-3">
      {visiblePosts.map((post, i) => (
        <SocialPostCard
          key={post.id}
          post={post}
          onClick={onPostClick}
          delay={i === visibleCount - 1 ? 0.05 : 0}
        />
      ))}
      {visibleCount < sortedPosts.length && (
        <div className="flex items-center justify-center py-4">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
          </div>
        </div>
      )}
    </div>
  );
}

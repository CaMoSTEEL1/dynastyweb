"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Repeat2, BadgeCheck } from "lucide-react";
import type { SocialPost } from "@/lib/social/types";

const TYPE_COLORS: Record<SocialPost["type"], { avatar: string; badge: string }> = {
  fan: { avatar: "bg-ink2", badge: "bg-ink2/20 text-ink2" },
  rival: { avatar: "bg-dw-red", badge: "bg-dw-red/20 text-dw-red" },
  analyst: { avatar: "bg-dw-accent2", badge: "bg-dw-accent2/20 text-dw-accent2" },
  insider: { avatar: "bg-dw-accent", badge: "bg-dw-accent/20 text-dw-accent" },
  reddit: { avatar: "bg-dw-yellow", badge: "bg-dw-yellow/20 text-dw-yellow" },
};

interface SocialPostCardProps {
  post: SocialPost;
  onClick?: (post: SocialPost) => void;
  delay?: number;
}

export function SocialPostCard({ post, onClick, delay = 0 }: SocialPostCardProps) {
  const colors = TYPE_COLORS[post.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "rounded border border-dw-border bg-paper2 p-4",
        onClick && "cursor-pointer transition-colors hover:bg-paper3"
      )}
      onClick={onClick ? () => onClick(post) : undefined}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-paper",
            colors.avatar
          )}
        >
          {post.avatarInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-sans text-sm font-bold text-ink">
              {post.displayName}
            </span>
            {post.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-dw-accent" />
            )}
            <span className="text-xs text-ink3">{post.handle}</span>
            <span className="text-xs text-ink3">&middot;</span>
            <span className="text-xs text-ink3">{post.timestamp}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wide",
                colors.badge
              )}
            >
              {post.type}
            </span>
          </div>

          <p className="mt-1.5 font-serif text-sm leading-relaxed text-ink">
            {post.body}
          </p>

          <div className="mt-2.5 flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-ink3">
              <Heart className="h-3.5 w-3.5" />
              {post.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink3">
              <Repeat2 className="h-3.5 w-3.5" />
              {post.reposts.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

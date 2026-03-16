"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialPost } from "@/lib/social/types";
import { SocialPostCard } from "./social-post-card";

interface ThreadModalProps {
  post: SocialPost | null;
  onClose: () => void;
  sessionContext: {
    school: string;
    coachName: string;
    week: number;
  } | null;
}

export function ThreadModal({ post, onClose, sessionContext }: ThreadModalProps) {
  const [replies, setReplies] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReplies = useCallback(async (targetPost: SocialPost, ctx: { school: string; coachName: string; week: number }) => {
    setLoading(true);
    setError(null);
    setReplies([]);

    try {
      const response = await fetch(`/api/social/thread/${targetPost.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: targetPost,
          sessionContext: ctx,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load thread");
      }

      const data = (await response.json()) as { replies: SocialPost[] };
      setReplies(data.replies);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load replies";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (post && sessionContext) {
      void fetchReplies(post, sessionContext);
    } else {
      setReplies([]);
      setError(null);
    }
  }, [post, sessionContext, fetchReplies]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (post) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [post, onClose]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-xl rounded border border-dw-border bg-paper shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className={cn(
                "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full",
                "bg-paper2 text-ink3 transition-colors hover:bg-paper3 hover:text-ink"
              )}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-4">
              <SocialPostCard post={post} />
            </div>

            <div className="border-t border-dw-border px-4 pb-4 pt-3">
              <p className="mb-3 font-headline text-xs uppercase tracking-wider text-ink3">
                Replies
              </p>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-dw-accent" />
                  <span className="ml-2 font-serif text-sm text-ink3">
                    Loading replies...
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
                  <p className="font-serif text-sm text-dw-red">{error}</p>
                </div>
              )}

              {!loading && !error && replies.length === 0 && (
                <p className="py-6 text-center font-serif text-sm text-ink3">
                  No replies yet.
                </p>
              )}

              {!loading && !error && replies.length > 0 && (
                <div className="flex flex-col gap-3">
                  {replies.map((reply, i) => (
                    <SocialPostCard
                      key={reply.id}
                      post={reply}
                      delay={i * 0.08}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

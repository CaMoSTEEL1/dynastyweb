"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import type { SocialPost } from "@/lib/social/types";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "don", "t", "s", "ll", "ve", "re", "d", "m", "i", "me", "my",
  "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
  "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "it", "its", "itself", "they", "them", "their",
  "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
  "these", "those", "am", "but", "if", "or", "because", "until", "while",
  "about", "against", "and", "up", "down", "any", "get", "got", "like",
  "going", "know", "think", "make", "go", "see", "come", "take", "want",
  "look", "give", "use", "find", "tell", "ask", "seem", "feel", "try",
  "leave", "call", "keep", "let", "put", "say", "said", "still", "big",
  "new", "old", "long", "great", "little", "right", "good", "bad",
  "much", "way", "back", "even", "also", "well", "just", "now",
  "really", "that's", "it's", "don't", "i'm", "he's", "she's", "we're",
  "they're", "you're", "isn't", "aren't", "wasn't", "weren't", "hasn't",
  "haven't", "hadn't", "doesn't", "didn't", "won't", "wouldn't", "can't",
  "couldn't", "shouldn't", "aint", "ain't", "lol", "lmao", "gonna",
  "gotta", "wanna", "ya", "yeah", "nah", "man", "guys", "bro", "one",
  "two", "first", "last", "every",
]);

interface TrendingPanelProps {
  posts: SocialPost[];
  visibleCount: number;
}

export function TrendingPanel({ posts, visibleCount }: TrendingPanelProps) {
  const topics = useMemo(() => {
    const visiblePosts = posts.slice(0, visibleCount);
    const freq = new Map<string, number>();

    for (const post of visiblePosts) {
      const words = post.body
        .toLowerCase()
        .replace(/[^a-z0-9\s#@'-]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      const seen = new Set<string>();
      for (const word of words) {
        const clean = word.replace(/^[#@]/, "");
        if (clean.length < 3 || seen.has(clean)) continue;
        seen.add(clean);
        freq.set(clean, (freq.get(clean) ?? 0) + 1);
      }
    }

    return Array.from(freq.entries())
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword, postCount]) => ({ keyword, postCount }));
  }, [posts, visibleCount]);

  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="rounded border border-dw-border bg-paper2 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-dw-accent" />
        <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
          Trending
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {topics.map((topic, i) => (
          <div key={topic.keyword} className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[10px] font-sans text-ink3">
                {i + 1}
              </span>
              <span
                className={cn(
                  "truncate font-sans text-sm font-medium",
                  i < 3 ? "text-ink" : "text-ink2"
                )}
              >
                #{topic.keyword}
              </span>
            </div>
            <span className="ml-2 shrink-0 text-[10px] text-ink3">
              {topic.postCount} {topic.postCount === 1 ? "post" : "posts"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

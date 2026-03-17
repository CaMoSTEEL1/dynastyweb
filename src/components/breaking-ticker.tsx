"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface BreakingTickerProps {
  items: string[];
}

const ROTATE_INTERVAL_MS = 45_000; // rotate items every 45s
const BATCH_SIZE = 5; // show 5 items at a time

export default function BreakingTicker({ items }: BreakingTickerProps) {
  // Shuffle items on mount for variety per session
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);

  useEffect(() => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffled(copy);
    setBatchIndex(0);
  }, [items]);

  // Rotate to next batch of items periodically
  const rotateBatch = useCallback(() => {
    setBatchIndex((prev) => {
      const totalBatches = Math.ceil(shuffled.length / BATCH_SIZE);
      return totalBatches > 0 ? (prev + 1) % totalBatches : 0;
    });
  }, [shuffled.length]);

  useEffect(() => {
    if (shuffled.length <= BATCH_SIZE) return;
    const timer = setInterval(rotateBatch, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [rotateBatch, shuffled.length]);

  const currentItems =
    shuffled.length > 0
      ? shuffled.slice(
          batchIndex * BATCH_SIZE,
          batchIndex * BATCH_SIZE + BATCH_SIZE
        )
      : items.slice(0, BATCH_SIZE);

  // If we wrapped around and have fewer items, fill from the start
  const displayItems =
    currentItems.length < BATCH_SIZE && shuffled.length > BATCH_SIZE
      ? [
          ...currentItems,
          ...shuffled.slice(0, BATCH_SIZE - currentItems.length),
        ]
      : currentItems;

  const separator = (
    <span className="mx-4 text-white/50 select-none" aria-hidden="true">
      &#9670;
    </span>
  );

  const renderItems = () =>
    displayItems.map((item, i) => (
      <span key={`${batchIndex}-${i}`} className="inline-flex items-center">
        <span className="font-serif text-sm text-white/90 whitespace-nowrap">
          {item}
        </span>
        {separator}
      </span>
    ));

  return (
    <div
      className={cn(
        "w-full bg-dw-accent overflow-hidden",
        "flex items-center h-9 md:h-10"
      )}
    >
      <div
        className={cn(
          "shrink-0 flex items-center px-3 md:px-4 h-full",
          "bg-dw-accent border-r border-white/20"
        )}
      >
        <span
          className={cn(
            "font-headline uppercase text-white font-bold",
            "text-xs md:text-sm tracking-wider"
          )}
        >
          Breaking
        </span>
      </div>

      <div className="relative overflow-hidden flex-1 h-full flex items-center">
        <div className="ticker-scroll flex items-center">
          {renderItems()}
          {renderItems()}
        </div>
      </div>
    </div>
  );
}

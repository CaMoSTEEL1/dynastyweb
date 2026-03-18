"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StreamEvent {
  type: string;
  content: unknown;
  timestamp: number;
}

interface UseWeeklyStreamReturn {
  content: Record<string, unknown>;
  isStreaming: boolean;
  error: string | null;
}

export function useWeeklyStream(
  submissionId: string | null
): UseWeeklyStreamReturn {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!submissionId) {
      cleanup();
      return;
    }

    cleanup();
    setIsStreaming(true);
    setError(null);

    const es = new EventSource(
      `/api/weekly/stream/${encodeURIComponent(submissionId)}`
    );
    eventSourceRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;

      try {
        const parsed = JSON.parse(event.data as string) as StreamEvent;

        if (parsed.type === "done") {
          setIsStreaming(false);
          es.close();
          return;
        }

        if (parsed.type === "error") {
          setError(parsed.content as string);
          setIsStreaming(false);
          es.close();
          return;
        }

        setContent((prev) => ({
          ...prev,
          [parsed.type]: parsed.content,
        }));
      } catch {
        setError("Failed to parse stream event");
      }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;
      setIsStreaming(false);
      es.close();
      // Don't show an error if content already arrived — generation likely finished
      setContent((prev) => {
        const hasContent = Object.keys(prev).length > 0;
        if (!hasContent) {
          setError("Connection interrupted. Refresh the page to load your content.");
        }
        return prev;
      });
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [submissionId, cleanup]);

  return { content, isStreaming, error };
}

import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildPersonaVoiceMap,
  BROADCAST_SETTINGS,
  BROADCAST_MODEL,
} from "@/lib/audio/voices";
import type { ShowTranscript } from "@/lib/shows/types";

export interface AudioSegment {
  index: number;
  speaker: string;
  role: string;
  audioUrl: string;
}

export interface AudioGenerateResponse {
  segments: AudioSegment[];
}

async function streamToBuffer(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function generateSegment(
  client: ElevenLabsClient,
  text: string,
  voiceId: string
): Promise<Buffer> {
  const stream = await client.textToSpeech.convert(voiceId, {
    text,
    model_id: BROADCAST_MODEL,
    voice_settings: BROADCAST_SETTINGS,
  });
  return streamToBuffer(stream as AsyncIterable<Buffer>);
}

// Run N async tasks with a concurrency cap
async function withConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      submissionId: string;
      contentType: string; // e.g. "show_gameday"
      dynastyId: string;
    };

    const { submissionId, contentType, dynastyId } = body;
    if (!submissionId || !contentType || !dynastyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user owns this dynasty
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: dynasty } = await supabase
      .from("dynasties")
      .select("id")
      .eq("id", dynastyId)
      .eq("user_id", user.id)
      .single();

    if (!dynasty) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Check if audio already generated and cached
    const audioCacheType = `audio_${contentType}`;
    const { data: cached } = await supabase
      .from("content_cache")
      .select("content")
      .eq("weekly_submission_id", submissionId)
      .eq("content_type", audioCacheType)
      .limit(1)
      .single();

    if (cached?.content) {
      const cachedData = cached.content as { segments: AudioSegment[] };
      if (Array.isArray(cachedData.segments) && cachedData.segments.length > 0) {
        return NextResponse.json({ segments: cachedData.segments });
      }
    }

    // Fetch the show transcript from content_cache
    const { data: transcriptRow } = await supabase
      .from("content_cache")
      .select("content")
      .eq("weekly_submission_id", submissionId)
      .eq("content_type", contentType)
      .limit(1)
      .single();

    if (!transcriptRow?.content) {
      return NextResponse.json({ error: "Show transcript not found" }, { status: 404 });
    }

    const transcript = transcriptRow.content as ShowTranscript;

    // Build voice map from personas
    const voiceMap = buildPersonaVoiceMap(transcript.personas);

    // Filter to only speech lines (skip stage directions)
    const speechLines = transcript.dialogue.filter((line) => !line.isStageDirection);

    if (speechLines.length === 0) {
      return NextResponse.json({ error: "No speech lines in transcript" }, { status: 400 });
    }

    const elevenlabs = new ElevenLabsClient({ apiKey });
    const adminClient = createAdminClient();

    // Generate all segments with concurrency cap of 3
    const segments = await withConcurrency(
      speechLines,
      3,
      async (line, segmentIndex) => {
        const voiceId = voiceMap.get(line.speaker);
        if (!voiceId) {
          throw new Error(`No voice assigned for speaker: ${line.speaker}`);
        }

        const buffer = await generateSegment(elevenlabs, line.text, voiceId);

        const storagePath = `${dynastyId}/${submissionId}/${contentType}/${segmentIndex}.mp3`;
        const { error: uploadError } = await adminClient.storage
          .from("audio")
          .upload(storagePath, buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = adminClient.storage
          .from("audio")
          .getPublicUrl(storagePath);

        return {
          index: segmentIndex,
          speaker: line.speaker,
          role: line.role,
          audioUrl: urlData.publicUrl,
        } satisfies AudioSegment;
      }
    );

    // Cache the generated segments
    await supabase.from("content_cache").insert({
      weekly_submission_id: submissionId,
      content_type: audioCacheType,
      content: { segments },
    });

    return NextResponse.json({ segments });
  } catch (err) {
    console.error("[audio/generate] Error:", err);
    const message = err instanceof Error ? err.message : "Audio generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

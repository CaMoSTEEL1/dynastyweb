import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";
import { createClient } from "@/lib/supabase/server";
import { getReporterVoiceIdAsync, BROADCAST_SETTINGS, BROADCAST_MODEL } from "@/lib/audio/voices";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      questionText: string;
      reporterName: string;
    };

    const { questionText, reporterName } = body;
    if (!questionText || !reporterName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const voiceId = await getReporterVoiceIdAsync(reporterName, apiKey);
    const elevenlabs = new ElevenLabsClient({ apiKey });

    const stream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: questionText,
      model_id: BROADCAST_MODEL,
      voice_settings: BROADCAST_SETTINGS,
    });

    // Collect to buffer and return as audio/mpeg response
    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[audio/question] Error:", err);
    const message = err instanceof Error ? err.message : "Audio generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

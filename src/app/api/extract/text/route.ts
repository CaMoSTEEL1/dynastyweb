import { NextRequest, NextResponse } from "next/server";
import { extractFromText } from "@/lib/extraction/text-extractor";
import type { ExtractionResponse } from "@/lib/extraction/types";

const MAX_TEXT_LENGTH = 5000;

interface TextExtractionBody {
  text: string;
  week: number;
  school: string;
  conference: string;
}

function isValidBody(body: unknown): body is TextExtractionBody {
  if (typeof body !== "object" || body === null) return false;
  const obj = body as Record<string, unknown>;
  return (
    typeof obj.text === "string" &&
    typeof obj.week === "number" &&
    typeof obj.school === "string" &&
    typeof obj.conference === "string"
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ExtractionResponse>> {
  try {
    const body: unknown = await request.json();

    if (!isValidBody(body)) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error:
            "Invalid request body. Required: { text: string, week: number, school: string, conference: string }",
          extractionType: "text",
        },
        { status: 400 }
      );
    }

    if (!body.text.trim()) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Text cannot be empty",
          extractionType: "text",
        },
        { status: 400 }
      );
    }

    if (body.text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: `Text exceeds ${MAX_TEXT_LENGTH} character limit (received ${body.text.length})`,
          extractionType: "text",
        },
        { status: 413 }
      );
    }

    if (body.week < 1 || body.week > 16 || !Number.isInteger(body.week)) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Week must be an integer between 1 and 16",
          extractionType: "text",
        },
        { status: 400 }
      );
    }

    const result = await extractFromText(body.text, {
      week: body.week,
      school: body.school,
      conference: body.conference,
    });

    return NextResponse.json({
      success: true,
      result,
      extractionType: "text",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        result: null,
        error: "Internal server error during text extraction",
        extractionType: "text",
      },
      { status: 500 }
    );
  }
}

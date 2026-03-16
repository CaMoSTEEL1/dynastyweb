import { NextRequest, NextResponse } from "next/server";
import { extractFromScreenshot } from "@/lib/extraction/image-extractor";
import type { ExtractionResponse } from "@/lib/extraction/types";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(
  request: NextRequest
): Promise<NextResponse<ExtractionResponse>> {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Image exceeds 10MB size limit",
          extractionType: "screenshot",
        },
        { status: 413 }
      );
    }

    const formData = await request.formData();

    const imageFile = formData.get("image");
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Missing required field: image",
          extractionType: "screenshot",
        },
        { status: 400 }
      );
    }

    if (!ACCEPTED_MIME_TYPES.has(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: `Invalid image type: ${imageFile.type}. Accepted: png, jpeg, webp`,
          extractionType: "screenshot",
        },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Image exceeds 10MB size limit",
          extractionType: "screenshot",
        },
        { status: 413 }
      );
    }

    const weekStr = formData.get("week");
    const school = formData.get("school");
    const conference = formData.get("conference");

    if (
      typeof weekStr !== "string" ||
      typeof school !== "string" ||
      typeof conference !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Missing required fields: week, school, conference",
          extractionType: "screenshot",
        },
        { status: 400 }
      );
    }

    const week = parseInt(weekStr, 10);
    if (isNaN(week) || week < 1 || week > 16) {
      return NextResponse.json(
        {
          success: false,
          result: null,
          error: "Week must be a number between 1 and 16",
          extractionType: "screenshot",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const result = await extractFromScreenshot(base64, imageFile.type, {
      week,
      school,
      conference,
    });

    return NextResponse.json({
      success: true,
      result,
      extractionType: "screenshot",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        result: null,
        error: "Internal server error during image extraction",
        extractionType: "screenshot",
      },
      { status: 500 }
    );
  }
}

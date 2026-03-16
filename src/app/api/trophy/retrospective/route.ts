import { NextResponse } from "next/server";
import { generateDynastyRetrospective } from "@/lib/trophy/generators";
import type { SeasonArchive } from "@/lib/trophy/types";

interface RetrospectiveRequest {
  archives: SeasonArchive[];
  dynasty: {
    school: string;
    coachName: string;
    prestige: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RetrospectiveRequest;

    if (!body.archives || !Array.isArray(body.archives) || body.archives.length === 0) {
      return NextResponse.json(
        { error: "No season archives provided" },
        { status: 400 }
      );
    }

    if (!body.dynasty || !body.dynasty.school || !body.dynasty.coachName) {
      return NextResponse.json(
        { error: "Dynasty info is required" },
        { status: 400 }
      );
    }

    const retrospective = await generateDynastyRetrospective(
      body.archives,
      body.dynasty
    );

    return NextResponse.json(retrospective);
  } catch (err) {
    console.error("Retrospective generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate retrospective" },
      { status: 500 }
    );
  }
}

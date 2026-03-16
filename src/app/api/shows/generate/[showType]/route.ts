import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  ShowType,
  ShowTranscript,
  ShowPersona,
  DialogueLine,
} from "@/lib/shows/types";

const VALID_SHOW_TYPES: ShowType[] = [
  "gameday",
  "rankings",
  "portal",
  "draft",
  "hotseat",
];

interface ShowRequestBody {
  school: string;
  coachName: string;
  conference: string;
  week: number;
  seasonState: string;
  narrativeMemory: string;
}

const PERSONAS: Record<ShowType, ShowPersona[]> = {
  gameday: [
    {
      name: "Marcus Cole",
      role: "Host",
      affiliation: "DynastyWire",
      personality: "Enthusiastic and energetic, loves big moments",
    },
    {
      name: "Diana Reeves",
      role: "Analyst",
      affiliation: "CFP Network",
      personality: "Analytical and data-driven, always has the numbers",
    },
    {
      name: "Troy Washington",
      role: "Analyst",
      affiliation: "DynastyWire",
      personality: "Contrarian hot-take artist, provocative but entertaining",
    },
  ],
  rankings: [
    {
      name: "Marcus Cole",
      role: "Host",
      affiliation: "DynastyWire",
      personality: "Enthusiastic and energetic, drives the studio discussion",
    },
    {
      name: "Diana Reeves",
      role: "Analyst",
      affiliation: "CFP Network",
      personality: "Analytical and data-driven, defends or critiques rankings with evidence",
    },
    {
      name: "Troy Washington",
      role: "Analyst",
      affiliation: "DynastyWire",
      personality: "Contrarian hot-take artist, loves to argue a team is overrated or underrated",
    },
  ],
  portal: [
    {
      name: "Jake Morrison",
      role: "Reporter",
      affiliation: "Portal Insider Network",
      personality: "Connected insider with sources everywhere, speaks in scoops",
    },
    {
      name: "Lisa Chen",
      role: "Analyst",
      affiliation: "CFP Network",
      personality: "Measured and thoughtful, evaluates roster impact carefully",
    },
    {
      name: "Marcus Cole",
      role: "Host",
      affiliation: "DynastyWire",
      personality: "Enthusiastic and energetic, ties portal moves to the bigger picture",
    },
  ],
  draft: [
    {
      name: "Pete Nakamura",
      role: "Scout",
      affiliation: "Draft Scout Network",
      personality: "Former NFL scout, evaluates players with technical precision",
    },
    {
      name: "Diana Reeves",
      role: "Analyst",
      affiliation: "CFP Network",
      personality: "Analytical and data-driven, compares prospects to NFL archetypes",
    },
  ],
  hotseat: [
    {
      name: "Troy Washington",
      role: "Host",
      affiliation: "DynastyWire",
      personality: "Provocative and direct, not afraid to say a coach should be fired",
    },
    {
      name: "Lisa Chen",
      role: "Analyst",
      affiliation: "CFP Network",
      personality: "Measured and fair, considers context and program trajectory",
    },
  ],
};

function buildShowTitle(showType: ShowType): { title: string; subtitle: string } {
  switch (showType) {
    case "gameday":
      return { title: "DynastyWire GameDay", subtitle: "Pre-game preview panel" };
    case "rankings":
      return { title: "The Rankings Report", subtitle: "Weekly top-25 show" };
    case "portal":
      return { title: "Portal Insider", subtitle: "Transfer portal segment" };
    case "draft":
      return { title: "Draft Scout", subtitle: "NFL draft prospect breakdown" };
    case "hotseat":
      return { title: "Hot Seat Weekly", subtitle: "Coaching performance segment" };
  }
}

function buildPrompt(
  showType: ShowType,
  body: ShowRequestBody,
  personas: ShowPersona[]
): string {
  const personaBlock = personas
    .map(
      (p) =>
        `- ${p.name} (${p.role}, ${p.affiliation}): ${p.personality}`
    )
    .join("\n");

  const baseInstructions = [
    `You are generating a transcript for a college football broadcast show called "${buildShowTitle(showType).title}".`,
    `The show features these recurring personalities:`,
    personaBlock,
    "",
    `Context about the team:`,
    `School: ${body.school} (${body.conference})`,
    `Head Coach: ${body.coachName}`,
    `Current Week: ${body.week}`,
    "",
    `Season State:`,
    body.seasonState,
    "",
  ];

  if (body.narrativeMemory.trim().length > 0) {
    baseInstructions.push(`Ongoing Storylines:`);
    baseInstructions.push(body.narrativeMemory);
    baseInstructions.push("");
  }

  switch (showType) {
    case "gameday":
      baseInstructions.push(
        "Generate a lively pre-game/post-game panel discussion. The analysts should debate the team's performance,",
        "make observations about the season trajectory, and reference specific stats and results from the season state.",
        "Include natural banter, disagreements, and stage directions like [turns to camera] or [laughs].",
        "The discussion should feel authentic to a real ESPN/Fox Sports studio show."
      );
      break;
    case "rankings":
      baseInstructions.push(
        "Generate a rankings discussion segment. The analysts should debate whether the team's ranking is justified,",
        "discuss playoff implications, compare to other teams, and argue about who should move up or down.",
        "Include references to the team's record, strength of schedule, and key wins/losses.",
        "Include stage directions and natural disagreements between the personalities."
      );
      break;
    case "portal":
      baseInstructions.push(
        "Generate a transfer portal segment. Jake Morrison should share insider scoops about portal activity",
        "related to the team. Discuss potential transfers in and out, roster needs, and how portal moves",
        "could impact the program. Reference the team's current record and needs based on the season state.",
        "Include stage directions and natural conversation flow."
      );
      break;
    case "draft":
      baseInstructions.push(
        "Generate an NFL draft prospect evaluation segment. Pete Nakamura should provide scout-level analysis",
        "of the team's top NFL prospects. Discuss draft stock, combine projections, and how the season",
        "performance is affecting their draft position. Reference specific player performances from the season.",
        "Include stage directions and technical football evaluation language."
      );
      break;
    case "hotseat":
      baseInstructions.push(
        "Generate a coaching hot seat discussion. Troy Washington should be provocative about the coach's job security",
        "while Lisa Chen provides measured counterpoints. Discuss the team's trajectory, fan sentiment,",
        "administration patience, and what the coach needs to do to save their job or cement their position.",
        "Reference the record, losses, and overall program direction. Include stage directions."
      );
      break;
  }

  baseInstructions.push(
    "",
    "IMPORTANT: Respond with valid JSON only. No markdown code fences. Use this exact schema:",
    JSON.stringify({
      dialogue: [
        {
          speaker: "Name",
          role: "Role",
          text: "What they say or stage direction text",
          isStageDirection: false,
        },
      ],
    }),
    "",
    "Generate 12-20 dialogue lines. Mix regular dialogue with 2-4 stage directions.",
    "Stage directions should use text like '[turns to camera]', '[shakes head]', '[pulls up graphic]', etc.",
    "For stage directions, set speaker to the person performing the action and isStageDirection to true.",
    "Make sure dialogue references real details from the season state provided. Do not invent scores or stats not in the context."
  );

  return baseInstructions.join("\n");
}

interface DialogueResponse {
  dialogue: DialogueLine[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ showType: string }> }
): Promise<NextResponse<ShowTranscript>> {
  const { showType } = await params;

  if (!VALID_SHOW_TYPES.includes(showType as ShowType)) {
    return NextResponse.json(
      {
        showType: showType as ShowType,
        title: "Error",
        subtitle: "Invalid show type",
        personas: [],
        dialogue: [],
        week: 0,
        error: true,
      },
      { status: 400 }
    );
  }

  const validShowType = showType as ShowType;

  let body: ShowRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        showType: validShowType,
        title: "Error",
        subtitle: "Invalid request body",
        personas: [],
        dialogue: [],
        week: 0,
        error: true,
      },
      { status: 400 }
    );
  }

  const personas = PERSONAS[validShowType];
  const { title, subtitle } = buildShowTitle(validShowType);
  const prompt = buildPrompt(validShowType, body, personas);

  try {
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const parsed: DialogueResponse = JSON.parse(textBlock.text);

    const transcript: ShowTranscript = {
      showType: validShowType,
      title,
      subtitle,
      personas,
      dialogue: parsed.dialogue.map((line) => ({
        speaker: line.speaker,
        role: line.role,
        text: line.text,
        isStageDirection: line.isStageDirection,
      })),
      week: body.week,
    };

    return NextResponse.json(transcript);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to generate show";
    console.error("Show generation error:", errorMessage);

    return NextResponse.json(
      {
        showType: validShowType,
        title,
        subtitle,
        personas,
        dialogue: [
          {
            speaker: "Marcus Cole",
            role: "Host",
            text: "We're experiencing some technical difficulties in the studio. We'll be right back after this break.",
            isStageDirection: false,
          },
          {
            speaker: "Marcus Cole",
            role: "Host",
            text: "[adjusts earpiece and looks off-camera]",
            isStageDirection: true,
          },
        ],
        week: body.week,
        error: true,
      },
      { status: 500 }
    );
  }
}

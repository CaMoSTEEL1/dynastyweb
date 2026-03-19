import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResponseOption } from "@/lib/ai/press-conference-types";
import { PRESS_CONFERENCE_DB } from "@/lib/data/press-conference-db";

interface RespondRequestBody {
  question: string;
  userAnswer: string;
  tone: string;
  sessionContext: {
    school: string;
    coachName: string;
    week: number;
  };
  nextQuestion: string | null;
}

interface RespondResult {
  followUp: string | null;
  followUpOptions: ResponseOption[] | null;
  nextOptions: ResponseOption[] | null;
}

export async function POST(request: Request): Promise<NextResponse<RespondResult | { error: string }>> {
  try {
    const body = (await request.json()) as RespondRequestBody;
    const { question, userAnswer, tone, sessionContext, nextQuestion } = body;

    if (!question || !userAnswer || !tone || !sessionContext) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic();

    // Pick 3 random response examples to guide tone
    const shuffled = [...PRESS_CONFERENCE_DB].sort(() => Math.random() - 0.5);
    const responseExamples = shuffled.slice(0, 3).map((e) => {
      const r = e.responses;
      return `Q: "${e.question}"\n  honest: "${r.honest}"\n  deflect: "${r.deflect}"\n  coachspeak: "${r.coachspeak}"\n  fiery: "${r.fiery}"`;
    }).join("\n\n");

    const systemPrompt = `You are a college football press conference simulator engine. You evaluate coach responses and generate realistic follow-up questions.

Context:
- School: ${sessionContext.school}
- Coach: ${sessionContext.coachName}
- Week: ${sessionContext.week}

Here are examples of the TONE and VOICE for each response style. Use these as guidance for generating response options:

${responseExamples}

Key tone definitions:
- honest: Direct, vulnerable, real talk. Acknowledges truth without spin.
- deflect: Redirects, stays safe, non-committal. Classic "next question" energy.
- coachspeak: Process-oriented, cliché-laden but polished. "We just gotta execute."
- fiery: Aggressive, passionate, confrontational. Coaches going OFF.

You must respond with valid JSON only, no markdown formatting.`;

    const userPrompt = `A reporter asked: "${question}"

The coach (${sessionContext.coachName}) responded with a "${tone}" tone:
"${userAnswer}"

Evaluate this response and:
1. Decide if a follow-up question is warranted (about 50% of the time). If yes, provide a sharp, realistic follow-up that a college football reporter would ask — it should directly react to the coach's specific answer above. Also generate 3-4 multiple choice response options for that follow-up, each with a different tone (honest, deflect, coachspeak, fiery). If no follow-up is warranted, set followUp and followUpOptions to null.
2. ${nextQuestion ? `Generate 3-4 multiple choice response options for the NEXT question: "${nextQuestion}". Each option should have a different tone (honest, deflect, coachspeak, fiery). Make them sound like realistic coach responses.` : "There are no more questions, so set nextOptions to null."}

Respond with this exact JSON structure:
{
  "followUp": "follow-up question text" or null,
  "followUpOptions": [
    {
      "id": "fu_1",
      "label": "Short label (2-4 words)",
      "tone": "honest" | "deflect" | "coachspeak" | "fiery",
      "text": "Full response text the coach would say to the follow-up"
    }
  ] or null,
  "nextOptions": [
    {
      "id": "opt_1",
      "label": "Short label (2-4 words)",
      "tone": "honest" | "deflect" | "coachspeak" | "fiery",
      "text": "Full response text the coach would say"
    }
  ] or null
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(textBlock.text) as RespondResult;

    return NextResponse.json(parsed);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Press conference respond error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { PressConfExchange, PressConfGrade } from "@/lib/ai/press-conference-types";

interface GradeRequestBody {
  exchanges: PressConfExchange[];
  sessionContext: {
    school: string;
    coachName: string;
    week: number;
  };
}

export async function POST(request: Request): Promise<NextResponse<PressConfGrade | { error: string }>> {
  try {
    const body = (await request.json()) as GradeRequestBody;
    const { exchanges, sessionContext } = body;

    if (!exchanges || !sessionContext || exchanges.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic();

    const transcript = exchanges
      .map((ex, i) => {
        let text = `Q${i + 1} (${ex.question.reporterName}, ${ex.question.outlet} — ${ex.question.tone} tone): "${ex.question.question}"`;
        text += `\nCoach's answer (${ex.selectedTone} tone, ${ex.responseMode} mode): "${ex.userAnswer}"`;
        if (ex.followUp) {
          text += `\nFollow-up: "${ex.followUp}"`;
          text += `\nCoach's follow-up answer: "${ex.followUpAnswer ?? "(no answer)"}"`;
        }
        return text;
      })
      .join("\n\n");

    const systemPrompt = `You are a college football media analyst grading a coach's press conference performance. You are fair but critical, like a real sports media evaluator.

Context:
- School: ${sessionContext.school}
- Coach: ${sessionContext.coachName}
- Week: ${sessionContext.week}

You must respond with valid JSON only, no markdown formatting.`;

    const userPrompt = `Grade this press conference transcript:

${transcript}

Evaluate the coach's performance across these categories (0-100 each):
- composure: How well did the coach stay calm and collected?
- authenticity: Did the coach sound genuine or robotic?
- deflectionSkill: How well did the coach handle tough/gotcha questions?
- headlineManagement: Will the answers create good or bad headlines?

Also provide:
- overall: A letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F)
- summary: 2-3 sentence overall evaluation in a sports columnist style
- bestMoment: Quote or describe the coach's best answer
- worstMoment: Quote or describe the coach's worst answer (or "N/A" if all were solid)

Respond with this exact JSON structure:
{
  "overall": "B+",
  "composure": 78,
  "authenticity": 82,
  "deflectionSkill": 65,
  "headlineManagement": 71,
  "summary": "...",
  "bestMoment": "...",
  "worstMoment": "..."
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

    const grade = JSON.parse(textBlock.text) as PressConfGrade;

    return NextResponse.json(grade);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Press conference grade error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import type { SeasonState } from "@/lib/state/schema";
import type { PromptContext } from "./context-builder";

const client = new Anthropic();

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function extractRecordFromText(
  text: string
): { wins: number; losses: number } | null {
  const match = text.match(/(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  return { wins: parseInt(match[1], 10), losses: parseInt(match[2], 10) };
}

function recordContradicts(
  text: string,
  state: SeasonState
): boolean {
  const mentioned = extractRecordFromText(text);
  if (!mentioned) return false;
  return (
    mentioned.wins !== state.record.wins ||
    mentioned.losses !== state.record.losses
  );
}

async function compressMemory(memory: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system:
      "You are a concise sports narrative editor. Compress the given narrative memory by summarizing the oldest storylines into shorter form while preserving the most recent developments in full detail. Return only the compressed text, no commentary.",
    messages: [
      {
        role: "user",
        content: `Compress this narrative memory to under 350 words while preserving key storylines and the most recent entries:\n\n${memory}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text.trim() : memory;
}

export async function updateNarrativeMemory(
  currentMemory: string,
  state: SeasonState,
  ctx: PromptContext
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: [
        "You are a sports narrative tracker. Your job is to append 2-3 concise sentences",
        "summarizing the key narrative developments from this week.",
        "Focus on storylines: momentum shifts, rivalry implications, coaching hot seat,",
        "breakout players, recruiting impact, and fan sentiment changes.",
        "Return ONLY the 2-3 new sentences to append. No headers, no JSON, just prose.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            "Current narrative memory:",
            currentMemory || "(empty - this is the first week)",
            "",
            "This week's context:",
            ctx.userContext,
            "",
            "Write 2-3 sentences summarizing this week's key narrative developments to append to the memory.",
          ].join("\n"),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const newSentences = textBlock ? textBlock.text.trim() : "";

    if (newSentences.length === 0) {
      return currentMemory;
    }

    if (recordContradicts(newSentences, state)) {
      return currentMemory;
    }

    const separator = currentMemory.trim().length > 0 ? " " : "";
    let updated = currentMemory.trim() + separator + newSentences;

    if (countWords(updated) > 400) {
      updated = await compressMemory(updated);

      if (countWords(updated) > 400) {
        const words = updated.split(/\s+/);
        updated = words.slice(0, 400).join(" ");
      }
    }

    return updated;
  } catch {
    return currentMemory;
  }
}

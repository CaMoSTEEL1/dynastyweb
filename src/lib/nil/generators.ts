import Anthropic from "@anthropic-ai/sdk";
import type { PromptContext } from "@/lib/ai/context-builder";
import type { SocialPost } from "@/lib/social/types";
import type {
  NILOffer,
  NILDrama,
  NILGenerationResult,
  PortalEntry,
  PortalDrama,
  PortalGenerationResult,
  NILDramaType,
  NILDramaSeverity,
  NILOfferStatus,
  PortalDirection,
  PortalDramaType,
} from "./types";

const client = new Anthropic();

function parseJSON<T>(raw: string): T | null {
  try {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return null;
    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as T;
  } catch {
    return null;
  }
}

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1500
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

const VALID_NIL_STATUSES = new Set<NILOfferStatus>([
  "pending",
  "accepted",
  "declined",
  "controversy",
]);

const VALID_NIL_DRAMA_TYPES = new Set<NILDramaType>([
  "bidding_war",
  "controversy",
  "mega_deal",
  "compliance_concern",
]);

const VALID_NIL_SEVERITIES = new Set<NILDramaSeverity>([
  "minor",
  "moderate",
  "major",
]);

const VALID_PORTAL_DIRECTIONS = new Set<PortalDirection>([
  "entering",
  "exiting",
]);

const VALID_PORTAL_DRAMA_TYPES = new Set<PortalDramaType>([
  "unexpected_departure",
  "bidding_war",
  "tampering_rumor",
  "last_minute_flip",
]);

function isValidNILOffer(o: Record<string, unknown>): boolean {
  return (
    typeof o.id === "string" &&
    typeof o.playerName === "string" &&
    typeof o.position === "string" &&
    typeof o.offerAmount === "string" &&
    typeof o.source === "string" &&
    typeof o.status === "string" &&
    VALID_NIL_STATUSES.has(o.status as NILOfferStatus) &&
    typeof o.narrative === "string"
  );
}

function isValidNILDrama(d: Record<string, unknown>): boolean {
  return (
    typeof d.headline === "string" &&
    typeof d.body === "string" &&
    typeof d.type === "string" &&
    VALID_NIL_DRAMA_TYPES.has(d.type as NILDramaType) &&
    typeof d.severity === "string" &&
    VALID_NIL_SEVERITIES.has(d.severity as NILDramaSeverity)
  );
}

function isValidPortalEntry(e: Record<string, unknown>): boolean {
  return (
    typeof e.id === "string" &&
    typeof e.playerName === "string" &&
    typeof e.position === "string" &&
    typeof e.direction === "string" &&
    VALID_PORTAL_DIRECTIONS.has(e.direction as PortalDirection) &&
    typeof e.reason === "string" &&
    (e.destination === null || typeof e.destination === "string") &&
    typeof e.narrative === "string" &&
    (e.drama === null || typeof e.drama === "string")
  );
}

function isValidPortalDrama(d: Record<string, unknown>): boolean {
  return (
    typeof d.headline === "string" &&
    typeof d.body === "string" &&
    typeof d.type === "string" &&
    VALID_PORTAL_DRAMA_TYPES.has(d.type as PortalDramaType)
  );
}

export async function generateNILOffers(
  ctx: PromptContext
): Promise<NILGenerationResult> {
  try {
    const prompt = [
      "Generate NIL (Name, Image, Likeness) offers and potential drama for this college football program as JSON with this exact schema:",
      JSON.stringify({
        offers: [
          {
            id: "nil_1",
            playerName: "string",
            position: "string",
            offerAmount: "$50K-$100K",
            source: "string (company/collective name)",
            status: "pending|accepted|declined|controversy",
            narrative: "string (1-2 sentences about the deal)",
          },
        ],
        drama: {
          headline: "string",
          body: "string (2-3 sentences)",
          type: "bidding_war|controversy|mega_deal|compliance_concern",
          severity: "minor|moderate|major",
        },
      }),
      "",
      `Generate 3-5 NIL offers for ${ctx.school} players.`,
      "Use realistic player names and positions. Offer amounts should range from $5K-$500K in range format (e.g., '$25K-$50K').",
      "Sources should be fictional but realistic NIL collectives, local businesses, or national brands.",
      "Mix statuses: most pending, some accepted/declined, rarely controversy.",
      "Narratives should read like insider reports about the deals.",
      "Include drama ONLY if it fits the context (about 50% of the time). Set drama to null if no drama.",
      "If including drama, make it feel like a developing story that would generate headlines.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<{
      offers: Record<string, unknown>[];
      drama: Record<string, unknown> | null;
    }>(raw);

    if (
      parsed &&
      Array.isArray(parsed.offers) &&
      parsed.offers.length >= 1 &&
      parsed.offers.every((o) => isValidNILOffer(o))
    ) {
      const validDrama =
        parsed.drama !== null && isValidNILDrama(parsed.drama)
          ? (parsed.drama as unknown as NILDrama)
          : null;

      return {
        offers: parsed.offers as unknown as NILOffer[],
        drama: validDrama,
      };
    }

    return buildFallbackNILResult(ctx.school);
  } catch {
    return buildFallbackNILResult(ctx.school);
  }
}

export async function generatePortalDrama(
  ctx: PromptContext
): Promise<PortalGenerationResult> {
  try {
    const prompt = [
      "Generate transfer portal entries and potential drama for this college football program as JSON with this exact schema:",
      JSON.stringify({
        entries: [
          {
            id: "portal_1",
            playerName: "string",
            position: "string",
            direction: "entering|exiting",
            reason: "string (why they are entering/leaving the portal)",
            destination: "string|null (where they are going, null if unknown)",
            narrative: "string (1-2 sentences insider take)",
            drama: "string|null (dramatic element if any)",
          },
        ],
        drama: {
          headline: "string",
          body: "string (2-3 sentences)",
          type: "unexpected_departure|bidding_war|tampering_rumor|last_minute_flip",
        },
      }),
      "",
      `Generate 3-5 transfer portal entries related to ${ctx.school}.`,
      "Mix directions: some entering the portal (leaving), some exiting (arriving at the school).",
      "Reasons should be realistic: playing time, NIL opportunities, coaching changes, scheme fit, closer to home, etc.",
      "Destinations should be null for most entering portal entries (unknown), filled for exiting entries.",
      "Include portal drama ONLY if it fits the narrative (about 40% of the time). Set drama to null otherwise.",
      "Drama should feel like breaking news that would dominate the college football news cycle.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<{
      entries: Record<string, unknown>[];
      drama: Record<string, unknown> | null;
    }>(raw);

    if (
      parsed &&
      Array.isArray(parsed.entries) &&
      parsed.entries.length >= 1 &&
      parsed.entries.every((e) => isValidPortalEntry(e))
    ) {
      const validDrama =
        parsed.drama !== null && isValidPortalDrama(parsed.drama)
          ? (parsed.drama as unknown as PortalDrama)
          : null;

      return {
        entries: parsed.entries as unknown as PortalEntry[],
        drama: validDrama,
      };
    }

    return buildFallbackPortalResult(ctx.school);
  } catch {
    return buildFallbackPortalResult(ctx.school);
  }
}

export async function generateNILSocialReactions(
  offers: NILOffer[],
  drama: NILDrama | null,
  school: string
): Promise<SocialPost[]> {
  try {
    const offerSummary = offers
      .map(
        (o) =>
          `${o.playerName} (${o.position}) - ${o.offerAmount} from ${o.source} [${o.status}]`
      )
      .join("\n");

    const dramaSummary = drama
      ? `DRAMA: ${drama.headline} - ${drama.body} (${drama.type}, ${drama.severity})`
      : "No major drama this cycle.";

    const prompt = [
      "Generate 5-6 social media reactions to these NIL/portal developments as JSON with this exact schema:",
      JSON.stringify({
        posts: [
          {
            handle: "@username",
            displayName: "Display Name",
            type: "fan|rival|analyst|insider|reddit",
            body: "Post content",
            likes: 100,
            reposts: 20,
          },
        ],
      }),
      "",
      `School: ${school}`,
      "",
      "NIL Offers:",
      offerSummary,
      "",
      dramaSummary,
      "",
      "Include a mix of: fans reacting to the money involved, rival fans mocking or being jealous,",
      "analysts commenting on the NIL landscape, insiders sharing behind-the-scenes intel,",
      "and reddit-style hot takes. Fan posts should be emotional. Rival posts should be snarky.",
      "Analyst posts should be measured. Insider posts should hint at more to come.",
      "Vary likes/reposts realistically (fans: 5-200, analysts: 100-2000, insiders: 500-5000).",
    ].join("\n");

    const systemPrompt = [
      "You are the DynastyWire content engine, generating realistic college football social media reactions.",
      "Always respond with valid JSON matching the exact schema requested.",
      "Do not wrap JSON in markdown code fences. Return raw JSON only.",
    ].join("\n");

    const raw = await callClaude(systemPrompt, prompt, 1200);
    const parsed = parseJSON<{
      posts: Array<{
        handle: string;
        displayName: string;
        type: string;
        body: string;
        likes: number;
        reposts: number;
      }>;
    }>(raw);

    const validTypes = new Set(["fan", "rival", "analyst", "insider", "reddit"]);

    if (
      parsed &&
      Array.isArray(parsed.posts) &&
      parsed.posts.length >= 1 &&
      parsed.posts.every(
        (p) =>
          typeof p.handle === "string" &&
          typeof p.displayName === "string" &&
          validTypes.has(p.type) &&
          typeof p.body === "string" &&
          typeof p.likes === "number" &&
          typeof p.reposts === "number"
      )
    ) {
      return parsed.posts.map((p, i) => ({
        id: `nil_social_${i}`,
        handle: p.handle,
        displayName: p.displayName,
        type: p.type as SocialPost["type"],
        body: p.body,
        likes: p.likes,
        reposts: p.reposts,
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 3600000)
        ).toISOString(),
        verified: p.type === "analyst" || p.type === "insider",
        avatarInitial: p.displayName.charAt(0).toUpperCase(),
      }));
    }

    return buildFallbackSocialPosts(school);
  } catch {
    return buildFallbackSocialPosts(school);
  }
}

function buildFallbackNILResult(school: string): NILGenerationResult {
  return {
    offers: [
      {
        id: "nil_fallback_1",
        playerName: "Star Player",
        position: "QB",
        offerAmount: "$75K-$150K",
        source: `${school} Collective`,
        status: "pending",
        narrative: `A significant NIL offer is on the table for ${school}'s star quarterback. Details are still emerging.`,
      },
      {
        id: "nil_fallback_2",
        playerName: "Top Receiver",
        position: "WR",
        offerAmount: "$25K-$50K",
        source: "Local Auto Group",
        status: "accepted",
        narrative: `${school}'s leading receiver has signed a deal with a local automotive dealership for social media promotions.`,
      },
    ],
    drama: null,
  };
}

function buildFallbackPortalResult(school: string): PortalGenerationResult {
  return {
    entries: [
      {
        id: "portal_fallback_1",
        playerName: "Backup Quarterback",
        position: "QB",
        direction: "entering",
        reason: "Seeking starting opportunity elsewhere",
        destination: null,
        narrative: `${school}'s QB2 has officially entered the transfer portal. Sources say playing time was the primary factor.`,
        drama: null,
      },
      {
        id: "portal_fallback_2",
        playerName: "Transfer Addition",
        position: "LB",
        direction: "exiting",
        reason: "Scheme fit and NIL opportunity",
        destination: school,
        narrative: `A promising linebacker from the portal has committed to ${school}, filling a key defensive need.`,
        drama: null,
      },
    ],
    drama: null,
  };
}

function buildFallbackSocialPosts(school: string): SocialPost[] {
  return [
    {
      id: "nil_social_fallback_1",
      handle: "@CFBInsider",
      displayName: "CFB Insider",
      type: "insider",
      body: `Hearing some significant NIL movement around ${school} this week. More details to come.`,
      likes: 842,
      reposts: 156,
      timestamp: new Date().toISOString(),
      verified: true,
      avatarInitial: "C",
    },
    {
      id: "nil_social_fallback_2",
      handle: "@DieHardFan",
      displayName: "Die Hard Fan",
      type: "fan",
      body: `The NIL game at ${school} is getting serious. Love to see the collective stepping up!`,
      likes: 45,
      reposts: 8,
      timestamp: new Date().toISOString(),
      verified: false,
      avatarInitial: "D",
    },
  ];
}

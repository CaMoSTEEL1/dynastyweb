export type OffseasonPhase =
  | "bowl_recap"
  | "awards"
  | "portal_window"
  | "coaching_carousel"
  | "signing_day"
  | "spring_preview";

export interface OffseasonContent {
  phase: OffseasonPhase;
  title: string;
  content: Record<string, unknown>;
  generated: boolean;
}

export interface BowlRecapContent {
  headline: string;
  body: string;
  socialReactions: Array<{ handle: string; body: string; type: string }>;
}

export interface AwardsContent {
  awards: Array<{ name: string; winner: string; description: string }>;
  allConference: Array<{ name: string; position: string }>;
  narrative: string;
}

export interface PortalContent {
  entries: Array<{
    name: string;
    position: string;
    direction: "in" | "out";
    reason: string;
    impact: string;
  }>;
  narrative: string;
}

export interface CarouselContent {
  rumors: Array<{
    staffName: string;
    role: string;
    school: string;
    likelihood: string;
    narrative: string;
  }>;
  headline: string;
}

export interface SigningDayContent {
  decisions: Array<{
    name: string;
    position: string;
    stars: number;
    decision: "committed" | "flipped" | "decommitted" | "surprise";
    narrative: string;
  }>;
  classGrade: string;
  summary: string;
}

export interface SpringPreviewContent {
  headline: string;
  body: string;
  keyStorylines: string[];
  preseasonRanking: number | null;
}

export interface OffseasonPhaseConfig {
  phase: OffseasonPhase;
  title: string;
  subtitle: string;
  description: string;
}

export const OFFSEASON_PHASES: OffseasonPhaseConfig[] = [
  {
    phase: "bowl_recap",
    title: "Bowl Game Recap",
    subtitle: "The final chapter of the season",
    description:
      "Final articles and social reactions for how the season ended.",
  },
  {
    phase: "awards",
    title: "Awards Ceremony",
    subtitle: "Honors and accolades",
    description:
      "Heisman, All-Conference, All-American — who earned the hardware?",
  },
  {
    phase: "portal_window",
    title: "Transfer Portal Window",
    subtitle: "The portal is open",
    description:
      "Who's leaving? Who's arriving? The roster reshuffles.",
  },
  {
    phase: "coaching_carousel",
    title: "Coaching Carousel",
    subtitle: "Staff changes and rumors",
    description:
      "Interview requests, departures, and loyalty decisions.",
  },
  {
    phase: "signing_day",
    title: "Signing Day",
    subtitle: "The next generation arrives",
    description:
      "Uncommitted recruits make their final decisions.",
  },
  {
    phase: "spring_preview",
    title: "Spring Preview",
    subtitle: "Looking ahead",
    description: "What to expect from the upcoming season.",
  },
];

// ElevenLabs premade voice IDs — available on all plans
export const VOICE_IDS = {
  // Male broadcast voices
  host_male: "TxGEqnHWrfWFTfGW9XjX",      // Josh — deep, authoritative broadcaster
  analyst_male: "ErXwobaYiN019PkySvjV",    // Antoni — punchy sports analyst
  reporter_male: "bVMeCyTHy58xNoL34h3p",  // Jeremy — clipped reporter cadence
  scout_male: "pNInz6obpgDQGcFmaJgB",      // Adam — measured, evaluative

  // Female broadcast voices
  analyst_female: "21m00Tcm4TlvDq8ikWAM",  // Rachel — sharp, professional
  reporter_female: "XB0fDUnXU5powFXDhCwa", // Charlotte — sophisticated, direct
} as const;

export type VoiceKey = keyof typeof VOICE_IDS;

// Voice settings tuned for sports broadcast energy
export const BROADCAST_SETTINGS = {
  stability: 0.35,       // More variation = more natural & expressive
  similarity_boost: 0.75,
  style: 0.4,            // Some expressiveness
  use_speaker_boost: true,
};

export const BROADCAST_MODEL = "eleven_turbo_v2_5"; // Fastest + most cost-effective

// Simple female name heuristics for voice assignment
const LIKELY_FEMALE_ENDINGS = ["a", "e", "i", "y"];
const LIKELY_FEMALE_NAMES = new Set([
  "diana", "sarah", "ashley", "jessica", "emily", "amanda", "brittany",
  "stephanie", "morgan", "taylor", "alexis", "tanya", "lisa", "jennifer",
  "michelle", "samantha", "kate", "katie", "kim", "kimberly", "shannon",
  "brittney", "amber", "megan", "lauren", "natalie", "vanessa", "christina",
  "rachel", "charlotte", "olivia", "sophia", "grace", "emma", "avery",
  "brooke", "cassidy", "courtney", "hailey", "haley", "jade", "jasmine",
  "kayla", "kelsey", "kylie", "lacey", "leah", "leigh", "linda", "lucy",
  "madison", "mary", "mia", "natasha", "nina", "paige", "patricia", "penny",
]);

function isLikelyFemale(name: string): boolean {
  const lower = name.toLowerCase().split(" ")[0];
  if (LIKELY_FEMALE_NAMES.has(lower)) return true;
  if (lower.endsWith("ia") || lower.endsWith("ina") || lower.endsWith("ita")) return true;
  // Last resort: name ends in a vowel that suggests feminine
  const lastChar = lower.slice(-1);
  return LIKELY_FEMALE_ENDINGS.includes(lastChar) && lower.length > 4;
}

export interface PersonaVoiceAssignment {
  name: string;
  voiceId: string;
}

export function buildPersonaVoiceMap(
  personas: Array<{ name: string; role: string }>
): Map<string, string> {
  const map = new Map<string, string>();

  personas.forEach((persona, index) => {
    const role = persona.role.toLowerCase();
    const female = isLikelyFemale(persona.name);

    let voiceId: string;

    if (role.includes("host") || index === 0) {
      voiceId = VOICE_IDS.host_male; // Hosts are always the deep broadcaster voice
    } else if (role.includes("scout") || role.includes("insider")) {
      voiceId = female ? VOICE_IDS.analyst_female : VOICE_IDS.scout_male;
    } else if (role.includes("reporter") || role.includes("correspondent")) {
      voiceId = female ? VOICE_IDS.reporter_female : VOICE_IDS.reporter_male;
    } else {
      // Analyst or generic — alternate by index for variety
      voiceId = female
        ? VOICE_IDS.analyst_female
        : index % 2 === 1
          ? VOICE_IDS.analyst_male
          : VOICE_IDS.scout_male;
    }

    map.set(persona.name, voiceId);
  });

  return map;
}

// For press conference reporters — cycle through 2 reporter voices for variety
const REPORTER_VOICE_POOL = [
  VOICE_IDS.reporter_male,
  VOICE_IDS.reporter_female,
  VOICE_IDS.analyst_male,
];

export function getReporterVoiceId(reporterName: string): string {
  // Hash the name to get a consistent voice per reporter
  let hash = 0;
  for (const char of reporterName) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  if (isLikelyFemale(reporterName)) return VOICE_IDS.reporter_female;
  return REPORTER_VOICE_POOL[Math.abs(hash) % REPORTER_VOICE_POOL.length];
}

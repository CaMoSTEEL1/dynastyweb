export type NILOfferStatus = "pending" | "accepted" | "declined" | "controversy";

export type NILDramaType =
  | "bidding_war"
  | "controversy"
  | "mega_deal"
  | "compliance_concern";

export type NILDramaSeverity = "minor" | "moderate" | "major";

export type PortalDirection = "entering" | "exiting";

export type PortalDramaType =
  | "unexpected_departure"
  | "bidding_war"
  | "tampering_rumor"
  | "last_minute_flip";

export interface NILOffer {
  id: string;
  playerName: string;
  position: string;
  offerAmount: string;
  source: string;
  status: NILOfferStatus;
  narrative: string;
}

export interface NILDrama {
  headline: string;
  body: string;
  type: NILDramaType;
  severity: NILDramaSeverity;
}

export interface PortalEntry {
  id: string;
  playerName: string;
  position: string;
  direction: PortalDirection;
  reason: string;
  destination: string | null;
  narrative: string;
  drama: string | null;
}

export interface PortalDrama {
  headline: string;
  body: string;
  type: PortalDramaType;
}

export interface NILGenerationResult {
  offers: NILOffer[];
  drama: NILDrama | null;
}

export interface PortalGenerationResult {
  entries: PortalEntry[];
  drama: PortalDrama | null;
}

export interface NILPageContent {
  nilOffers: NILOffer[];
  nilDrama: NILDrama | null;
  portalEntries: PortalEntry[];
  portalDrama: PortalDrama | null;
}

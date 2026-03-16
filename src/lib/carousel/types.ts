export interface StaffMember {
  id: string;
  name: string;
  role: "OC" | "DC" | "ST" | "Position Coach";
  hotSeatLevel: "secure" | "lukewarm" | "hot";
  yearsOnStaff: number;
  reputation: string;
}

export interface CoachingRumor {
  id: string;
  staffMember: StaffMember;
  type: "interview_request" | "poaching_attempt" | "forced_departure" | "loyalty_test";
  suitor: string;
  narrative: string;
  urgency: "low" | "medium" | "high";
}

export interface CarouselDecision {
  rumorId: string;
  decision: "retain" | "release" | "counter_offer";
  bonusOffered: boolean;
}

export interface CarouselOutcome {
  staffMember: StaffMember;
  decision: string;
  result: "stayed" | "departed" | "fired";
  narrative: string;
  impactOnNextSeason: string;
}

export const DEFAULT_STAFF: StaffMember[] = [
  { id: "oc", name: "", role: "OC", hotSeatLevel: "secure", yearsOnStaff: 1, reputation: "" },
  { id: "dc", name: "", role: "DC", hotSeatLevel: "secure", yearsOnStaff: 1, reputation: "" },
];

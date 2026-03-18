export interface SocialPost {
  id: string;
  handle: string;
  displayName: string;
  type: "fan" | "rival" | "analyst" | "insider" | "reddit" | "coach" | "recruit";
  body: string;
  likes: number;
  reposts: number;
  timestamp: string;
  verified: boolean;
  avatarInitial: string;
  // Optional fields for recruit type cards
  stars?: number;
  position?: string;
}

export interface SocialThread {
  parentPost: SocialPost;
  replies: SocialPost[];
}

export interface TrendingTopic {
  keyword: string;
  postCount: number;
}

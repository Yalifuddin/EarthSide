export const TOPIC_REQUEST_STATUSES = ["new", "read", "done"] as const;
export type TopicRequestStatus = (typeof TOPIC_REQUEST_STATUSES)[number];

/** A reader's suggestion for a future article. */
export interface TopicRequest {
  id: string;
  email: string;
  topic: string;
  description: string;
  status: TopicRequestStatus;
  createdAt: Date;
}

export interface TopicRequestInput {
  email: string;
  topic: string;
  description: string;
}

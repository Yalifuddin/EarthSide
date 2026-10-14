import type { TopicRequest, TopicRequestInput, TopicRequestStatus } from "./topic-request";

/** Public port: anyone may drop a request in the box. */
export interface TopicRequestSubmitter {
  submit(input: TopicRequestInput): Promise<void>;
}

/** Admin port: reading and triaging submitted requests. */
export interface TopicRequestInbox {
  listAll(): Promise<TopicRequest[]>;
  countByStatus(status: TopicRequestStatus): Promise<number>;
  updateStatus(id: string, status: TopicRequestStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface TopicRequestRepository extends TopicRequestSubmitter, TopicRequestInbox {}

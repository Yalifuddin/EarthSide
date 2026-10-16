import { createId } from "@/core/shared/id";
import type {
  TopicRequest,
  TopicRequestInput,
  TopicRequestStatus,
} from "@/core/topic-requests/topic-request";
import type { TopicRequestRepository } from "@/core/topic-requests/topic-request-repository";

/** Volatile repository for demo mode and tests. */
export class InMemoryTopicRequestRepository implements TopicRequestRepository {
  private readonly requests = new Map<string, TopicRequest>();

  constructor(seed: TopicRequest[] = []) {
    seed.forEach((request) => this.requests.set(request.id, request));
  }

  async submit(input: TopicRequestInput): Promise<void> {
    const id = createId();
    this.requests.set(id, { ...input, id, status: "new", createdAt: new Date() });
  }

  async listAll(): Promise<TopicRequest[]> {
    return [...this.requests.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async countByStatus(status: TopicRequestStatus): Promise<number> {
    return [...this.requests.values()].filter((request) => request.status === status).length;
  }

  async updateStatus(id: string, status: TopicRequestStatus): Promise<void> {
    const existing = this.requests.get(id);
    if (existing) this.requests.set(id, { ...existing, status });
  }

  async delete(id: string): Promise<void> {
    this.requests.delete(id);
  }
}

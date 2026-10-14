import { ValidationError } from "@/core/shared/validation";
import type { TopicRequest, TopicRequestInput, TopicRequestStatus } from "./topic-request";
import { SilentNotifier, type TopicRequestNotifier } from "./topic-request-notifier";
import type { TopicRequestInbox, TopicRequestSubmitter } from "./topic-request-repository";
import { validateTopicRequest } from "./topic-request-validation";

/** Use case for readers: suggesting a topic. */
export class TopicRequestSubmissionService {
  constructor(
    private readonly submitter: TopicRequestSubmitter,
    private readonly notifier: TopicRequestNotifier = new SilentNotifier(),
  ) {}

  /** Stores the request, then lets Della know. @throws {ValidationError} when invalid. */
  async submit(input: TopicRequestInput): Promise<void> {
    const result = validateTopicRequest(input);
    if (!result.success) throw new ValidationError(result.errors);
    await this.submitter.submit(result.data);
    await this.notifier.notifyNewRequest(result.data);
  }
}

/** Use cases for the author: triaging the inbox. */
export class TopicRequestInboxService {
  constructor(private readonly inbox: TopicRequestInbox) {}

  listAll(): Promise<TopicRequest[]> {
    return this.inbox.listAll();
  }

  /** How many requests Della hasn't looked at yet. */
  countNew(): Promise<number> {
    return this.inbox.countByStatus("new");
  }

  updateStatus(id: string, status: TopicRequestStatus): Promise<void> {
    return this.inbox.updateStatus(id, status);
  }

  delete(id: string): Promise<void> {
    return this.inbox.delete(id);
  }
}

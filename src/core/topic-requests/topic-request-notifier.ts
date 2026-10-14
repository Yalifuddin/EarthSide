import type { TopicRequestInput } from "./topic-request";

/** Port for telling Della that a reader just suggested a topic. */
export interface TopicRequestNotifier {
  notifyNewRequest(request: TopicRequestInput): Promise<void>;
}

/** Used when no notification channel is configured. */
export class SilentNotifier implements TopicRequestNotifier {
  async notifyNewRequest(): Promise<void> {}
}

/**
 * Decorator: a failed notification is logged but never breaks the submission —
 * the request is already safely stored in the inbox by then.
 */
export class BestEffortNotifier implements TopicRequestNotifier {
  constructor(
    private readonly inner: TopicRequestNotifier,
    private readonly onError: (error: unknown) => void,
  ) {}

  async notifyNewRequest(request: TopicRequestInput): Promise<void> {
    try {
      await this.inner.notifyNewRequest(request);
    } catch (error) {
      this.onError(error);
    }
  }
}

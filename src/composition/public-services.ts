import "server-only";
import { serverEnv } from "@/config/server-env";
import { siteConfig } from "@/config/site";
import { ArticleQueryService } from "@/core/articles/article-query-service";
import {
  BestEffortNotifier,
  SilentNotifier,
  type TopicRequestNotifier,
} from "@/core/topic-requests/topic-request-notifier";
import { NoHumanVerifier, SlidingWindowRateLimiter, SpamGuard } from "@/core/spam/spam-guard";
import { TopicRequestSubmissionService } from "@/core/topic-requests/topic-request-service";
import { TurnstileVerifier } from "@/infrastructure/cloudflare/turnstile-verifier";
import { ResendTopicRequestNotifier } from "@/infrastructure/resend/resend-topic-request-notifier";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getArticleRepository, getTopicRequestRepository } from "./repositories";

function createNotifier(): TopicRequestNotifier {
  if (!serverEnv.resend.apiKey) return new SilentNotifier();
  return new BestEffortNotifier(
    new ResendTopicRequestNotifier({
      ...serverEnv.resend,
      dashboardUrl: new URL(routes.admin(DEFAULT_LOCALE), siteConfig.url).toString(),
    }),
    (error) => console.error("Could not send the new-request email", error),
  );
}

const REQUESTS_PER_WINDOW = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function createSpamGuard(): SpamGuard {
  const verifier = serverEnv.turnstileSecretKey
    ? new TurnstileVerifier(serverEnv.turnstileSecretKey)
    : new NoHumanVerifier();
  return new SpamGuard(verifier, new SlidingWindowRateLimiter(REQUESTS_PER_WINDOW, RATE_WINDOW_MS));
}

/** Services used by public, server-rendered pages and server actions. */
export const publicServices = {
  articles: new ArticleQueryService(getArticleRepository()),
  topicRequests: new TopicRequestSubmissionService(getTopicRequestRepository(), createNotifier()),
  spamGuard: createSpamGuard(),
};

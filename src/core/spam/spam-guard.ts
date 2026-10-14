/**
 * Layered protection for the public request form. Each layer is a small port,
 * so a stronger implementation (e.g. a shared rate limiter) can be swapped in.
 */

export type SpamVerdict = "ok" | "bot" | "rate_limited" | "challenge_failed";

/** Confirms a CAPTCHA-style token came from a real person. */
export interface HumanVerifier {
  readonly enabled: boolean;
  verify(token: string, clientIp: string | null): Promise<boolean>;
}

export interface RateLimiter {
  /** Records an attempt for `key`; returns false once the limit is reached. */
  tryConsume(key: string): boolean;
}

/** Used when no CAPTCHA is configured. */
export class NoHumanVerifier implements HumanVerifier {
  readonly enabled = false;
  async verify(): Promise<boolean> {
    return true;
  }
}

/**
 * In-memory sliding window. Good enough against casual abuse; note that each
 * server instance keeps its own counts.
 */
export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  tryConsume(key: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}

export interface SubmissionSignals {
  /** Value of the hidden field only bots fill in. */
  honeypot: string;
  /** CAPTCHA token from the browser, if any. */
  humanToken: string;
  clientIp: string | null;
}

export class SpamGuard {
  constructor(
    private readonly verifier: HumanVerifier,
    private readonly limiter: RateLimiter,
  ) {}

  get requiresChallenge(): boolean {
    return this.verifier.enabled;
  }

  async check({ honeypot, humanToken, clientIp }: SubmissionSignals): Promise<SpamVerdict> {
    if (honeypot) return "bot";
    if (!this.limiter.tryConsume(clientIp ?? "unknown")) return "rate_limited";
    if (this.verifier.enabled && !(await this.verifier.verify(humanToken, clientIp))) {
      return "challenge_failed";
    }
    return "ok";
  }
}

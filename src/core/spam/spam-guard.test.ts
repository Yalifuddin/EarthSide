import { describe, expect, it } from "vitest";
import {
  NoHumanVerifier,
  SlidingWindowRateLimiter,
  SpamGuard,
  type HumanVerifier,
} from "./spam-guard";

const signals = { honeypot: "", humanToken: "token", clientIp: "1.2.3.4" };

describe("SpamGuard", () => {
  it("flags bots that fill in the honeypot", async () => {
    const guard = new SpamGuard(new NoHumanVerifier(), new SlidingWindowRateLimiter(5, 1000));
    expect(await guard.check({ ...signals, honeypot: "http://spam" })).toBe("bot");
  });

  it("rate-limits repeated submissions from the same address", async () => {
    const guard = new SpamGuard(new NoHumanVerifier(), new SlidingWindowRateLimiter(2, 60_000));
    expect(await guard.check(signals)).toBe("ok");
    expect(await guard.check(signals)).toBe("ok");
    expect(await guard.check(signals)).toBe("rate_limited");
    expect(await guard.check({ ...signals, clientIp: "5.6.7.8" })).toBe("ok");
  });

  it("lets the window slide so people can submit again later", () => {
    let time = 0;
    const limiter = new SlidingWindowRateLimiter(1, 1000, () => time);
    expect(limiter.tryConsume("ip")).toBe(true);
    expect(limiter.tryConsume("ip")).toBe(false);
    time = 1500;
    expect(limiter.tryConsume("ip")).toBe(true);
  });

  it("rejects a failed CAPTCHA when one is configured", async () => {
    const strict: HumanVerifier = { enabled: true, verify: async () => false };
    const guard = new SpamGuard(strict, new SlidingWindowRateLimiter(5, 1000));
    expect(await guard.check(signals)).toBe("challenge_failed");
  });
});

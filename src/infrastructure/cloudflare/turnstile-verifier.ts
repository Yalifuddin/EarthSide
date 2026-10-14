import type { HumanVerifier } from "@/core/spam/spam-guard";

interface SiteverifyResponse {
  success: boolean;
}

/** Cloudflare Turnstile — a free, privacy-friendly CAPTCHA (https://www.cloudflare.com/products/turnstile/). */
export class TurnstileVerifier implements HumanVerifier {
  readonly enabled = true;

  constructor(private readonly secretKey: string) {}

  async verify(token: string, clientIp: string | null): Promise<boolean> {
    if (!token) return false;

    const body = new URLSearchParams({ secret: this.secretKey, response: token });
    if (clientIp) body.set("remoteip", clientIp);

    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as SiteverifyResponse;
      return result.success;
    } catch {
      return false;
    }
  }
}

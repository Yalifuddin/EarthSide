import type { TopicRequestInput } from "@/core/topic-requests/topic-request";
import type { TopicRequestNotifier } from "@/core/topic-requests/topic-request-notifier";

interface ResendConfig {
  apiKey: string;
  from: string;
  to: string;
  dashboardUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Emails Della through Resend (https://resend.com). Reply-To is the reader's address. */
export class ResendTopicRequestNotifier implements TopicRequestNotifier {
  constructor(private readonly config: ResendConfig) {}

  async notifyNewRequest(request: TopicRequestInput): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [this.config.to],
        reply_to: request.email,
        subject: `🌱 Request topik baru: ${request.topic}`,
        text: [
          `Topik: ${request.topic}`,
          `Dari: ${request.email}`,
          "",
          request.description,
          "",
          `Buka dashboard: ${this.config.dashboardUrl}`,
        ].join("\n"),
        html: `
          <div style="font-family:sans-serif;color:#1b2a22;line-height:1.6">
            <h2 style="color:#0a3323;margin:0 0 8px">Request topik baru 🌱</h2>
            <p style="margin:0"><strong>Topik:</strong> ${escapeHtml(request.topic)}</p>
            <p style="margin:0"><strong>Dari:</strong> ${escapeHtml(request.email)}</p>
            <p style="white-space:pre-line;background:#fcefe8;padding:12px 16px;border-radius:12px">${escapeHtml(request.description)}</p>
            <p><a href="${escapeHtml(this.config.dashboardUrl)}" style="color:#105666">Buka dashboard EarthSide</a>
            · balas email ini untuk menjawab pembaca langsung.</p>
          </div>`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
    }
  }
}

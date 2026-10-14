import type { TopicRequest } from "@/core/topic-requests/topic-request";

const HOUR_MS = 60 * 60 * 1000;

/** Sample inbox shown only in demo mode, so the dashboard has something to triage. */
export function createDemoTopicRequests(now = new Date()): TopicRequest[] {
  return [
    {
      id: "demo-request-1",
      email: "pembaca.satu@example.com",
      topic: "Sampah fast fashion",
      description: "Aku penasaran baju-baju murah yang cepat rusak itu akhirnya dibuang ke mana.",
      status: "new",
      createdAt: new Date(now.getTime() - 3 * HOUR_MS),
    },
    {
      id: "demo-request-2",
      email: "pembaca.dua@example.com",
      topic: "Polusi udara di kota besar",
      description: "Kenapa langit kadang abu-abu banget? Apa yang bisa dilakukan pelajar?",
      status: "read",
      createdAt: new Date(now.getTime() - 26 * HOUR_MS),
    },
    {
      id: "demo-request-3",
      email: "reader.three@example.com",
      topic: "Coral bleaching",
      description: "What is happening to coral reefs and is there any way to help from home?",
      status: "done",
      createdAt: new Date(now.getTime() - 72 * HOUR_MS),
    },
  ];
}

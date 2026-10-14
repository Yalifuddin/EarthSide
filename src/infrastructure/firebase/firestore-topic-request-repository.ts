import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCount,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore/lite";
import {
  TOPIC_REQUEST_STATUSES,
  type TopicRequest,
  type TopicRequestInput,
  type TopicRequestStatus,
} from "@/core/topic-requests/topic-request";
import type { TopicRequestRepository } from "@/core/topic-requests/topic-request-repository";
import { COLLECTIONS, getDb } from "./firebase-app";

function toStatus(value: unknown): TopicRequestStatus {
  return TOPIC_REQUEST_STATUSES.includes(value as TopicRequestStatus)
    ? (value as TopicRequestStatus)
    : "new";
}

export class FirestoreTopicRequestRepository implements TopicRequestRepository {
  private get requests() {
    return collection(getDb(), COLLECTIONS.topicRequests);
  }

  async submit(input: TopicRequestInput): Promise<void> {
    await addDoc(this.requests, {
      ...input,
      status: "new" satisfies TopicRequestStatus,
      createdAt: serverTimestamp(),
    });
  }

  async listAll(): Promise<TopicRequest[]> {
    const snapshot = await getDocs(query(this.requests, orderBy("createdAt", "desc")));
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: String(data.email ?? ""),
        topic: String(data.topic ?? ""),
        description: String(data.description ?? ""),
        status: toStatus(data.status),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(0),
      };
    });
  }

  async countByStatus(status: TopicRequestStatus): Promise<number> {
    const snapshot = await getCount(query(this.requests, where("status", "==", status)));
    return snapshot.data().count;
  }

  async updateStatus(id: string, status: TopicRequestStatus): Promise<void> {
    await updateDoc(doc(this.requests, id), { status });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.requests, id));
  }
}

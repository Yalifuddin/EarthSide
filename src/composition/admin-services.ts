import { env } from "@/config/env";
import { siteConfig } from "@/config/site";
import { ArticleAdminService } from "@/core/articles/article-admin-service";
import type { ArticleWriter } from "@/core/articles/article-repository";
import { AdminPolicy, type AuthGateway } from "@/core/auth/auth";
import { ValidatingImageUploader, type ImageUploader } from "@/core/media/image-uploader";
import type { TopicRequestInbox } from "@/core/topic-requests/topic-request-repository";
import { TopicRequestInboxService } from "@/core/topic-requests/topic-request-service";
import { CloudinaryImageUploader } from "@/infrastructure/cloudinary/cloudinary-image-uploader";
import { DEMO_ADMIN, DemoAuthGateway } from "@/infrastructure/demo/demo-auth-gateway";
import { DataUrlImageUploader } from "@/infrastructure/demo/data-url-image-uploader";
import {
  DemoStoreArticleWriter,
  DemoStoreTopicRequestInbox,
} from "@/infrastructure/demo/demo-store-adapters";
import { FirebaseAuthGateway } from "@/infrastructure/firebase/firebase-auth-gateway";
import { FirebaseStorageImageUploader } from "@/infrastructure/firebase/firebase-storage-image-uploader";
import { getArticleRepository, getTopicRequestRepository, isDemoMode } from "./repositories";

/**
 * Composition root for the (browser-only) admin dashboard.
 *
 * Without Firebase, the dashboard runs as a local demo in development only, so
 * nobody can open a fake admin on a deployed site. The demo still writes to the
 * server's store, so public pages reflect every edit, just like with Firebase.
 */
export interface AdminServices {
  auth: AuthGateway;
  policy: AdminPolicy;
  articles: ArticleAdminService;
  requests: TopicRequestInboxService;
  images: ImageUploader;
  isDemo: boolean;
}

export const isAdminAvailable = !isDemoMode || process.env.NODE_ENV === "development";

function createImageUploader(): ImageUploader {
  if (isDemoMode) return new DataUrlImageUploader();
  return env.imageProvider === "firebase"
    ? new FirebaseStorageImageUploader()
    : new CloudinaryImageUploader(env.cloudinary);
}

function createArticleWriter(): ArticleWriter {
  return isDemoMode ? new DemoStoreArticleWriter() : getArticleRepository();
}

function createRequestInbox(): TopicRequestInbox {
  return isDemoMode ? new DemoStoreTopicRequestInbox() : getTopicRequestRepository();
}

function createAdminServices(): AdminServices {
  return {
    auth: isDemoMode ? new DemoAuthGateway() : new FirebaseAuthGateway(),
    policy: new AdminPolicy(isDemoMode ? [DEMO_ADMIN.email!] : env.adminEmails),
    articles: new ArticleAdminService(createArticleWriter(), siteConfig.author),
    requests: new TopicRequestInboxService(createRequestInbox()),
    images: new ValidatingImageUploader(createImageUploader()),
    isDemo: isDemoMode,
  };
}

let adminServices: AdminServices | undefined;

export function getAdminServices(): AdminServices {
  adminServices ??= createAdminServices();
  return adminServices;
}

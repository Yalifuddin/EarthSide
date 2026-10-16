import type { ImageUploader } from "@/core/media/image-uploader";

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  /** Keeps each environment's uploads apart, e.g. "development" or "production". */
  environment: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message: string };
}

/**
 * Uploads straight from the browser using an *unsigned* upload preset
 * (free tier, no billing account needed).
 */
export class CloudinaryImageUploader implements ImageUploader {
  constructor(private readonly config: CloudinaryConfig) {
    if (!config.cloudName || !config.uploadPreset) {
      throw new Error("Cloudinary is not configured. See .env.example.");
    }
  }

  async upload(file: File, folder: string): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", this.config.uploadPreset);
    body.append("folder", `earthside/${this.config.environment}/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
      { method: "POST", body },
    );
    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message ?? "Image upload failed");
    }
    return result.secure_url;
  }
}

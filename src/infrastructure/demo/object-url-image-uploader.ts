import type { ImageUploader } from "@/core/media/image-uploader";

/** Demo-only uploader: previews the file in this tab without storing it anywhere. */
export class ObjectUrlImageUploader implements ImageUploader {
  async upload(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }
}

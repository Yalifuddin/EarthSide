import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import type { ImageUploader } from "@/core/media/image-uploader";
import { createId } from "@/core/shared/id";
import { getFirebaseApp } from "./firebase-app";

/** Stores images in Firebase Cloud Storage (requires the Blaze plan for new projects). */
export class FirebaseStorageImageUploader implements ImageUploader {
  async upload(file: File, folder: string): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${folder}/${createId()}.${extension}`;
    const storageRef = ref(getStorage(getFirebaseApp()), path);

    await uploadBytes(storageRef, file, { contentType: file.type });
    return getDownloadURL(storageRef);
  }
}

import { FirebaseError } from "firebase/app";
import { PermissionDeniedError } from "@/core/shared/errors";

/** Translates Firebase-specific failures into domain errors the UI understands. */
export async function translateFirebaseErrors<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      throw new PermissionDeniedError(error);
    }
    throw error;
  }
}

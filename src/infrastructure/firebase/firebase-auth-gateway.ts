import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import type { AuthGateway, AuthUser, Unsubscribe } from "@/core/auth/auth";
import { getFirebaseApp } from "./firebase-app";

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoURL,
  };
}

/**
 * Google sign-in via Firebase Auth. Registering Auth on the shared app also
 * makes Firestore Lite send the signed-in user's token with every request.
 */
export class FirebaseAuthGateway implements AuthGateway {
  private get auth(): Auth {
    return getAuth(getFirebaseApp());
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(this.auth, provider);
    return toAuthUser(credential.user);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  async getIdToken(): Promise<string | null> {
    return (await this.auth.currentUser?.getIdToken()) ?? null;
  }

  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, (user) => listener(user ? toAuthUser(user) : null));
  }
}

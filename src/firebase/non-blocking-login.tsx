'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in. Returns a Promise. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {}); // Ensures the return type is Promise<void>
}

/** Initiate email/password sign-up. Returns a Promise. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // This function now returns the promise from createUserWithEmailAndPassword.
  // The calling component will handle the catch block.
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. Returns a Promise. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  // This function now returns the promise from signInWithEmailAndPassword.
  // The calling component will handle the catch block.
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {});
}

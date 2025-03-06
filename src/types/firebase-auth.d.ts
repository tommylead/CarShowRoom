declare module 'firebase/auth' {
  export interface IdTokenResult {
    claims: {
      [key: string]: any;
      role?: string;
    };
    token: string;
    authTime: string;
    issuedAtTime: string;
    expirationTime: string;
    signInProvider: string | null;
    signInSecondFactor: string | null;
  }

  export class GoogleAuthProvider {
    constructor();
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(customOAuthParameters: Object): GoogleAuthProvider;
  }

  export function signInWithEmailAndPassword(
    auth: any,
    email: string,
    password: string
  ): Promise<any>;

  export function signInWithPopup(
    auth: any,
    provider: GoogleAuthProvider
  ): Promise<any>;

  export function createUserWithEmailAndPassword(
    auth: any,
    email: string,
    password: string
  ): Promise<any>;

  export function updateProfile(
    user: any,
    profile: {
      displayName?: string | null;
      photoURL?: string | null;
    }
  ): Promise<void>;

  export function getAuth(app?: any): any;
} 
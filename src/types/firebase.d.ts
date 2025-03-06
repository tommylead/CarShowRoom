declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: object;
    automaticDataCollectionEnabled: boolean;
  }

  export function initializeApp(options: object, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    isAnonymous: boolean;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
    providerData: Array<{
      providerId: string;
      uid: string;
      displayName: string | null;
      email: string | null;
      phoneNumber: string | null;
      photoURL: string | null;
    }>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
  }

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

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string;
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
  ): Promise<UserCredential>;

  export function signInWithPopup(
    auth: any,
    provider: GoogleAuthProvider
  ): Promise<UserCredential>;

  export function signInWithRedirect(
    auth: any,
    provider: GoogleAuthProvider
  ): Promise<never>;

  export function getRedirectResult(
    auth: any
  ): Promise<UserCredential | null>;

  export function createUserWithEmailAndPassword(
    auth: any,
    email: string,
    password: string
  ): Promise<UserCredential>;

  export function updateProfile(
    user: User,
    profile: {
      displayName?: string | null;
      photoURL?: string | null;
    }
  ): Promise<void>;

  export function onAuthStateChanged(
    auth: any,
    nextOrObserver: (user: User | null) => void,
    error?: (error: Error) => void,
    completed?: () => void
  ): () => void;

  export function onIdTokenChanged(
    auth: any,
    nextOrObserver: (user: User | null) => void,
    error?: (error: Error) => void,
    completed?: () => void
  ): () => void;

  export function signOut(auth: any): Promise<void>;
  export function getAuth(app?: any): any;
}

declare module 'firebase/storage' {
  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    parent: StorageReference | null;
    root: StorageReference;
    storage: any;
  }

  export function getStorage(app?: any, url?: string): any;
  export function ref(storage: any, path?: string): StorageReference;
  export function uploadBytes(ref: StorageReference, data: Blob | Uint8Array | ArrayBuffer): Promise<any>;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
  export function deleteObject(ref: StorageReference): Promise<void>;
}

declare module 'firebase/analytics' {
  export interface Analytics {
    app: any;
  }

  export function getAnalytics(app?: any): Analytics;
  export function logEvent(analytics: Analytics, eventName: string, eventParams?: object): void;
} 
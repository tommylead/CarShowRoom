import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Khởi tạo Firebase Admin SDK một cách an toàn
export function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    try {
      return initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as any),
      });
    } catch (error) {
      console.error("Lỗi khi khởi tạo Firebase Admin:", error);
      // Trả về undefined để tránh lỗi khi gọi các hàm khác
      return undefined as any;
    }
  }
  return getApps()[0];
}

// Lấy instance của Auth
export function getFirebaseAdminAuth() {
  try {
    const app = getFirebaseAdminApp();
    return app ? getAuth(app) : null;
  } catch (error) {
    console.error("Lỗi khi lấy Firebase Auth:", error);
    return null;
  }
}

// Hàm tạo custom claims cho user
export async function setUserRole(uid: string, role: 'USER' | 'ADMIN') {
  try {
    const auth = getFirebaseAdminAuth();
    if (!auth) return false;
    
    await auth.setCustomUserClaims(uid, { role });
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return false;
  }
}

// Hàm lấy role của user
export async function getUserRole(uid: string) {
  try {
    const auth = getFirebaseAdminAuth();
    if (!auth) return 'USER';
    
    const user = await auth.getUser(uid);
    return user.customClaims?.role || 'USER';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'USER';
  }
} 
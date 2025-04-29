import admin from 'firebase-admin';

// Khởi tạo Firebase Admin nếu chưa được khởi tạo
const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // Đảm bảo private key được xử lý đúng
      const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;
        
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
  
  return admin;
};

export const firebaseAdmin = getFirebaseAdmin();
export const auth = firebaseAdmin.auth();
export const firestore = firebaseAdmin.firestore();

// Hàm tạo custom claims cho user
export async function setUserRole(uid: string, role: 'USER' | 'ADMIN') {
  try {
    const auth = getFirebaseAdmin().auth();
    if (!auth) return false;
    
    // Thêm custom claim cho user
    await auth.setCustomUserClaims(uid, { role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
}

// Lấy role của user từ Firebase Auth
export async function getUserRole(uid: string) {
  try {
    const auth = getFirebaseAdmin().auth();
    if (!auth) return 'USER';
    
    const user = await auth.getUser(uid);
    return user.customClaims?.role || 'USER';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'USER';
  }
} 
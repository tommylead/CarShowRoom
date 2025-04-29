// Script cập nhật custom claims trong Firebase
const admin = require('firebase-admin');
require('dotenv').config();

// Khởi tạo Firebase Admin
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
          privateKey: privateKey,
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

async function forceUpdateClaims() {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    const email = 'admin@gmail.com';
    
    // Lấy thông tin user từ Firebase
    try {
      const firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
      console.log('Firebase user found:', firebaseUser.email);
      console.log('Current custom claims:', firebaseUser.customClaims);
      
      // Cập nhật claims mới
      await firebaseAdmin.auth().setCustomUserClaims(firebaseUser.uid, { 
        role: 'ADMIN',
        updatedAt: new Date().toISOString()
      });
      
      // Kiểm tra lại sau khi cập nhật
      const updatedUser = await firebaseAdmin.auth().getUser(firebaseUser.uid);
      console.log('Updated custom claims:', updatedUser.customClaims);
      
      console.log('Firebase custom claims updated successfully.');
    } catch (error) {
      console.error('Error updating Firebase claims:', error);
    }
  } catch (error) {
    console.error('Error in forceUpdateClaims:', error);
  }
}

// Chạy script
forceUpdateClaims(); 
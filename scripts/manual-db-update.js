// Script cập nhật thủ công cơ sở dữ liệu để đồng bộ thông tin admin
const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
require('dotenv').config();

const prisma = new PrismaClient();

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

async function syncAdminUser() {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    const email = 'admin@gmail.com';
    
    // Lấy thông tin user từ Firebase
    try {
      const firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
      console.log('Firebase user found:', firebaseUser.email);
      
      // Kiểm tra xem user đã tồn tại trong DB chưa
      let dbUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (dbUser) {
        // Cập nhật user nếu đã tồn tại
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { 
            firebaseUid: firebaseUser.uid,
            role: 'ADMIN',
            name: firebaseUser.displayName || 'Admin User'
          }
        });
        console.log('Updated existing user in database:', dbUser);
      } else {
        // Tạo user mới nếu chưa tồn tại
        dbUser = await prisma.user.create({
          data: {
            email,
            name: firebaseUser.displayName || 'Admin User',
            firebaseUid: firebaseUser.uid,
            role: 'ADMIN'
          }
        });
        console.log('Created new user in database:', dbUser);
      }
      
      console.log('Database synchronized successfully.');
    } catch (error) {
      console.error('Error syncing user with database:', error);
    }
  } catch (error) {
    console.error('Error in syncAdminUser:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
syncAdminUser(); 
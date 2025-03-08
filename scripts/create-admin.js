// Import Firebase Admin và dotenv để đọc biến môi trường
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
      
      console.log('Initializing Firebase Admin with:');
      console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('- Private Key exists:', !!privateKey);
        
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

async function setUserRole(email, role) {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    // Tìm user theo email
    const user = await firebaseAdmin.auth().getUserByEmail(email);

    // Thiết lập role
    await firebaseAdmin.auth().setCustomUserClaims(user.uid, { role: role });

    console.log(`Successfully set ${email} as ${role}`);
    console.log("User details:", {
      uid: user.uid,
      email: user.email,
      role: role,
    });
    
    // Cập nhật user trong Prisma database
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Kiểm tra xem user đã tồn tại trong DB chưa
      const dbUser = await prisma.user.findFirst({
        where: { 
          email: email 
        }
      });
      
      if (dbUser) {
        // Cập nhật role nếu user đã tồn tại
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: role }
        });
        console.log(`Updated user role in database for ${email}`);
      } else {
        console.log(`User ${email} not found in database, role only updated in Firebase`);
      }
      
      await prisma.$disconnect();
    } catch (dbError) {
      console.error('Database update error:', dbError);
    }
  } catch (error) {
    console.error(`Error setting user as ${role}:`, error);
  }
}

// Lấy email và role từ command line args
const email = process.argv[2] || "admin@gmail.com";
const role = process.argv[3] || "ADMIN";

// Kiểm tra role hợp lệ
if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
  console.error("Role must be either ADMIN or SUPER_ADMIN");
  process.exit(1);
}

console.log(`Setting ${email} as ${role}...`);
setUserRole(email, role); 
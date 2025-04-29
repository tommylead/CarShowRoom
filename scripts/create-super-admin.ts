import { auth } from "../src/lib/firebase-admin";

async function setUserRole(email: string, role: "ADMIN" | "SUPER_ADMIN") {
  try {
    // Tìm user theo email
    const user = await auth.getUserByEmail(email);

    // Thiết lập role
    await auth.setCustomUserClaims(user.uid, { role: role });

    console.log(`Successfully set ${email} as ${role}`);
    console.log("User details:", {
      uid: user.uid,
      email: user.email,
      role: role,
    });
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
setUserRole(email, role as "ADMIN" | "SUPER_ADMIN"); 
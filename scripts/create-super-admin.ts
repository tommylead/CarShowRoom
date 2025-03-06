import { auth } from "../src/lib/firebase-admin";

async function createSuperAdmin(email: string) {
  try {
    // Tìm user theo email
    const user = await auth.getUserByEmail(email);

    // Thiết lập role SUPER_ADMIN
    await auth.setCustomUserClaims(user.uid, { role: "SUPER_ADMIN" });

    console.log(`Successfully set ${email} as SUPER_ADMIN`);
    console.log("User details:", {
      uid: user.uid,
      email: user.email,
      role: "SUPER_ADMIN",
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
  }
}

// Thay thế email bằng email của bạn
const superAdminEmail = process.argv[2];

if (!superAdminEmail) {
  console.error("Please provide an email address");
  process.exit(1);
}

createSuperAdmin(superAdminEmail); 
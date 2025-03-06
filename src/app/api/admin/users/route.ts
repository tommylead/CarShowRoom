import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { auth } from "@/lib/firebase-admin";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

// POST /api/admin/users - Set user role
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Kiểm tra role của user hiện tại
  const currentUserRole = session?.user?.role as UserRole | undefined;

  // Chỉ SUPER_ADMIN mới có thể thay đổi role
  if (!currentUserRole || currentUserRole !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { uid, role } = await request.json();

    if (!uid || !role || !["ADMIN", "USER"].includes(role)) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Cập nhật custom claims cho user
    await auth.setCustomUserClaims(uid, { role });

    // Lấy thông tin user đã cập nhật
    const userRecord = await auth.getUser(uid);

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: userRecord.customClaims?.role,
      },
    });
  } catch (error) {
    console.error("[USER_ROLE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// GET /api/admin/users - Get all users
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Kiểm tra role của user hiện tại
  const currentUserRole = session?.user?.role as UserRole | undefined;

  // Chỉ SUPER_ADMIN và ADMIN mới có thể xem danh sách users
  if (!currentUserRole || !["SUPER_ADMIN", "ADMIN"].includes(currentUserRole)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Lấy danh sách users từ Firebase
    const listUsersResult = await auth.listUsers();
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: (user.customClaims?.role as UserRole) || "USER",
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET_USERS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
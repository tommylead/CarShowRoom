import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddCarForm from "../_components/AddCarForm";

export default async function AddCarPage() {
  // Xác thực Admin
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Thêm xe mới</h1>
      <AddCarForm />
    </div>
  );
} 
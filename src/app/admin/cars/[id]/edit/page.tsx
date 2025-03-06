import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CarForm from "@/components/admin/CarForm";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditCarPage({ params }: Props) {
  const car = await prisma.car.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!car) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Chỉnh sửa thông tin xe</h1>
      <CarForm car={car} />
    </div>
  );
} 
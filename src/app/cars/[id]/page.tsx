import Image from "next/image";
import { notFound } from "next/navigation";
import { FaCar, FaGasPump, FaCalendar, FaPalette } from "react-icons/fa";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: {
    id: string;
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await prisma.car.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!car) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={car.images[0] || "/placeholder-car.jpg"}
              alt={car.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {car.images.slice(1).map((image: string, index: number) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-lg"
              >
                <Image
                  src={image}
                  alt={`${car.name} - Ảnh ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Car Details */}
        <div>
          <h1 className="mb-4 text-3xl font-bold">{car.name}</h1>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3">
              <FaCar className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Hãng xe</p>
                <p className="font-semibold">{car.brand}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3">
              <FaGasPump className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Loại xe</p>
                <p className="font-semibold">{car.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3">
              <FaCalendar className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Năm sản xuất</p>
                <p className="font-semibold">{car.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3">
              <FaPalette className="text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Màu sắc</p>
                <p className="font-semibold">{car.color}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Mô tả</h2>
            <p className="text-gray-600">{car.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Giá bán</h2>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(car.price)}
            </p>
          </div>

          <button className="w-full rounded-lg bg-primary-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-500">
            Liên hệ mua xe
          </button>
        </div>
      </div>
    </div>
  );
} 
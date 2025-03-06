import Image from "next/image";
import Link from "next/link";
import { Car } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link href={`/cars/${car.id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={car.images[0] || "/placeholder-car.jpg"}
            alt={car.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold">{car.name}</h3>
          <p className="mb-2 text-sm text-gray-600">{car.brand}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(car.price)}
            </span>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-600">
              {car.type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 
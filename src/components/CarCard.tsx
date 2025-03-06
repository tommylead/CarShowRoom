import Image from "next/image";
import Link from "next/link";
import { FaGasPump, FaCar } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";

interface CarCardProps {
  car: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
    type: string;
  };
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 w-full">
        <Image
          src={car.images[0] || "/placeholder-car.jpg"}
          alt={car.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{car.name}</h3>
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaCar className="h-4 w-4" />
            <span>{car.brand}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaGasPump className="h-4 w-4" />
            <span>{car.type}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(car.price)}
          </span>
          <span className="text-sm text-gray-500">{car.year}</span>
        </div>
      </div>
    </Link>
  );
} 
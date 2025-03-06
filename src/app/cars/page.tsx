import { prisma } from "@/lib/prisma";
import { Prisma, Car } from "@prisma/client";
import CarGrid from "../_components/CarGrid";
import CarFilters from "../_components/CarFilters";
import Pagination from "../_components/Pagination";

interface Props {
  searchParams: {
    brand?: string;
    type?: string;
    priceRange?: string;
    year?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 12;

export default async function CarsPage({ searchParams }: Props) {
  // Parse price range
  let minPrice = 0;
  let maxPrice = Number.MAX_SAFE_INTEGER;
  if (searchParams.priceRange) {
    const [minStr, maxStr] = searchParams.priceRange.split("-");
    const min = Number(minStr);
    const max = Number(maxStr);
    if (!Number.isNaN(min)) minPrice = min;
    if (!Number.isNaN(max) && max !== Infinity) maxPrice = max;
  }

  // Parse page number
  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Parse sort
  const [sortField, sortOrder] = (searchParams.sort || "createdAt.desc").split(
    ".",
  ) as [keyof Car, "asc" | "desc"];

  // Build where clause
  const where = {
    AND: [
      searchParams.brand ? { brand: searchParams.brand } : {},
      searchParams.type ? { type: searchParams.type } : {},
      searchParams.year
        ? {
            year: Number.isNaN(Number(searchParams.year))
              ? undefined
              : Number(searchParams.year),
          }
        : {},
      {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      searchParams.search
        ? {
            OR: [
              { name: { contains: searchParams.search } },
              { brand: { contains: searchParams.search } },
              { model: { contains: searchParams.search } },
            ],
          }
        : {},
    ],
  } as Prisma.CarWhereInput;

  // Fetch cars with pagination
  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: {
        [sortField]: sortOrder,
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.car.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Danh sách xe</h1>
      <CarFilters />
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {cars.length} trên tổng số {total} xe
      </div>
      <CarGrid cars={cars} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </main>
  );
} 
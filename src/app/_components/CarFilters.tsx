"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const brands = [
  "Toyota",
  "Honda",
  "Mercedes",
  "BMW",
  "Audi",
  "Ford",
  "Hyundai",
  "Kia",
  "Mazda",
  "Nissan",
];

const carTypes = [
  "SUV",
  "SEDAN",
  "COUPE",
  "TRUCK",
  "VAN",
];

const priceRanges = [
  { label: "Dưới 500 triệu", min: 0, max: 500000000 },
  { label: "500 triệu - 1 tỷ", min: 500000000, max: 1000000000 },
  { label: "1 tỷ - 2 tỷ", min: 1000000000, max: 2000000000 },
  { label: "2 tỷ - 5 tỷ", min: 2000000000, max: 5000000000 },
  { label: "Trên 5 tỷ", min: 5000000000, max: Infinity },
];

const years = Array.from(
  { length: new Date().getFullYear() - 2019 + 1 },
  (_, i) => new Date().getFullYear() - i,
);

const sortOptions = [
  { label: "Mới nhất", value: "createdAt.desc" },
  { label: "Cũ nhất", value: "createdAt.asc" },
  { label: "Giá thấp đến cao", value: "price.asc" },
  { label: "Giá cao đến thấp", value: "price.desc" },
  { label: "Năm sản xuất (mới nhất)", value: "year.desc" },
  { label: "Năm sản xuất (cũ nhất)", value: "year.asc" },
];

export default function CarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset về trang 1 khi thay đổi bộ lọc
    params.set("page", "1");
    
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Thanh tìm kiếm */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm xe..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            const timer = setTimeout(() => {
              handleFilterChange("search", value);
            }, 500);
            return () => clearTimeout(timer);
          }}
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Bộ lọc và sắp xếp */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <select
          className="rounded-lg border border-gray-300 px-4 py-2"
          value={searchParams.get("brand") || ""}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
        >
          <option value="">Hãng xe</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-4 py-2"
          value={searchParams.get("type") || ""}
          onChange={(e) => handleFilterChange("type", e.target.value)}
        >
          <option value="">Loại xe</option>
          {carTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-4 py-2"
          value={searchParams.get("priceRange") || ""}
          onChange={(e) => handleFilterChange("priceRange", e.target.value)}
        >
          <option value="">Giá</option>
          {priceRanges.map((range, index) => (
            <option key={index} value={`${range.min}-${range.max}`}>
              {range.label}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-4 py-2"
          value={searchParams.get("year") || ""}
          onChange={(e) => handleFilterChange("year", e.target.value)}
        >
          <option value="">Năm sản xuất</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gray-300 px-4 py-2"
          value={searchParams.get("sort") || "createdAt.desc"}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 
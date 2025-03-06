"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/cars?${params.toString()}`);
  };

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
      if (currentPage <= 3) {
        // Đang ở gần đầu
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Dấu ... (ellipsis)
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Đang ở gần cuối
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center">
      <nav className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === -1 ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                pageNumber === currentPage
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </button>
          ),
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
} 
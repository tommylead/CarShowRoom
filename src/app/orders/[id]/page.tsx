import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrderDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      user: true,
      items: {
        include: {
          car: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết đơn hàng #{order.id}</h1>
        <Link
          href="/orders"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Order Status */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">Thông tin đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusText(order.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày đặt:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thanh toán:</span>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">Thông tin giao hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Họ tên:</span>
                <span>{order.shippingName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số điện thoại:</span>
                <span>{order.shippingPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Địa chỉ:</span>
                <span>{order.shippingAddress}</span>
              </div>
              {order.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ghi chú:</span>
                  <span>{order.note}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-medium">Danh sách xe</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded object-cover"
                        src={item.car.images[0] || "/default-car.png"}
                        alt={item.car.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.car.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.car.brand} - {item.car.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <div className="text-sm text-gray-500">
                Tổng {order.items.length} sản phẩm
              </div>
              <div className="text-lg font-medium text-gray-900">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === "PENDING" && (
        <div className="mt-8 flex justify-end">
          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => {
              // Handle order cancellation
            }}
          >
            Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}

function getOrderStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getOrderStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPED":
      return "Đang giao";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Chưa thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED":
      return "Thanh toán thất bại";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status;
  }
} 
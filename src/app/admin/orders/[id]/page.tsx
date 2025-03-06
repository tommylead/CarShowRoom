import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrderDetailsPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
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
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Chi tiết đơn hàng #{order.id}</h1>

      {/* Order Status */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <h2 className="mb-4 text-lg font-medium">Thông tin khách hàng</h2>
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0">
              <img
                className="h-12 w-12 rounded-full"
                src={order.user.image || "/default-avatar.png"}
                alt={order.user.name || ""}
              />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
              <div className="text-sm text-gray-500">{order.user.email}</div>
              <div className="text-sm text-gray-500">{order.user.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium">Danh sách xe</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Xe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Số lượng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tổng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
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
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(item.price)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                Tổng cộng
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(order.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          In hóa đơn
        </button>
        {order.status === "PENDING" && (
          <>
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Xác nhận đơn hàng
            </button>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Hủy đơn hàng
            </button>
          </>
        )}
        {order.status === "CONFIRMED" && (
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Bắt đầu giao hàng
          </button>
        )}
        {order.status === "SHIPPED" && (
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Xác nhận đã giao
          </button>
        )}
      </div>
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
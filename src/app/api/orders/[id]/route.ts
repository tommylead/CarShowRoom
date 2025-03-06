import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Props {
  params: {
    id: string;
  };
}

// GET /api/orders/[id] - Get order details
export async function GET(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          car: true,
        },
      },
    },
  });

  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  return NextResponse.json(order);
}

// PUT /api/orders/[id] - Update order status (cancel order)
export async function PUT(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { action } = await request.json();

    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (action === "cancel") {
      if (order.status !== "PENDING") {
        return new NextResponse("Cannot cancel order", { status: 400 });
      }

      // Cancel order and restore stock in a transaction
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order status
        const order = await tx.order.update({
          where: {
            id: params.id,
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            items: {
              include: {
                car: true,
              },
            },
          },
        });

        // Restore car stock
        for (const item of order.items) {
          await tx.car.update({
            where: {
              id: item.carId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return order;
      });

      return NextResponse.json(updatedOrder);
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("[ORDER_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Admin only routes
// PUT /api/orders/[id]/admin - Update order status (admin)
export async function PATCH(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { status, paymentStatus } = await request.json();

    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: {
        status,
        paymentStatus,
      },
      include: {
        items: {
          include: {
            car: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_ADMIN_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
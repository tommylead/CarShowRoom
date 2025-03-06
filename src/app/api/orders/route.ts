import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/orders - Get user's orders
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          car: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(orders);
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { shippingName, shippingPhone, shippingAddress, note, paymentMethod } =
      await request.json();

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        car: true,
      },
    });

    if (cartItems.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.car.stock < item.quantity) {
        return new NextResponse(
          `Not enough stock for ${item.car.name}`,
          { status: 400 },
        );
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress,
          note,
          items: {
            create: cartItems.map((item) => ({
              carId: item.carId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              car: true,
            },
          },
        },
      });

      // Update car stock
      for (const item of cartItems) {
        await tx.car.update({
          where: {
            id: item.carId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return order;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
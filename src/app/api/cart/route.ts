import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/cart - Get cart items
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      car: true,
    },
  });

  return NextResponse.json(cartItems);
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { carId, quantity } = await request.json();

    // Check if car exists and has enough stock
    const car = await prisma.car.findUnique({
      where: {
        id: carId,
      },
    });

    if (!car) {
      return new NextResponse("Car not found", { status: 404 });
    }

    if (car.stock < quantity) {
      return new NextResponse("Not enough stock", { status: 400 });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        carId,
      },
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
          price: car.price,
        },
        include: {
          car: true,
        },
      });

      return NextResponse.json(updatedItem);
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        carId,
        quantity,
        price: car.price,
      },
      include: {
        car: true,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[CART_ADD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { itemId, quantity } = await request.json();

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
        userId: session.user.id,
      },
      include: {
        car: true,
      },
    });

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    if (cartItem.car.stock < quantity) {
      return new NextResponse("Not enough stock", { status: 400 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
      include: {
        car: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[CART_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { itemId } = await request.json();

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    });

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
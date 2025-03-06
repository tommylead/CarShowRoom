import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Props {
  params: {
    id: string;
  };
}

// GET /api/cars/[id] - Get car details
export async function GET(request: Request, { params }: Props) {
  const car = await prisma.car.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!car) {
    return new NextResponse("Car not found", { status: 404 });
  }

  return NextResponse.json(car);
}

// PUT /api/cars/[id] - Update car (admin only)
export async function PUT(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role === "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json();

    const car = await prisma.car.update({
      where: {
        id: params.id,
      },
      data,
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error("[CAR_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/cars/[id] - Delete car (admin only)
export async function DELETE(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role === "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.car.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CAR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/reviews - Get reviews with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const carId = searchParams.get("carId");
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const skip = (page - 1) * limit;

  const where = {
    ...(carId && { carId }),
    ...(userId && { userId }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
}

// POST /api/reviews - Create new review
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { carId, rating, comment } = await request.json();

    // Check if user has already reviewed this car
    const existingReview = await prisma.review.findFirst({
      where: {
        carId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return new NextResponse("You have already reviewed this car", { status: 400 });
    }

    // Check if user has purchased this car
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: {
            carId,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("You can only review cars you have purchased", {
        status: 400,
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        carId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update car rating
    const reviews = await prisma.review.findMany({
      where: {
        carId,
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.car.update({
      where: {
        id: carId,
      },
      data: {
        rating: averageRating,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("[REVIEW_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/reviews - Update review
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id, rating, comment } = await request.json();

    const review = await prisma.review.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id,
      },
      data: {
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update car rating
    const reviews = await prisma.review.findMany({
      where: {
        carId: review.carId,
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.car.update({
      where: {
        id: review.carId,
      },
      data: {
        rating: averageRating,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("[REVIEW_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/reviews - Delete review
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await request.json();

    const review = await prisma.review.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    await prisma.review.delete({
      where: {
        id,
      },
    });

    // Update car rating
    const reviews = await prisma.review.findMany({
      where: {
        carId: review.carId,
      },
      select: {
        rating: true,
      },
    });

    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    await prisma.car.update({
      where: {
        id: review.carId,
      },
      data: {
        rating: averageRating,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[REVIEW_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
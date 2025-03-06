import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Props {
  params: {
    id: string;
  };
}

// GET /api/reviews/[id] - Get review details
export async function GET(request: Request, { params }: Props) {
  const review = await prisma.review.findUnique({
    where: {
      id: params.id,
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

  if (!review) {
    return new NextResponse("Review not found", { status: 404 });
  }

  return NextResponse.json(review);
}

// PUT /api/reviews/[id] - Update review
export async function PUT(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { rating, comment } = await request.json();

    const review = await prisma.review.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: params.id,
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

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(request: Request, { params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return new NextResponse("Review not found", { status: 404 });
    }

    await prisma.review.delete({
      where: {
        id: params.id,
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
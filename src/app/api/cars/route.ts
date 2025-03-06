import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Danh sách các loại xe hợp lệ
const validCarTypes = ["SUV", "SEDAN", "COUPE", "TRUCK", "VAN"];

// GET /api/cars - Get all cars with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand");
    const typeParam = searchParams.get("type");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "Infinity");
    const sortBy = searchParams.get("sortBy") as keyof Prisma.CarScalarFieldEnum || "createdAt";
    const sortOrder = searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const whereConditions: any[] = [];

    // Điều kiện tìm kiếm theo từ khóa
    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search } },
          { brand: { contains: search } },
          { model: { contains: search } },
        ],
      });
    }

    // Điều kiện lọc theo thương hiệu
    if (brand) {
      whereConditions.push({ brand });
    }

    // Điều kiện lọc theo loại xe
    if (typeParam && validCarTypes.includes(typeParam)) {
      whereConditions.push({ type: typeParam });
    }

    // Điều kiện lọc theo giá
    whereConditions.push({
      price: {
        gte: minPrice,
        ...(maxPrice !== Infinity && { lte: maxPrice }),
      },
    });

    // Nếu không có điều kiện nào, truy vấn tất cả xe
    const where =
      whereConditions.length > 0
        ? { AND: whereConditions }
        : {};

    // Thực hiện truy vấn
    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.car.count({ where }),
    ]);

    return NextResponse.json({
      data: cars,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("[CARS_GET]", error);
    return NextResponse.json({ error: "Lỗi khi truy vấn dữ liệu xe" }, { status: 500 });
  }
}

// POST /api/cars - Create new car
export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const data = await request.json();

    // Chuyển đổi giá trị từ chuỗi sang số (nếu cần)
    const carData = {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
      year: typeof data.year === 'string' ? parseInt(data.year) : data.year,
      stock: typeof data.stock === 'string' ? parseInt(data.stock) : data.stock,
    };

    const car = await prisma.car.create({
      data: carData,
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error("[CARS_CREATE]", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo xe mới", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/cars - Update multiple cars
export async function PUT(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const cars = await request.json();

    const updatedCars = await Promise.all(
      cars.map(async (car: any) => {
        const { id, ...updateData } = car;
        
        // Chuyển đổi giá trị từ chuỗi sang số (nếu cần)
        const carData = {
          ...updateData,
          price: typeof updateData.price === 'string' ? parseFloat(updateData.price) : updateData.price,
          year: typeof updateData.year === 'string' ? parseInt(updateData.year) : updateData.year,
          stock: typeof updateData.stock === 'string' ? parseInt(updateData.stock) : updateData.stock,
        };
        
        return prisma.car.update({
          where: { id },
          data: carData,
        });
      })
    );

    return NextResponse.json(updatedCars);
  } catch (error) {
    console.error("[CARS_UPDATE]", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật xe", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/cars - Delete multiple cars
export async function DELETE(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { ids } = await request.json();

    await prisma.car.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CARS_DELETE]", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa xe", details: (error as Error).message },
      { status: 500 }
    );
  }
} 
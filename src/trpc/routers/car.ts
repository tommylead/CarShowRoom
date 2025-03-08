import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const carInputSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive(),
  color: z.string().min(1),
  category: z.string().min(1),
  images: z.array(z.string()),
  description: z.string().min(1),
  features: z.array(z.string()),
  specifications: z.record(z.string(), z.any()).optional(),
  stock: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

export const carRouter = createTRPCRouter({
  // Public procedures
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        color: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.prisma.car.findMany({
        take: limit + 1,
        where: {
          AND: [
            input.category ? { category: input.category } : {},
            input.brand ? { brand: input.brand } : {},
            input.color ? { color: input.color } : {},
            input.minPrice ? { price: { gte: input.minPrice } } : {},
            input.maxPrice ? { price: { lte: input.maxPrice } } : {},
            input.search
              ? {
                  OR: [
                    { name: { contains: input.search, mode: "insensitive" } },
                    { brand: { contains: input.search, mode: "insensitive" } },
                    { model: { contains: input.search, mode: "insensitive" } },
                  ],
                }
              : {},
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const car = await ctx.prisma.car.findUnique({
        where: { id: input },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!car) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car not found",
        });
      }

      // Increment view count
      await ctx.prisma.car.update({
        where: { id: input },
        data: { viewCount: { increment: 1 } },
      });

      return car;
    }),

  // Protected procedures (Admin only)
  create: protectedProcedure
    .input(carInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.car.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: carInputSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: input.id },
      });

      if (!car) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car not found",
        });
      }

      return ctx.prisma.car.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: input },
      });

      if (!car) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car not found",
        });
      }

      return ctx.prisma.car.delete({
        where: { id: input },
      });
    }),
}); 
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const orderInputSchema = z.object({
  shippingName: z.string().min(1),
  shippingPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  note: z.string().optional(),
  paymentMethod: z.string(),
});

export const orderRouter = createTRPCRouter({
  // Get all orders (Admin only)
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.prisma.order.findMany({
        take: limit + 1,
        where: {
          status: input.status,
          paymentStatus: input.paymentStatus,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              car: true,
            },
          },
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

  // Get user's orders
  getMine: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.prisma.order.findMany({
        take: limit + 1,
        where: {
          userId: ctx.session.user.id,
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            include: {
              car: true,
            },
          },
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

  // Get order by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              car: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if user is admin or order owner
      if (
        ctx.session.user.role !== "ADMIN" &&
        order.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return order;
    }),

  // Create order from cart
  create: protectedProcedure
    .input(orderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          items: {
            include: {
              car: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Calculate total amount
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.car.price * item.quantity,
        0
      );

      // Create order
      const order = await ctx.prisma.order.create({
        data: {
          userId: ctx.session.user.id,
          totalAmount,
          ...input,
          items: {
            create: cart.items.map((item) => ({
              carId: item.carId,
              quantity: item.quantity,
              price: item.car.price,
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
      await Promise.all(
        cart.items.map((item) =>
          ctx.prisma.car.update({
            where: { id: item.carId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      // Clear cart
      await ctx.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    }),

  // Update order status (Admin only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const order = await ctx.prisma.order.findUnique({
        where: { id: input.id },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return ctx.prisma.order.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
        include: {
          items: {
            include: {
              car: true,
            },
          },
        },
      });
    }),

  // Update payment status (Admin only)
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentStatus: z.nativeEnum(PaymentStatus),
        paymentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const order = await ctx.prisma.order.findUnique({
        where: { id: input.id },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return ctx.prisma.order.update({
        where: { id: input.id },
        data: {
          paymentStatus: input.paymentStatus,
          paymentId: input.paymentId,
        },
        include: {
          items: {
            include: {
              car: true,
            },
          },
        },
      });
    }),

  // Cancel order
  cancel: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if user is admin or order owner
      if (
        ctx.session.user.role !== "ADMIN" &&
        order.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if order can be cancelled
      if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order cannot be cancelled",
        });
      }

      // Restore car stock
      await Promise.all(
        order.items.map((item) =>
          ctx.prisma.car.update({
            where: { id: item.carId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        )
      );

      return ctx.prisma.order.update({
        where: { id: input },
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
    }),
}); 
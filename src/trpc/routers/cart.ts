import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }) => {
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

    if (!cart) {
      // Create new cart if not exists
      return ctx.prisma.cart.create({
        data: {
          userId: ctx.session.user.id,
        },
        include: {
          items: {
            include: {
              car: true,
            },
          },
        },
      });
    }

    return cart;
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        carId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!cart) {
        cart = await ctx.prisma.cart.create({
          data: {
            userId: ctx.session.user.id,
          },
        });
      }

      // Check if car exists and is available
      const car = await ctx.prisma.car.findUnique({
        where: { id: input.carId },
      });

      if (!car) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car not found",
        });
      }

      if (!car.isAvailable || car.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Car is not available or insufficient stock",
        });
      }

      // Check if item already exists in cart
      const existingItem = await ctx.prisma.cartItem.findUnique({
        where: {
          cartId_carId: {
            cartId: cart.id,
            carId: input.carId,
          },
        },
      });

      if (existingItem) {
        // Update quantity if item exists
        return ctx.prisma.cartItem.update({
          where: {
            cartId_carId: {
              cartId: cart.id,
              carId: input.carId,
            },
          },
          data: {
            quantity: existingItem.quantity + input.quantity,
          },
          include: {
            car: true,
          },
        });
      }

      // Create new item if not exists
      return ctx.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          carId: input.carId,
          quantity: input.quantity,
        },
        include: {
          car: true,
        },
      });
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        carId: z.string(),
        quantity: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      const car = await ctx.prisma.car.findUnique({
        where: { id: input.carId },
      });

      if (!car) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Car not found",
        });
      }

      if (input.quantity > car.stock) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      if (input.quantity === 0) {
        return ctx.prisma.cartItem.delete({
          where: {
            cartId_carId: {
              cartId: cart.id,
              carId: input.carId,
            },
          },
        });
      }

      return ctx.prisma.cartItem.update({
        where: {
          cartId_carId: {
            cartId: cart.id,
            carId: input.carId,
          },
        },
        data: {
          quantity: input.quantity,
        },
        include: {
          car: true,
        },
      });
    }),

  removeItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: carId }) => {
      const cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      return ctx.prisma.cartItem.delete({
        where: {
          cartId_carId: {
            cartId: cart.id,
            carId: carId,
          },
        },
      });
    }),

  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cart not found",
      });
    }

    return ctx.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
  }),
}); 
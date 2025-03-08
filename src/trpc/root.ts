import { createTRPCRouter } from "./trpc";
import { carRouter } from "./routers/car";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/order";

export const appRouter = createTRPCRouter({
  car: carRouter,
  cart: cartRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter; 
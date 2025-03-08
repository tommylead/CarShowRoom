import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  const auth = getAuth(req);
  const userId = auth.userId;

  return {
    prisma,
    userId,
    auth,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed); 
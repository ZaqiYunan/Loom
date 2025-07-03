import { userRouter } from '~/server/api/routers/user';
import { productRouter } from '~/server/api/routers/product';
import { cartRouter } from '~/server/api/routers/cart';
import { orderRouter } from '~/server/api/routers/order';
import { paymentRouter } from '~/server/api/routers/payment';
import { chatRouter } from '~/server/api/routers/chat';
import { searchRouter } from '~/server/api/routers/search';
import { profileRouter } from '~/server/api/routers/profile';
import { postRouter } from '~/server/api/routers/post';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  payment: paymentRouter,
  chat: chatRouter,
  search: searchRouter,
  profile: profileRouter,
  post: postRouter,
});

// Ekspor type definition dari API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.user.all();
 * ^? User[]
 */
export const createCaller = appRouter.createCaller;

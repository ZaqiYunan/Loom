import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const cartRouter = createTRPCRouter({
  /**
   * Get all items in the currently logged-in user's cart.
   */
  get: protectedProcedure.query(({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);
    return ctx.db.cart.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
      include: {
        product: true, // Include product details for each cart item
      },
    });
  }),

  /**
   * Add a product to cart or update quantity if it already exists.
   */
  add: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      const { productId, quantity } = input;

      const existingCartItem = await ctx.db.cart.findFirst({
        where: { userId, productId },
      });

      if (existingCartItem) {
        // If product already exists in cart, update its quantity
        return ctx.db.cart.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
      } else {
        // If product doesn't exist, create new entry
        return ctx.db.cart.create({
          data: { userId, productId, quantity },
        });
      }
    }),

  /**
   * Update quantity of a specific item in cart.
   */
  update: protectedProcedure
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      const { cartItemId, quantity } = input;

      const cartItem = await ctx.db.cart.findUnique({ where: { id: cartItemId } });

      // Verify cart item ownership
      if (!cartItem || cartItem.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cart item not found or does not belong to you.' });
      }

      return ctx.db.cart.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }),

  /**
   * Remove one item from cart.
   */
  remove: protectedProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      const { cartItemId } = input;

      const cartItem = await ctx.db.cart.findUnique({ where: { id: cartItemId } });

      // Verify cart item ownership
      if (!cartItem || cartItem.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cart item not found or does not belong to you.' });
      }

      await ctx.db.cart.delete({ where: { id: cartItemId } });
      return { success: true, message: "Item successfully removed from cart." };
    }),

  /**
   * Clear entire user cart.
   */
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);
    await ctx.db.cart.deleteMany({ where: { userId } });
    return { success: true, message: "Cart successfully cleared." };
  }),
});

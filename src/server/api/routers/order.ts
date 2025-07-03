import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, sellerProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const orderRouter = createTRPCRouter({
  /**
   * Mutation to create one or more orders from cart items.
   * Protected by protectedProcedure, only for logged-in users.
   */
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          })
        ).min(1, "Order must have at least one item."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items } = input;
      const userId = parseInt(ctx.session.user.id);

      // Get product details and group by sellerId
      const products = await ctx.db.product.findMany({
        where: { id: { in: items.map((item) => item.productId) } },
      });

      const itemsBySeller = new Map<number, typeof items>();
      const totalAmountBySeller = new Map<number, number>();

      for (const item of items) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Product with ID ${item.productId} not found.` });
        }

        if (!itemsBySeller.has(product.sellerId)) {
          itemsBySeller.set(product.sellerId, []);
          totalAmountBySeller.set(product.sellerId, 0);
        }

        itemsBySeller.get(product.sellerId)!.push(item);
        const currentTotal = totalAmountBySeller.get(product.sellerId)!;
        totalAmountBySeller.set(product.sellerId, currentTotal + (product.price * item.quantity));
      }

      // Use transaction to ensure all orders are created or none
      try {
        const createdOrders = await ctx.db.$transaction(async (prisma: any) => {
          const orders = [];
          for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
            const order = await prisma.order.create({
              data: {
                userId,
                sellerId,
                totalAmount: totalAmountBySeller.get(sellerId)!,
                status: 'pending',
                requestTitle: "Product Order",
                description: "Order from marketplace",
                category: "product_order",
                items: {
                  create: sellerItems.map((item) => {
                    const product = products.find((p: any) => p.id === item.productId)!;
                    return {
                      productId: item.productId,
                      quantity: item.quantity,
                      price: product.price,
                    };
                  }),
                },
              },
              include: { items: true },
            });
            orders.push(order);
          }
          return orders;
        });
        return createdOrders;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order. Please try again.',
          cause: error,
        });
      }
    }),

    /**
     * Get order history for the currently logged-in user.
     */
    getForUser: protectedProcedure.query(({ ctx }) => {
        return ctx.db.order.findMany({
            where: { userId: parseInt(ctx.session.user.id) },
            orderBy: { orderDate: 'desc' },
            include: {
                seller: { include: { user: { select: { fullName: true } } } },
                items: { include: { product: { select: { name: true, imageUrl: true } } } },
            },
        });
    }),

    /**
     * Get incoming orders for the currently logged-in seller.
     */
    getForSeller: sellerProcedure.query(async ({ ctx }) => {
        const seller = await ctx.db.seller.findUnique({
            where: { userId: parseInt(ctx.session.user.id) },
        });

        if (!seller) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
        }

        return ctx.db.order.findMany({
            where: { sellerId: seller.id },
            orderBy: { orderDate: 'desc' },
            include: {
                user: { select: { fullName: true, email: true } },
                items: { include: { product: { select: { name: true } } } },
            },
        });
    }),

    /**
     * Update order status. Only for sellers.
     */
    updateStatus: sellerProcedure
        .input(z.object({
            orderId: z.number(),
            status: z.string().min(1), // Can be validated more strictly with z.enum()
        }))
        .mutation(async ({ ctx, input }) => {
            const { orderId, status } = input;

            // Verify that this order belongs to the currently logged-in seller
            const order = await ctx.db.order.findUnique({
                where: { id: orderId },
            });

            const seller = await ctx.db.seller.findUnique({
                where: { userId: parseInt(ctx.session.user.id) },
            });

            if (!order || !seller || order.sellerId !== seller.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to modify this order.' });
            }

            return ctx.db.order.update({
                where: { id: orderId },
                data: { status },
            });
        }),
});

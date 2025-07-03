import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import midtransclient from 'midtrans-client';
import { env } from '~/env.js';

// Initialize Midtrans Snap client
const snap = new midtransclient.Snap({
    isProduction: false, // Set to false for sandbox testing
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

export const paymentRouter = createTRPCRouter({
  /**
   * Create Midtrans Snap token for product orders from cart.
   */
  createSnapToken: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      const { orderId } = input;

      // Get order details from database including order items and products
      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
        include: { 
          user: true,
          items: {
            include: {
              product: true
            }
          }
        },
      });

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found.' });
      }
      if (order.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this order.' });
      }
      if (order.items.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order has no items.' });
      }

      // Calculate total amount and prepare item details
      const itemDetails = order.items.map((item: any) => ({
        id: `PRODUCT-${item.product.id}`,
        price: Math.round(item.product.price), // Remove cents for IDR
        quantity: item.quantity,
        name: item.product.name,
        category: item.product.category || 'Product',
      }));

      const totalAmount = Math.round(order.totalAmount || order.items.reduce((total: number, item: any) => 
        total + (item.product.price * item.quantity), 0
      )); // Remove cents for IDR

      // Create transaction parameters for Midtrans
      const parameter = {
        transaction_details: {
          order_id: `ORDER-${order.id}-${Date.now()}`, // Create unique order ID
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: order.user.fullName || order.user.email?.split('@')[0] || 'Customer',
          email: order.user.email,
        },
        item_details: itemDetails,
        // Enable various payment methods
        enabled_payments: [
          'credit_card', 'bca_va', 'bni_va', 'bri_va', 'echannel', 'permata_va',
          'other_va', 'gopay', 'shopeepay', 'qris', 'indomaret', 'alfamart'
        ],
        // Custom expiry (optional) - Fixed format for Indonesian timezone
        expiry: {
          start_time: (() => {
            const now = new Date();
            const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
            const year = jakartaTime.getUTCFullYear();
            const month = String(jakartaTime.getUTCMonth() + 1).padStart(2, '0');
            const day = String(jakartaTime.getUTCDate()).padStart(2, '0');
            const hours = String(jakartaTime.getUTCHours()).padStart(2, '0');
            const minutes = String(jakartaTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(jakartaTime.getUTCSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;
          })(),
          unit: 'minutes',
          duration: 60 // 1 hour
        }
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        const transactionToken = transaction.token;

        // Save token to order for reference
        await ctx.db.order.update({
            where: { id: order.id },
            data: { snapToken: transactionToken },
        });

        return { token: transactionToken };
      } catch (error) {
        console.error("Midtrans Error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment transaction.',
        });
      }
    }),
});

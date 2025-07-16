import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, sellerProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const customOrderRouter = createTRPCRouter({
  /**
   * Create a new custom order
   */
  create: protectedProcedure
    .input(
      z.object({
        sellerId: z.number(),
        imageUrl: z.string().optional(),
        description: z.string().min(10, "Description must be at least 10 characters"),
        needsCourier: z.boolean().default(false),
        address: z.string().optional(),
        pickupTime: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Verify seller exists
      const seller = await ctx.db.seller.findUnique({
        where: { id: input.sellerId },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller not found.' });
      }

      // Create custom order
      const customOrder = await ctx.db.customOrder.create({
        data: {
          userId,
          sellerId: input.sellerId,
          imageUrl: input.imageUrl,
          description: input.description,
          status: 'pending',
        },
      });

      // Create courier request if needed
      if (input.needsCourier && input.address && input.pickupTime) {
        await ctx.db.courierRequest.create({
          data: {
            customOrderId: customOrder.id,
            address: input.address,
            pickupTime: input.pickupTime,
            status: 'requested',
          },
        });
      }

      // Create notification for seller
      await ctx.db.notification.create({
        data: {
          userId: seller.userId,
          title: 'New Custom Order',
          message: `You have received a new custom order request.`,
          type: 'custom_order',
        },
      });

      return customOrder;
    }),

  /**
   * Get custom orders for the current user
   */
  getForUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);

    return ctx.db.customOrder.findMany({
      where: { userId },
      include: {
        seller: {
          include: {
            user: {
              select: {
                fullName: true,
              }
            }
          }
        },
        courierRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /**
   * Get custom orders for seller
   */
  getForSeller: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.db.seller.findUnique({
      where: { userId: parseInt(ctx.session.user.id) },
    });

    if (!seller) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
    }

    return ctx.db.customOrder.findMany({
      where: { sellerId: seller.id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        },
        courierRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /**
   * Update custom order status
   */
  updateStatus: sellerProcedure
    .input(
      z.object({
        customOrderId: z.number(),
        status: z.enum(['pending', 'accepted', 'rejected', 'completed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      // Verify this custom order belongs to the seller
      const customOrder = await ctx.db.customOrder.findUnique({
        where: { id: input.customOrderId },
        include: { user: true },
      });

      if (!customOrder || customOrder.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to modify this order.' });
      }

      // Update status
      const updatedOrder = await ctx.db.customOrder.update({
        where: { id: input.customOrderId },
        data: { status: input.status },
      });

      // Create a conversation when the order is accepted
      if (input.status === 'accepted') {
        const existingConversation = await ctx.db.$queryRaw<Array<{id: number}>>`
          SELECT id FROM conversations WHERE custom_order_id = ${input.customOrderId}
        `;

        if (existingConversation.length === 0) {
          await ctx.db.$queryRaw`
            INSERT INTO conversations (custom_order_id) VALUES (${input.customOrderId})
          `;
        }
      }

      // Create notification for user
      const statusMessage = {
        accepted: 'Your custom order has been accepted! You can now chat with the designer.',
        rejected: 'Your custom order has been rejected.',
        completed: 'Your custom order has been completed!',
      };

      if (input.status !== 'pending') {
        await ctx.db.notification.create({
          data: {
            userId: customOrder.userId,
            title: 'Custom Order Update',
            message: statusMessage[input.status] || 'Your custom order status has been updated.',
            type: 'custom_order_update',
          },
        });
      }

      return updatedOrder;
    }),

  /**
   * Update courier request status
   */
  updateCourierStatus: sellerProcedure
    .input(
      z.object({
        courierRequestId: z.number(),
        status: z.enum(['requested', 'picked_up', 'delivered', 'cancelled']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      // Verify this courier request belongs to the seller's custom order
      const courierRequest = await ctx.db.courierRequest.findUnique({
        where: { id: input.courierRequestId },
        include: { 
          customOrder: {
            include: { user: true }
          }
        },
      });

      if (!courierRequest || courierRequest.customOrder.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to modify this courier request.' });
      }

      // Update courier status
      const updatedRequest = await ctx.db.courierRequest.update({
        where: { id: input.courierRequestId },
        data: { status: input.status },
      });

      // Create notification for user
      const statusMessage = {
        picked_up: 'Your item has been picked up by the courier.',
        delivered: 'Your item has been delivered to the designer.',
        cancelled: 'The courier pickup has been cancelled.',
      };

      if (input.status !== 'requested') {
        await ctx.db.notification.create({
          data: {
            userId: courierRequest.customOrder.userId,
            title: 'Courier Update',
            message: statusMessage[input.status] || 'Your courier request status has been updated.',
            type: 'courier_update',
          },
        });
      }

      return updatedRequest;
    }),
});

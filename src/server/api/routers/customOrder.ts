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
        negotiations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest negotiation
        },
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
        negotiations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest negotiation
        },
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
        status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'negotiating', 'payment_pending']),
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

      // Create a conversation when the order is accepted or negotiating
      if (input.status === 'accepted' || input.status === 'negotiating') {
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
      const statusMessage: Record<string, string> = {
        accepted: 'Your custom order has been accepted! You can now chat with the designer.',
        rejected: 'Your custom order has been rejected.',
        completed: 'Your custom order has been completed!',
        negotiating: 'The seller has started price negotiation for your custom order.',
        payment_pending: 'Your custom order is awaiting payment.',
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

  /**
   * Propose initial price (seller)
   */
  proposePrice: sellerProcedure
    .input(
      z.object({
        customOrderId: z.number(),
        price: z.number().min(0, "Price must be positive"),
        message: z.string().optional(),
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

      // Update custom order with initial price and status
      const updatedOrder = await ctx.db.customOrder.update({
        where: { id: input.customOrderId },
        data: {
          initialPrice: input.price,
          negotiationStatus: 'seller_proposed',
          status: 'negotiating',
        },
      });

      // Create price negotiation record
      await ctx.db.priceNegotiation.create({
        data: {
          customOrderId: input.customOrderId,
          proposedBy: 'seller',
          price: input.price,
          message: input.message,
          status: 'pending',
        },
      });

      // Create notification for buyer
      await ctx.db.notification.create({
        data: {
          userId: customOrder.userId,
          title: 'Price Proposal Received',
          message: `The seller has proposed a price of $${input.price} for your custom order.`,
          type: 'price_negotiation',
        },
      });

      return updatedOrder;
    }),

  /**
   * Counter offer price (buyer)
   */
  counterOffer: protectedProcedure
    .input(
      z.object({
        customOrderId: z.number(),
        price: z.number().min(0, "Price must be positive"),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Verify this custom order belongs to the user
      const customOrder = await ctx.db.customOrder.findUnique({
        where: { id: input.customOrderId },
        include: { 
          seller: {
            include: { user: true }
          }
        },
      });

      if (!customOrder || customOrder.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to modify this order.' });
      }

      // Update custom order with proposed price
      const updatedOrder = await ctx.db.customOrder.update({
        where: { id: input.customOrderId },
        data: {
          proposedPrice: input.price,
          negotiationStatus: 'buyer_countered',
        },
      });

      // Create price negotiation record
      await ctx.db.priceNegotiation.create({
        data: {
          customOrderId: input.customOrderId,
          proposedBy: 'buyer',
          price: input.price,
          message: input.message,
          status: 'pending',
        },
      });

      // Create notification for seller
      await ctx.db.notification.create({
        data: {
          userId: customOrder.seller.userId,
          title: 'Counter Offer Received',
          message: `The buyer has counter-offered $${input.price} for the custom order.`,
          type: 'price_negotiation',
        },
      });

      return updatedOrder;
    }),

  /**
   * Accept price negotiation
   */
  acceptPrice: protectedProcedure
    .input(
      z.object({
        customOrderId: z.number(),
        negotiationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Get the negotiation record
      const negotiation = await ctx.db.priceNegotiation.findUnique({
        where: { id: input.negotiationId },
        include: {
          customOrder: {
            include: {
              user: true,
              seller: { include: { user: true } }
            }
          }
        }
      });

      if (!negotiation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Negotiation not found.' });
      }

      const customOrder = negotiation.customOrder;

      // Verify user has permission (either buyer or seller)
      const isBuyer = customOrder.userId === userId;
      const isSeller = customOrder.seller.userId === userId;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to accept this offer.' });
      }

      // Update custom order with agreed price
      const updatedOrder = await ctx.db.customOrder.update({
        where: { id: input.customOrderId },
        data: {
          agreedPrice: negotiation.price,
          negotiationStatus: 'agreed',
          status: 'payment_pending', // Move to payment pending after agreement
        },
      });

      // Update negotiation status
      await ctx.db.priceNegotiation.update({
        where: { id: input.negotiationId },
        data: { status: 'accepted' },
      });

      // Create notifications for both parties
      const notificationForBuyer = {
        userId: customOrder.userId,
        title: 'Price Agreement Reached',
        message: `Price of $${negotiation.price} has been agreed for your custom order.`,
        type: 'price_agreed',
      };

      const notificationForSeller = {
        userId: customOrder.seller.userId,
        title: 'Price Agreement Reached',
        message: `Price of $${negotiation.price} has been agreed for the custom order.`,
        type: 'price_agreed',
      };

      // Send notification to the other party (not the one who accepted)
      if (isBuyer) {
        await ctx.db.notification.create({ data: notificationForSeller });
      } else {
        await ctx.db.notification.create({ data: notificationForBuyer });
      }

      return updatedOrder;
    }),

  /**
   * Get price negotiations for a custom order
   */
  getNegotiations: protectedProcedure
    .input(z.object({ customOrderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Verify user has access to this custom order
      const customOrder = await ctx.db.customOrder.findUnique({
        where: { id: input.customOrderId },
        include: { seller: true },
      });

      if (!customOrder) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Custom order not found.' });
      }

      const isBuyer = customOrder.userId === userId;
      const isSeller = customOrder.seller.userId === userId;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view these negotiations.' });
      }

      return ctx.db.priceNegotiation.findMany({
        where: { customOrderId: input.customOrderId },
        orderBy: { createdAt: 'asc' },
      });
    }),

  /**
   * Create payment for custom order
   */
  createPayment: protectedProcedure
    .input(z.object({ customOrderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Verify user owns this custom order
      const customOrder = await ctx.db.customOrder.findUnique({
        where: { id: input.customOrderId },
        include: {
          seller: {
            include: { user: true }
          }
        },
      });

      if (!customOrder || customOrder.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to pay for this order.' });
      }

      if (!customOrder.agreedPrice) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No agreed price found for this custom order.' });
      }

      if (customOrder.paymentStatus === 'paid') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This custom order has already been paid.' });
      }

      // Create Midtrans payment
      const midtrans = require('midtrans-client');
      const snap = new midtrans.Snap({
        isProduction: false, // Set to true for production
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const parameter = {
        transaction_details: {
          order_id: `custom-order-${customOrder.id}-${Date.now()}`,
          gross_amount: Math.round(customOrder.agreedPrice),
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: ctx.session.user.name,
          email: ctx.session.user.email,
        },
        item_details: [
          {
            id: `custom-order-${customOrder.id}`,
            price: Math.round(customOrder.agreedPrice),
            quantity: 1,
            name: `Custom Order from ${customOrder.seller.storeName}`,
          },
        ],
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        
        // Update custom order with snap token
        await ctx.db.customOrder.update({
          where: { id: input.customOrderId },
          data: {
            snapToken: transaction.token,
            paymentStatus: 'pending',
            status: 'payment_pending',
          },
        });

        return {
          snapToken: transaction.token,
          redirectUrl: transaction.redirect_url,
        };
      } catch (error: any) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: `Payment creation failed: ${error.message}` 
        });
      }
    }),

  /**
   * Handle payment notification/callback
   */
  handlePaymentNotification: protectedProcedure
    .input(
      z.object({
        customOrderId: z.number(),
        transactionStatus: z.string(),
        paymentType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { customOrderId, transactionStatus } = input;

      let status = 'payment_pending';
      let paymentStatus = 'pending';

      // Map Midtrans status to our status
      switch (transactionStatus) {
        case 'capture':
        case 'settlement':
          status = 'accepted';
          paymentStatus = 'paid';
          break;
        case 'pending':
          status = 'payment_pending';
          paymentStatus = 'pending';
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
          status = 'payment_pending';
          paymentStatus = 'failed';
          break;
        default:
          paymentStatus = 'pending';
      }

      const updateData: any = {
        paymentStatus,
        status,
      };

      if (paymentStatus === 'paid') {
        updateData.paidAt = new Date();
      }

      // Update custom order
      const updatedOrder = await ctx.db.customOrder.update({
        where: { id: customOrderId },
        data: updateData,
        include: {
          user: true,
          seller: { include: { user: true } },
        },
      });

      // Create notifications
      if (paymentStatus === 'paid') {
        // Notify seller
        await ctx.db.notification.create({
          data: {
            userId: updatedOrder.seller.userId,
            title: 'Payment Received',
            message: `Payment of $${updatedOrder.agreedPrice} has been received for custom order #${customOrderId}. You can now start working on the order.`,
            type: 'payment_received',
          },
        });

        // Notify buyer
        await ctx.db.notification.create({
          data: {
            userId: updatedOrder.userId,
            title: 'Payment Successful',
            message: `Your payment of $${updatedOrder.agreedPrice} for custom order #${customOrderId} has been processed successfully.`,
            type: 'payment_success',
          },
        });
      }

      return updatedOrder;
    }),

  /**
   * Get single custom order by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      const customOrder = await ctx.db.customOrder.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          },
          seller: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                }
              }
            }
          },
          courierRequest: true,
          negotiations: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!customOrder) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Custom order not found.' });
      }

      // Check if user has permission to view this order
      const isBuyer = customOrder.userId === userId;
      const isSeller = customOrder.seller.userId === userId;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view this order.' });
      }

      return customOrder;
    }),
});

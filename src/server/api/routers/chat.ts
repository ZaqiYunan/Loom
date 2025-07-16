import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const chatRouter = createTRPCRouter({
  /**
   * Mutation untuk mengirim pesan baru ke dalam sebuah percakapan.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        orderId: z.number().optional(),
        customOrderId: z.number().optional(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = parseInt(ctx.session.user.id);
      const { orderId, customOrderId, content } = input;

      if (!orderId && !customOrderId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Either orderId or customOrderId must be provided.' });
      }

      // Dapatkan conversationId dari orderId atau customOrderId
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          ...(orderId && { orderId }),
          ...(customOrderId && { customOrderId }),
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Percakapan untuk pesanan ini tidak ditemukan.' });
      }

      // Verifikasi bahwa pengirim adalah bagian dari pesanan (pembeli atau penjual)
      let isBuyer = false;
      let isSeller = false;

      if (conversation.orderId) {
        const order = await ctx.db.order.findUnique({
          where: { id: conversation.orderId },
        });
        if (order) {
          isBuyer = order.userId === senderId;
          isSeller = order.sellerId === senderId;
        }
      } else {
        // Use raw query for custom order check
        const customOrderConvs = await ctx.db.$queryRaw<Array<{id: number, customOrderId: number | null}>>`
          SELECT id, custom_order_id as "customOrderId" 
          FROM conversations 
          WHERE id = ${conversation.id} AND custom_order_id IS NOT NULL
        `;
        
        if (customOrderConvs.length > 0 && customOrderConvs[0]?.customOrderId) {
          const customOrder = await ctx.db.customOrder.findUnique({
            where: { id: customOrderConvs[0].customOrderId },
          });
          if (customOrder) {
            isBuyer = customOrder.userId === senderId;
            isSeller = customOrder.sellerId === senderId;
          }
        }
      }

      if (!isBuyer && !isSeller) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke percakapan ini.' });
      }

      const newMessage = await ctx.db.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content,
        },
        include: { sender: { select: { id: true, fullName: true } } },
      });

      // Create notification for the other user
      let recipientId: number | null = null;
      let orderType = 'order';
      let orderIdForNotification: number | null = null;

      if (conversation.orderId) {
        const order = await ctx.db.order.findUnique({
          where: { id: conversation.orderId },
        });
        if (order) {
          recipientId = order.userId === senderId ? order.sellerId : order.userId;
          orderIdForNotification = order.id;
        }
      } else {
        // Use raw query for custom order
        const customOrderConvs = await ctx.db.$queryRaw<Array<{customOrderId: number}>>`
          SELECT custom_order_id as "customOrderId" 
          FROM conversations 
          WHERE id = ${conversation.id} AND custom_order_id IS NOT NULL
        `;
        
        if (customOrderConvs.length > 0) {
          const customOrder = await ctx.db.customOrder.findUnique({
            where: { id: customOrderConvs[0]!.customOrderId },
          });
          if (customOrder) {
            recipientId = customOrder.userId === senderId ? customOrder.sellerId : customOrder.userId;
            orderType = 'custom_order';
            orderIdForNotification = customOrder.id;
          }
        }
      }

      // Create notification if recipient found
      if (recipientId && orderIdForNotification) {
        await ctx.db.notification.create({
          data: {
            userId: recipientId,
            title: 'New Message',
            message: `You have a new message for ${orderType === 'custom_order' ? 'custom order' : 'order'} #${orderIdForNotification}`,
            type: 'message',
          },
        });
      }

      return newMessage;
    }),
    
    /**
     * Mengambil riwayat pesan dari sebuah percakapan.
     */
    getHistory: protectedProcedure
        .input(z.object({ conversationId: z.number() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.message.findMany({
                where: { conversationId: input.conversationId },
                orderBy: { createdAt: 'asc' },
                include: { sender: { select: { id: true, fullName: true } } },
            });
        }),
        
        /**
     * Get or create a conversation for a custom order
     */
    getOrCreateCustomOrderConversation: protectedProcedure
        .input(z.object({ customOrderId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const userId = parseInt(ctx.session.user.id);
            const { customOrderId } = input;

            // Check if conversation already exists
            let conversation = await ctx.db.$queryRaw<Array<{id: number, orderId: number | null, customOrderId: number | null}>>`
                SELECT id, order_id as "orderId", custom_order_id as "customOrderId" 
                FROM conversations 
                WHERE custom_order_id = ${customOrderId}
            `;

            if (!conversation || conversation.length === 0) {
                // Verify user has access to this custom order
                const customOrder = await ctx.db.customOrder.findUnique({
                    where: { id: customOrderId },
                });

                if (!customOrder) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Custom order not found.' });
                }

                // Check if user is either the customer or the seller
                const hasAccess = customOrder.userId === userId || customOrder.sellerId === userId;
                if (!hasAccess) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this custom order.' });
                }

                // Create new conversation
                const newConversation = await ctx.db.$queryRaw<Array<{id: number}>>`
                    INSERT INTO conversations (custom_order_id) VALUES (${customOrderId}) RETURNING id
                `;
                
                conversation = [{
                    id: newConversation[0]!.id,
                    orderId: null,
                    customOrderId: customOrderId
                }];
            }

            return conversation[0] || null;
        }),

    /**
     * Get conversation details by custom order ID
     */
    getCustomOrderConversation: protectedProcedure
        .input(z.object({ customOrderId: z.number() }))
        .query(async ({ ctx, input }) => {
            const userId = parseInt(ctx.session.user.id);
            const { customOrderId } = input;

            // Verify user has access to this custom order
            const customOrder = await ctx.db.customOrder.findUnique({
                where: { id: customOrderId },
                include: {
                    user: { select: { id: true, fullName: true } },
                    seller: { include: { user: { select: { id: true, fullName: true } } } },
                },
            });

            if (!customOrder) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Custom order not found.' });
            }

            // Check if user is either the customer or the seller
            const hasAccess = customOrder.userId === userId || customOrder.sellerId === userId;
            if (!hasAccess) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this custom order.' });
            }

            const conversation = await ctx.db.$queryRaw<Array<{id: number, orderId: number | null, customOrderId: number | null}>>`
                SELECT id, order_id as "orderId", custom_order_id as "customOrderId" 
                FROM conversations 
                WHERE custom_order_id = ${customOrderId}
            `;

            return {
                conversation: conversation[0] || null,
                customOrder,
                otherUser: customOrder.userId === userId ? customOrder.seller.user : customOrder.user,
            };
        }),
});

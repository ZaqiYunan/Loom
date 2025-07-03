import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';

// EventEmitter untuk menangani event pesan real-time
const ee = new EventEmitter();

export const chatRouter = createTRPCRouter({
  /**
   * Mutation untuk mengirim pesan baru ke dalam sebuah percakapan.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = parseInt(ctx.session.user.id);
      const { orderId, content } = input;

      // Dapatkan conversationId dari orderId
      const conversation = await ctx.db.conversation.findUnique({
        where: { orderId },
        include: { order: true },
      });

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Percakapan untuk pesanan ini tidak ditemukan.' });
      }

      // Verifikasi bahwa pengirim adalah bagian dari pesanan (pembeli atau penjual)
      const isBuyer = conversation.order.userId === senderId;
      const isSeller = conversation.order.sellerId === senderId;

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

      // Emit event bahwa ada pesan baru
      ee.emit(`newMessage.${conversation.id}`, newMessage);

      return newMessage;
    }),

  /**
   * Subscription untuk mendengarkan pesan baru secara real-time.
   */
  onNewMessage: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .subscription(({ input }) => {
      return observable((emit) => {
        const handler = (data: any) => {
          emit.next(data);
        };

        ee.on(`newMessage.${input.conversationId}`, handler);

        // Cleanup saat subscription berakhir
        return () => {
          ee.off(`newMessage.${input.conversationId}`, handler);
        };
      });
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
});

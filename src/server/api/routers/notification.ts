import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const notificationRouter = createTRPCRouter({
  /**
   * Get all notifications for the current user
   */
  getForUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);

    return ctx.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent notifications
    });
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);

      // Verify the notification belongs to the current user
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!notification || notification.userId !== userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found.' });
      }

      return ctx.db.notification.update({
        where: { id: input.notificationId },
        data: { read: true },
      });
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);

    return ctx.db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);

    return ctx.db.notification.count({
      where: { userId, read: false },
    });
  }),
});

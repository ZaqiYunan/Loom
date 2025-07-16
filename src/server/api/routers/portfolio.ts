import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, sellerProcedure, publicProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const portfolioRouter = createTRPCRouter({
  /**
   * Create a new portfolio item (seller only)
   */
  create: sellerProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        imageUrl: z.string().url("Valid image URL is required"),
        category: z.string().optional(),
        tags: z.string().optional(), // JSON string of tags
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      return ctx.db.portfolio.create({
        data: {
          sellerId: seller.id,
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          category: input.category,
          tags: input.tags,
          featured: input.featured,
        },
      });
    }),

  /**
   * Get portfolio items for current seller
   */
  getForSeller: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.db.seller.findUnique({
      where: { userId: parseInt(ctx.session.user.id) },
    });

    if (!seller) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
    }

    return ctx.db.portfolio.findMany({
      where: { sellerId: seller.id },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }),

  /**
   * Get portfolio items for a specific seller (public)
   */
  getBySellerId: publicProcedure
    .input(z.object({ sellerId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.portfolio.findMany({
        where: { sellerId: input.sellerId },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    }),

  /**
   * Update portfolio item
   */
  update: sellerProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        imageUrl: z.string().url("Valid image URL is required"),
        category: z.string().optional(),
        tags: z.string().optional(),
        featured: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      // Verify this portfolio item belongs to the seller
      const portfolioItem = await ctx.db.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!portfolioItem || portfolioItem.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this portfolio item.' });
      }

      return ctx.db.portfolio.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          category: input.category,
          tags: input.tags,
          featured: input.featured,
        },
      });
    }),

  /**
   * Delete portfolio item
   */
  delete: sellerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      // Verify this portfolio item belongs to the seller
      const portfolioItem = await ctx.db.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!portfolioItem || portfolioItem.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this portfolio item.' });
      }

      return ctx.db.portfolio.delete({
        where: { id: input.id },
      });
    }),

  /**
   * Toggle featured status
   */
  toggleFeatured: sellerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      // Verify this portfolio item belongs to the seller
      const portfolioItem = await ctx.db.portfolio.findUnique({
        where: { id: input.id },
      });

      if (!portfolioItem || portfolioItem.sellerId !== seller.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to modify this portfolio item.' });
      }

      return ctx.db.portfolio.update({
        where: { id: input.id },
        data: {
          featured: !portfolioItem.featured,
        },
      });
    }),
});

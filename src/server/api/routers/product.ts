import { z } from 'zod';
import { createTRPCRouter, publicProcedure, sellerProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const productRouter = createTRPCRouter({
  /**
   * Get all finished products available to the public.
   */
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          include: {
            user: {
              select: {
                fullName: true,
              }
            }
          }
        }
      }
    });
  }),

  /**
   * Get product by ID.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          seller: {
            include: {
              user: {
                select: {
                  fullName: true,
                }
              }
            }
          }
        }
      });
    }),

  /**
   * Get all products owned by the currently logged-in seller.
   * Protected by sellerProcedure.
   */
  getForSeller: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
    });

    if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
    }

    return ctx.db.product.findMany({
        where: { sellerId: seller.id },
        orderBy: { createdAt: 'desc' },
    });
  }),

  /**
   * Mutation to create a new finished product.
   */
  create: sellerProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        price: z.number().positive("Price must be a positive number"),
        imageUrl: z.string().url("Invalid image URL").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Seller profile not found for this user.' });
      }

      return await ctx.db.product.create({
        data: { ...input, sellerId: seller.id },
      });
    }),

  /**
   * Mutation to edit an existing product.
   */
  update: sellerProcedure
    .input(
        z.object({
            id: z.number(),
            name: z.string().min(3).optional(),
            description: z.string().min(10).optional(),
            price: z.number().positive().optional(),
            imageUrl: z.string().url().optional(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        const { id, ...dataToUpdate } = input;

        // Verify that this product belongs to the currently logged-in seller
        const product = await ctx.db.product.findUnique({
            where: { id },
            include: { seller: true },
        });

        if (!product || product.seller.userId !== parseInt(ctx.session.user.id)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to edit this product.' });
        }

        return await ctx.db.product.update({
            where: { id },
            data: dataToUpdate,
        });
    }),

  /**
   * Mutation to delete a product.
   */
  delete: sellerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
        const { id } = input;

        // Verify that this product belongs to the currently logged-in seller
        const product = await ctx.db.product.findUnique({
            where: { id },
            include: { seller: true },
        });

        if (!product || product.seller.userId !== parseInt(ctx.session.user.id)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this product.' });
        }

        await ctx.db.product.delete({ where: { id } });

        return { success: true, message: "Product successfully deleted." };
    }),
});

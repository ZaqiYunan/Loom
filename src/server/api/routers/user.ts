import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure, sellerProcedure } from '~/server/api/trpc';
import { db } from '~/server/db';

export const userRouter = createTRPCRouter({
  /**
   * Mutation for new user registration.
   * Uses publicProcedure because this is an action that can be performed
   * by anyone (users who are not logged in).
   */
  register: publicProcedure
    .input(
      // Input validation using Zod
      z.object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        fullName: z.string().min(3, "Full name must be at least 3 characters"),
        role: z.enum(['user', 'seller']).default('user'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { username, email, password, fullName, role } = input;

      // Using context `db` provided by `createTRPCContext`
      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      // If user already exists, throw error that will be caught by tRPC
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username or email already registered.',
        });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user in database
      const newUser = await ctx.db.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          fullName,
          role,
        },
      });
      
      // If role is seller, also create entry in sellers table
      if (role === 'seller') {
        await ctx.db.seller.create({
            data: {
                userId: newUser.id,
                storeName: `${fullName}'s Store`, // Default store name
                description: `Welcome to ${fullName}'s store!`,
            }
        });
      }

      // Remove password from object returned to client
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }),

  /**
   * Get seller profile for the current logged-in seller
   */
  getSellerProfile: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.db.seller.findUnique({
      where: { userId: parseInt(ctx.session.user.id) },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        }
      }
    });

    if (!seller) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
    }

    return seller;
  }),

  /**
   * Update seller profile
   */
  updateSellerProfile: sellerProcedure
    .input(
      z.object({
        storeName: z.string().min(3, "Store name must be at least 3 characters"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.db.seller.findUnique({
        where: { userId: parseInt(ctx.session.user.id) },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller profile not found.' });
      }

      const updatedSeller = await ctx.db.seller.update({
        where: { id: seller.id },
        data: {
          storeName: input.storeName,
          description: input.description,
        },
      });

      return updatedSeller;
    }),

  /**
   * Get all sellers for selection
   */
  getAllSellers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.seller.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }),
});

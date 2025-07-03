import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const profileRouter = createTRPCRouter({
  /**
   * Mengambil data profil lengkap untuk pengguna yang sedang login.
   */
  get: protectedProcedure.query(({ ctx }) => {
    const userId = parseInt(ctx.session.user.id);
    return ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        seller: { // Sertakan data seller jika ada
          select: {
            id: true,
            storeName: true,
            description: true,
          }
        },
        userSkills: { // Sertakan data skills
            include: {
                skill: true,
            }
        }
      },
    });
  }),

  /**
   * Memperbarui data profil pengguna.
   */
  update: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(3).optional(),
        storeName: z.string().min(3).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = parseInt(ctx.session.user.id);
      
      // Update data dasar pengguna
      if (input.fullName) {
        await ctx.db.user.update({
          where: { id: userId },
          data: { fullName: input.fullName },
        });
      }

      // Jika user adalah seller dan ada data toko yang diupdate
      if (ctx.session.user.role === 'seller' && (input.storeName || input.description)) {
        const seller = await ctx.db.seller.findUnique({ where: { userId } });
        if (!seller) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Profil seller tidak ditemukan.' });
        }
        await ctx.db.seller.update({
          where: { userId },
          data: {
            storeName: input.storeName,
            description: input.description,
          },
        });
      }
      
      return { success: true, message: "Profil berhasil diperbarui." };
    }),

    /**
     * Menambahkan keahlian baru ke profil pengguna.
     */
    addSkill: protectedProcedure
        .input(z.object({ skillName: z.string().min(1).toLowerCase() }))
        .mutation(async ({ ctx, input }) => {
            const userId = parseInt(ctx.session.user.id);

            return await ctx.db.$transaction(async (prisma) => {
                // Buat skill jika belum ada, atau dapatkan yang sudah ada
                const skill = await prisma.skill.upsert({
                    where: { name: input.skillName },
                    update: {},
                    create: { name: input.skillName },
                });

                // Cek apakah user sudah memiliki skill ini
                const existingUserSkill = await prisma.userSkill.findFirst({
                    where: { userId, skillId: skill.id },
                });

                if (existingUserSkill) {
                    throw new TRPCError({ code: 'CONFLICT', message: 'Anda sudah memiliki keahlian ini.' });
                }

                // Tambahkan relasi antara user dan skill
                return await prisma.userSkill.create({
                    data: {
                        userId,
                        skillId: skill.id,
                    }
                });
            });
        }),
    
    /**
     * Mengambil semua skill yang ada di database (untuk autocomplete/dropdown).
     */
    getAllSkills: publicProcedure.query(({ ctx }) => {
        return ctx.db.skill.findMany({
            orderBy: { name: 'asc' }
        });
    }),
});

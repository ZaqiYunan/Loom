import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const searchRouter = createTRPCRouter({
  /**
   * Melakukan pencarian umum di seluruh produk dan penjual.
   * Ini adalah publicProcedure sehingga siapa saja bisa menggunakannya.
   */
  query: publicProcedure
    .input(z.object({ term: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { term } = input;
      const searchTerm = `%${term}%`; // Wildcard untuk pencarian 'like'

      // Menjalankan beberapa query pencarian secara paralel
      const [productsFound, sellersFoundByName, sellersFoundBySkill] = await ctx.db.$transaction([
        // 1. Cari di tabel Produk
        ctx.db.product.findMany({
          where: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          },
          include: { seller: { include: { user: { select: { fullName: true } } } } },
        }),
        // 2. Cari di tabel Seller berdasarkan nama/deskripsi
        ctx.db.seller.findMany({
            where: {
                OR: [
                    { storeName: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } },
                    { user: { fullName: { contains: term, mode: 'insensitive' } } },
                ],
            },
            include: { user: { select: { fullName: true, email: true } } },
        }),
        // 3. Cari di tabel Seller berdasarkan keahlian
        ctx.db.seller.findMany({
            where: {
                user: {
                    userSkills: {
                        some: {
                            skill: { name: { contains: term, mode: 'insensitive' } }
                        }
                    }
                }
            },
            include: { user: { select: { fullName: true, email: true } } },
        }),
      ]);

      // Gabungkan hasil pencarian seller dan hapus duplikat
      const allSellers = new Map<number, typeof sellersFoundByName[0]>();
      sellersFoundByName.forEach(seller => allSellers.set(seller.id, seller));
      sellersFoundBySkill.forEach(seller => allSellers.set(seller.id, seller));

      return {
        products: productsFound,
        sellers: Array.from(allSellers.values()),
      };
    }),
});

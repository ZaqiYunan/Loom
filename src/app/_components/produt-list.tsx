"use client";

import { api } from "~/trpc/react";
import Image from "next/image";

export function ProductList() {
  const { data: products, isLoading, error } = api.product.getAll.useQuery();

  if (isLoading) {
    return <div>Memuat daftar jasa...</div>;
  }

  if (error) {
    return <div>Terjadi kesalahan: {error.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div>Belum ada jasa yang tersedia saat ini.</div>;
  }

  return (
    <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Jasa Tersedia</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
            <div key={product.id} className="rounded-xl bg-white/10 p-4 flex flex-col justify-between">
                <div>
                    <Image 
                        src={product.imageUrl ?? `https://placehold.co/400x300/4F46E5/FFFFFF?text=${product.name}`}
                        alt={`Gambar untuk ${product.name}`}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-bold truncate">{product.name}</h3>
                    <p className="text-sm text-gray-300 mb-2">oleh {product.seller.user.fullName}</p>
                    <p className="text-xs text-gray-400 truncate h-10">{product.description}</p>
                </div>
                <div className="mt-4">
                    <p className="text-xl font-semibold text-right text-[hsl(280,100%,70%)]">
                        Rp {product.price.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
}

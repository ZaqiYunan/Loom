"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { AlertTriangle, Edit, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ManageProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Query untuk mengambil produk milik seller
  const { data: products, isLoading, error, refetch } = api.product.getForSeller.useQuery(
    undefined, // tidak ada input yang dibutuhkan
    {
      // Hanya jalankan query jika user adalah seller
      enabled: session?.user?.role === "seller",
    }
  );

  // Mutasi untuk menghapus produk
  const deleteProductMutation = api.product.delete.useMutation({
    onSuccess: () => {
      alert("Product successfully deleted.");
      refetch(); // Refresh product data after successful deletion
    },
    onError: (err) => {
      alert(`Failed to delete product: ${err.message}`);
    },
  });

  const handleDelete = (productId: number) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      deleteProductMutation.mutate({ id: productId });
    }
  };

  // Handle loading state otentikasi
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Redirect if not logged in or not a seller
  if (status === "unauthenticated" || session?.user?.role !== "seller") {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk Saya</h1>
            <p className="mt-1 text-gray-600">Lihat, edit, atau hapus produk barang jadi Anda.</p>
          </div>
          <Link
            href="/products/add"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah Produk Baru
          </Link>
        </div>

        {/* Konten utama */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-2 text-gray-500">Memuat produk Anda...</p>
            </div>
          )}
          {error && (
            <div className="p-12 text-center text-red-500">
              <AlertTriangle className="mx-auto h-8 w-8" />
              <p className="mt-2">Terjadi kesalahan: {error.message}</p>
            </div>
          )}
          {!isLoading && !error && products && (
            products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Produk</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Harga</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product: any) => (
                      <tr key={product.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Image
                              src={product.imageUrl ?? `https://placehold.co/40x40/E0E7FF/4F46E5?text=${product.name.charAt(0)}`}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                          Rp {product.price.toLocaleString("id-ID")}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-4">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteProductMutation.isPending}
                              className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">Anda belum memiliki produk</h3>
                <p className="mt-1 text-sm text-gray-500">Mulai jual barang jadi Anda dengan menambahkan produk baru.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

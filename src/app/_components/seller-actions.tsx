"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { PlusCircle, Package, ListOrdered } from "lucide-react";

export function SellerActions() {
  const { data: session } = useSession();

  if (session?.user?.role === 'seller') {
    return (
      <div className="mt-6 flex flex-wrap justify-start gap-4 border-t border-gray-200 pt-6">
        <Link 
          href="/dashboard/seller/products/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
        <Link 
          href="/dashboard/seller/products"
          className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50"
        >
          <Package className="h-4 w-4" />
          My Products
        </Link>
        <Link 
          href="/dashboard/seller/orders"
          className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50"
        >
          <ListOrdered className="h-4 w-4" />
          Orders
        </Link>
      </div>
    );
  }

  return null;
}

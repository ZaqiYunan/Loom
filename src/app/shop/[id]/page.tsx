"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Star, MessageCircle, Package } from "lucide-react";
import Link from "next/link";

export default function SellerShopPage() {
  const params = useParams();
  const sellerId = parseInt(params.id as string);

  const { data: portfolioItems, isLoading: portfolioLoading } = api.portfolio.getBySellerId.useQuery(
    { sellerId },
    { enabled: !!sellerId }
  );

  const { data: products, isLoading: productsLoading } = api.product.getBySeller.useQuery(
    { sellerId },
    { enabled: !!sellerId }
  );

  // Get seller info from products query
  const sellerInfo = products?.[0]?.seller;

  if (portfolioLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!sellerInfo && (!portfolioItems || portfolioItems.length === 0) && (!products || products.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-gray-600">This seller shop doesn't exist or has no items yet.</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const featuredItems = portfolioItems?.filter((item: any) => item.featured) || [];
  const regularItems = portfolioItems?.filter((item: any) => !item.featured) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {sellerInfo?.storeName || "Designer Shop"}
              </h1>
              <p className="text-gray-600 mb-4">
                by {sellerInfo?.user?.fullName || "Designer"}
              </p>
              {sellerInfo?.description && (
                <p className="text-gray-700 max-w-2xl">{sellerInfo.description}</p>
              )}
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link
                href={`/orders/custom/new?sellerId=${sellerId}`}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Request Custom Order</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Portfolio Items */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Featured Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/400/300";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>Featured</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    )}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.split(',').slice(0, 4).map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products for Sale */}
        {products && products.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Package className="h-6 w-6 text-indigo-600 mr-2" />
              Products for Sale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Link key={product.id} href={`/product/${product.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={product.imageUrl || "/api/placeholder/300/200"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/300/200";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Gallery */}
        {regularItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/300/200";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                      {item.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    )}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!portfolioItems || portfolioItems.length === 0) && (!products || products.length === 0) && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Yet</h3>
            <p className="text-gray-600 mb-6">This seller hasn't added any portfolio items or products yet.</p>
            <Link
              href={`/orders/custom/new?sellerId=${sellerId}`}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Request Custom Order</span>
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-indigo-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-indigo-900 mb-4">
            Love what you see? Let's work together!
          </h3>
          <p className="text-indigo-700 mb-6">
            Get a custom design made just for you by this talented designer.
          </p>
          <Link
            href={`/orders/custom/new?sellerId=${sellerId}`}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Start Your Custom Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

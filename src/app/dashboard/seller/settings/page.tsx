"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState, useEffect } from "react";
import { Loader2, Save, Store, User, Mail, Settings } from "lucide-react";
import Link from "next/link";

export default function SellerSettingsPage() {
  const { data: session, status } = useSession();
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get seller data
  const { data: seller, refetch } = api.user.getSellerProfile.useQuery(
    undefined,
    { enabled: session?.user?.role === "seller" }
  );

  // Update form when seller data is loaded
  useEffect(() => {
    if (seller) {
      setStoreName(seller.storeName || "");
      setStoreDescription(seller.description || "");
    }
  }, [seller]);

  const updateSellerMutation = api.user.updateSellerProfile.useMutation({
    onSuccess: () => {
      alert("Store settings updated successfully!");
      refetch();
    },
    onError: (err: any) => {
      alert(`Failed to update settings: ${err.message}`);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    updateSellerMutation.mutate({
      storeName,
      description: storeDescription,
    });
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "seller") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in as a seller to access this page.</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
            <p className="text-gray-600 mt-2">Manage your store information and preferences</p>
          </div>
          <Link
            href="/dashboard/seller"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Store Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Store className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your store name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your store and what you offer..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{session?.user?.name || "N/A"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{session?.user?.email || "N/A"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                  {session?.user?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Store Name:</span>
                <span className="font-medium">{seller?.storeName || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium">
                  {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Contact our support team if you need assistance with your store settings.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

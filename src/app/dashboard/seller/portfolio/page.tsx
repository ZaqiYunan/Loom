"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Plus, Edit, Trash2, Star, StarOff, Eye, Upload } from "lucide-react";
import Link from "next/link";

export default function SellerPortfolioPage() {
  const { data: session, status } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    tags: "",
    featured: false,
  });

  const { data: portfolioItems, isLoading, refetch } = api.portfolio.getForSeller.useQuery(
    undefined,
    { enabled: session?.user?.role === "seller" }
  );

  const createMutation = api.portfolio.create.useMutation({
    onSuccess: () => {
      setShowAddForm(false);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        category: "",
        tags: "",
        featured: false,
      });
      refetch();
    },
  });

  const updateMutation = api.portfolio.update.useMutation({
    onSuccess: () => {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        category: "",
        tags: "",
        featured: false,
      });
      refetch();
    },
  });

  const deleteMutation = api.portfolio.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const toggleFeaturedMutation = api.portfolio.toggleFeatured.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: item.category || "",
      tags: item.tags || "",
      featured: item.featured,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this portfolio item?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleToggleFeatured = async (id: number) => {
    await toggleFeaturedMutation.mutateAsync({ id });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio & Shop</h1>
          <p className="text-gray-600">Showcase your best work to attract customers</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingItem(null);
            setFormData({
              title: "",
              description: "",
              imageUrl: "",
              category: "",
              tags: "",
              featured: false,
            });
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Portfolio Item</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  <option value="Wedding Dress">Wedding Dress</option>
                  <option value="Formal Wear">Formal Wear</option>
                  <option value="Casual Wear">Casual Wear</option>
                  <option value="Evening Gown">Evening Gown</option>
                  <option value="Business Attire">Business Attire</option>
                  <option value="Traditional Wear">Traditional Wear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe this piece..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="elegant, modern, custom, handmade"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Feature this item (will be shown prominently)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingItem ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Grid */}
      {!portfolioItems || portfolioItems.length === 0 ? (
        <div className="text-center py-16">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items Yet</h3>
          <p className="text-gray-600 mb-6">Start building your portfolio to showcase your work to potential customers.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Portfolio Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioItems.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Featured Badge */}
              {item.featured && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Featured</span>
                  </span>
                </div>
              )}
              
              {/* Image */}
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

              {/* Content */}
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
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`transition-colors ${
                        item.featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"
                      }`}
                      title={item.featured ? "Remove from featured" : "Mark as featured"}
                    >
                      {item.featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

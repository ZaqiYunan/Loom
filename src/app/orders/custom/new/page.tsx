"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Upload, Camera, Package, Truck, Clock, User, X } from "lucide-react";
import Link from "next/link";
import { uploadImage, validateImageFile } from "~/lib/upload";

function CustomOrderForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSeller, setSelectedSeller] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [needsCourier, setNeedsCourier] = useState(false);
  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Get all sellers for selection
  const { data: sellers } = api.user.getAllSellers.useQuery();

  // Pre-select seller from URL parameter
  useEffect(() => {
    const sellerIdParam = searchParams.get('sellerId');
    if (sellerIdParam) {
      setSelectedSeller(sellerIdParam);
    }
  }, [searchParams]);

  // Create custom order mutation
  const createCustomOrderMutation = api.customOrder.create.useMutation({
    onSuccess: (data) => {
      alert("Custom order submitted successfully! The seller will contact you soon.");
      router.push("/orders/custom");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    setUploadError("");
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error) {
      setUploadError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setUploadedImageUrl("");
    setUploadError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSeller) {
      alert("Please select a designer/seller");
      return;
    }

    if (!description.trim()) {
      alert("Please provide a description of your customization needs");
      return;
    }

    if (!uploadedImageUrl && !imagePreview) {
      alert("Please upload an image of your fashion item");
      return;
    }

    if (isUploading) {
      alert("Please wait for the image to finish uploading");
      return;
    }

    const pickupDateTime = needsCourier && pickupDate && pickupTime 
      ? new Date(`${pickupDate}T${pickupTime}`) 
      : undefined;

    // Use the uploaded Supabase URL if available, otherwise fallback to base64
    const imageUrl = uploadedImageUrl || imagePreview;

    createCustomOrderMutation.mutate({
      sellerId: parseInt(selectedSeller),
      imageUrl,
      description,
      needsCourier,
      address: needsCourier ? address : undefined,
      pickupTime: pickupDateTime,
    });
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to submit a custom order</h1>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Custom Fashion Order</h1>
          <p className="text-gray-600">Send your fashion item to a designer for customization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Designer Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Choose Designer</h2>
            </div>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a designer/seller</option>
              {sellers?.map((seller: any) => (
                <option key={seller.id} value={seller.id}>
                  {seller.storeName} - {seller.user.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Camera className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Upload Your Fashion Item</h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-64 object-contain rounded-lg"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Uploading...</p>
                        </div>
                      </div>
                    )}
                    {uploadedImageUrl && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove Image</span>
                    </button>
                    {uploadedImageUrl && (
                      <span className="text-green-600 text-sm">✓ Uploaded successfully</span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Upload a photo of your fashion item</p>
                  <p className="text-sm text-gray-500 mb-4">Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {uploadError}
              </div>
            )}
          </div>

          {/* Customization Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Customization Details</h2>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what you want to customize:
- What type of item is it? (dress, shirt, pants, etc.)
- What changes do you want? (resize, color change, add embellishments, etc.)
- Any specific requirements or preferences?
- Your measurements (if needed)
- Budget range"
              required
            />
          </div>

          {/* Courier Request */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Courier Pickup</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={needsCourier}
                  onChange={(e) => setNeedsCourier(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">I need a courier to pick up my item</span>
              </label>

              {needsCourier && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your full address including postal code"
                      required={needsCourier}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required={needsCourier}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required={needsCourier}
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={createCustomOrderMutation.isPending || isUploading}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {createCustomOrderMutation.isPending 
                ? "Submitting..." 
                : isUploading 
                  ? "Uploading Image..." 
                  : "Submit Custom Order"}
            </button>
            <Link
              href="/orders"
              className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    </div>}>
      <CustomOrderForm />
    </Suspense>
  );
}

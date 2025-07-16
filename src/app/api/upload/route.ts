import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";
import { auth } from "~/server/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");
    
    const session = await auth();
    console.log("Session:", session ? "Authenticated" : "Not authenticated");
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", file.name, file.type, file.size);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${session.user.id}_${timestamp}.${extension}`;

    console.log("Generated filename:", filename);

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    console.log("File converted to buffer, size:", uint8Array.length);

    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    console.log("Available buckets:", buckets?.map(b => b.name));
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
    }

    // Try to create bucket if it doesn't exist
    const bucketName = "custom-order-images";
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log("Bucket doesn't exist, creating it...");
      const { data: createBucketData, error: createBucketError } = await supabaseAdmin.storage
        .createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });
      
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        return NextResponse.json(
          { error: "Failed to create storage bucket" },
          { status: 500 }
        );
      }
      console.log("Bucket created successfully");
    }

    // Upload to Supabase Storage
    console.log("Uploading to Supabase...");
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filename, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Failed to upload image: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Upload successful:", data);

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filename);

    console.log("Public URL generated:", publicUrlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: filename,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabase";

export async function GET() {
  try {
    console.log("Testing Supabase connection...");
    
    // Test connection by listing buckets
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      console.error("Supabase connection error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        url: process.env.SUPABASE_URL || "URL not set",
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
    }

    return NextResponse.json({
      success: true,
      buckets: buckets?.map(bucket => ({
        name: bucket.name,
        public: bucket.public,
        created_at: bucket.created_at
      })),
      url: process.env.SUPABASE_URL || "URL not set",
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      url: process.env.SUPABASE_URL || "URL not set",
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  }
}

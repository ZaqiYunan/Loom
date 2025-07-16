import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { supabaseAdmin } from "~/lib/supabase";

export const uploadRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // base64 encoded file data
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(input.fileType)) {
          throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
        }

        // Create unique filename
        const timestamp = Date.now();
        const extension = input.fileName.split(".").pop();
        const filename = `${ctx.session.user.id}_${timestamp}.${extension}`;

        // Convert base64 to buffer
        const base64Data = input.fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from("custom-order-images")
          .upload(filename, buffer, {
            contentType: input.fileType,
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("custom-order-images")
          .getPublicUrl(filename);

        return {
          success: true,
          url: publicUrlData.publicUrl,
          filename: filename,
        };
      } catch (error) {
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});

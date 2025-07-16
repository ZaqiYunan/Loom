# Supabase Integration Setup

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Client-side Supabase (these should be the same as above)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setting up Supabase Storage

1. **Create a Supabase project** at https://supabase.com
2. **Create a storage bucket** named `custom-order-images`
3. **Run the SQL setup script** in your Supabase SQL editor:
   ```sql
   -- Execute the contents of scripts/setup-supabase-storage.sql
   ```

## How it works

### Image Upload Flow

1. **Client-side**: User selects an image file
2. **Validation**: File type and size are validated
3. **Upload**: File is uploaded to Supabase Storage via API route
4. **Storage**: Image is stored in the `custom-order-images` bucket
5. **URL**: Public URL is returned and used in the custom order

### API Endpoints

- `POST /api/upload` - Upload image file to Supabase Storage
- `api.upload.uploadImage` - tRPC mutation for base64 image upload

### Security

- Images are publicly accessible once uploaded
- Users can only upload/modify their own images
- File type validation (JPEG, PNG, WebP only)
- File size limit (5MB)
- Unique filenames to prevent conflicts

## Usage

The image upload is integrated into the custom order creation flow:

1. User selects an image file
2. File is automatically uploaded to Supabase
3. Upload progress is shown to the user
4. Uploaded image URL is included in the custom order
5. Sellers can view the uploaded images in their dashboard

## Troubleshooting

- Make sure your Supabase project has storage enabled
- Check that the bucket `custom-order-images` exists and is public
- Verify that your environment variables are correctly set
- Ensure the RLS policies are properly configured

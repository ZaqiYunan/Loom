-- Create a bucket for custom order images
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-order-images', 'custom-order-images', true);

-- Set up Row Level Security (RLS) policies for the bucket
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-order-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Drop anonymous/open write policies on provider-images bucket
DROP POLICY IF EXISTS "Anyone can upload provider images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update provider images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete provider images" ON storage.objects;

-- Drop authenticated write policies on provider-images (now handled by edge function with service role)
DROP POLICY IF EXISTS "Authenticated users can upload provider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update provider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete provider images" ON storage.objects;

-- Drop anonymous write policies on pdfs bucket
DROP POLICY IF EXISTS "Allow uploads to pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from pdfs" ON storage.objects;

-- Drop anonymous write policies on provider-catalogs bucket
DROP POLICY IF EXISTS "Authenticated users can upload catalogs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own catalogs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own catalogs" ON storage.objects;
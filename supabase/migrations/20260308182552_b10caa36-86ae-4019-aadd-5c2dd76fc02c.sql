-- Drop permissive write policies on api_keys
DROP POLICY IF EXISTS "Public insert api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Public update api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Public delete api_keys" ON public.api_keys;

-- Drop permissive write policies on api_usage (edge function uses service role)
DROP POLICY IF EXISTS "Public insert api_usage" ON public.api_usage;
DROP POLICY IF EXISTS "Public update api_usage" ON public.api_usage;

-- Drop permissive write policy on api_logs (edge function uses service role)
DROP POLICY IF EXISTS "Public insert api_logs" ON public.api_logs;

-- Drop permissive write policies on providers_public
DROP POLICY IF EXISTS "Public insert providers_public" ON public.providers_public;
DROP POLICY IF EXISTS "Public update providers_public" ON public.providers_public;
DROP POLICY IF EXISTS "Public delete providers_public" ON public.providers_public;
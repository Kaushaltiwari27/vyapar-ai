-- ====================================================================
-- SQL Script to Fix Supabase Security Advisor Warnings
-- ====================================================================

-- 1. Fix "Function Search Path Mutable" Warnings
-- This sets a secure search path on SECURITY DEFINER functions to prevent privilege escalation.
ALTER FUNCTION public.get_user_business_id() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public;

-- 2. Fix "RLS Policy Always True" Warning
-- This drops the overly permissive INSERT policy on the businesses table.
-- The trigger function `handle_new_user` runs as SECURITY DEFINER and bypasses RLS,
-- so this permissive policy is not needed for signup.
DROP POLICY IF EXISTS "Allow inserts on businesses" ON public.businesses;

-- 3. Fix "Public Can Execute SECURITY DEFINER Function" Warnings
-- By default, PostgreSQL allows anyone (PUBLIC) to execute new functions. We revoke this for safety.
REVOKE EXECUTE ON FUNCTION public.get_user_business_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

-- 4. Fix "Signed In Users Can Execute SECURITY DEFINER Function" Warnings
-- Revoke direct execution permissions from signed-in users (authenticated role) for functions
-- that are system triggers or helper utilities.
REVOKE EXECUTE ON FUNCTION public.get_user_business_id() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- ============================================================
-- Seed admin users: bertwinromero@gmail.com, youngcho@billionsoulharvest.com & gorospegeraby@gmail.com
-- Default password: Password123$ (change via Supabase Dashboard)
--
-- NOTE: This migration creates auth.users via SQL with all required
-- columns populated (including email_change, phone_change, etc.)
-- to avoid GoTrue NULL scan errors. The password is hashed with
-- pgcrypto crypt() which produces compatible bcrypt hashes.
-- ============================================================

DO $$
DECLARE
  _bertwin_id uuid;
  _youngcho_id uuid;
  _gorospegeraby_id uuid;
  _password_hash text := crypt('Password123$', gen_salt('bf'));
BEGIN
  -- Create bertwinromero@gmail.com
  SELECT id INTO _bertwin_id FROM auth.users WHERE email = 'bertwinromero@gmail.com';
  IF _bertwin_id IS NULL THEN
    _bertwin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
      phone_change, phone_change_token
    ) VALUES (
      _bertwin_id,
      '00000000-0000-0000-0000-000000000000',
      'bertwinromero@gmail.com',
      _password_hash,
      now(), 'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Bertwin Romero"}'::jsonb,
      now(), now(),
      '', '',
      '', '', '', 0,
      '', ''
    );
  END IF;

  -- Create youngcho@billionsoulharvest.com
  SELECT id INTO _youngcho_id FROM auth.users WHERE email = 'youngcho@billionsoulharvest.com';
  IF _youngcho_id IS NULL THEN
    _youngcho_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
      phone_change, phone_change_token
    ) VALUES (
      _youngcho_id,
      '00000000-0000-0000-0000-000000000000',
      'youngcho@billionsoulharvest.com',
      _password_hash,
      now(), 'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Young Cho"}'::jsonb,
      now(), now(),
      '', '',
      '', '', '', 0,
      '', ''
    );
  END IF;

  -- Create gorospegeraby@gmail.com
  SELECT id INTO _gorospegeraby_id FROM auth.users WHERE email = 'gorospegeraby@gmail.com';
  IF _gorospegeraby_id IS NULL THEN
    _gorospegeraby_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change, email_change_token_new, email_change_token_current, email_change_confirm_status,
      phone_change, phone_change_token
    ) VALUES (
      _gorospegeraby_id,
      '00000000-0000-0000-0000-000000000000',
      'gorospegeraby@gmail.com',
      _password_hash,
      now(), 'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Gorospegeraby"}'::jsonb,
      now(), now(),
      '', '',
      '', '', '', 0,
      '', ''
    );
  END IF;

  -- Insert auth.identities (required by GoTrue for login)
  INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), id, 'email', id::text,
    jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false),
    now(), now(), now()
  FROM auth.users
  WHERE email IN ('bertwinromero@gmail.com', 'youngcho@billionsoulharvest.com', 'gorospegeraby@gmail.com')
  AND id NOT IN (SELECT user_id FROM auth.identities WHERE provider = 'email');

  -- Grant super_admin role
  INSERT INTO admin_users (id, role, display_name)
  VALUES
    (_bertwin_id, 'super_admin', 'Bertwin Romero'),
    (_youngcho_id, 'super_admin', 'Young Cho'),
    (_gorospegeraby_id, 'super_admin', 'Gorospegeraby')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
END $$;

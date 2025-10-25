BEGIN;

INSERT INTO storage.buckets (id, name, public)
VALUES ('food-items','food-items',true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments','attachments',false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;

CREATE OR REPLACE FUNCTION public.attachment_child_id(obj_name text)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(split_part(obj_name, '/', 1), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION public.can_read_attachment(uid uuid, obj_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
  v_child_id uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  v_child_id := public.attachment_child_id(obj_name);
  IF v_child_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = v_child_id AND c.guardian_id = uid
  ) THEN
    RETURN true;
  END IF;

  IF to_regclass('public.doctor_children') IS NOT NULL AND
     EXISTS (SELECT 1 FROM public.doctor_children dc WHERE dc.doctor_id = uid AND dc.child_id = v_child_id) THEN
    RETURN true;
  END IF;

  IF to_regclass('public.dietitian_children') IS NOT NULL AND
     EXISTS (SELECT 1 FROM public.dietitian_children d WHERE d.dietitian_id = uid AND d.child_id = v_child_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$func$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_food_items_public_read'
  ) THEN
    EXECUTE
      'CREATE POLICY p_food_items_public_read ON storage.objects
       FOR SELECT TO public
       USING (bucket_id = ''food-items'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_food_items_ins_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_food_items_ins_owner_admin ON storage.objects
       FOR INSERT TO public
       WITH CHECK (bucket_id = ''food-items'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_food_items_upd_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_food_items_upd_owner_admin ON storage.objects
       FOR UPDATE TO public
       USING (bucket_id = ''food-items'' AND (owner = auth.uid() OR auth.role() = ''admin''))
       WITH CHECK (bucket_id = ''food-items'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_food_items_del_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_food_items_del_owner_admin ON storage.objects
       FOR DELETE TO public
       USING (bucket_id = ''food-items'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_attachments_sel_careteam'
  ) THEN
    EXECUTE
      'CREATE POLICY p_attachments_sel_careteam ON storage.objects
       FOR SELECT TO public
       USING (
         bucket_id = ''attachments'' AND (
           auth.role() = ''admin'' OR
           owner = auth.uid() OR
           public.can_read_attachment(auth.uid(), name)
         )
       )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_attachments_ins_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_attachments_ins_owner_admin ON storage.objects
       FOR INSERT TO public
       WITH CHECK (bucket_id = ''attachments'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_attachments_upd_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_attachments_upd_owner_admin ON storage.objects
       FOR UPDATE TO public
       USING (bucket_id = ''attachments'' AND (owner = auth.uid() OR auth.role() = ''admin''))
       WITH CHECK (bucket_id = ''attachments'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='p_attachments_del_owner_admin'
  ) THEN
    EXECUTE
      'CREATE POLICY p_attachments_del_owner_admin ON storage.objects
       FOR DELETE TO public
       USING (bucket_id = ''attachments'' AND (owner = auth.uid() OR auth.role() = ''admin''))';
  END IF;
END;
$do$;

COMMIT;

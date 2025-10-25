BEGIN;
DO $$
DECLARE
tbl regclass;
has_slug boolean;
has_code boolean;
has_key boolean;
has_name boolean;
has_label boolean;
r text;
idcol text;
exists_row boolean;
BEGIN
SELECT to_regclass('public.roles') INTO tbl;
IF tbl IS NULL THEN RETURN; END IF;

SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='slug') INTO has_slug;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='code') INTO has_code;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='key') INTO has_key;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='name') INTO has_name;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='label') INTO has_label;

IF has_slug THEN idcol := 'slug';
ELSIF has_code THEN idcol := 'code';
ELSIF has_key THEN idcol := 'key';
ELSIF has_name THEN idcol := 'name';
ELSE RETURN;
END IF;

FOR r IN SELECT unnest(ARRAY['guardian','doctor','dietitian','admin'])
LOOP
EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.roles WHERE %I = $1)', idcol) INTO exists_row USING r;
IF NOT exists_row THEN
IF has_label THEN
EXECUTE format('INSERT INTO public.roles(%I, label) VALUES ($1, initcap($1))', idcol) USING r;
ELSIF has_name AND idcol <> 'name' THEN
EXECUTE format('INSERT INTO public.roles(%I, name) VALUES ($1, initcap($1))', idcol) USING r;
ELSE
EXECUTE format('INSERT INTO public.roles(%I) VALUES ($1)', idcol) USING r;
END IF;
END IF;
END LOOP;
END$$;
COMMIT;
[[END]]

Thought for 7s

[[BEGIN]]
BEGIN;
DO $$
DECLARE
tbl regclass;
has_slug boolean;
has_code boolean;
has_key boolean;
has_name boolean;
has_label boolean;
r text;
idcol text;
exists_row boolean;
BEGIN
SELECT to_regclass('public.roles') INTO tbl;
IF tbl IS NULL THEN RETURN; END IF;

SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='slug') INTO has_slug;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='code') INTO has_code;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='key') INTO has_key;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='name') INTO has_name;
SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' AND column_name='label') INTO has_label;

IF has_slug THEN idcol := 'slug';
ELSIF has_code THEN idcol := 'code';
ELSIF has_key THEN idcol := 'key';
ELSIF has_name THEN idcol := 'name';
ELSE RETURN;
END IF;

FOR r IN SELECT unnest(ARRAY['guardian','doctor','dietitian','admin'])
LOOP
EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.roles WHERE %I = $1)', idcol) INTO exists_row USING r;
IF NOT exists_row THEN
IF has_label THEN
EXECUTE format('INSERT INTO public.roles(%I, label) VALUES ($1, initcap($1))', idcol) USING r;
ELSIF has_name AND idcol <> 'name' THEN
EXECUTE format('INSERT INTO public.roles(%I, name) VALUES ($1, initcap($1))', idcol) USING r;
ELSE
EXECUTE format('INSERT INTO public.roles(%I) VALUES ($1)', idcol) USING r;
END IF;
END IF;
END LOOP;
END$$;
COMMIT;

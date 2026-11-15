create or replace function relationship_private.clean_state(s jsonb,u uuid,a uuid,ds date,de date)
returns jsonb language plpgsql set search_path='' as $$
declare k text; v jsonb; f text; x jsonb; id text;
 ids constant text[]:=array['interpretaciones','expectativas','empatia','comunicacion','conflicto','cooperacion','afecto','confianza','intimidad'];
begin
 if coalesce(jsonb_typeof(s),'')<>'object' or octet_length(s::text)>150000 or
 coalesce(jsonb_typeof(s->'meta'),'')<>'object' or coalesce(jsonb_typeof(s->'answers'),'')<>'object' or
 coalesce(length(trim(s->'meta'->>'alias')),0) not between 1 and 60 or
 coalesce(jsonb_typeof(s->'meta'->'sexual'),'')<>'boolean' or
 coalesce(s->>'measurementId','') !~ '^[0-9a-fA-F-]{36}$' or
 coalesce(s->>'step','0') !~ '^(10|[0-9])$' then raise exception 'Borrador incompleto o no válido'; end if;
 foreach f in array array['importance','context','open','plan'] loop
  if coalesce(jsonb_typeof(s->f),'')<>'object' then raise exception 'Borrador no válido'; end if;
 end loop;
 for k,v in select * from jsonb_each(s->'answers') loop
  id:=split_part(k,'-',1);
  if not(id=any(ids)) or k !~ '^[a-z]+-[0-5]$' or coalesce(jsonb_typeof(v),'')<>'object' then raise exception 'Respuesta no válida'; end if;
  for f,x in select * from jsonb_each(v) loop
   if f not in ('self','partner') or (x<>'null'::jsonb and x::text !~ '^[1-5]$') then raise exception 'La escala válida es de 1 a 5'; end if;
  end loop;
 end loop;
 for k,v in select * from jsonb_each(s->'importance') loop
  if not(k=any(ids)) or (v<>'null'::jsonb and v::text !~ '^[1-5]$') then raise exception 'Importancia no válida'; end if;
 end loop;
 for k,v in select * from jsonb_each(s->'context') loop
  if k not in ('carga','cansancio','estres') or (v<>'null'::jsonb and v::text !~ '^[1-5]$') then raise exception 'Contexto no válido'; end if;
 end loop;
 for k,v in select * from jsonb_each(s->'open') loop
  if k not in ('fortalezas','episodio','gesto','cambio','sexualSatisfaccion') or coalesce(jsonb_typeof(v),'')<>'string' or length(v#>>'{}')>4000 then raise exception 'Reflexión no válida'; end if;
 end loop;
 for k,v in select * from jsonb_each(s->'plan') loop
  if not(k=any(ids)) or coalesce(jsonb_typeof(v),'')<>'object' then raise exception 'Plan no válido'; end if;
  for f,x in select * from jsonb_each(v) loop
   if f not in ('actionA','actionB','when','evidence','review') or coalesce(jsonb_typeof(x),'')<>'string' or length(x#>>'{}')>4000 then raise exception 'Plan no válido'; end if;
  end loop;
 end loop;
 return jsonb_build_object('participantId',u,'measurementId',s->>'measurementId',
 'meta',jsonb_build_object('alias',trim(s->'meta'->>'alias'),'pairCode',upper('NUBE-'||left(replace(a::text,'-',''),24)),'mode',case when s->'meta'->>'mode'='solo' then 'solo' else 'couple' end,'start',ds,'end',de,'sexual',s->'meta'->'sexual'),
 'answers',s->'answers','importance',s->'importance','context',s->'context','open',s->'open','plan',s->'plan','step',coalesce((s->>'step')::int,0));
end $$;

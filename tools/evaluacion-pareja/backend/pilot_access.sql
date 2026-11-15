create table relationship_private.pilot_access(email text primary key check(email=lower(email)));
alter table relationship_private.pilot_access enable row level security;
revoke all on relationship_private.pilot_access from public,anon,authenticated;
create or replace function relationship_private.handle(action text,input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); a uuid; t relationship_private.assessments; d relationship_private.drafts;
 v jsonb; opts jsonb; token text; inv relationship_private.invitations; cnt int; rev int; k text; x jsonb; f text; j jsonb;
 p relationship_private.plans; common text[]; chosen jsonb; content jsonb;
begin
 if u is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Inicia sesión para continuar' using errcode='28000'; end if;
 if not exists(select 1 from auth.users au join relationship_private.pilot_access pa on pa.email=lower(au.email) where au.id=u and au.email_confirmed_at is not null and (au.banned_until is null or au.banned_until<=now())) then raise exception 'El piloto está limitado a las personas autorizadas' using errcode='42501'; end if;
 if coalesce(jsonb_typeof(input),'')<>'object' or octet_length(input::text)>180000 then raise exception 'Petición no válida'; end if;
 if action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'start',q.starts,'end',q.ends,'alias',q.alias,'members',q.members,'shared',q.shared,'myShared',q.my_shared) order by q.created_at desc),'[]') into v from (
   select e.*, coalesce(dr.state->'meta'->>'alias','Mi evaluación') alias,
   (select count(*) from relationship_private.members z where z.assessment_id=e.id) members,
   (select count(*) from relationship_private.shares z where z.assessment_id=e.id) shared,
   exists(select 1 from relationship_private.shares z where z.assessment_id=e.id and z.user_id=u) my_shared
   from relationship_private.assessments e join relationship_private.members m on m.assessment_id=e.id and m.user_id=u
   left join relationship_private.drafts dr on dr.assessment_id=e.id and dr.user_id=u
  ) q; return v;
 elsif action='create' then
  if (select count(*) from relationship_private.members where user_id=u)>=30 then raise exception 'Has alcanzado el límite del piloto'; end if;
  if coalesce(input->>'start','') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(input->>'end','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Revisa las fechas'; end if;
  insert into relationship_private.assessments(starts,ends) values((input->>'start')::date,(input->>'end')::date) returning * into t;
  insert into relationship_private.members values(t.id,u,1); return jsonb_build_object('id',t.id,'start',t.starts,'end',t.ends);
 elsif action='join' then
  token:=input->>'token';if token is null or token !~ '^[a-f0-9]{64}$' then raise exception 'Invitación no válida'; end if;
  select * into inv from relationship_private.invitations where token_hash=encode(sha256(convert_to(token,'UTF8')),'hex') for update;
  if not found or inv.expires_at<now() or inv.used_by is not null then raise exception 'La invitación ha caducado o ya se ha utilizado'; end if;
  a:=inv.assessment_id; perform 1 from relationship_private.assessments where id=a for update;
  if exists(select 1 from relationship_private.members where assessment_id=a and user_id=u) then raise exception 'Ya participas en esta evaluación. Usa otra cuenta para la segunda persona'; end if;
  select count(*) into cnt from relationship_private.members where assessment_id=a;
  if cnt>=2 then raise exception 'Esta evaluación ya tiene dos participantes'; end if;
  insert into relationship_private.members values(a,u,case when exists(select 1 from relationship_private.members where assessment_id=a and seat=1) then 2 else 1 end);
  update relationship_private.invitations set used_by=u where token_hash=inv.token_hash;
  select * into t from relationship_private.assessments where id=a;return jsonb_build_object('id',a,'start',t.starts,'end',t.ends);
 end if;
 a:=(input->>'assessmentId')::uuid;
 if a is null or not exists(select 1 from relationship_private.members where assessment_id=a and user_id=u) then raise exception 'Evaluación no accesible' using errcode='42501'; end if;
 select * into t from relationship_private.assessments where id=a;
 if action='save' then
  v:=relationship_private.clean_state(input->'state',u,a,t.starts,t.ends);
  rev:=coalesce((input->>'revision')::int,0);
  insert into relationship_private.drafts(assessment_id,user_id,state,revision) values(a,u,v,1)
   on conflict(assessment_id,user_id) do update set state=excluded.state,revision=relationship_private.drafts.revision+1,updated_at=now()
   where relationship_private.drafts.revision=rev returning * into d;
  if not found or (rev<>0 and d.revision=1) then raise exception 'Otra pestaña ha actualizado el borrador. Vuelve a abrirlo antes de guardar' using errcode='40001'; end if;
  return jsonb_build_object('revision',d.revision,'updated_at',d.updated_at);
 elsif action='invite' then
  perform 1 from relationship_private.assessments where id=a for update;
  if (select count(*) from relationship_private.members where assessment_id=a)>=2 then raise exception 'Ya hay dos participantes'; end if;
  token:=encode(extensions.gen_random_bytes(32),'hex');
  update relationship_private.invitations set expires_at=now() where assessment_id=a and used_by is null;
  insert into relationship_private.invitations(token_hash,assessment_id,inviter,expires_at) values(encode(sha256(convert_to(token,'UTF8')),'hex'),a,u,now()+interval '7 days');
  return jsonb_build_object('token',token,'expiresInDays',7);
 elsif action='publish' then
  select * into d from relationship_private.drafts where assessment_id=a and user_id=u;
  if not found or coalesce((input->>'consent')::boolean,false) is not true then raise exception 'Revisa y autoriza lo que eliges compartir'; end if;
  if (input->>'revision')::int is distinct from d.revision then raise exception 'El borrador ha cambiado. Revisa de nuevo el contenido'; end if;
  opts:=coalesce(input->'scope','{}');v:=relationship_private.shared_payload(d.state,opts);
  insert into relationship_private.shares values(a,u,v,now()) on conflict(assessment_id,user_id) do update set payload=excluded.payload,updated_at=now();
  return jsonb_build_object('shared',true);
 elsif action='withdraw' then
  delete from relationship_private.shares where assessment_id=a and user_id=u;return jsonb_build_object('shared',false);
 elsif action in ('workspace','save_plan') then
  select array_agg(z.id) into common from (
   select value->>'id' id from relationship_private.shares s cross join lateral jsonb_array_elements(s.payload->'summaries') where s.assessment_id=a group by value->>'id' having count(*)=2
  ) z;
  if action='save_plan' then
   chosen:=input->'selected';content:=input->'content';
   if coalesce(jsonb_typeof(chosen),'')<>'array' or jsonb_array_length(chosen)>2 or coalesce(jsonb_typeof(content),'')<>'object' then raise exception 'Plan no válido'; end if;
   for x in select value from jsonb_array_elements(chosen) loop
    k:=x#>>'{}';if not coalesce(k=any(common),false) then raise exception 'El área no está compartida por ambos'; end if;
   end loop;
   for k,v in select * from jsonb_each(content) loop
    if not (chosen ? k) or coalesce(jsonb_typeof(v),'')<>'object' then raise exception 'Área del plan no válida'; end if;
    for f,x in select * from jsonb_each(v) loop
     if f not in ('actionA','actionB','when','evidence','review') or coalesce(jsonb_typeof(x),'')<>'string' or length(x#>>'{}')>4000 then raise exception 'Contenido del plan no válido'; end if;
    end loop;
   end loop;
   rev:=coalesce((input->>'revision')::int,0);
   insert into relationship_private.plans(assessment_id,selected,content) values(a,chosen,content)
    on conflict(assessment_id) do update set selected=excluded.selected,content=excluded.content,revision=relationship_private.plans.revision+1,updated_at=now()
    where relationship_private.plans.revision=rev returning * into p;
   if not found or (rev<>0 and p.revision=1) then raise exception 'El plan se ha actualizado en otro dispositivo. Recárgalo antes de guardar' using errcode='40001'; end if;
   return jsonb_build_object('revision',p.revision,'updated_at',p.updated_at);
  end if;
  select * into d from relationship_private.drafts where assessment_id=a and user_id=u;
  select * into p from relationship_private.plans where assessment_id=a;
  chosen:=coalesce((select jsonb_agg(value) from jsonb_array_elements(coalesce(p.selected,'[]')) where (value#>>'{}')=any(coalesce(common,array[]::text[]))),'[]');
  content:=coalesce((select jsonb_object_agg(key,value) from jsonb_each(coalesce(p.content,'{}')) where key=any(coalesce(common,array[]::text[]))),'{}');
  select coalesce(jsonb_agg(s.payload order by m.seat),'[]') into v from relationship_private.shares s join relationship_private.members m using(assessment_id,user_id) where s.assessment_id=a;
  return jsonb_build_object('id',a,'start',t.starts,'end',t.ends,'draft',case when d.assessment_id is null then null else jsonb_build_object('state',d.state,'revision',d.revision,'updated_at',d.updated_at) end,'shares',v,'members',(select count(*) from relationship_private.members where assessment_id=a),'plan',jsonb_build_object('selected',chosen,'content',content,'revision',coalesce(p.revision,0)));
 elsif action='delete_mine' then
  delete from relationship_private.members where assessment_id=a and user_id=u;
  update relationship_private.invitations set expires_at=now() where assessment_id=a and inviter=u;
  return jsonb_build_object('deleted',true);
 end if;
 raise exception 'Operación no disponible';
end $$;


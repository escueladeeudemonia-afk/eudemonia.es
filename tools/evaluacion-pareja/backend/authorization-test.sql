begin;
-- Todo se revierte. Ningún dato de prueba ni usuario queda guardado.
select set_config('qa.user_a',gen_random_uuid()::text,true),set_config('qa.user_b',gen_random_uuid()::text,true),set_config('qa.user_c',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values
(current_setting('qa.user_a')::uuid,'pair-test-a@example.invalid',now()),
(current_setting('qa.user_b')::uuid,'pair-test-b@example.invalid',now()),
(current_setting('qa.user_c')::uuid,'pair-test-c@example.invalid',now());
insert into relationship_private.pilot_access(email) values('pair-test-a@example.invalid'),('pair-test-b@example.invalid');
set local role authenticated;
do $$
declare a uuid; b uuid; token text; st jsonb; v jsonb; id text; i int; ans jsonb:='{}'; refused boolean;
begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.user_a'),'role','authenticated')::text,true);
 v:=public.relationship_api('create','{"start":"2026-10-19","end":"2026-11-15"}'); a:=(v->>'id')::uuid;
 perform set_config('qa.assessment',a::text,true);
 token:=public.relationship_api('invite',jsonb_build_object('assessmentId',a))->>'token';
 foreach id in array array['interpretaciones','expectativas','empatia','comunicacion','conflicto','cooperacion','afecto','confianza','intimidad'] loop
  for i in 0..5 loop ans:=ans||jsonb_build_object(id||'-'||i,jsonb_build_object('self',3,'partner',4)); end loop;
 end loop;
 st:=jsonb_build_object('participantId',gen_random_uuid(),'measurementId',gen_random_uuid(),'meta',jsonb_build_object('alias','Persona A QA','sexual',true,'adult',true,'voluntary',true),'answers',ans,'importance','{}'::jsonb,'context','{}'::jsonb,'open',jsonb_build_object('fortalezas','Texto privado QA','sexualSatisfaccion','Intimidad privada QA'),'plan','{}'::jsonb,'step',0);
 v:=public.relationship_api('save',jsonb_build_object('assessmentId',a,'state',st,'revision',0));
 assert (v->>'revision')::int=1,'primera revisión';
 refused:=false;begin perform public.relationship_api('save',jsonb_build_object('assessmentId',a,'state',jsonb_set(st,'{answers,afecto-0,self}','0'),'revision',1));exception when others then refused:=true;end;assert refused,'el cero se rechaza';
 refused:=false;begin perform public.relationship_api('save',jsonb_build_object('assessmentId',a,'state',jsonb_set(st,'{answers,afecto-0,self}','6'),'revision',1));exception when others then refused:=true;end;assert refused,'seis se rechaza';
 refused:=false; begin perform public.relationship_api('save',jsonb_build_object('assessmentId',a,'state',st,'revision',0));exception when serialization_failure then refused:=true;end;assert refused,'evita sobreescribir otra pestaña';
 perform public.relationship_api('publish',jsonb_build_object('assessmentId',a,'scope','{}'::jsonb,'consent',true,'revision',1));
 v:=public.relationship_api('workspace',jsonb_build_object('assessmentId',a));
 assert v->'shares'->0->>'pairCode' ~ '^NUBE-[A-F0-9]{24}$','código compatible con el cliente';
 assert not ((v->'shares'->0)::text like '%Intimidad privada%'),'intimidad no compartida';
 assert not ((v->'shares'->0)::text like '%Texto privado%'),'texto libre no compartido';
 assert not ((v->'shares'->0)::text like '%intimidad%'),'resumen sexual excluido';
 assert not (v->'draft'->'state'->'meta' ? 'voluntary'),'elección privada no conservada';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.user_b'),'role','authenticated')::text,true);
 refused:=false;begin perform public.relationship_api('workspace',jsonb_build_object('assessmentId',a));exception when insufficient_privilege then refused:=true;end;assert refused,'otra cuenta no puede leer antes de unirse';
 perform public.relationship_api('join',jsonb_build_object('token',token));
 refused:=false;begin perform public.relationship_api('join',jsonb_build_object('token',token));exception when others then refused:=true;end;assert refused,'invitación de un solo uso';
 v:=public.relationship_api('workspace',jsonb_build_object('assessmentId',a));assert v->'draft'='null'::jsonb,'nunca devuelve el borrador de A';
 st:=jsonb_set(st,'{meta,alias}','"Persona B QA"');
 perform public.relationship_api('save',jsonb_build_object('assessmentId',a,'state',st,'revision',0));
 perform public.relationship_api('publish',jsonb_build_object('assessmentId',a,'scope',jsonb_build_object('sexual',true,'items',true,'text',true),'consent',true,'revision',1));
 v:=public.relationship_api('workspace',jsonb_build_object('assessmentId',a));assert jsonb_array_length(v->'shares')=2,'dos versiones compartidas';
 assert v->'draft'->'state'->'meta'->>'alias'='Persona B QA','borrador propio';
 refused:=false;begin perform public.relationship_api('save_plan',jsonb_build_object('assessmentId',a,'selected','["intimidad"]'::jsonb,'content','{}'::jsonb,'revision',0));exception when others then refused:=true;end;assert refused,'sexual sólo si ambos comparten';
 perform public.relationship_api('save_plan',jsonb_build_object('assessmentId',a,'selected','["comunicacion"]'::jsonb,'content',jsonb_build_object('comunicacion',jsonb_build_object('actionA','Ensayo QA')),'revision',0));
 perform public.relationship_api('withdraw',jsonb_build_object('assessmentId',a));
 v:=public.relationship_api('workspace',jsonb_build_object('assessmentId',a));assert v->'plan'->'content'='{}'::jsonb,'plan oculto tras retirar';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('qa.user_c'),'role','authenticated')::text,true);
 refused:=false;begin perform public.relationship_api('list','{}');exception when insufficient_privilege then refused:=true;end;assert refused,'el piloto excluye cuentas no autorizadas';
 refused:=false;begin perform count(*) from relationship_private.drafts;exception when insufficient_privilege then refused:=true;end;assert refused,'tablas sin lectura directa';
 perform set_config('request.jwt.claims','{}',true);refused:=false;begin perform public.relationship_api('list','{}');exception when invalid_authorization_specification then refused:=true;end;assert refused,'sin sesión denegado';
 raise notice 'PASS: autorización, aislamiento, revisión, proyección, omisiones y retirada';
end $$;
reset role;
rollback;

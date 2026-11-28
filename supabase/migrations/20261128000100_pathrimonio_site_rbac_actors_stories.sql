-- Registra los 5 roles oficiales del sistema RBAC (Visitante, Usuario Registrado, Socio / Cliente, Colaborador, Administrador)
-- como Actores / Roles formales e Historias de Usuario trazables dentro del proyecto 'pathrimonio-site'.

INSERT INTO public.actors (
  id, project_id, name, category, avatar_icon, color, description, permission_level,
  system_areas, assigned_worker, assigned_worker_name, status, is_primary_role, created_at
) VALUES
(
  'ACT-PS-06',
  'pathrimonio-site',
  'Visitante (guest)',
  'Usuario Final / B2C',
  'travel_explore',
  'cyan',
  'Usuario sin sesión que llega a la landing. Puede navegar la landing, usar el Cotizador Interactivo, probar FORMALIA Studio y descargar su primer diagrama. Límites: 5 turnos de IA por sesión (con límite diario por IP) y 1 lienzo temporal en localStorage.',
  'Consulta / Lectura',
  ARRAY['Landing Corporativa & Portada','Cotizador Interactivo','FORMALIA Studio (5 turnos IA / sesión)','Descarga Primer Diagrama','Cumplimiento Legal & Cookies']::text[],
  'visitante@pathrimonio.site',
  'Visitante sin sesión (5 IA/sesión)',
  'Activo',
  true,
  '2026-11-28'
),
(
  'ACT-PS-07',
  'pathrimonio-site',
  'Usuario Registrado (user)',
  'Operaciones & Ventas',
  'person_check',
  'sky',
  'Emprendedor o dueño de PYME que creó cuenta en FORMALIA o Portal. Crea Workspaces (techo 5) y lienzos permanentes (techo 20), edita manualmente sin límite, usa "Implementar en solución web" (historias, tema, maquetación) y envía cotizaciones. Cuota: 15 turnos IA diarios (reinicio 00:00 UTC) + 4 subvistas del Portal y Estado & Diffs.',
  'Operativo / Escritura',
  ARRAY['FORMALIA Studio (15 turnos IA / día)','Workspaces (máx. 5) & Lienzos (máx. 20)','Implementar en Solución Web','Actores, Historias & Interfaces (4 subvistas)','Estado & Diffs Web Post-Envío']::text[],
  'defaultgarcia906@gmail.com',
  'Emprendedor / Dueño de PYME',
  'Activo',
  true,
  '2026-11-28'
),
(
  'ACT-PS-08',
  'pathrimonio-site',
  'Socio / Cliente (partner)',
  'Operaciones & Ventas',
  'handshake',
  'emerald',
  'Empresa con membresía activa o desarrollo pactado en Pathrimonio. Incluye todo lo de Usuario Registrado + Panel de Socio: código de referido, Billetera de Créditos de Socio (canje/extensión de roles), estado de proyectos, talleres en vivo y beneficios en Pathway. Cuota ampliada: 45 turnos IA/día (00:00 UTC) y hasta 50 workspaces / 200 lienzos.',
  'Aprobador / PO',
  ARRAY['Panel de Socio & Código de Referido','Billetera de Créditos & Canjes','FORMALIA Studio (45 turnos IA / día)','Talleres en Vivo & Beneficios Pathway','Workspaces (máx. 50) & Lienzos (máx. 200)']::text[],
  'socio@pathrimonio.site',
  'Empresa con Membresía Activa',
  'Activo',
  true,
  '2026-11-28'
),
(
  'ACT-PS-09',
  'pathrimonio-site',
  'Colaborador (collaborator)',
  'Auditoría & Control',
  'engineering',
  'amber',
  'Equipo técnico interno, analistas y desarrolladores asignados por Administración. Ve cotizaciones entrantes, expedientes de FORMALIA (JSON, .puml, historias, web_blueprints, chats recopilados), aprueba/observa diffs web, y accede a Architecture (Archifly) y Files (métodos abstractos AST). Sin acceso a editar tarifas globales ni eliminar socios.',
  'Operativo / Escritura',
  ARRAY['Preventa, Cotizaciones & Diffs Web','Expedientes FORMALIA (JSON/.puml/Blueprints)','Arquitectura & Visor Archify (.html)','Árbol de Archivos & MCP AST','FORMALIA Studio (120 turnos IA / día)']::text[],
  'carlos@pathrimonio.org',
  'Equipo Técnico Pathrimonio',
  'Activo',
  true,
  '2026-11-28'
),
(
  'ACT-PS-10',
  'pathrimonio-site',
  'Administrador (admin)',
  'Administración & Gerencia',
  'shield_person',
  'purple',
  'Dirección / Gerencia de Pathrimonio Company con control RBAC total: editar pricing-config global, aprobar pagos de referidos (disparar créditos en billeteras), publicar métricas de Impacto Comunitario (educación, deporte, valores), gestionar usuarios y auditar registros del sistema.',
  'Acceso Total (Admin)',
  ARRAY['Control Total RBAC & Usuarios','Editor Tarifas (pricing-config)','Aprobación Referidos & Créditos','Publicador Impacto Comunitario','Auditoría Global del Sistema']::text[],
  'admin@pathrimonio.org',
  'Dirección / Gerencia Pathrimonio',
  'Activo',
  true,
  '2026-11-28'
)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  avatar_icon = EXCLUDED.avatar_icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  permission_level = EXCLUDED.permission_level,
  system_areas = EXCLUDED.system_areas,
  assigned_worker = EXCLUDED.assigned_worker,
  assigned_worker_name = EXCLUDED.assigned_worker_name,
  status = EXCLUDED.status,
  is_primary_role = EXCLUDED.is_primary_role,
  created_at = EXCLUDED.created_at;

INSERT INTO public.stories (
  id, project_id, module, priority, status, role, action, benefit,
  attachments_count, attachment_name, author, created_at
) VALUES
(
  'US-PS-10',
  'pathrimonio-site',
  'FormalIA Studio & Preventa',
  'Alta',
  'Aprobado por PO',
  'Visitante (guest)',
  'navegar la landing, usar el Cotizador Interactivo, probar FORMALIA Studio con 5 turnos de IA por sesión en 1 lienzo temporal y descargar mi primer diagrama',
  'validar el alcance operativo de mi negocio sin barrera de registro y conservar mis avances al crear cuenta o iniciar sesión.',
  0,
  NULL,
  'Jhan C.',
  '2026-11-28'
),
(
  'US-PS-11',
  'pathrimonio-site',
  'Autenticación & Control RBAC',
  'Alta',
  'Aprobado por PO',
  'Usuario Registrado (user)',
  'crear hasta 5 workspaces y 20 lienzos permanentes con 15 turnos diarios de IA, editar manualmente sin límite, ejecutar "Implementar en solución web" y enviar cotizaciones',
  'tener un proyecto propio en el Portal con las 4 subvistas iniciales y seguimiento visual de diferencias post-envío.',
  1,
  '20261126000500_rbac_five_roles_platform.sql',
  'Jhan C.',
  '2026-11-28'
),
(
  'US-PS-12',
  'pathrimonio-site',
  'Autenticación & Control RBAC',
  'Alta',
  'Aprobado por PO',
  'Socio / Cliente (partner)',
  'acceder al Panel de Socio con mi código de referido, gestionar mi Billetera de Créditos para canjear o extender roles, ver talleres en vivo y mapear procesos con cuota de 45 turnos IA diarios',
  'escalar todos los flujos de mi empresa aprovechando beneficios en Pathway y recompensas por referidos aprobados.',
  0,
  NULL,
  'Jhan C.',
  '2026-11-28'
),
(
  'US-PS-13',
  'pathrimonio-site',
  'Actores, Historias & Trazabilidad',
  'Alta',
  'Aprobado por PO',
  'Colaborador (collaborator)',
  'inspeccionar cotizaciones entrantes y expedientes de FORMALIA (JSON, .puml, historias, web_blueprints, chats), revisar/aprobar diffs post-envío y operar Architecture (Archifly) y Files (AST)',
  'ejecutar preventa técnica, análisis y desarrollo sin acceso de riesgo a modificar tarifas globales ni eliminar socios.',
  0,
  NULL,
  'Jhan C.',
  '2026-11-28'
),
(
  'US-PS-14',
  'pathrimonio-site',
  'Autenticación & Control RBAC',
  'Bloqueante',
  'Aprobado por PO',
  'Administrador (admin)',
  'editar la configuración global de tarifas (pricing-config), aprobar pagos de referidos para abonar créditos, publicar métricas de Impacto Comunitario, administrar usuarios y auditar el sistema',
  'mantener el gobierno financiero, operativo y de seguridad RBAC completo sobre toda la plataforma pathrimonio.site.',
  1,
  '20261128000100_pathrimonio_site_rbac_actors_stories.sql',
  'Administrador Sistémico',
  '2026-11-28'
)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  module = EXCLUDED.module,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  role = EXCLUDED.role,
  action = EXCLUDED.action,
  benefit = EXCLUDED.benefit,
  attachments_count = EXCLUDED.attachments_count,
  attachment_name = EXCLUDED.attachment_name,
  author = EXCLUDED.author,
  created_at = EXCLUDED.created_at;

DELETE FROM public.story_criteria WHERE story_id IN ('US-PS-10','US-PS-11','US-PS-12','US-PS-13','US-PS-14');

INSERT INTO public.story_criteria (story_id, id, text, checked, position) VALUES
('US-PS-10', 'c1', 'Cuota estricta de 5 turnos IA por sesión + límite diario por IP en api/v1/formalia/quota', true, 0),
('US-PS-10', 'c2', '1 lienzo temporal persistido en localStorage y recopilado en formalia_sessions', true, 1),
('US-PS-10', 'c3', 'Reclamo automático al iniciar sesión asignando el lienzo al usuario y proyecto', true, 2),
('US-PS-11', 'c1', '15 turnos IA diarios (reinicio 00:00 UTC) y techo anti-abuso de 5 workspaces / 20 lienzos', true, 0),
('US-PS-11', 'c2', 'Acceso exclusivo a Actores, Historias, Interfaces, FORMALIA y Estado & Diffs de proyectos propios', true, 1),
('US-PS-11', 'c3', 'Snapshot inmutable al enviar implementación web con resaltado visual de cambios posteriores', true, 2),
('US-PS-12', 'c1', '45 turnos IA diarios (00:00 UTC) y techo ampliado a 50 workspaces / 200 lienzos', true, 0),
('US-PS-12', 'c2', 'Panel de Socio con código de referido, Billetera USD, canjes en credit_redemptions y talleres', true, 1),
('US-PS-12', 'c3', 'Vinculación directa de beneficios y membresía activa en Pathway', true, 2),
('US-PS-13', 'c1', 'Acceso habilitado a Preventa & Cotizaciones, Architecture (Archifly) y Files (AST)', true, 0),
('US-PS-13', 'c2', 'Revisión y aprobación/observación de solicitudes web y diffs de clientes', true, 1),
('US-PS-13', 'c3', 'Bloqueo estricto de edición de pricing-config, aprobación de referidos y eliminación de socios', true, 2),
('US-PS-14', 'c1', 'Editor de pricing-config reflejado en tiempo real en Cotizador y PartnershipSection', true, 0),
('US-PS-14', 'c2', 'Aprobación de referidos con abono atómico en wallet de Socio y registro en system_audit_logs', true, 1),
('US-PS-14', 'c3', 'Publicación en vivo de métricas de Educación, Deporte y Valores hacia la Landing Pública', true, 2);

UPDATE public.story_criteria
SET text = 'Sesiones formalia_sessions recopiladas (5 turnos/sesión visitante, 15/día usuario, 45/día socio)'
WHERE story_id = 'US-PS-08' AND id = 'c1';

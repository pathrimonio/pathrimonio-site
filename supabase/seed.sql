-- ============================================================
-- PATHrimonio — Seed generado desde src/data/*.js
-- Generado por scripts/generate-supabase-seed.mjs
-- No editar a mano: volvé a correr el generador.
-- ============================================================

begin;

insert into public.projects (id, name, short_name, subtitle, description, category, icon, color, status, client, version, modules) values
  ('pathway', 'Pathway (App MVP)', 'Pathway', 'Registro de Metas & Pasos Secuenciales', 'Producto insignia de Pathrimonio enfocado en ayudar a las personas a definir metas claras y dividirlas en pasos ordenados. En espera de aprobación en Google Play Store.', 'Producto Propio (MVP)', 'route', 'amber', 'En Aprobación Play Store', 'Pathrimonio Labs', 'v1.0.0', array['Metas & Hábitos (Pathway)', 'Pasos & Hitos', 'Bitácora de Progreso', 'Autenticación & Acceso']::text[]),
  ('core-hub', 'Core Banking & Impact Hub', 'Core Hub', 'Fintech Comunitaria & Desembolsos Offline', 'Plataforma sistemática de microcréditos, firma digital y auditoría criptográfica para cooperativas y comunidades remotas.', 'Fintech & Impacto', 'account_balance', 'blue', 'Sprint 14 Activo', 'Cooperativas Andinas', 'v2.4.0', array['Gestión de Crédito', 'Autenticación & KYC', 'Pasarela de Pagos', 'Reportes de Impacto']::text[]),
  ('portal-admin', 'Sistema de Gestión & Ventas', 'Gestión ERP', 'Dashboard Administrativo & Alertas en Vivo', 'Solución de software a medida para monitoreo en tiempo real de ventas, inventario crítico, ingresos, egresos y accesos de administración.', 'Software a Medida', 'dashboard', 'emerald', 'Fase de Diseño UI', 'Empresa Aliada', 'v0.8.2', array['Gestión & Monitoreo', 'Inventario & Alertas', 'Finanzas & Reportes', 'Configuración']::text[])
on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, subtitle = excluded.subtitle, description = excluded.description, category = excluded.category, icon = excluded.icon, color = excluded.color, status = excluded.status, client = excluded.client, version = excluded.version, modules = excluded.modules;

insert into public.portal_users (id, email, name, role, avatar, color, permissions) values
  ('u1', 'admin@pathrimonio.org', 'Administrador Sistémico', 'Admin', 'AS', 'bg-primary', array['read', 'write', 'delete', 'export', 'settings']::text[]),
  ('u2', 'sofia@pathrimonio.org', 'Sofía V.', 'Fintech Lead', 'SV', 'bg-blue-500', array['read', 'write', 'export']::text[]),
  ('u3', 'carlos@pathrimonio.org', 'Carlos D.', 'Desarrollador', 'CD', 'bg-purple-500', array['read', 'write']::text[]),
  ('u4', 'elena@pathrimonio.org', 'Elena Morales', 'Auditora de Impacto', 'EM', 'bg-teal-500', array['read', 'export']::text[])
on conflict (id) do update set email = excluded.email, name = excluded.name, role = excluded.role, avatar = excluded.avatar, color = excluded.color, permissions = excluded.permissions;

insert into public.actors (id, project_id, name, category, avatar_icon, color, description, permission_level, system_areas, assigned_worker, assigned_worker_name, status, is_primary_role, created_at, created_at_label) values
  ('ACT-01', 'pathway', 'Usuario enfocado en superación', 'Usuario Final / B2C', 'psychology', 'emerald', 'Persona motivada que busca alcanzar metas grandes (estudio, negocio, bienestar) y necesita un método estructurado paso a paso para evitar la procrastinación en su día a día.', 'Usuario Móvil / B2C', array['Metas & Hábitos (Pathway)', 'Pasos & Hitos']::text[], 'jhan.lead@pathrimonio.org', 'Jhan C. (Product Owner Pathway)', 'Activo', true, '2026-11-18'::date, '2026-11-18'),
  ('ACT-02', 'pathway', 'Usuario con metas complejas', 'Usuario Final / B2C', 'route', 'sky', 'Usuario con objetivos a mediano y largo plazo que involucran múltiples fases interdependientes. Requiere mapas secuenciales visuales de hitos con cálculo del % de avance.', 'Usuario Móvil / B2C', array['Pasos & Hitos', 'Bitácora de Progreso']::text[], 'elena.ux@pathrimonio.org', 'Elena Morales (Investigación UX)', 'Activo', false, '2026-11-19'::date, '2026-11-19'),
  ('ACT-03', 'pathway', 'Usuario constante', 'Usuario Final / B2C', 'edit_calendar', 'amber', 'Usuario habitual que registra reflexiones diarias, analiza sus estados de ánimo predominantes y mantiene una racha de micro-hábitos matutinos o nocturnos.', 'Usuario Móvil / B2C', array['Bitácora de Progreso', 'Metas & Hábitos (Pathway)']::text[], 'sofia.qa@pathrimonio.org', 'Sofía V. (Fintech & Hábitos)', 'Activo', false, '2026-11-20'::date, '2026-11-20'),
  ('ACT-04', 'portal-admin', 'Administrador General', 'Administración & Gerencia', 'admin_panel_settings', 'purple', 'Líder del negocio responsable de supervisar ingresos, egresos, autorizar márgenes de descuento, monitorear alertas de stock crítico y tomar decisiones comerciales desde el Dashboard.', 'Acceso Total (Admin)', array['Gestión & Monitoreo', 'Ventas & Facturación', 'Inventario & Alertas', 'Configuración & Permisos']::text[], 'gerencia@comercial.pe', 'Gerencia Comercial (Cliente Encargado)', 'Activo', true, '2026-11-20'::date, '2026-11-20'),
  ('ACT-05', 'portal-admin', 'Cajero / Operador de Ventas', 'Operaciones & Ventas', 'point_of_sale', 'cyan', 'Trabajador de atención al cliente en punto de venta que registra comprobantes rápidos (boletas, tickets, transferencias), cobra y realiza el cierre de caja del turno.', 'Operativo / Escritura', array['Ventas & Facturación', 'Gestión & Monitoreo']::text[], 'caja.principal@comercial.pe', 'Operador de Caja Principal', 'Activo', false, '2026-11-20'::date, '2026-11-20'),
  ('ACT-06', 'portal-admin', 'Supervisor de Almacén', 'Operaciones & Ventas', 'inventory_2', 'amber', 'Encargado de la recepción de mercadería, ajuste de existencias físicas y atención inmediata de las alertas preventivas de productos con menos de 5 unidades.', 'Operativo / Escritura', array['Inventario & Alertas', 'Gestión & Monitoreo']::text[], 'logistica@comercial.pe', 'Coordinador de Bodega & Logística', 'Activo', false, '2026-11-20'::date, '2026-11-20'),
  ('ACT-07', 'core-hub', 'Oficial de Crédito Comunitario', 'Personal de Campo / Brigadas', 'shield_person', 'primary', 'Agente financiero que viaja a comunidades rurales desconectadas, asesora a los productores, evalúa la capacidad de pago y formaliza desembolsos con firma biométrica offline.', 'Operativo / Escritura', array['Gestión de Crédito', 'Autenticación & KYC']::text[], 'brigada.cusco@pathrimonio.org', 'Oficial de Brigada Rural Cusco', 'Activo', true, '2026-11-15'::date, '2026-11-15'),
  ('ACT-08', 'core-hub', 'Beneficiario Rural', 'Usuario Final / B2C', 'person', 'emerald', 'Agricultor o artesano comunero que solicita financiamiento para su actividad productiva, valida su identidad mediante huella dactilar y recibe el desembolso.', 'Consulta / Lectura', array['Gestión de Crédito']::text[], 'cooperativa.asociados@cusco.org', 'Representante de Cooperativa', 'Activo', false, '2026-11-15'::date, '2026-11-15'),
  ('ACT-09', 'core-hub', 'Auditor de Impacto', 'Auditoría & Control', 'verified_user', 'blue', 'Especialista externo o interno que fiscaliza la inmutabilidad de las firmas biométricas con hash SHA-256 y verifica la trazabilidad social de los fondos desembolsados.', 'Consulta / Lectura', array['Reportes de Impacto', 'Autenticación & KYC']::text[], 'auditoria.externa@latam-impact.org', 'Comité de Auditoría de Impacto', 'Activo', false, '2026-11-16'::date, '2026-11-16')
on conflict (id) do update set project_id = excluded.project_id, name = excluded.name, category = excluded.category, avatar_icon = excluded.avatar_icon, color = excluded.color, description = excluded.description, permission_level = excluded.permission_level, system_areas = excluded.system_areas, assigned_worker = excluded.assigned_worker, assigned_worker_name = excluded.assigned_worker_name, status = excluded.status, is_primary_role = excluded.is_primary_role, created_at = excluded.created_at, created_at_label = excluded.created_at_label;

insert into public.stories (id, project_id, module, priority, status, role, action, benefit, attachments_count, attachment_name, author, created_at_label, image, image_meta) values
  ('US-201', 'pathway', 'Metas & Hábitos (Pathway)', 'Alta', 'Aprobado por PO', 'Usuario enfocado en superación', 'registrar una meta grande con fecha límite estimada y asignarle un color de acento representativo', 'tenga un propósito claro y medible que pueda consultar todos los días en mi celular.', 1, 'pathway_goal_mockup_v1.png', 'Jhan C.', 'Hoy', null, null),
  ('US-202', 'pathway', 'Pasos & Hitos', 'Bloqueante', 'Aprobado por PO', 'Usuario con metas complejas', 'desglosar mi gran meta en pasos ordenados secuencialmente y marcar cada hito completado', 'pueda avanzar paso a paso sin sentirme abrumado por la magnitud del objetivo final.', 2, 'step_roadmap_spec.png', 'Elena Morales', 'Ayer', null, null),
  ('US-203', 'pathway', 'Bitácora de Progreso', 'Media', 'Draft', 'Usuario constante', 'registrar una reflexión diaria rápida con mi estado de ánimo asociado a mis metas', 'mantenga la motivación a lo largo de las semanas y aprenda de mis propios patrones de avance.', 0, null, 'Jhan C.', 'Hace 2 días', null, null),
  ('US-101', 'core-hub', 'Gestión de Crédito', 'Bloqueante', 'Aprobado por PO', 'Oficial de Crédito Comunitario', 'desembolsar fondos a grupos solidarios con verificación multifactorial offline', 'los desembolsos no se detengan por caídas de red eléctrica o telecomunicaciones en áreas periféricas.', 2, 'wireframe_offline_flow_v2.png', 'Sofía V. (Fintech Lead)', 'Hace 2 horas', null, null),
  ('US-102', 'core-hub', 'Autenticación & KYC', 'Alta', 'Under Review', 'Beneficiario de Cooperativa Rural', 'validar mi identidad mediante huella dactilar o token SMS sin claves alfanuméricas complejas', 'personas de la tercera edad o con baja alfabetización digital accedan al crédito sin fricción ni dependencia de terceros.', 1, 'spec_biometria_peru.pdf', 'Carlos D.', 'Hace 4 horas', null, null),
  ('US-103', 'core-hub', 'Pasarela de Pagos', 'Media', 'Draft', 'Auditor de Impacto Social', 'exportar balances consolidados con trazabilidad criptográfica SHA-256 en formato CSV y PDF', 'los comités comunales puedan verificar el destino exacto de los fondos en asambleas públicas mensuales.', 0, null, 'Elena Morales', 'Ayer', null, null),
  ('US-104', 'core-hub', 'Reportes de Impacto', 'Baja', 'Approved', 'Coordinadora de Programa', 'visualizar en un mapa térmico las microempresas activas financiadas por zona geográfica', 'podamos priorizar brigadas de capacitación técnica y asistencia agronómica en distritos vulnerables.', 3, 'cusco_microcredits_geojson.json', 'Mariana R.', 'Hace 2 días', '/assets/images/map-preview.png', '142 Cooperativas Georreferenciadas (Cusco & Puno)'),
  ('US-301', 'portal-admin', 'Gestión & Monitoreo', 'Alta', 'Aprobado por PO', 'Administrador General', 'monitorear ventas, ingresos, egresos y alertas de inventario en tiempo real desde un dashboard centralizado', 'la gerencia pueda tomar decisiones comerciales de reabastecimiento antes de que se agote el stock crítico.', 1, 'dashboard_admin_spec.png', 'Carlos D.', 'Hoy', null, null)
on conflict (id) do update set project_id = excluded.project_id, module = excluded.module, priority = excluded.priority, status = excluded.status, role = excluded.role, action = excluded.action, benefit = excluded.benefit, attachments_count = excluded.attachments_count, attachment_name = excluded.attachment_name, author = excluded.author, created_at_label = excluded.created_at_label, image = excluded.image, image_meta = excluded.image_meta;

insert into public.story_criteria (story_id, id, text, checked, position) values
  ('US-201', 'c1', 'Título obligatorio de mínimo 5 caracteres', true, 0),
  ('US-201', 'c2', 'Selector de color de meta con contraste accesible', true, 1),
  ('US-201', 'c3', 'Almacenamiento offline en SQLite local', true, 2),
  ('US-202', 'c1', 'Línea de tiempo vertical con nodos interactivos', true, 0),
  ('US-202', 'c2', 'Cálculo en tiempo real del % de avance general', true, 1),
  ('US-202', 'c3', 'Feedback háptico al completar cada paso en móvil', false, 2),
  ('US-203', 'c1', 'Registro con timestamp automático inmutable', true, 0),
  ('US-203', 'c2', 'Selector de ánimo con iconos visuales', true, 1),
  ('US-101', 'c1', 'Token OTP con sincronización temporal TOTP', true, 0),
  ('US-101', 'c2', 'Cifrado AES-256 en base local SQLite', true, 1),
  ('US-101', 'c3', 'Límite de desembolso offline por oficial: $5,000 USD', true, 2),
  ('US-102', 'c1', 'Compatibilidad con lectores USB OTG estándar', true, 0),
  ('US-102', 'c2', 'Fallback a llamada de voz automatizada en quechua/español', true, 1),
  ('US-102', 'c3', 'Registro seguro de consentimiento informado con firma táctil', false, 2),
  ('US-102', 'c4', 'Resincronización biométrica periódica contra RENIEC', false, 3),
  ('US-103', 'c1', 'Firma hash SHA-256 por cada lote liquidado', true, 0),
  ('US-103', 'c2', 'Exportación compatible con auditorías de Contraloría', true, 1),
  ('US-104', 'c1', 'Capa georreferenciada con coordenadas UTM', true, 0),
  ('US-104', 'c2', 'Filtro dinámico por cultivo y etapa de cosecha', true, 1),
  ('US-301', 'c1', 'Métricas en vivo de ventas del día e ingresos del mes', true, 0),
  ('US-301', 'c2', 'Panel de alertas para productos con menos de 5 unidades', true, 1),
  ('US-301', 'c3', 'Restricción de acceso exclusivo al rol Administrador', true, 2)
on conflict (story_id, id) do update set text = excluded.text, checked = excluded.checked, position = excluded.position;

insert into public.interface_modules (name) values
  ('Autenticación & Acceso'),
  ('Bitácora de Progreso'),
  ('Gestión & Monitoreo'),
  ('Gestión de Crédito'),
  ('Metas & Hábitos (Pathway)'),
  ('Pasos & Hitos'),
  ('Reportes de Impacto')
on conflict (name) do nothing;

insert into public.interfaces (id, project_id, number, title, full_name, module, status, platform, image, image_placeholder, objective, content, rules, details, linked_story_id, author, reviewed_by, approved_at, version, image_aspect) values
  ('INT-01', 'pathway', '1', 'Login & Autenticación', '1. Login & Autenticación', 'Autenticación & Acceso', 'Aprobado por Cliente', 'Web & Mobile', null, 'login', 'Autenticar usuarios de forma segura mediante correo/contraseña o biometría, garantizando acceso rápido y recuperación de cuenta.', 'Campos de correo y contraseña, botón de visibilidad, botón de acceso biométrico (FaceID/Huella), enlace ''¿Olvidaste tu contraseña?'', y acceso de invitado.', 'Bloqueo temporal de 15 minutos tras 5 intentos fallidos consecutivos. Contraseña con longitud mínima de 8 caracteres. Cifrado de credenciales en reposo.', 'Generación de tokens JWT con expiración de 8 horas. Soporta autenticación offline con SQLite cifrado si no hay cobertura.', 'US-201', 'Jhan C.', 'Cliente / PO', '2026-11-18'::date, 'v1.2', null),
  ('INT-02', 'pathway', '2', 'Onboarding & Bienvenida', '2. Onboarding & Bienvenida', 'Autenticación & Acceso', 'Aprobado por Cliente', 'Mobile (Android / iOS)', null, 'onboarding', 'Presentar la propuesta de valor de la aplicación y orientar al usuario en la metodología de metas y pasos antes de su primer uso.', 'Carrusel interactivo de 3 pantallas con ilustraciones vectoriales, indicadores de progreso (dots), botón ''Omitir'' y botón ''Comenzar Mi Ruta''.', 'Se muestra exclusivamente en la primera ejecución tras la instalación de la app o al pulsar ''Repetir tutorial'' desde Configuración.', 'Animación de transición horizontal a 60fps. Solicita permisos de notificaciones locales con explicación contextual previa.', 'US-201', 'Elena Morales', 'Cliente / PO', '2026-11-19'::date, 'v1.1', null),
  ('INT-03', 'pathway', '3', 'Registro de Gran Meta (Pathway)', '3. Registro de Gran Meta (Pathway)', 'Metas & Hábitos (Pathway)', 'Aprobado por Cliente', 'Web & Mobile', null, 'goal_create', 'Permitir al usuario formalizar una meta personal o profesional con fecha objetivo, categoría y color distintivo.', 'Campo de título de meta, selector de categoría con iconos (Estudio, Negocio, Salud, Finanzas), selector de fecha límite, paleta de colores y botón ''Guardar y Desglosar en Pasos''.', 'El título debe contener al menos 5 caracteres. La fecha estimada debe ser igual o posterior a la fecha actual.', 'Validación instantánea en cliente. Al guardar, redirige de forma automática al mapa secuencial de pasos (INT-05).', 'US-201', 'Jhan C.', 'Cliente / PO', '2026-11-20'::date, 'v1.0', null),
  ('INT-05', 'pathway', '5', 'Mapa Secuencial de Pasos e Hitos', '5. Mapa Secuencial de Pasos e Hitos', 'Pasos & Hitos', 'En Revisión', 'Web & Mobile', null, 'steps_roadmap', 'Visualizar el camino ordenado de hitos y pasos secuenciales necesarios para cumplir la meta seleccionada.', 'Línea de tiempo vertical con nodos interactivos, estado de cada paso (Completado, En Curso, Pendiente), porcentaje total de progreso y botón ''+ Añadir Paso''.', 'Cada paso completado suma proporcionalmente al indicador de progreso global. Un paso no puede completarse si su predecesor obligatorio no fue validado.', 'Feedback háptico en móviles al marcar un hito como logrado. Soporta reordenamiento por arrastre (drag-and-drop).', 'US-202', 'Sofía V.', null, null, 'v1.1', null),
  ('INT-06', 'pathway', '6', 'Bitácora Diaria & Registro de Hábitos', '6. Bitácora Diaria & Registro de Hábitos', 'Bitácora de Progreso', 'En Revisión', 'Web & Mobile', null, 'journal', 'Registrar avances diarios, reflexiones, hábitos cumplidos y estados de ánimo vinculados a las metas activas.', 'Línea de tiempo cronológica, campo de reflexión rápida con timestamp automático, selector de estado de ánimo (emojis) y checklist de hábitos diarios.', 'Las entradas son privadas del usuario. Cada reflexión queda sellada con fecha y hora local inmutable una vez guardada.', 'Sincronización en segundo plano con almacenamiento local prioritario (offline-first).', 'US-203', 'Elena Morales', null, null, 'v0.9', null),
  ('INT-04', 'portal-admin', '4', 'Dashboard', '4. Dashboard', 'Gestión & Monitoreo', 'Aprobado por Cliente', 'Web & Mobile', null, 'dashboard', 'Monitorear ventas, ingresos, egresos y alertas en tiempo real.', 'Ventas, ingresos, egresos, alertas de inventario y accesos rápidos.', 'Solo administrador.', 'Datos en tiempo real.', 'US-301', 'Carlos D.', 'Cliente / PO', '2026-11-20'::date, 'v2.0', null),
  ('INT-07', 'core-hub', '7', 'Desembolso & Validación Biométrica', '7. Desembolso & Validación Biométrica', 'Gestión de Crédito', 'Aprobado por Cliente', 'Web / Desktop', null, 'dashboard', 'Verificar identidad del beneficiario mediante huella dactilar y autorizar desembolso en zonas desconectadas.', 'Datos del crédito, resumen de cuotas, canvas de firma digital y confirmación con token TOTP.', 'Monto máximo por oficial: $5,000 USD sin conexión a internet.', 'Firma digital sellada con hash SHA-256 almacenada en base de datos local SQLite cifrada.', 'US-101', 'Sofía V.', 'Auditor Legal', '2026-11-15'::date, 'v2.4', null)
on conflict (id) do update set project_id = excluded.project_id, number = excluded.number, title = excluded.title, full_name = excluded.full_name, module = excluded.module, status = excluded.status, platform = excluded.platform, image = excluded.image, image_placeholder = excluded.image_placeholder, objective = excluded.objective, content = excluded.content, rules = excluded.rules, details = excluded.details, linked_story_id = excluded.linked_story_id, author = excluded.author, reviewed_by = excluded.reviewed_by, approved_at = excluded.approved_at, version = excluded.version, image_aspect = excluded.image_aspect;

insert into public.interface_roles (interface_id, role_name, actor_id, position) values
  ('INT-01', 'Usuario enfocado en superación', 'ACT-01', 0),
  ('INT-01', 'Usuario con metas complejas', 'ACT-02', 1),
  ('INT-01', 'Usuario constante', 'ACT-03', 2),
  ('INT-02', 'Usuario enfocado en superación', 'ACT-01', 0),
  ('INT-02', 'Usuario con metas complejas', 'ACT-02', 1),
  ('INT-03', 'Usuario enfocado en superación', 'ACT-01', 0),
  ('INT-03', 'Usuario con metas complejas', 'ACT-02', 1),
  ('INT-05', 'Usuario con metas complejas', 'ACT-02', 0),
  ('INT-05', 'Usuario enfocado en superación', 'ACT-01', 1),
  ('INT-06', 'Usuario constante', 'ACT-03', 0),
  ('INT-04', 'Administrador General', 'ACT-04', 0),
  ('INT-04', 'Cajero / Operador de Ventas', 'ACT-05', 1),
  ('INT-04', 'Supervisor de Almacén', 'ACT-06', 2),
  ('INT-07', 'Oficial de Crédito Comunitario', 'ACT-07', 0),
  ('INT-07', 'Beneficiario Rural', 'ACT-08', 1),
  ('INT-07', 'Auditor de Impacto', 'ACT-09', 2)
on conflict (interface_id, role_name) do update set actor_id = excluded.actor_id, position = excluded.position;

insert into public.data_models (id, project_id, table_name, name, module, storage_target, storage_location, sync_strategy, status, description, linked_story_id, linked_interface_id, author, approved_at, version) values
  ('TBL-01', 'pathway', 'tb_metas', 'Metas y Grandes Propósitos (Pathway)', 'Metas & Hábitos (Pathway)', 'SQLite Cifrado (Offline-First Móvil)', 'Sandbox Local App Móvil (SQLCipher AES-256) + Réplica en Supabase Cloud', 'Offline-First bidireccional. Resolución de conflictos por timestamp (LWW - Last Write Wins).', 'Aprobado por Arquitectura', 'Entidad principal que almacena las metas creadas por el usuario en Pathway. Cada meta contiene fecha estimada, categoría visual, color y cálculo de progreso.', 'US-201', 'INT-03', 'Jhan C.', '2026-11-20'::date, 'v1.2'),
  ('TBL-02', 'pathway', 'tb_pasos_hitos', 'Pasos e Hitos Secuenciales', 'Pasos & Hitos', 'SQLite Cifrado (Offline-First Móvil)', 'Base SQLite cifrada en cliente + Cola de sincronización local', 'Sincronización incremental con cola de eventos ''pending_sync_queue''.', 'Aprobado por Arquitectura', 'Desglose atómico de una meta en pasos ordenados secuencialmente. Registra el orden de ejecución, pre-requisito obligatorio y confirmación de cumplimiento.', 'US-202', 'INT-05', 'Elena Morales', '2026-11-20'::date, 'v1.1'),
  ('TBL-03', 'pathway', 'tb_bitacora_diaria', 'Bitácora Diaria & Reflexiones', 'Bitácora de Progreso', 'SQLite Cifrado (Offline-First Móvil)', 'Almacenamiento local SQLite con cifrado biométrico', 'Sincronización en background al conectarse a red WiFi / Datos.', 'En Revisión', 'Registra entradas diarias personales del usuario: notas reflexivas, selección de estado de ánimo y hábitos cumplidos en la jornada.', 'US-203', 'INT-06', 'Carlos D.', null, 'v1.0'),
  ('TBL-04', 'portal-admin', 'tb_ventas_transacciones', 'Ventas y Transacciones Comerciales', 'Gestión & Monitoreo', 'PostgreSQL (Supabase Cloud)', 'Cluster PostgreSQL Administrado (AWS us-east-1 / Supabase)', 'Lectura/Escritura en tiempo real con WebSockets (Supabase Realtime) hacia el Dashboard.', 'Aprobado por Arquitectura', 'Centraliza todas las ventas del negocio para alimentar el ''4. Dashboard'' en tiempo real con ingresos, egresos, número de boleta y estado de pago.', 'US-301', 'INT-04', 'Carlos D.', '2026-11-20'::date, 'v2.0'),
  ('TBL-05', 'portal-admin', 'tb_inventario_alertas', 'Inventario de Productos & Alertas de Stock', 'Gestión & Monitoreo', 'PostgreSQL (Supabase Cloud)', 'PostgreSQL con disparadores (Triggers) de alerta en Supabase', 'Eventos CDC (Change Data Capture) emiten notificaciones push al dashboard ante stock crítico.', 'Aprobado por Arquitectura', 'Catálogo de mercadería con control de existencias. Genera alertas de inventario críticas cuando el stock disponible es menor o igual al stock mínimo configurado.', 'US-301', 'INT-04', 'Carlos D.', '2026-11-20'::date, 'v2.0'),
  ('TBL-06', 'core-hub', 'tb_creditos_desembolsos', 'Desembolsos de Crédito Comunitario', 'Gestión de Crédito', 'PostgreSQL Relacional (AWS RDS)', 'Base de Datos Relacional Ledger con replicación multi-zona y cifrado AES-256', 'Almacenamiento transaccional ACID con verificación de firma hash SHA-256.', 'Aprobado por Arquitectura', 'Registra los contratos y desembolsos de microcrédito otorgados a comunidades rurales, vinculados a la validación biométrica del oficial de crédito.', 'US-101', 'INT-07', 'Sofía V.', '2026-11-15'::date, 'v2.4'),
  ('TBL-07', 'core-hub', 'tb_validaciones_biometricas', 'Validaciones Biométricas & Auditoría', 'Autenticación & KYC', 'PostgreSQL Relacional (AWS RDS)', 'Tabla particionada por mes con almacenamiento de hash en frío', 'Sello temporal inmutable con validación de coordenadas satelitales GPS.', 'Aprobado por Arquitectura', 'Auditoría forense de biometría dactilar y facial para garantizar que los fondos comunitarios lleguen directamente al beneficiario legítimo en zonas rurales.', 'US-102', 'INT-07', 'Sofía V.', '2026-11-15'::date, 'v2.4')
on conflict (id) do update set project_id = excluded.project_id, table_name = excluded.table_name, name = excluded.name, module = excluded.module, storage_target = excluded.storage_target, storage_location = excluded.storage_location, sync_strategy = excluded.sync_strategy, status = excluded.status, description = excluded.description, linked_story_id = excluded.linked_story_id, linked_interface_id = excluded.linked_interface_id, author = excluded.author, approved_at = excluded.approved_at, version = excluded.version;

insert into public.data_model_attributes (data_model_id, id, name, data_type, is_primary, is_nullable, is_unique, foreign_key, default_value, description, position) values
  ('TBL-01', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Identificador universal único e inmutable de la meta.', 0),
  ('TBL-01', 'c2', 'user_id', 'UUID', false, false, false, 'auth.users(id)', null, 'ID del usuario autenticado propietario de la meta.', 1),
  ('TBL-01', 'c3', 'titulo', 'VARCHAR(255)', false, false, false, null, null, 'Título de la meta definido por el usuario (mínimo 5 caracteres).', 2),
  ('TBL-01', 'c4', 'categoria', 'VARCHAR(50)', false, false, false, null, '''Estudio''', 'Categoría temática: Estudio, Negocio, Salud, Finanzas o Personal.', 3),
  ('TBL-01', 'c5', 'color_hex', 'VARCHAR(20)', false, true, false, null, '''#34d399''', 'Código de color hexadecimal representativo para la interfaz móvil.', 4),
  ('TBL-01', 'c6', 'fecha_objetivo', 'DATE', false, false, false, null, null, 'Fecha límite propuesta para alcanzar el 100% de la meta.', 5),
  ('TBL-01', 'c7', 'progreso_pct', 'INTEGER', false, false, false, null, '0', 'Porcentaje de avance calculado automáticamente (0 a 100).', 6),
  ('TBL-01', 'c8', 'estado', 'VARCHAR(30)', false, false, false, null, '''en_curso''', 'Estado de la meta: ''en_curso'', ''completada'', ''pausada'', ''archivada''.', 7),
  ('TBL-01', 'c9', 'created_at', 'TIMESTAMP WITH TIME ZONE', false, false, false, null, 'CURRENT_TIMESTAMP', 'Fecha y hora exacta de registro de la meta.', 8),
  ('TBL-01', 'c10', 'updated_at', 'TIMESTAMP WITH TIME ZONE', false, false, false, null, 'CURRENT_TIMESTAMP', 'Timestamp de última modificación para sincronización diferencial.', 9),
  ('TBL-02', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Identificador único del paso.', 0),
  ('TBL-02', 'c2', 'meta_id', 'UUID', false, false, false, 'tb_metas(id) ON DELETE CASCADE', null, 'Clave foránea hacia la gran meta contenedora.', 1),
  ('TBL-02', 'c3', 'orden_secuencia', 'INTEGER', false, false, false, null, '1', 'Posición ordinal del paso en el mapa de ruta vertical (1, 2, 3...).', 2),
  ('TBL-02', 'c4', 'titulo_paso', 'VARCHAR(255)', false, false, false, null, null, 'Acción concreta y medible a realizar.', 3),
  ('TBL-02', 'c5', 'es_completado', 'BOOLEAN', false, false, false, null, 'false', 'Bandera booleana de cumplimiento del paso.', 4),
  ('TBL-02', 'c6', 'fecha_completado', 'TIMESTAMP WITH TIME ZONE', false, true, false, null, null, 'Timestamp del momento exacto en que el usuario marcó el hito.', 5),
  ('TBL-02', 'c7', 'paso_previo_id', 'UUID', false, true, false, 'tb_pasos_hitos(id)', null, 'Paso anterior obligatorio que debe cumplirse previamente (opcional).', 6),
  ('TBL-03', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Clave primaria del registro de bitácora.', 0),
  ('TBL-03', 'c2', 'user_id', 'UUID', false, false, false, 'auth.users(id)', null, 'Usuario autor de la reflexión.', 1),
  ('TBL-03', 'c3', 'fecha_registro', 'DATE', false, false, false, null, 'CURRENT_DATE', 'Fecha del día que se registra.', 2),
  ('TBL-03', 'c4', 'reflexion_texto', 'TEXT', false, false, false, null, null, 'Contenido de texto libre con las reflexiones del usuario.', 3),
  ('TBL-03', 'c5', 'animo_emoji', 'VARCHAR(20)', false, true, false, null, '''🔥 Enfoque''', 'Descriptor o emoji del estado de ánimo predominante.', 4),
  ('TBL-03', 'c6', 'habitos_cumplidos_count', 'INTEGER', false, false, false, null, '0', 'Cantidad de micro-hábitos completados durante el día.', 5),
  ('TBL-03', 'c7_meta', 'meta_id', 'UUID', false, true, false, 'tb_metas(id)', null, 'Llave foránea opcional que asocia la reflexión con su meta principal en Pathway.', 6),
  ('TBL-04', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'ID de la transacción comercial.', 0),
  ('TBL-04', 'c2', 'codigo_comprobante', 'VARCHAR(50)', false, false, true, null, null, 'Número de boleta, factura o ticket de venta correlativo.', 1),
  ('TBL-04', 'c3', 'cliente_nombre', 'VARCHAR(255)', false, false, false, null, '''Consumidor Final''', 'Nombre o razón social del comprador.', 2),
  ('TBL-04', 'c4', 'monto_subtotal', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Monto base gravable sin impuestos.', 3),
  ('TBL-04', 'c5', 'monto_impuesto', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Impuesto al valor agregado (IGV / IVA).', 4),
  ('TBL-04', 'c6', 'monto_total', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Monto neto total pagado por el cliente.', 5),
  ('TBL-04', 'c7', 'metodo_pago', 'VARCHAR(50)', false, false, false, null, '''Efectivo''', 'Efectivo, Tarjeta, Transferencia, Billetera Digital (Yape/Plin).', 6),
  ('TBL-04', 'c8', 'estado_pago', 'VARCHAR(30)', false, false, false, null, '''pagado''', 'Estado de cobro: ''pagado'', ''pendiente'', ''anulado''.', 7),
  ('TBL-04', 'c9', 'cajero_admin_id', 'UUID', false, false, false, 'auth.users(id)', null, 'Administrador o cajero que procesó la venta.', 8),
  ('TBL-04', 'c10', 'created_at', 'TIMESTAMP WITH TIME ZONE', false, false, false, null, 'CURRENT_TIMESTAMP', 'Timestamp exacto para graficar ventas del día en el Dashboard.', 9),
  ('TBL-05', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Identificador único de producto.', 0),
  ('TBL-05', 'c2', 'sku', 'VARCHAR(50)', false, false, true, null, null, 'Código de barra o SKU único del artículo.', 1),
  ('TBL-05', 'c3', 'nombre_producto', 'VARCHAR(255)', false, false, false, null, null, 'Denominación comercial del producto.', 2),
  ('TBL-05', 'c4', 'stock_actual', 'INTEGER', false, false, false, null, '0', 'Unidades físicas disponibles en almacén.', 3),
  ('TBL-05', 'c5', 'stock_minimo', 'INTEGER', false, false, false, null, '5', 'Umbral para disparar alerta visual de agotamiento en el Dashboard.', 4),
  ('TBL-05', 'c6', 'precio_costo', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Costo unitario de adquisición para cálculo de egresos.', 5),
  ('TBL-05', 'c7', 'precio_venta', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Precio de venta al público en general.', 6),
  ('TBL-05', 'c8', 'alerta_activa', 'BOOLEAN', false, false, false, null, 'false', 'Calculado: true si stock_actual <= stock_minimo.', 7),
  ('TBL-05', 'c9_trans', 'ultima_transaccion_id', 'UUID', false, true, false, 'tb_ventas_transacciones(id)', null, 'Llave foránea a la última transacción de venta que modificó el inventario disponible.', 8),
  ('TBL-06', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Identificador global del crédito.', 0),
  ('TBL-06', 'c2', 'beneficiario_id', 'UUID', false, false, false, 'tb_beneficiarios(id)', null, 'Identificador del productor o comunero receptor del crédito.', 1),
  ('TBL-06', 'c3', 'monto_capital', 'DECIMAL(12,2)', false, false, false, null, '0.00', 'Monto principal desembolsado en moneda local.', 2),
  ('TBL-06', 'c4', 'tasa_interes_anual', 'DECIMAL(5,2)', false, false, false, null, '12.50', 'Tasa de interés comunitaria preferencial.', 3),
  ('TBL-06', 'c5', 'plazo_meses', 'INTEGER', false, false, false, null, '12', 'Número total de cuotas mensuales pactadas.', 4),
  ('TBL-06', 'c6', 'hash_firma_sha256', 'VARCHAR(64)', false, false, true, null, null, 'Sello criptográfico SHA-256 inmutable de la firma del desembolso.', 5),
  ('TBL-06', 'c7', 'estado_credito', 'VARCHAR(30)', false, false, false, null, '''vigente''', '''vigente'', ''cancelado'', ''en_mora'', ''desembolsado_offline''.', 6),
  ('TBL-07', 'c1', 'id', 'UUID', true, false, true, null, 'gen_random_uuid()', 'Identificador del registro biométrico.', 0),
  ('TBL-07', 'c2', 'credito_id', 'UUID', false, false, false, 'tb_creditos_desembolsos(id)', null, 'Contrato de crédito asociado.', 1),
  ('TBL-07', 'c3', 'tipo_biometria', 'VARCHAR(30)', false, false, false, null, '''huella_dactilar''', '''huella_dactilar'', ''reconocimiento_facial'', ''firma_grafica''.', 2),
  ('TBL-07', 'c4', 'score_coincidencia', 'DECIMAL(5,2)', false, false, false, null, '98.50', 'Puntuación de match biométrico certificado (> 90.00% requerido).', 3),
  ('TBL-07', 'c5', 'coordenadas_gps', 'VARCHAR(100)', false, true, false, null, null, 'Latitud y longitud capturadas al momento de la firma rural.', 4),
  ('TBL-07', 'c6', 'token_totp_verificado', 'BOOLEAN', false, false, false, null, 'true', 'Validación de token de 6 dígitos fuera de línea.', 5)
on conflict (data_model_id, id) do update set name = excluded.name, data_type = excluded.data_type, is_primary = excluded.is_primary, is_nullable = excluded.is_nullable, is_unique = excluded.is_unique, foreign_key = excluded.foreign_key, default_value = excluded.default_value, description = excluded.description, position = excluded.position;

insert into public.files (id, project_id, name, category, format, size_bytes, size_formatted, version, status, uploaded_by, uploaded_at, description, tags, linked_entity, download_url, content_preview) values
  ('FILE-01', 'pathway', 'Pathway_MVP_Release_v1.0.4.apk', 'Builds & Entregables (APKs / Releases)', 'apk', 40265318, '38.4 MB', 'v1.0.4-prod', 'En Revisión', 'Jhan C. (Product Owner & Mobile Lead)', '2026-11-20'::date, 'Binario de producción compilado y firmado para Android. Actualmente en proceso de revisión de Play Console para su publicación oficial en Google Play Store.', array['Android', 'Producción', 'Play Store', 'Release']::text[], 'US-201 (Algoritmo de Metas)', '#download-apk', 'Binary APK file - SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'),
  ('FILE-02', 'pathway', 'Especificacion_Tecnica_Pathway_v1.2.pdf', 'Documentación & PRD', 'pdf', 4404019, '4.2 MB', 'v1.2', 'Vigente / Oficial', 'Equipo de Arquitectura', '2026-11-19'::date, 'Documento maestro de requerimientos funcionales (PRD/SRS), arquitectura offline-first con SQLite cifrado y cálculo del avance por porcentaje de hitos completados.', array['SRS', 'Arquitectura', 'Metas', 'Offline-First']::text[], 'INT-03 (Configuración de Metas)', '#download-pdf', 'SRS Document - Sistema de Registro y Descomposición de Metas Pathway. Contiene matriz de trazabilidad y casos de prueba.'),
  ('FILE-03', 'pathway', 'Wireframes_Diseno_Metas_Habitos_v3.fig', 'Diseños & Prototipos (UI/UX)', 'figma', 19503513, '18.6 MB', 'v3.0', 'Aprobado por Cliente', 'Elena Morales (Investigación UX)', '2026-11-18'::date, 'Prototipo interactivo en Figma con el flujo de onboarding, tarjetas visuales de metas, selector de colores y micro-hábitos matutinos con tipografía Space Grotesk.', array['Figma', 'UI Kit', 'Dark Mode', 'Prototipo']::text[], 'INT-01 (Móvil Principal)', '#download-figma', 'Figma File ID: 948124-pathway-ux-v3. Contiene pantallas Mobile 390x844px e interacciones animadas.'),
  ('FILE-04', 'pathway', 'Esquema_Inicial_SQLCipher_SQLite.sql', 'Arquitectura & SQL', 'sql', 126976, '124 KB', 'v1.0', 'Vigente / Oficial', 'Arquitectura de Datos', '2026-11-18'::date, 'Script DDL SQL de inicialización para la base de datos local SQLite cifrada con AES-256 (SQLCipher): tb_metas, tb_pasos_hitos y tb_bitacora_diaria con índices foráneos.', array['DDL', 'SQLite', 'SQLCipher', 'Base de Datos']::text[], 'tb_metas', '#download-sql', 'CREATE TABLE IF NOT EXISTS tb_metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fecha_limite DATE,
    color_hex VARCHAR(7) NOT NULL DEFAULT ''#10B981'',
    progreso_porcentaje INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);'),
  ('FILE-05', 'portal-admin', 'TDR_Contrato_Sistema_Gestion_Comercial_v2.pdf', 'Documentación & PRD', 'pdf', 2936012, '2.8 MB', 'v2.0', 'Vigente / Oficial', 'Gerencia Comercial (Cliente Encargado)', '2026-11-20'::date, 'Términos de Referencia contractuales para el ''4. Dashboard'', módulo de ventas, boletas electrónicas y control preventivo de inventario con menos de 5 unidades.', array['TDR', 'Contrato', 'Dashboard', 'Comercial']::text[], 'INT-04 (Dashboard)', '#download-tdr', 'TDR Contract - Alcance de entrega y validación de aceptación técnica para el módulo de ventas e inventario.'),
  ('FILE-06', 'portal-admin', 'Dashboard_Comercial_Mockup_HighRes.png', 'Diseños & Prototipos (UI/UX)', 'png', 3670016, '3.5 MB', 'v2.1', 'Aprobado por Cliente', 'Diseño UI Pathrimonio', '2026-11-20'::date, 'Mockup visual en alta resolución aprobado por gerencia, detallando métricas de ventas totales ($48,250), ingresos, egresos y alertas críticas de stock.', array['Mockup', 'PNG', 'Dashboard', 'High-Res']::text[], 'INT-04 (Dashboard)', '#download-png', 'Image preview available - Mockup del Dashboard comercial con paleta dark y acentos dorados.'),
  ('FILE-07', 'portal-admin', 'Plantilla_Carga_Masiva_Inventario_SKU.xlsx', 'Recursos & Multimedia', 'xlsx', 870400, '850 KB', 'v1.1', 'Vigente / Oficial', 'Coordinador de Bodega & Logística', '2026-11-20'::date, 'Plantilla Excel estructurada para la importación por lotes de 500+ ítems de mercadería, incluyendo columnas para SKU, stock mínimo, precio costo y precio venta.', array['Excel', 'Inventario', 'Carga Masiva', 'SKU']::text[], 'tb_inventario_alertas', '#download-xlsx', 'Excel Workbook - Contiene hojas: ''Productos'', ''Categorías'' y ''Reglas de Validación de Stock''.'),
  ('FILE-08', 'portal-admin', 'DDL_PostgreSQL_Supabase_Ventas_Inventario.sql', 'Arquitectura & SQL', 'sql', 98304, '96 KB', 'v2.0', 'Vigente / Oficial', 'Carlos D. (Data Lead)', '2026-11-20'::date, 'Script DDL completo con definición de tb_ventas_transacciones y tb_inventario_alertas, vistas de agregación de ingresos diarios y función trigger para alertas automáticas.', array['PostgreSQL', 'Supabase', 'Triggers', 'Ventas']::text[], 'tb_ventas_transacciones', '#download-sql', 'CREATE TABLE IF NOT EXISTS tb_ventas_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_comprobante VARCHAR(50) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(255) NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);'),
  ('FILE-09', 'core-hub', 'Protocolo_Firma_Biometrica_Offline_SHA256.pdf', 'Documentación & PRD', 'pdf', 3250585, '3.1 MB', 'v1.0', 'Aprobado por Cliente', 'Seguridad & Compliance', '2026-11-16'::date, 'Estándar de sellado criptográfico y hash SHA-256 para validación de actas biométricas capturadas en zonas rurales sin conexión celular.', array['Biometría', 'SHA256', 'Criptografía', 'Seguridad']::text[], 'US-101 (Microcréditos Offline)', '#download-crypto', 'Cryptographic Specification - Protocolo de firmas offline y sincronización asíncrona.'),
  ('FILE-10', 'core-hub', 'Dictamen_Auditoria_Impacto_Social_Cusco_2026.pdf', 'Actas & Aprobaciones', 'pdf', 1887436, '1.8 MB', 'v1.0', 'Vigente / Oficial', 'Comité de Auditoría de Impacto', '2026-11-17'::date, 'Acta de fiscalización y trazabilidad social de los fondos comunitarios desembolsados a productores agrícolas y artesanos comuneros.', array['Auditoría', 'Impacto Social', 'Cusco', 'Acta']::text[], 'US-103 (Reportes de Impacto)', '#download-acta', 'Audit Report - Certificación de cumplimiento del 100% de desembolsos en cooperativas agrarias.')
on conflict (id) do update set project_id = excluded.project_id, name = excluded.name, category = excluded.category, format = excluded.format, size_bytes = excluded.size_bytes, size_formatted = excluded.size_formatted, version = excluded.version, status = excluded.status, uploaded_by = excluded.uploaded_by, uploaded_at = excluded.uploaded_at, description = excluded.description, tags = excluded.tags, linked_entity = excluded.linked_entity, download_url = excluded.download_url, content_preview = excluded.content_preview;

commit;

// Catálogo completo del proyecto propio: Pathrimonio Site (Portal SDD, MCP AST & Visor Archify)
// Todos los elementos corresponden 1:1 con los componentes, tablas SQL, roles y flujos reales de f:\SITIO_PATHRIMONIO.

export const PATHRIMONIO_SITE_PROJECT = {
  id: 'pathrimonio-site',
  name: 'Pathrimonio Site — Portal SDD & Arquitectura',
  shortName: 'Pathrimonio Site',
  subtitle: 'Portal de Ingeniería SDD, Modelado UI/BD, Sincronización MCP & Visor Archify',
  description:
    'Plataforma web corporativa y workspace operativo de Pathrimonio (React 18 + Vite + Tailwind CSS + Supabase Realtime). Centraliza actores RBAC, historias de usuario, interfaces interactivas con hotspots y consumo de datos, modelado relacional DDL SQL, árbol real de código con extracción AST sin fuga de secretos (MCP pathrimonio-files) y renderizado interactivo de diagramas Archify (.html).',
  category: 'Plataforma Web / SaaS',
  icon: 'web',
  color: 'amber',
  status: 'En Producción (v1.0)',
  client: 'Pathrimonio Labs',
  version: 'v1.0.0',
  modules: [
    'Landing Corporativa & Portada',
    'Autenticación & Control RBAC',
    'Actores, Historias & Trazabilidad',
    'Interfaces Interactivas & Hotspots',
    'Modelado de Datos & DDL SQL',
    'Árbol de Archivos & MCP AST',
    'Arquitectura & Visor Archify (.html)'
  ]
};

export const PATHRIMONIO_SITE_ACTORS = [
  {
    id: 'ACT-PS-01',
    projectId: 'pathrimonio-site',
    name: 'Administrador Sistémico',
    category: 'Administración & Gerencia',
    avatarIcon: 'admin_panel_settings',
    color: 'amber',
    description:
      'Dueño técnico de Pathrimonio Site con acceso completo a los 10 módulos del portal, gestión de usuarios, definición de roles/permisos RBAC, membresías de proyecto y publicación de arquitectura.',
    permissionLevel: 'Acceso Total (Admin)',
    systemAreas: [
      'Autenticación & Control RBAC',
      'Configuración & Permisos',
      'Arquitectura & Visor Archify (.html)',
      'Modelado de Datos & DDL SQL'
    ],
    assignedWorker: 'admin@pathrimonio.org',
    assignedWorkerName: 'Administrador Sistémico',
    status: 'Activo',
    createdAt: '2026-11-24',
    isPrimaryRole: true
  },
  {
    id: 'ACT-PS-02',
    projectId: 'pathrimonio-site',
    name: 'Arquitecto de Software',
    category: 'Auditoría & Control',
    avatarIcon: 'account_tree',
    color: 'emerald',
    description:
      'Responsable de validar las capas Clean/Hexagonal, esquemas DDL PostgreSQL, contratos abstractos sin fuga de código y diagramas interactivos HTML generados con la skill archify.',
    permissionLevel: 'Aprobador / PO',
    systemAreas: [
      'Arquitectura & Visor Archify (.html)',
      'Modelado de Datos & DDL SQL',
      'Árbol de Archivos & MCP AST'
    ],
    assignedWorker: 'jhan.lead@pathrimonio.org',
    assignedWorkerName: 'Arquitecto Principal Pathrimonio',
    status: 'Activo',
    createdAt: '2026-11-24',
    isPrimaryRole: true
  },
  {
    id: 'ACT-PS-03',
    projectId: 'pathrimonio-site',
    name: 'Product Owner / Analista SDD',
    category: 'Operaciones & Ventas',
    avatarIcon: 'view_kanban',
    color: 'sky',
    description:
      'Especifica actores del negocio, historias de usuario con criterios DoD, prototipos de interfaces con hotspots y vinculación de campos de base de datos por pantalla.',
    permissionLevel: 'Operativo / Escritura',
    systemAreas: [
      'Actores, Historias & Trazabilidad',
      'Interfaces Interactivas & Hotspots'
    ],
    assignedWorker: 'sofia@pathrimonio.org',
    assignedWorkerName: 'Sofía V. (Product Owner)',
    status: 'Activo',
    createdAt: '2026-11-24',
    isPrimaryRole: true
  },
  {
    id: 'ACT-PS-04',
    projectId: 'pathrimonio-site',
    name: 'Agente IA / MCP (pathrimonio-files)',
    category: 'Auditoría & Control',
    avatarIcon: 'smart_toy',
    color: 'violet',
    description:
      'Agente de programación conectado vía stdio MCP (mcp/pathrimonio-mcp-server.mjs) que escanea el árbol real del repositorio con TypeScript AST sin leer cuerpos privados ni secretos, actualizando nodos, métodos y diagramas HTML Archify en tiempo real.',
    permissionLevel: 'Operativo / Escritura',
    systemAreas: [
      'Árbol de Archivos & MCP AST',
      'Arquitectura & Visor Archify (.html)'
    ],
    assignedWorker: 'carlos@pathrimonio.org',
    assignedWorkerName: 'Servidor MCP pathrimonio-files v1.0',
    status: 'Activo',
    createdAt: '2026-11-24',
    isPrimaryRole: false
  },
  {
    id: 'ACT-PS-05',
    projectId: 'pathrimonio-site',
    name: 'Visitante Web / Prospecto B2B',
    category: 'Usuario Final / B2C',
    avatarIcon: 'public',
    color: 'rose',
    description:
      'Visitante público de https://www.pathrimonio.site que explora la propuesta SDD, los pilares de arquitectura sin fuga de código y utiliza el estimador interactivo y modal de contacto.',
    permissionLevel: 'Consulta / Lectura',
    systemAreas: ['Landing Corporativa & Portada'],
    assignedWorker: 'contacto@pathrimonio.site',
    assignedWorkerName: 'Audiencia Pública Web',
    status: 'Activo',
    createdAt: '2026-11-24',
    isPrimaryRole: false
  }
];

export const PATHRIMONIO_SITE_STORIES = [
  {
    id: 'US-PS-01',
    projectId: 'pathrimonio-site',
    module: 'Autenticación & Control RBAC',
    priority: 'Bloqueante',
    status: 'Aprobado por PO',
    role: 'Administrador Sistémico',
    action:
      'autenticar usuarios mediante Supabase Auth, asignar roles configurables en matriz RBAC y gestionar membresías por proyecto',
    benefit:
      'cada integrante visualice únicamente los proyectos y pestañas del portal autorizadas según su perfil real.',
    criteria: [
      { id: 'c1', text: 'Login seguro con Supabase Auth (persistSession y autoRefreshToken)', checked: true },
      { id: 'c2', text: 'Matriz editable de permisos por rol en AdminUsersView', checked: true },
      { id: 'c3', text: 'Control de miembros en project_members (owner, editor, viewer)', checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: 'permissions_rbac_matrix.json',
    author: 'Administrador Sistémico',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-02',
    projectId: 'pathrimonio-site',
    module: 'Actores, Historias & Trazabilidad',
    priority: 'Alta',
    status: 'Aprobado por PO',
    role: 'Product Owner / Analista SDD',
    action:
      'documentar actores del negocio, historias de usuario en formato Rol-Acción-Beneficio y checklist DoD enlazados a proyectos reales',
    benefit:
      'todo el equipo de desarrollo y los agentes IA trabajen sobre especificaciones trazables y verificables.',
    criteria: [
      { id: 'c1', text: 'Alta y edición de actores y asignaciones en portal_users', checked: true },
      { id: 'c2', text: 'Persistencia de historias y story_criteria ordenados por posición', checked: true },
      { id: 'c3', text: 'Consolidación automática en Backlog y Sprints & Ciclos', checked: true }
    ],
    attachmentsCount: 0,
    attachmentName: null,
    author: 'Sofía V.',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-03',
    projectId: 'pathrimonio-site',
    module: 'Interfaces Interactivas & Hotspots',
    priority: 'Alta',
    status: 'Aprobado por PO',
    role: 'Product Owner / Analista SDD',
    action:
      'registrar fichas UI/UX con imágenes de mockups, hotspots interactivos y trazabilidad directa a columnas de tablas en Supabase',
    benefit:
      'el diseñador, desarrollador y cliente naveguen de forma visual cada botón y dato requerido en cada pantalla.',
    criteria: [
      { id: 'c1', text: 'Hotspots sobre imágenes con coordenadas normalizadas x/y/width/height', checked: true },
      { id: 'c2', text: 'Mapeo en interface_data_usage hacia atributos de data_models', checked: true },
      { id: 'c3', text: 'Mapeo de roles por interfaz en interface_roles', checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: 'hotspot_overlay_spec.png',
    author: 'Elena Morales',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-04',
    projectId: 'pathrimonio-site',
    module: 'Modelado de Datos & DDL SQL',
    priority: 'Alta',
    status: 'Aprobado por PO',
    role: 'Arquitecto de Software',
    action:
      'modelar tablas relacionales, importar scripts DDL SQL automáticamente y generar diagramas Entidad-Relación (DER)',
    benefit:
      'la estructura de almacenamiento en PostgreSQL y SQLite quede documentada con llaves primarias, foráneas y tipos exactos.',
    criteria: [
      { id: 'c1', text: 'Parser DDL SQL con extracción de COMMENT ON COLUMN y FOREIGN KEY', checked: true },
      { id: 'c2', text: 'Generador automático de scripts CREATE TABLE y PlantUML DER', checked: true },
      { id: 'c3', text: 'Persistencia en data_models y data_model_attributes', checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: '20261121000100_init.sql',
    author: 'Arquitecto Principal',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-05',
    projectId: 'pathrimonio-site',
    module: 'Árbol de Archivos & MCP AST',
    priority: 'Bloqueante',
    status: 'Aprobado por PO',
    role: 'Agente IA / MCP (pathrimonio-files)',
    action:
      'escanear archivos reales del repositorio con TypeScript AST y sincronizar nodos y firmas abstractas hacia Supabase Realtime vía MCP',
    benefit:
      'el portal refleje en vivo los archivos y métodos modificados por los agentes sin exponer cuerpos de funciones ni secretos.',
    criteria: [
      { id: 'c1', text: 'Servidor MCP stdio con 12 tools registradas y pruebas E2E en verde', checked: true },
      { id: 'c2', text: 'Bloqueo estricto de fuga de código (solo firma, tipo, línea y JSDoc)', checked: true },
      { id: 'c3', text: 'Actualización en tiempo real en ProjectTreeView y TreeFileDetailModal', checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: 'MCP_Registro_Archivos_y_Metodos.md',
    author: 'Carlos D.',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-06',
    projectId: 'pathrimonio-site',
    module: 'Arquitectura & Visor Archify (.html)',
    priority: 'Bloqueante',
    status: 'Aprobado por PO',
    role: 'Arquitecto de Software',
    action:
      'renderizar diagramas interactivos HTML generados por la skill archify dentro de la subvista Arquitectura de Software con soporte de localhost, carga local y Supabase Realtime',
    benefit:
      'se pueda inspeccionar, filtrar vistas guiadas, cambiar tema oscuro/claro y exportar arquitecturas sin salir del portal.',
    criteria: [
      { id: 'c1', text: 'Tabla project_architecture_artifacts con publicación en Realtime', checked: true },
      { id: 'c2', text: 'Puente dev localhost POST /api/archify/sync + CLI archify.mjs', checked: true },
      { id: 'c3', text: 'Iframe responsivo de ancho completo con selector multi-diagrama', checked: true }
    ],
    attachmentsCount: 1,
    attachmentName: 'pathrimonio-site-architecture.html',
    author: 'Arquitecto Principal',
    createdAt: 'Hoy',
    image: null
  },
  {
    id: 'US-PS-07',
    projectId: 'pathrimonio-site',
    module: 'Landing Corporativa & Portada',
    priority: 'Media',
    status: 'Aprobado por PO',
    role: 'Visitante Web / Prospecto B2B',
    action:
      'explorar el manifiesto SDD, los pilares tecnológicos y calcular un estimado interactivo de desarrollo con acceso directo al portal',
    benefit:
      'clientes y aliados comprendan el valor diferencial de Pathrimonio y puedan iniciar contacto o entrar al workspace.',
    criteria: [
      { id: 'c1', text: 'Soporte de tema oscuro/claro persistido en pathrimonio_theme', checked: true },
      { id: 'c2', text: 'Estimador interactivo basado en pricingRules.js y pantallas configurables', checked: true },
      { id: 'c3', text: 'Sección técnica interactiva ArchitectureSection con vista de doble modo AST', checked: true }
    ],
    attachmentsCount: 0,
    attachmentName: null,
    author: 'Jhan C.',
    createdAt: 'Hoy',
    image: null
  }
];

export const PATHRIMONIO_SITE_DATA_MODELS = [
  {
    id: 'TBL-PS-01',
    projectId: 'pathrimonio-site',
    tableName: 'projects',
    name: 'Catálogo de Proyectos del Portal',
    module: 'Autenticación & Control RBAC',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.projects)',
    syncStrategy: 'CRUD REST + Supabase Realtime (postgres_changes) y caché local de respaldo.',
    status: 'Aprobado por Arquitectura',
    description:
      'Tabla maestra con los productos y proyectos gestionados dentro de Pathrimonio (Pathway, Core Hub, Gestión ERP, SMATAD y Pathrimonio Site).',
    linkedStory: 'US-PS-01',
    linkedInterface: 'INT-PS-03',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'Slug identificador único del proyecto (ej. pathrimonio-site).' },
      { id: 'c2', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre completo visible del proyecto.' },
      { id: 'c3', name: 'short_name', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Etiqueta compacta para selector y tarjetas.' },
      { id: 'c4', name: 'category', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Categoría tecnológica del software.' },
      { id: 'c5', name: 'status', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Estado operativo o sprint actual.' },
      { id: 'c6', name: 'modules', type: 'TEXT[]', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: "'{}'", description: 'Catálogo de módulos funcionales del proyecto.' }
    ]
  },
  {
    id: 'TBL-PS-02',
    projectId: 'pathrimonio-site',
    tableName: 'portal_users',
    name: 'Perfiles y Roles del Portal',
    module: 'Autenticación & Control RBAC',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.portal_users)',
    syncStrategy: 'Autenticación delegada a Supabase Auth; perfiles y permisos cacheados en React state.',
    status: 'Aprobado por Arquitectura',
    description: 'Directorio de cuentas de equipo con rol asignado y arreglo de permisos granulares (las credenciales viven en auth.users).',
    linkedStory: 'US-PS-01',
    linkedInterface: 'INT-PS-12',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'Identificador del perfil (ej. u1).' },
      { id: 'c2', name: 'email', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'Correo vinculado con auth.users.' },
      { id: 'c3', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre mostrado en cabecera y auditoría.' },
      { id: 'c4', name: 'role', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Rol canónico RBAC (Admin, Desarrollador, etc.).' },
      { id: 'c5', name: 'permissions', type: 'TEXT[]', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: "'{}'", description: 'Lista de capacidades habilitadas.' }
    ]
  },
  {
    id: 'TBL-PS-03',
    projectId: 'pathrimonio-site',
    tableName: 'project_members',
    name: 'Membresías por Proyecto',
    module: 'Autenticación & Control RBAC',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.project_members)',
    syncStrategy: 'Unicidad (project_id, user_id) con cascada en delete.',
    status: 'Aprobado por Arquitectura',
    description: 'Tabla puente que vincula cuentas de portal_users con los proyectos autorizados y su nivel de acceso.',
    linkedStory: 'US-PS-01',
    linkedInterface: 'INT-PS-12',
    author: '20261122000100_project_members.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: 'gen_random_uuid()', description: 'PK UUID.' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto asignado.' },
      { id: 'c3', name: 'user_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'portal_users(id)', defaultValue: null, description: 'Usuario miembro.' },
      { id: 'c4', name: 'role', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: "'viewer'", description: 'owner | editor | viewer.' }
    ]
  },
  {
    id: 'TBL-PS-04',
    projectId: 'pathrimonio-site',
    tableName: 'actors',
    name: 'Actores y Roles de Negocio',
    module: 'Actores, Historias & Trazabilidad',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.actors)',
    syncStrategy: 'Upsert directo desde ActorBuilder con propagación a interface_roles.',
    status: 'Aprobado por Arquitectura',
    description: 'Catálogo de actores operativos o externos de cada software documentado en el portal.',
    linkedStory: 'US-PS-02',
    linkedInterface: 'INT-PS-04',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'Código de actor (ej. ACT-PS-01).' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c3', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre funcional del actor.' },
      { id: 'c4', name: 'permission_level', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nivel de autoridad dentro del software.' },
      { id: 'c5', name: 'system_areas', type: 'TEXT[]', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: "'{}'", description: 'Módulos sobre los cuales opera.' }
    ]
  },
  {
    id: 'TBL-PS-05',
    projectId: 'pathrimonio-site',
    tableName: 'stories',
    name: 'Historias de Usuario (US)',
    module: 'Actores, Historias & Trazabilidad',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.stories)',
    syncStrategy: 'Upsert transaccional acompañado de reemplazo ordenado de story_criteria.',
    status: 'Aprobado por Arquitectura',
    description: 'Requerimientos funcionales bajo estructura Como [rol] quiero [acción] para [beneficio].',
    linkedStory: 'US-PS-02',
    linkedInterface: 'INT-PS-05',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'Código de historia (ej. US-PS-01).' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto dueño.' },
      { id: 'c3', name: 'module', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Módulo funcional.' },
      { id: 'c4', name: 'priority', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Prioridad (Bloqueante, Alta, Media, Baja).' },
      { id: 'c5', name: 'status', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Estado de aprobación PO.' },
      { id: 'c6', name: 'role', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Rol solicitante.' },
      { id: 'c7', name: 'action', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Capacidad deseada.' }
    ]
  },
  {
    id: 'TBL-PS-06',
    projectId: 'pathrimonio-site',
    tableName: 'story_criteria',
    name: 'Criterios de Aceptación (DoD)',
    module: 'Actores, Historias & Trazabilidad',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.story_criteria)',
    syncStrategy: 'Sincronización ordenada por columna position.',
    status: 'Aprobado por Arquitectura',
    description: 'Checklist verificable de Definition of Done perteneciente a cada historia en public.stories.',
    linkedStory: 'US-PS-02',
    linkedInterface: 'INT-PS-05',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'story_id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: 'stories(id)', defaultValue: null, description: 'FK hacia la historia padre.' },
      { id: 'c2', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Identificador local del criterio.' },
      { id: 'c3', name: 'text', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Condición verificable.' },
      { id: 'c4', name: 'checked', type: 'BOOLEAN', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: 'false', description: 'Estado cumplido / pendiente.' },
      { id: 'c5', name: 'position', type: 'INTEGER', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: '0', description: 'Orden visual.' }
    ]
  },
  {
    id: 'TBL-PS-07',
    projectId: 'pathrimonio-site',
    tableName: 'interfaces',
    name: 'Especificaciones de Interfaces UI/UX',
    module: 'Interfaces Interactivas & Hotspots',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.interfaces)',
    syncStrategy: 'Persistencia con serialización JSON de hotspots e imágenes multipantalla.',
    status: 'Aprobado por Arquitectura',
    description: 'Fichas detalladas de cada pantalla web o móvil con objetivo, reglas de negocio, plataforma, historia vinculada y hotspots.',
    linkedStory: 'US-PS-03',
    linkedInterface: 'INT-PS-06',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'ID de interfaz (ej. INT-PS-01).' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c3', name: 'number', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Numeración jerárquica de pantalla.' },
      { id: 'c4', name: 'title', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Título visible de la interfaz.' },
      { id: 'c5', name: 'module', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Módulo funcional.' },
      { id: 'c6', name: 'platform', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Web / Desktop, Mobile o Web & Mobile.' },
      { id: 'c7', name: 'linked_story_id', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: 'stories(id)', defaultValue: null, description: 'Historia de usuario trazada.' }
    ]
  },
  {
    id: 'TBL-PS-08',
    projectId: 'pathrimonio-site',
    tableName: 'interface_roles',
    name: 'Roles Autorizados por Interfaz',
    module: 'Interfaces Interactivas & Hotspots',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.interface_roles)',
    syncStrategy: 'Reemplazo limpio al guardar ficha de interfaz resolviendo actor_id.',
    status: 'Aprobado por Arquitectura',
    description: 'Relación N:M entre interfaces UI/UX y los actores de negocio autorizados a operarlas.',
    linkedStory: 'US-PS-03',
    linkedInterface: 'INT-PS-06',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'interface_id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: 'interfaces(id)', defaultValue: null, description: 'PK compuesta hacia interfaces.' },
      { id: 'c2', name: 'role_name', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre del rol en la interfaz.' },
      { id: 'c3', name: 'actor_id', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: 'actors(id)', defaultValue: null, description: 'Referencia al actor oficial.' }
    ]
  },
  {
    id: 'TBL-PS-09',
    projectId: 'pathrimonio-site',
    tableName: 'data_models',
    name: 'Modelado de Tablas y Almacenamiento',
    module: 'Modelado de Datos & DDL SQL',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.data_models)',
    syncStrategy: 'Unicidad (project_id, table_name); alimentado manualmente o por parseSQLScript.',
    status: 'Aprobado por Arquitectura',
    description: 'Especificación lógica y física de cada tabla perteneciente a los proyectos administrados.',
    linkedStory: 'US-PS-04',
    linkedInterface: 'INT-PS-08',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'ID de modelo de datos.' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c3', name: 'table_name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre físico SQL de la tabla.' },
      { id: 'c4', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre descriptivo en lenguaje de negocio.' },
      { id: 'c5', name: 'storage_target', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Motor destino (PostgreSQL, SQLite, etc.).' }
    ]
  },
  {
    id: 'TBL-PS-10',
    projectId: 'pathrimonio-site',
    tableName: 'data_model_attributes',
    name: 'Atributos y Restricciones de Tablas',
    module: 'Modelado de Datos & DDL SQL',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.data_model_attributes)',
    syncStrategy: 'Sincronizado en bloque por data_model_id manteniendo orden position.',
    status: 'Aprobado por Arquitectura',
    description: 'Definición de columnas, tipos SQL, PK, NOT NULL, UNIQUE, FOREIGN KEY y valor por defecto.',
    linkedStory: 'US-PS-04',
    linkedInterface: 'INT-PS-08',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'data_model_id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: 'data_models(id)', defaultValue: null, description: 'Tabla padre.' },
      { id: 'c2', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'ID de columna dentro de la tabla.' },
      { id: 'c3', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre de columna SQL.' },
      { id: 'c4', name: 'data_type', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Tipo SQL (UUID, TEXT, JSONB, etc.).' },
      { id: 'c5', name: 'is_primary', type: 'BOOLEAN', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: 'false', description: 'Indicador de clave primaria.' },
      { id: 'c6', name: 'foreign_key', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Referencia foránea destino.' }
    ]
  },
  {
    id: 'TBL-PS-11',
    projectId: 'pathrimonio-site',
    tableName: 'interface_data_usage',
    name: 'Trazabilidad de Datos por Interfaz',
    module: 'Interfaces Interactivas & Hotspots',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.interface_data_usage)',
    syncStrategy: 'Snapshot denormalizado vinculado opcionalmente a data_models.',
    status: 'Aprobado por Arquitectura',
    description: 'Registra exactamente qué esquema, tabla y campo consume o modifica cada pantalla del software.',
    linkedStory: 'US-PS-03',
    linkedInterface: 'INT-PS-06',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: 'gen_random_uuid()', description: 'PK UUID.' },
      { id: 'c2', name: 'interface_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'interfaces(id)', defaultValue: null, description: 'Interfaz consumidora.' },
      { id: 'c3', name: 'data_model_id', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: 'data_models(id)', defaultValue: null, description: 'Tabla vinculada.' },
      { id: 'c4', name: 'schema_name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Esquema PostgreSQL.' },
      { id: 'c5', name: 'table_name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Tabla referenciada.' },
      { id: 'c6', name: 'attribute_name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Columna utilizada en UI.' }
    ]
  },
  {
    id: 'TBL-PS-12',
    projectId: 'pathrimonio-site',
    tableName: 'files',
    name: 'Entregables y Documentos del Proyecto',
    module: 'Árbol de Archivos & MCP AST',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.files)',
    syncStrategy: 'Registro directo desde FileUploader.',
    status: 'Aprobado por Arquitectura',
    description: 'Repositorio de artefactos documentales, builds, scripts SQL, actas y manifiestos de cada proyecto.',
    linkedStory: 'US-PS-05',
    linkedInterface: 'INT-PS-10',
    author: '20261121000100_init.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'TEXT', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: null, description: 'ID de entregable (ej. FILE-PS-01).' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c3', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre del documento o artefacto.' },
      { id: 'c4', name: 'category', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Categoría documental.' },
      { id: 'c5', name: 'format', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Extensión (sql, md, html, json, etc.).' }
    ]
  },
  {
    id: 'TBL-PS-13',
    projectId: 'pathrimonio-site',
    tableName: 'project_tree_nodes',
    name: 'Árbol Real de Carpetas y Archivos (MCP)',
    module: 'Árbol de Archivos & MCP AST',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.project_tree_nodes)',
    syncStrategy: 'RPC upsert_project_tree_nodes + Supabase Realtime para sincronización incremental sin perder UUIDs.',
    status: 'Aprobado por Arquitectura',
    description: 'Estructura jerárquica real de carpetas y archivos del repositorio sincronizada vía Web File Picker o servidor MCP.',
    linkedStory: 'US-PS-05',
    linkedInterface: 'INT-PS-09',
    author: '20261123000100_project_tree.sql',
    approvedAt: '2026-11-24',
    version: 'v1.1',
    attributes: [
      { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: 'gen_random_uuid()', description: 'PK UUID preservado al mover archivos.' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto asociado.' },
      { id: 'c3', name: 'root_name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Carpeta raíz importada.' },
      { id: 'c4', name: 'path', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Ruta POSIX relativa desde root_name.' },
      { id: 'c5', name: 'is_directory', type: 'BOOLEAN', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: 'false', description: 'Diferencia carpetas de archivos.' },
      { id: 'c6', name: 'record_count', type: 'INTEGER', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: '0', description: 'Conteo sincronizado vía trigger al modificar file_records.' }
    ]
  },
  {
    id: 'TBL-PS-14',
    projectId: 'pathrimonio-site',
    tableName: 'file_records',
    name: 'Métodos y Contratos Abstractos por Archivo',
    module: 'Árbol de Archivos & MCP AST',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.file_records)',
    syncStrategy: 'Actualizado por MCP AST (abstractExtractor.mjs) y reflejado en tiempo real vía supabase_realtime.',
    status: 'Aprobado por Arquitectura',
    description: 'Catálogo de funciones, clases, componentes React, hooks, interfaces, rutas y tablas dentro de cada archivo real sin código fuente privado.',
    linkedStory: 'US-PS-05',
    linkedInterface: 'INT-PS-09',
    author: '20261123000100_project_tree.sql',
    approvedAt: '2026-11-24',
    version: 'v1.1',
    attributes: [
      { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: 'gen_random_uuid()', description: 'PK UUID.' },
      { id: 'c2', name: 'node_id', type: 'UUID', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'project_tree_nodes(id)', defaultValue: null, description: 'Archivo al que pertenece.' },
      { id: 'c3', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c4', name: 'record_type', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'method | function | class | component | hook | table | route.' },
      { id: 'c5', name: 'name', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Nombre calificado del símbolo.' },
      { id: 'c6', name: 'signature', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Firma abstracta tipada sin implementación.' },
      { id: 'c7', name: 'line_number', type: 'INTEGER', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Línea exacta de declaración.' }
    ]
  },
  {
    id: 'TBL-PS-15',
    projectId: 'pathrimonio-site',
    tableName: 'project_architecture_artifacts',
    name: 'Diagramas Interactivos Archify (.html)',
    module: 'Arquitectura & Visor Archify (.html)',
    storageTarget: 'PostgreSQL (Supabase Cloud)',
    storageLocation: 'Supabase Cloud (public.project_architecture_artifacts)',
    syncStrategy: 'Publicado por MCP (publish_archify_html) o Vite localhost bridge + Supabase Realtime.',
    status: 'Aprobado por Arquitectura',
    description: 'Almacena los documentos HTML autónomos generados por la skill archify 3.3.0 para renderizarlos dentro de SoftwareArchitectureView.',
    linkedStory: 'US-PS-06',
    linkedInterface: 'INT-PS-07',
    author: '20261124000200_archify_artifacts.sql',
    approvedAt: '2026-11-24',
    version: 'v1.0',
    attributes: [
      { id: 'c1', name: 'id', type: 'UUID', isPrimary: true, isNullable: false, isUnique: true, foreignKey: null, defaultValue: 'gen_random_uuid()', description: 'PK UUID.' },
      { id: 'c2', name: 'project_id', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: 'projects(id)', defaultValue: null, description: 'Proyecto propietario.' },
      { id: 'c3', name: 'slug', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Slug único dentro del proyecto.' },
      { id: 'c4', name: 'title', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'Título del diagrama interactivo.' },
      { id: 'c5', name: 'html_content', type: 'TEXT', isPrimary: false, isNullable: false, isUnique: false, foreignKey: null, defaultValue: null, description: 'HTML completo autónomo generado por archify.' },
      { id: 'c6', name: 'generator_version', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, foreignKey: null, defaultValue: null, description: 'Versión de archify (ej. archify 3.3.0).' }
    ]
  }
];

export const PATHRIMONIO_SITE_INTERFACES = [
  {
    id: 'INT-PS-01',
    projectId: 'pathrimonio-site',
    number: '1',
    title: 'Landing Corporativa & Estimador SDD',
    fullName: '1. Landing Corporativa & Estimador SDD',
    module: 'Landing Corporativa & Portada',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'landing',
    fields: {
      objetivo:
        'Presentar la metodología SDD de Pathrimonio, la arquitectura Zero-Code Leakage y permitir estimar alcance/costo interactivo o solicitar contacto.',
      contenido:
        'Navbar con selector de tema Oscuro/Claro, Hero, RolesSection, Pillars, ArchitectureSection, InteractiveEstimator, PartnershipSection y ContactModal.',
      reglas:
        'Soporta modo oscuro/claro sincronizado en pathrimonio_theme y transición directa a #portal o modal de registro.',
      detalles:
        'Componentes principales: Navbar.jsx, Hero.jsx, ArchitectureSection.jsx, InteractiveEstimator.jsx, pricingRules.js.'
    },
    roles: ['Visitante Web / Prospecto B2B', 'Administrador Sistémico'],
    dataUsage: [],
    linkedStory: 'US-PS-07',
    author: 'Jhan C.',
    reviewedBy: 'Arquitecto de Software',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-02',
    projectId: 'pathrimonio-site',
    number: '2',
    title: 'Acceso al Portal & Auth Supabase',
    fullName: '2. Acceso al Portal & Auth Supabase',
    module: 'Autenticación & Control RBAC',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'login',
    fields: {
      objetivo:
        'Autenticar de forma segura a los colaboradores del portal contra Supabase Auth resolviendo sus permisos y proyectos autorizados.',
      contenido:
        'Formulario de correo electrónico, contraseña, alternancia Crear Cuenta / Iniciar Sesión y retorno a portada.',
      reglas:
        'Las sesiones utilizan persistSession + autoRefreshToken de @supabase/supabase-js; nunca se almacenan contraseñas en portal_users.',
      detalles: 'Implementado en LoginPage.jsx, authConfig.js y supabase.js.'
    },
    roles: ['Administrador Sistémico', 'Arquitecto de Software', 'Product Owner / Analista SDD'],
    dataUsage: [
      { key: 'TBL-PS-02:c2', tableId: 'TBL-PS-02', tableName: 'portal_users', tableLabel: 'Perfiles y Roles del Portal', schema: 'public', attribute: 'email', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-02:c4', tableId: 'TBL-PS-02', tableName: 'portal_users', tableLabel: 'Perfiles y Roles del Portal', schema: 'public', attribute: 'role', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-01',
    author: 'Administrador Sistémico',
    reviewedBy: 'Arquitecto de Software',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-03',
    projectId: 'pathrimonio-site',
    number: '3',
    title: 'Workspace Portal, Header & Sidebar',
    fullName: '3. Workspace Portal, Header & Sidebar',
    module: 'Autenticación & Control RBAC',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'dashboard',
    fields: {
      objetivo:
        'Orquestar la navegación lateral responsiva (Sidebar), cabecera contextual, selector global de proyectos y creación de nuevos softwares.',
      contenido:
        'Sidebar fija en escritorio y drawer en móvil, ProjectSelector, NewProjectModal, Header con UserMenu, theme toggle y Toast de estado.',
      reglas:
        'El área principal ocupa 100% del ancho disponible (w-full px-3 sm:px-4 lg:px-5) filtrando proyectos según project_members.',
      detalles: 'Implementado en App.jsx, Sidebar.jsx, Header.jsx, ProjectSelector.jsx y NewProjectModal.jsx.'
    },
    roles: ['Administrador Sistémico', 'Arquitecto de Software', 'Product Owner / Analista SDD'],
    dataUsage: [
      { key: 'TBL-PS-01:c1', tableId: 'TBL-PS-01', tableName: 'projects', tableLabel: 'Catálogo de Proyectos del Portal', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-01:c2', tableId: 'TBL-PS-01', tableName: 'projects', tableLabel: 'Catálogo de Proyectos del Portal', schema: 'public', attribute: 'name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-03:c2', tableId: 'TBL-PS-03', tableName: 'project_members', tableLabel: 'Membresías por Proyecto', schema: 'public', attribute: 'project_id', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-01',
    author: 'Jhan C.',
    reviewedBy: 'Product Owner',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-04',
    projectId: 'pathrimonio-site',
    number: '4',
    title: 'Matriz de Actores & Roles de Negocio',
    fullName: '4. Matriz de Actores & Roles de Negocio',
    module: 'Actores, Historias & Trazabilidad',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'actors',
    fields: {
      objetivo:
        'Definir los roles humanos y sistémicos de cada proyecto, áreas autorizadas, responsable asignado y nivel de permisos.',
      contenido:
        'ActorsControlsBar, cuadrícula ActorFeed / ActorCard, modal ActorBuilder y detalle ActorDetailModal.',
      reglas:
        'Cada actor se vincula posteriormente con las interfaces UI/UX mediante public.interface_roles.',
      detalles: 'Componentes: ActorFeed.jsx, ActorCard.jsx, ActorBuilder.jsx, ActorDetailModal.jsx.'
    },
    roles: ['Administrador Sistémico', 'Product Owner / Analista SDD'],
    dataUsage: [
      { key: 'TBL-PS-04:c1', tableId: 'TBL-PS-04', tableName: 'actors', tableLabel: 'Actores y Roles de Negocio', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-04:c3', tableId: 'TBL-PS-04', tableName: 'actors', tableLabel: 'Actores y Roles de Negocio', schema: 'public', attribute: 'name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-04:c4', tableId: 'TBL-PS-04', tableName: 'actors', tableLabel: 'Actores y Roles de Negocio', schema: 'public', attribute: 'permission_level', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-02',
    author: 'Sofía V.',
    reviewedBy: 'Administrador Sistémico',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-05',
    projectId: 'pathrimonio-site',
    number: '5',
    title: 'Tablero de Historias de Usuario (US)',
    fullName: '5. Tablero de Historias de Usuario (US)',
    module: 'Actores, Historias & Trazabilidad',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'stories',
    fields: {
      objetivo:
        'Registrar, filtrar y aprobar historias de usuario con su lista interactiva de criterios de aceptación (DoD) y adjuntos.',
      contenido:
        'ControlsBar con filtros por módulo/prioridad/estado, StoryFeed, StoryBuilder y StoryDetailModal.',
      reglas:
        'Los criterios marcados se persisten en story_criteria conservando el orden exacto de checklist.',
      detalles: 'Componentes: StoryFeed.jsx, StoryBuilder.jsx, StoryDetailModal.jsx, ControlsBar.jsx.'
    },
    roles: ['Product Owner / Analista SDD', 'Arquitecto de Software'],
    dataUsage: [
      { key: 'TBL-PS-05:c1', tableId: 'TBL-PS-05', tableName: 'stories', tableLabel: 'Historias de Usuario (US)', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-05:c5', tableId: 'TBL-PS-05', tableName: 'stories', tableLabel: 'Historias de Usuario (US)', schema: 'public', attribute: 'status', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-06:c3', tableId: 'TBL-PS-06', tableName: 'story_criteria', tableLabel: 'Criterios de Aceptación (DoD)', schema: 'public', attribute: 'text', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-02',
    author: 'Sofía V.',
    reviewedBy: 'Arquitecto de Software',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-06',
    projectId: 'pathrimonio-site',
    number: '6',
    title: 'Catálogo de Interfaces & Hotspots Interactivos',
    fullName: '6. Catálogo de Interfaces & Hotspots Interactivos',
    module: 'Interfaces Interactivas & Hotspots',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'interfaces',
    fields: {
      objetivo:
        'Documentar interfaces UI/UX, superponer hotspots interactivos sobre capturas reales y enlazar campos de BD consumidos por cada vista.',
      contenido:
        'InterfaceControlsBar, InterfaceFeed, InterfaceBuilder, InterfaceDetailModal, InterfaceHotspotOverlay y DataUsagePicker.',
      reglas:
        'Soporta exportación visual y múltiple plataforma, catálogo global de módulos (interface_modules) y navegación entre pantallas por hotspot.',
      detalles:
        'Componentes: InterfaceFeed.jsx, InterfaceCard.jsx, InterfaceBuilder.jsx, InterfaceDetailModal.jsx, InterfaceHotspotOverlay.jsx.'
    },
    roles: ['Product Owner / Analista SDD', 'Arquitecto de Software'],
    dataUsage: [
      { key: 'TBL-PS-07:c1', tableId: 'TBL-PS-07', tableName: 'interfaces', tableLabel: 'Especificaciones de Interfaces UI/UX', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-07:c4', tableId: 'TBL-PS-07', tableName: 'interfaces', tableLabel: 'Especificaciones de Interfaces UI/UX', schema: 'public', attribute: 'title', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-08:c2', tableId: 'TBL-PS-08', tableName: 'interface_roles', tableLabel: 'Roles Autorizados por Interfaz', schema: 'public', attribute: 'role_name', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-11:c6', tableId: 'TBL-PS-11', tableName: 'interface_data_usage', tableLabel: 'Trazabilidad de Datos por Interfaz', schema: 'public', attribute: 'attribute_name', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-03',
    author: 'Elena Morales',
    reviewedBy: 'Product Owner',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-07',
    projectId: 'pathrimonio-site',
    number: '7',
    title: 'Arquitectura de Software & Visor Archify (.html)',
    fullName: '7. Arquitectura de Software & Visor Archify (.html)',
    module: 'Arquitectura & Visor Archify (.html)',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'architecture',
    fields: {
      objetivo:
        'Renderizar directamente en el portal los diagramas interactivos .html generados por la skill archify 3.3, junto a capas Clean, contratos MCP, matriz DoD y diagnóstico IA.',
      contenido:
        'Botón "Sincronizar con archify", selector multi-diagrama, <iframe> fullscreen/embed responsivo, alternador oscuro/claro, carga de .html local y pestañas Capas/C4/Métodos/Trazabilidad/Salud.',
      reglas:
        'Prioridad de fuentes: Sync Localhost (/api/archify/sync) > Supabase Realtime (project_architecture_artifacts) > Bundle estático /archify/manifest.json.',
      detalles: 'Implementado en SoftwareArchitectureView.jsx, archiflyAiService.js y vite.config.js.'
    },
    roles: ['Arquitecto de Software', 'Administrador Sistémico', 'Agente IA / MCP (pathrimonio-files)'],
    dataUsage: [
      { key: 'TBL-PS-15:c3', tableId: 'TBL-PS-15', tableName: 'project_architecture_artifacts', tableLabel: 'Diagramas Interactivos Archify (.html)', schema: 'public', attribute: 'slug', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-15:c5', tableId: 'TBL-PS-15', tableName: 'project_architecture_artifacts', tableLabel: 'Diagramas Interactivos Archify (.html)', schema: 'public', attribute: 'html_content', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-14:c6', tableId: 'TBL-PS-14', tableName: 'file_records', tableLabel: 'Métodos y Contratos Abstractos por Archivo', schema: 'public', attribute: 'signature', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-06',
    author: 'Arquitecto Principal',
    reviewedBy: 'Administrador Sistémico',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-08',
    projectId: 'pathrimonio-site',
    number: '8',
    title: 'Arquitectura de Datos, Importador SQL & DER',
    fullName: '8. Arquitectura de Datos, Importador SQL & DER',
    module: 'Modelado de Datos & DDL SQL',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'database',
    fields: {
      objetivo:
        'Gestionar el catálogo completo de tablas por proyecto, importar scripts DDL .sql en un clic y visualizar el Diagrama Entidad-Relación (DER).',
      contenido:
        'DataModelControlsBar, DataModelFeed, DataModelBuilder, DataModelDetailModal, SQLScriptModal (parser SQL real) y DERModal.',
      reglas:
        'Detecta automáticamente PK, NOT NULL, UNIQUE, FOREIGN KEY y DEFAULT generando DDL SQL y PlantUML listos para copiar o descargar.',
      detalles: 'Componentes: DataModelFeed.jsx, DataModelBuilder.jsx, SQLScriptModal.jsx, DERModal.jsx.'
    },
    roles: ['Arquitecto de Software', 'Administrador Sistémico'],
    dataUsage: [
      { key: 'TBL-PS-09:c3', tableId: 'TBL-PS-09', tableName: 'data_models', tableLabel: 'Modelado de Tablas y Almacenamiento', schema: 'public', attribute: 'table_name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-10:c3', tableId: 'TBL-PS-10', tableName: 'data_model_attributes', tableLabel: 'Atributos y Restricciones de Tablas', schema: 'public', attribute: 'name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-10:c4', tableId: 'TBL-PS-10', tableName: 'data_model_attributes', tableLabel: 'Atributos y Restricciones de Tablas', schema: 'public', attribute: 'data_type', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-04',
    author: 'Arquitecto Principal',
    reviewedBy: 'Administrador Sistémico',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-09',
    projectId: 'pathrimonio-site',
    number: '9',
    title: 'Explorador de Árbol de Archivos & Métodos AST (MCP)',
    fullName: '9. Explorador de Árbol de Archivos & Métodos AST (MCP)',
    module: 'Árbol de Archivos & MCP AST',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'files_tree',
    fields: {
      objetivo:
        'Inspeccionar el árbol de carpetas y archivos del proyecto real junto con cada método, clase, hook, componente y tabla registrada vía MCP o importador de carpeta.',
      contenido:
        'FilesControlsBar (acceso rápido a "Arquitectura archify"), ProjectTreeView en panel dividido, buscador global y modal TreeFileDetailModal para editar/ver métodos.',
      reglas:
        'Sincronizado vía Supabase Realtime; cambios desde agentes de código con sync_modified_file o sync_directory_from_disk aparecen sin recargar.',
      detalles: 'Implementado en ProjectTreeView.jsx, TreeFileDetailModal.jsx, FolderImportModal.jsx y mcp/abstractExtractor.mjs.'
    },
    roles: ['Agente IA / MCP (pathrimonio-files)', 'Arquitecto de Software', 'Administrador Sistémico'],
    dataUsage: [
      { key: 'TBL-PS-13:c4', tableId: 'TBL-PS-13', tableName: 'project_tree_nodes', tableLabel: 'Árbol Real de Carpetas y Archivos (MCP)', schema: 'public', attribute: 'path', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-13:c6', tableId: 'TBL-PS-13', tableName: 'project_tree_nodes', tableLabel: 'Árbol Real de Carpetas y Archivos (MCP)', schema: 'public', attribute: 'record_count', type: 'INTEGER', isPrimary: false },
      { key: 'TBL-PS-14:c5', tableId: 'TBL-PS-14', tableName: 'file_records', tableLabel: 'Métodos y Contratos Abstractos por Archivo', schema: 'public', attribute: 'name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-14:c6', tableId: 'TBL-PS-14', tableName: 'file_records', tableLabel: 'Métodos y Contratos Abstractos por Archivo', schema: 'public', attribute: 'signature', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-05',
    author: 'Carlos D.',
    reviewedBy: 'Arquitecto de Software',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-10',
    projectId: 'pathrimonio-site',
    number: '10',
    title: 'Entregables, Manifiestos & Subida de Archivos',
    fullName: '10. Entregables, Manifiestos & Subida de Archivos',
    module: 'Árbol de Archivos & MCP AST',
    status: 'Aprobado por Cliente',
    platform: 'Web & Mobile',
    image: null,
    imagePlaceholder: 'files_grid',
    fields: {
      objetivo:
        'Catalogar entregables clave del software (builds APK/AAB, especificaciones PRD, SQL DDLs, actas aprobadas) con exportación de manifiesto JSON.',
      contenido:
        'Vista alternable Lista / Árbol, FileFeed, FileCard, FileUploader drag-and-drop y FileDetailModal con previsualización.',
      reglas: 'Clasifica estado (Vigente/Oficial, Aprobado por Cliente, Borrador) y calcula peso total del proyecto.',
      detalles: 'Componentes: FileFeed.jsx, FileCard.jsx, FileUploader.jsx, FileDetailModal.jsx.'
    },
    roles: ['Product Owner / Analista SDD', 'Administrador Sistémico'],
    dataUsage: [
      { key: 'TBL-PS-12:c1', tableId: 'TBL-PS-12', tableName: 'files', tableLabel: 'Entregables y Documentos del Proyecto', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-12:c3', tableId: 'TBL-PS-12', tableName: 'files', tableLabel: 'Entregables y Documentos del Proyecto', schema: 'public', attribute: 'name', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-12:c5', tableId: 'TBL-PS-12', tableName: 'files', tableLabel: 'Entregables y Documentos del Proyecto', schema: 'public', attribute: 'format', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-05',
    author: 'Sofía V.',
    reviewedBy: 'Administrador Sistémico',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-11',
    projectId: 'pathrimonio-site',
    number: '11',
    title: 'Backlog, Sprints & Docs de Arquitectura',
    fullName: '11. Backlog, Sprints & Docs de Arquitectura',
    module: 'Actores, Historias & Trazabilidad',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'analytics',
    fields: {
      objetivo:
        'Proveer vistas de planificación ágil (Backlog consolidado y Sprints) junto a la documentación de estándares SDD del portal.',
      contenido:
        'Subvistas BacklogView, SprintsView y DocsView renderizadas a ancho completo dentro del workspace.',
      reglas:
        'Las tarjetas del backlog toman dinámicamente las historias del proyecto activo.',
      detalles: 'Implementado en src/components/portal/ExtraViews.jsx.'
    },
    roles: ['Product Owner / Analista SDD', 'Arquitecto de Software'],
    dataUsage: [
      { key: 'TBL-PS-05:c1', tableId: 'TBL-PS-05', tableName: 'stories', tableLabel: 'Historias de Usuario (US)', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true }
    ],
    linkedStory: 'US-PS-02',
    author: 'Sofía V.',
    reviewedBy: 'Administrador Sistémico',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  },
  {
    id: 'INT-PS-12',
    projectId: 'pathrimonio-site',
    number: '12',
    title: 'Administración de Usuarios, Permisos & Miembros',
    fullName: '12. Administración de Usuarios, Permisos & Miembros',
    module: 'Autenticación & Control RBAC',
    status: 'Aprobado por Cliente',
    platform: 'Web / Desktop',
    image: null,
    imagePlaceholder: 'settings',
    fields: {
      objetivo:
        'Configurar la matriz de acceso por rol (pestañas visibles y acciones permitidas) e invitar o revocar miembros de proyectos específicos.',
      contenido:
        'Panel RBAC en AdminUsersView, modal InviteProjectMemberModal y selector de roles (owner, editor, viewer).',
      reglas:
        'Solo usuarios con permiso canManageUsers / rol Admin pueden modificar accesos y membresías en project_members.',
      detalles: 'Componentes: AdminUsersView.jsx, InviteProjectMemberModal.jsx, permissionsConfig.js.'
    },
    roles: ['Administrador Sistémico'],
    dataUsage: [
      { key: 'TBL-PS-02:c1', tableId: 'TBL-PS-02', tableName: 'portal_users', tableLabel: 'Perfiles y Roles del Portal', schema: 'public', attribute: 'id', type: 'TEXT', isPrimary: true },
      { key: 'TBL-PS-03:c3', tableId: 'TBL-PS-03', tableName: 'project_members', tableLabel: 'Membresías por Proyecto', schema: 'public', attribute: 'user_id', type: 'TEXT', isPrimary: false },
      { key: 'TBL-PS-03:c4', tableId: 'TBL-PS-03', tableName: 'project_members', tableLabel: 'Membresías por Proyecto', schema: 'public', attribute: 'role', type: 'TEXT', isPrimary: false }
    ],
    linkedStory: 'US-PS-01',
    author: 'Administrador Sistémico',
    reviewedBy: 'Arquitecto de Software',
    approvedAt: '2026-11-24',
    version: 'v1.0'
  }
];

export const PATHRIMONIO_SITE_FILES = [
  {
    id: 'FILE-PS-01',
    projectId: 'pathrimonio-site',
    name: '20261121000100_init.sql',
    category: 'Arquitectura & SQL',
    format: 'sql',
    sizeBytes: 11240,
    sizeFormatted: '11.0 KB',
    version: 'v1.0',
    status: 'Vigente / Oficial',
    uploadedBy: 'Arquitecto Principal',
    uploadedAt: '2026-11-21',
    description:
      'Esquema relacional base de Pathrimonio Site en PostgreSQL (projects, portal_users, actors, stories, story_criteria, interfaces, interface_roles, data_models, data_model_attributes, interface_data_usage, files) con triggers y políticas RLS.',
    tags: ['PostgreSQL', 'Supabase', 'RLS', 'Esquema Base'],
    linkedEntity: 'US-PS-04 (Modelado de Datos & DDL SQL)',
    downloadUrl: '#file-ps-init',
    contentPreview: 'CREATE TABLE IF NOT EXISTS public.projects (...); -- + 11 tablas núcleo SDD'
  },
  {
    id: 'FILE-PS-02',
    projectId: 'pathrimonio-site',
    name: '20261123000100_project_tree.sql',
    category: 'Arquitectura & SQL',
    format: 'sql',
    sizeBytes: 5120,
    sizeFormatted: '5.0 KB',
    version: 'v1.1',
    status: 'Vigente / Oficial',
    uploadedBy: 'Carlos D.',
    uploadedAt: '2026-11-23',
    description:
      'Tablas project_tree_nodes y file_records junto a triggers de conteo automático (record_count) y RPC replace_project_tree para indexar repositorios sin exponer cuerpos.',
    tags: ['Project Tree', 'AST', 'File Records', 'Triggers'],
    linkedEntity: 'US-PS-05 (Árbol de Archivos & MCP AST)',
    downloadUrl: '#file-ps-tree',
    contentPreview: 'CREATE TABLE IF NOT EXISTS public.project_tree_nodes (...); CREATE TABLE IF NOT EXISTS public.file_records (...);'
  },
  {
    id: 'FILE-PS-03',
    projectId: 'pathrimonio-site',
    name: '20261124000100_mcp_sync_realtime.sql',
    category: 'Arquitectura & SQL',
    format: 'sql',
    sizeBytes: 4480,
    sizeFormatted: '4.4 KB',
    version: 'v1.0',
    status: 'Vigente / Oficial',
    uploadedBy: 'Carlos D.',
    uploadedAt: '2026-11-24',
    description:
      'Habilita Supabase Realtime en file_records, project_tree_nodes y projects más RPC upsert_project_tree_nodes para preservar node_id UUID al actualizar desde MCP.',
    tags: ['Realtime', 'MCP', 'Upsert RPC'],
    linkedEntity: 'US-PS-05 (Árbol de Archivos & MCP AST)',
    downloadUrl: '#file-ps-realtime',
    contentPreview: 'ALTER PUBLICATION supabase_realtime ADD TABLE public.file_records, public.project_tree_nodes;'
  },
  {
    id: 'FILE-PS-04',
    projectId: 'pathrimonio-site',
    name: '20261124000200_archify_artifacts.sql',
    category: 'Arquitectura & SQL',
    format: 'sql',
    sizeBytes: 1960,
    sizeFormatted: '1.9 KB',
    version: 'v1.0',
    status: 'Vigente / Oficial',
    uploadedBy: 'Arquitecto Principal',
    uploadedAt: '2026-11-24',
    description:
      'Crea public.project_architecture_artifacts con publicación Realtime para almacenar y renderizar los diagramas interactivos HTML generados por archify.',
    tags: ['Archify', 'HTML', 'Realtime', 'Supabase'],
    linkedEntity: 'US-PS-06 (Visor Archify)',
    downloadUrl: '#file-ps-archify-sql',
    contentPreview: 'CREATE TABLE IF NOT EXISTS public.project_architecture_artifacts (...);'
  },
  {
    id: 'FILE-PS-05',
    projectId: 'pathrimonio-site',
    name: 'MCP_Registro_Archivos_y_Metodos.md',
    category: 'Documentación & PRD',
    format: 'md',
    sizeBytes: 4120,
    sizeFormatted: '4.0 KB',
    version: 'v1.1',
    status: 'Vigente / Oficial',
    uploadedBy: 'Carlos D.',
    uploadedAt: '2026-11-24',
    description:
      'Guía oficial del servidor MCP pathrimonio-files (12 herramientas para sincronizar archivos, firmas AST sin fuga de código y diagramas HTML Archify).',
    tags: ['MCP', 'Documentación', 'AST', 'Archify'],
    linkedEntity: 'US-PS-05 / US-PS-06',
    downloadUrl: '#file-ps-mcp-doc',
    contentPreview: 'Servidor MCP pathrimonio-files: list_projects, sync_modified_file, sync_directory_from_disk, publish_archify_html...'
  },
  {
    id: 'FILE-PS-06',
    projectId: 'pathrimonio-site',
    name: 'pathrimonio-site-architecture.html',
    category: 'Arquitectura & SQL',
    format: 'html',
    sizeBytes: 958584,
    sizeFormatted: '936.1 KB',
    version: 'archify 3.3.0',
    status: 'Vigente / Oficial',
    uploadedBy: 'Skill archify CLI',
    uploadedAt: '2026-11-24',
    description:
      'Diagrama interactivo showcase de la arquitectura de Pathrimonio Site compilado y validado con archify 3.3.0.',
    tags: ['Archify', 'Diagrama Interactivo', 'HTML', 'Showcase'],
    linkedEntity: 'US-PS-06 / INT-PS-07',
    downloadUrl: '/archify/pathrimonio-site-architecture.html',
    contentPreview: '<!DOCTYPE html><html lang="es"><meta name="generator" content="archify 3.3.0">...'
  }
];

export const PATHRIMONIO_SITE_ARCHITECTURE = {
  projectId: 'pathrimonio-site',
  projectName: 'Pathrimonio Site — Portal SDD & Arquitectura',
  architecturePattern: 'Modular React Portal + MCP AST Bridge + Supabase Realtime + Archify HTML',
  version: 'v1.0.0',
  synthesizedBy: 'archify Engine v3.3 (AST & HTML Mode)',
  lastAnalyzed: '2026-11-24T16:15:00-05:00',
  tokenSavingsPercent: 96.1,
  auditStatus: 'Certificada (Cero Fuga de Código)',
  summary:
    'Plataforma web corporativa y workspace SDD construida en React 18, Vite y Tailwind CSS sobre Supabase PostgreSQL y Supabase Realtime. Integra un servidor MCP en Node.js con análisis AST vía TypeScript Compiler API para registrar archivos y firmas abstractas reales sin exponer implementaciones privadas ni secretos, junto a un visor embebido de diagramas HTML generados por archify.',
  metrics: {
    layersCount: 4,
    abstractMethodsCount: 48,
    tracedStoriesPercent: 100,
    tokenReductionRatio: '21.5x',
    offlineReadiness: 'Respaldo Local JSON / HTML + Supabase Cloud',
    dipCompliance: '100% Separación UI / Servicios / Datos / MCP'
  },
  layers: [
    {
      id: 'presentation',
      name: 'Capa 1: Presentación Web & Portal SDD',
      badge: 'UI/UX',
      colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description:
        'Componentes React de landing corporativa y subpantallas operativas de ancho completo (Actores, Historias, Interfaces/Hotspots, Datos/DER, Árbol de Archivos y Visor Interactivo Archify).',
      components: [
        {
          name: 'App (Root Workspace Orchestrator)',
          path: 'src/App.jsx',
          type: 'screen',
          abstractMethods: [
            { symbol: 'App', signature: 'export default function App(): JSX.Element', visibility: 'public', isAsync: false, line: 105, doc: 'Enruta Landing vs Portal, tema dark/light, estado de workspace y suscripciones Realtime.' },
            { symbol: 'handleSaveArchitectureArtifact', signature: 'handleSaveArchitectureArtifact(artifactPayload: ArchifyArtifact): Promise<ArchifyArtifact>', visibility: 'public', isAsync: true, line: 702, doc: 'Persiste un .html de Archify y actualiza el estado del portal.' }
          ]
        },
        {
          name: 'SoftwareArchitectureView',
          path: 'src/components/portal/SoftwareArchitectureView.jsx',
          type: 'screen',
          abstractMethods: [
            { symbol: 'handleSyncArchify', signature: 'handleSyncArchify(customPathOverride?: string): Promise<void>', visibility: 'public', isAsync: true, line: 340, doc: 'Sincroniza desde localhost bridge / Supabase / bundle estático y renderiza el iframe Archify.' },
            { symbol: 'handleLocalHtmlUpload', signature: 'handleLocalHtmlUpload(event: ChangeEvent<HTMLInputElement>): Promise<void>', visibility: 'public', isAsync: true, line: 410, doc: 'Carga un .html local generado con archify, lo renderiza y lo publica en Supabase.' },
            { symbol: 'prepareArchifySrcDoc', signature: 'prepareArchifySrcDoc(rawHtml: string, opts?: { theme: string; embed: boolean }): string', visibility: 'public', isAsync: false, line: 18, doc: 'Inyecta preferencia de tema y modo embed antes de montar el srcDoc del iframe.' }
          ]
        },
        {
          name: 'ProjectTreeView & InterfaceHotspotOverlay',
          path: 'src/components/portal/ProjectTreeView.jsx',
          type: 'component',
          abstractMethods: [
            { symbol: 'ProjectTreeView', signature: 'export default function ProjectTreeView(props: TreeProps): JSX.Element', visibility: 'public', isAsync: false, line: 15, doc: 'Explorador de carpetas/archivos con insignia Live Sync MCP y detalle de métodos.' },
            { symbol: 'InterfaceHotspotOverlay', signature: 'export default function InterfaceHotspotOverlay(props: OverlayProps): JSX.Element', visibility: 'public', isAsync: false, line: 1, doc: 'Renderiza zonas clicables sobre mockups enlazadas a pantallas o columnas DDL.' }
          ]
        }
      ]
    },
    {
      id: 'application',
      name: 'Capa 2: Servicios, RBAC & Puentes de Sincronización',
      badge: 'USE CASES',
      colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
      description:
        'Control de acceso RBAC, puente Vite localhost (/api/archify/sync), cliente de datos Supabase e integración opcional con proveedores de IA (Gemini / OpenAI / DeepSeek).',
      components: [
        {
          name: 'archifyLocalDevPlugin (Vite Bridge)',
          path: 'vite.config.js',
          type: 'service',
          abstractMethods: [
            { symbol: 'archifyLocalDevPlugin', signature: 'archifyLocalDevPlugin(): VitePlugin', visibility: 'private', isAsync: false, line: 112, doc: 'Middleware exclusivo de localhost POST /api/archify/sync que escanea .html/.archify y ejecuta archify.mjs.' },
            { symbol: 'parseArchifyHtmlMeta', signature: 'parseArchifyHtmlMeta(filePath: string, projectId: string): ArchifyArtifact', visibility: 'private', isAsync: false, line: 78, doc: 'Extrae título, versión del generador, slug normalizado y tamaño en bytes.' }
          ]
        },
        {
          name: 'archiflyAiService & ExportUtils',
          path: 'src/services/archiflyAiService.js',
          type: 'service',
          abstractMethods: [
            { symbol: 'analyzeArchitectureWithAi', signature: 'export async function analyzeArchitectureWithAi(params: AiAnalysisParams): Promise<AiResult>', visibility: 'public', isAsync: true, line: 169, doc: 'Sintetiza capas y contratos mediante API IA externa o motor determinista offline.' },
            { symbol: 'parseSQLScript', signature: 'export function parseSQLScript(sqlString: string, defaultProjectId?: string): DataModel[]', visibility: 'public', isAsync: false, line: 951, doc: 'Parser DDL SQL para poblar el modelador de datos desde scripts PostgreSQL.' }
          ]
        }
      ]
    },
    {
      id: 'domain',
      name: 'Capa 3: Reglas RBAC, Contratos SDD & Extracción AST',
      badge: 'DOMAIN',
      colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'Reglas de permisos RBAC, parser AST basado en TypeScript Compiler sin exposición de cuerpos y modelos iniciales del ecosistema Pathrimonio.',
      components: [
        {
          name: 'AbstractExtractor (AST Zero-Code Leakage)',
          path: 'mcp/abstractExtractor.mjs',
          type: 'entity',
          abstractMethods: [
            { symbol: 'extractAbstractRecordsFromFile', signature: 'export function extractAbstractRecordsFromFile(filePath: string, extension?: string): FileRecord[]', visibility: 'public', isAsync: false, line: 410, doc: 'Extrae clases, métodos, componentes React, hooks, SQL DDL y endpoints sin incluir implementaciones.' },
            { symbol: 'scanLocalDirectory', signature: 'export function scanLocalDirectory(repoRoot: string, opts?: ScanOptions): DirectoryScanResult', visibility: 'public', isAsync: false, line: 540, doc: 'Recorre un proyecto respetando carpetas ignoradas y límites seguros de lectura.' }
          ]
        },
        {
          name: 'PermissionsConfig & PricingRules',
          path: 'src/auth/permissionsConfig.js',
          type: 'entity',
          abstractMethods: [
            { symbol: 'SYSTEM_MODULES', signature: 'export const SYSTEM_MODULES: ModuleDescriptor[]', visibility: 'public', isAsync: false, line: 6, doc: 'Definición canónica de módulos y permisos RBAC por rol.' }
          ]
        }
      ]
    },
    {
      id: 'infrastructure',
      name: 'Capa 4: Persistencia Supabase, Realtime & Servidor MCP',
      badge: 'INFRA',
      colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description:
        'Repositorios PostgreSQL en Supabase (15 tablas con RLS y Realtime), servidor MCP stdio de 12 herramientas y archivos estáticos desplegados en Vercel Edge.',
      components: [
        {
          name: 'PathrimonioFilesMcpServer',
          path: 'mcp/pathrimonio-mcp-server.mjs',
          type: 'adapter',
          abstractMethods: [
            { symbol: 'sync_modified_file', signature: 'tool sync_modified_file(project_id, local_file_path, repo_root): Promise<McpResult>', visibility: 'public', isAsync: true, line: 720, doc: 'Indexa un archivo modificado y sincroniza sus métodos abstractos en Supabase Realtime.' },
            { symbol: 'sync_directory_from_disk', signature: 'tool sync_directory_from_disk(project_id, directory_path, prune_missing): Promise<McpResult>', visibility: 'public', isAsync: true, line: 890, doc: 'Sincronización incremental del repositorio completo hacia project_tree_nodes y file_records.' },
            { symbol: 'publish_archify_html', signature: 'tool publish_archify_html(project_id, html_file_path, slug, is_primary): Promise<McpResult>', visibility: 'public', isAsync: true, line: 1085, doc: 'Publica un .html de Archify directamente en Supabase para renderizarlo en el portal.' }
          ]
        },
        {
          name: 'SupabaseDataClient',
          path: 'src/lib/supabaseData.js',
          type: 'repository',
          abstractMethods: [
            { symbol: 'fetchWorkspace', signature: 'export async function fetchWorkspace(): Promise<WorkspaceSnapshot>', visibility: 'public', isAsync: true, line: 250, doc: 'Carga inicial paralela de proyectos, historias, interfaces, modelos, actores y archivos.' },
            { symbol: 'fetchProjectArchitectureArtifacts', signature: 'export async function fetchProjectArchitectureArtifacts(projectId: string): Promise<ArchifyArtifact[]>', visibility: 'public', isAsync: true, line: 728, doc: 'Recupera los diagramas interactivos .html almacenados para el proyecto activo.' }
          ]
        }
      ]
    }
  ],
  mermaidDiagram: `flowchart TD
  subgraph Presentation["Capa 1: UI Web React 18 + Vite"]
    UI_Portal["App / Workspace Portal (10 Vistas)"]
    UI_Arch["SoftwareArchitectureView (Visor Archify HTML)"]
    UI_Tree["ProjectTreeView (Árbol + Métodos AST)"]
  end

  subgraph Application["Capa 2: Servicios & Puente Local"]
    Srv_Vite["Vite Dev Middleware (/api/archify/sync)"]
    Srv_Data["supabaseData.js + Parser DDL SQL"]
  end

  subgraph Domain["Capa 3: AST & Reglas Zero-Code Leakage"]
    Dom_AST["abstractExtractor.mjs (TypeScript AST)"]
    Dom_RBAC["permissionsConfig.js (RBAC)"]
  end

  subgraph Infrastructure["Capa 4: MCP + Supabase Cloud + Archify CLI"]
    MCP_Srv["pathrimonio-mcp-server.mjs (12 Tools stdio)"]
    CLI_Arch["archify.mjs v3.3.0 (Render HTML Showcase)"]
    DB_Supa[("Supabase PostgreSQL 15 (15 Tablas + Realtime)")]
  end

  UI_Arch -->|localhost| Srv_Vite
  UI_Portal -->|CRUD / Realtime| Srv_Data
  UI_Tree -->|live subscription| DB_Supa
  Srv_Vite -->|invoca| CLI_Arch
  MCP_Srv -->|usa| Dom_AST
  MCP_Srv -->|escribe AST & HTML| DB_Supa
  Srv_Data -->|SQL / Auth| DB_Supa`,
  traceabilityMatrix: [
    {
      storyId: 'US-PS-05',
      storyTitle: 'Sincronización de árbol real y métodos abstractos vía MCP AST',
      interfaceId: 'INT-PS-09',
      interfaceName: 'Explorador de Árbol de Archivos & Métodos AST (MCP)',
      abstractMethod: 'AbstractExtractor.extractAbstractRecordsFromFile(...)',
      domainModel: 'project_tree_nodes + file_records',
      doDCriterion: 'Reflejo inmediato en Realtime sin exponer cuerpos de funciones ni secretos.',
      status: 'Auditado'
    },
    {
      storyId: 'US-PS-06',
      storyTitle: 'Renderizado interactivo de diagramas Archify (.html) en Arquitectura',
      interfaceId: 'INT-PS-07',
      interfaceName: 'Arquitectura de Software & Visor Archify (.html)',
      abstractMethod: 'SoftwareArchitectureView.handleSyncArchify(...)',
      domainModel: 'project_architecture_artifacts',
      doDCriterion: 'Renderizado en iframe responsivo con puente localhost, carga local y Realtime.',
      status: 'Auditado'
    },
    {
      storyId: 'US-PS-04',
      storyTitle: 'Modelado relacional DDL y generación DER',
      interfaceId: 'INT-PS-08',
      interfaceName: 'Arquitectura de Datos, Importador SQL & DER',
      abstractMethod: 'parseSQLScript(...)',
      domainModel: 'data_models + data_model_attributes',
      doDCriterion: 'Extracción automática de tablas, tipos, PK y FK desde migraciones PostgreSQL.',
      status: 'Auditado'
    }
  ],
  diagnostics: {
    dipCompliance: '100% — Separación clara entre UI React, puentes de sincronización, AST de dominio e infraestructura Supabase.',
    zeroLeakageScore: '100% — abstractExtractor.mjs descarta cuerpos de funciones y secretos.',
    offlineReadiness: 'Híbrida — Respaldo local de catálogos + /archify/manifest.json con sincronización Supabase Realtime.',
    cyclomaticComplexity: '1.3 (Promedio modular)',
    recommendations: [
      'Mantener ejecutado sync_directory_from_disk vía MCP cuando se creen o refactoricen componentes principales en src/ o mcp/.',
      'Regenerar y publicar pathrimonio-site-architecture.html vía publish_archify_html al añadir nuevos subsistemas.'
    ]
  }
};

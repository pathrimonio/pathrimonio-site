# Documento de Diseño de Software (SDD) — Agente **Pathcom** (`pathrimonio.site`)

## 1. Propósito y Alcance

Este documento especifica la arquitectura técnica, el modelo de datos y las herramientas del agente **Pathcom** (*Pathrimonio Community & Operations Manager*) dentro de `pathrimonio.site`.

### Alcance de la v1

1. **Gestión de Proyectos y Sitio Web:** Administración asistida de proyectos activos de Pathrimonio Company (`site_projects`), borradores de contenido web y seguimiento de expedientes (Cotizador y Formalia).
2. **Registro Cronológico de Rutas (*Path Logs*):** Captura y visualización de avances paso a paso con **fecha y hora exacta** verificada en servidor (`recorded_at` en UTC + `client_timezone`), permitiendo ver el progreso real tal cual ocurre.
3. **Pathrimonio Market (Conocimiento Validado):** Conversión de registros de ruta en guías estructuradas (`market_paths`), calificación por pares (`path_validations`) y publicación de conocimiento validado con trazabilidad hacia los `path_logs` originales.
4. **Puente con Pathway:** Sincronización de métricas e insignias de progreso desde la app Pathway hacia `path_logs` sin duplicados.

### Fuera de alcance (Fase Futura)

* **Clubes específicos (ej. Pathrimonio Fit):** El módulo de clubes queda reservado únicamente como una extensión desacoplada (*feature flag* `pathcom_modules.clubs_enabled = false` en `platform_settings`) hasta definir su modelo operativo.

---

## 2. Arquitectura del Agente y Gobernanza

Pathcom opera mediante un router unificado serverless (`api/v1/pathcom.js`, manteniendo el límite de ≤ 12 Serverless Functions en Vercel Hobby) basado en **Tool Calling** con validación estricta de permisos (**RBAC**) en servidor y compuertas de aprobación humana (**Human-in-the-Loop**).

### 2.1 Matriz de Acceso por Rol (`portal_users.role` normalizado)

| Rol | Capacidades frente a Pathcom |
| --- | --- |
| **`guest`** | Consultar catálogo público de *Pathrimonio Market* y proyectos publicados (`is_published = true`). |
| **`user`** | Registrar sus avances de ruta (hora sellada en servidor), proponer rutas para *Pathrimonio Market* y calificar rutas de otros integrantes. |
| **`partner`** | Todo lo de `user` + consultar estado de sus proyectos contratados, créditos de socio y sincronizar avances con **Pathway**. |
| **`collaborator`** | Gestionar borradores (`DRAFT`) en `site_projects`, revisar expedientes de Formalia, moderar validaciones en *Pathrimonio Market* y encolar solicitudes CMS. |
| **`admin`** | Orquestación completa y aprobación/rechazo en `pathcom_action_queue` para publicar en producción o certificar `PATRIMONIO_VALIDADO`. |

### 2.2 Compuertas de Aprobación (*Human-in-the-Loop*)

* **Ejecución directa:** Consultas públicas/autorizadas, creación de `path_logs`, compilación en estado `DRAFT`/`PEER_REVIEW` y calificaciones comunitarias.
* **Cola de aprobación (`pathcom_action_queue`):** Publicar cambios en `site_projects` hacia la landing, promover un recurso a `PATRIMONIO_VALIDADO` con beneficios comerciales o modificar estados operativos.

---

## 3. Modelo de Datos Relacional (`supabase/migrations/20261128020000_pathcom_v1.sql`)

* `public.path_logs` — registros cronológicos con `recorded_at` (`TIMESTAMPTZ` sellado en servidor), `client_timezone`, `duration_minutes`, `progress_percent`, `source` (`WEB` | `PATHWAY`) y `market_path_id`.
* `public.market_paths` — guías compiladas (`steps_json`) con estados `DRAFT` | `PEER_REVIEW` | `VALIDATED`, `avg_rating` y `validations_count`.
* `public.path_validations` — calificaciones 1–5 y reseñas ponderadas (`validator_weight`) de la comunidad.
* `public.site_projects` — proyectos públicos con columnas espejo `draft_name`, `draft_status`, `draft_summary` y `cms_state` (`DRAFT` | `PUBLISHED`).
* `public.pathcom_action_queue` — cola auditable (`PENDING` | `APPROVED` | `REJECTED`).
* `public.pathcom_chat_messages` — historial conversacional persistente de Pathcom por usuario.

---

## 4. Implementación Modular

* **Política y Herramientas Declarativas:** `src/lib/pathcom/rbacPolicy.js`, `src/lib/pathcom/toolExecutor.js`, `src/lib/pathcom/agentEngine.js`
* **Servidor y Persistencia:** `api/v1/pathcom.js`, `api/_lib/pathcomStore.js`, `vercel.json` (rewrites `/api/v1/pathcom/*`, `/api/v1/paths/*`, `/api/v1/market/*`)
* **Cliente y UI:** `src/services/pathcomService.js`, `src/components/pathcom/PathcomConsole.jsx`, `PathTimeline.jsx`, `PathMarketView.jsx`, `PathcomApprovalsQueue.jsx`

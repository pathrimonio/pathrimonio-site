# MCP `pathrimonio-files` — Sincronización de Archivos y Métodos Abstractos

El servidor MCP **`pathrimonio-files`** (`mcp/pathrimonio-mcp-server.mjs`) conecta a los agentes que trabajan en los repositorios locales reales (`Pathway`, `SMATAD`, `Core Hub`, `Portal Admin`, etc.) con la base de datos de **Pathrimonio** en Supabase (`project_tree_nodes` y `file_records`).

Cada modificación realizada mediante MCP dispara eventos en **Supabase Realtime**, por lo que los cambios en archivos y firmas de métodos se reflejan de forma automática e inmediata en el portal web (**Archivos & Manifiestos** y **Arquitectura de Software**).

---

## 1. Principio Zero-Code Leakage

El servidor MCP **nunca sube el cuerpo ni la lógica interna** de los archivos:
- Lee el archivo local usando el compilador TypeScript AST (`ts.createSourceFile`) para `.ts/.tsx/.js/.jsx/.mjs/.cjs` y extractores estructurales para `.py`, `.sql`, `.go`, `.java`, `.kt`, `.cs`, `.json`.
- Extrae exclusivamente nombres, tipos (`method`, `function`, `class`, `component`, `hook`, `interface`, `type`, `enum`, `table`, `route`), firmas tipadas, línea y comentario JSDoc corto.
- Descarta por completo implementaciones, variables internas y secretos.

---

## 2. Herramientas MCP Disponibles

| Herramienta | Propósito para el agente |
| :--- | :--- |
| **`list_projects`** | Obtiene los `project_id`, `roots` existentes y conteo de archivos y registros. |
| **`get_project_tree`** | Consulta archivos/carpetas de `project_tree_nodes` (filtra por ruta, búsqueda o registros). |
| **`sync_modified_file`** | **Uso recomendado tras editar un archivo real:** extrae firmas desde disco, crea/actualiza el nodo y sincroniza `file_records` (altas, cambios y bajas de métodos) en una sola llamada. |
| **`upsert_file_node`** | Crea o actualiza un nodo de archivo/carpeta (creando carpetas padre) **sin borrar** sus `file_records`. |
| **`rename_or_move_file_node`** | Mueve o renombra un archivo o subárbol completo preservando sus UUIDs y métodos asociados. |
| **`delete_file_node`** | Elimina un archivo o subárbol obsoleto (`recursive: true`). |
| **`list_file_records`** | Lista métodos/registros de un archivo específico o busca en todo el proyecto. |
| **`upsert_file_records`** | Inserta o actualiza manualmente métodos o registros en un archivo (opcional `replace_existing_for_file: true`). |
| **`delete_file_record`** | Elimina un método o registro específico. |
| **`sync_directory_from_disk`** | Sincronización incremental de un directorio completo respetando `.gitignore` y carpetas ignoradas, opcionalmente extrayendo firmas y podando archivos borrados. |

---

## 3. Flujo Recomendado para Agentes de Código

1. Al iniciar sesión en un proyecto real (ej. `F:\SMATAD\smatad-rn-prototype`), llama `list_projects` para confirmar `project_id` y `root_name`.
2. Cada vez que agregues, edites o elimines métodos en un archivo real, invoca:
   ```json
   {
     "project_id": "smatad",
     "repo_root": "F:\\SMATAD\\smatad-rn-prototype",
     "local_file_path": "F:\\SMATAD\\smatad-rn-prototype\\src\\services\\TripService.ts"
   }
   ```
   con la herramienta **`sync_modified_file`**.
3. Si renombras o mueves un archivo en el repo, llama **`rename_or_move_file_node`** para conservar su historial de registros abstractos.
4. Si eliminas un archivo del proyecto real, llama **`delete_file_node`**.

---

## 4. Configuración en Otros Repositorios / Agentes

En Antigravity ya queda registrado globalmente en:
- `C:\Users\jhan4\.gemini\antigravity\mcp_config.json`
- `C:\Users\jhan4\.gemini\config\mcp_config.json`

Para conectar otro cliente MCP (Cursor, Claude Code, Codex, o en otra máquina), copia `mcp/mcp_config.example.json` en `.mcp.json` del proyecto destino o define las variables de entorno:
- `PATHRIMONIO_SUPABASE_URL`
- `PATHRIMONIO_SUPABASE_SERVICE_ROLE_KEY` (o `PATHRIMONIO_SUPABASE_ANON_KEY` + `PATHRIMONIO_AGENT_EMAIL` + `PATHRIMONIO_AGENT_PASSWORD`).

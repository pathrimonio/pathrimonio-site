# SDD: Modo Local (`localhost`) y Manifiesto de Métodos Abstractos
**Módulo:** Files & Entregables · Pathrimonio Core  
**Fecha:** 2026-11-23  
**Estado:** Aprobado / En especificación técnica  

---

## 1. Visión y Justificación Arquitectónica

Separar la **lectura local del proyecto** de la **vista web de métodos abstractos** resuelve tres problemas estructurales críticos:
1. **Rendimiento instantáneo:** La carga del árbol y metadatos se realiza en milisegundos sin sobrecargar el hilo principal del navegador.
2. **Consumo óptimo de tokens para IA:** El analizador de arquitectura (`archifly`) consume únicamente un manifiesto ligero de contratos en lugar del código fuente completo.
3. **Privacidad y cero fuga de código:** El cuerpo de implementación (`body`), lógica de negocio, secretos y consultas internas **nunca se envían al navegador web, ni se almacenan en la base de datos ni salen de la máquina local**.

`localhost` opera como un **escáner local en vivo**, mientras que la aplicación web remota opera como un **visor ligero de firmas y contratos**.

---

## 2. Estrategia de Doble Modo (Local vs. Web)

El módulo `Files` en `src/components/portal/` detecta automáticamente el entorno de ejecución (`window.location.hostname`):

| Entorno | Fuente de Datos | Comportamiento |
| :--- | :--- | :--- |
| **`localhost` / `127.0.0.1` (Modo Escáner)** | Sistema de archivos local (`fs` vía Vite middleware o *File System Access API*). | Escanea el subárbol de archivos en < 150 ms, parsea firmas de métodos en memoria y actualiza la vista reactivamente. |
| **Producción / Web (Modo Visor)** | Manifiesto JSON persistido (`methods.manifest.json` o Supabase `project_files`). | Renderiza el árbol y las firmas abstractas sincronizadas sin requerir acceso al disco ni exponer código fuente. |

---

## 3. Mecanismo de Lectura y Filtrado en `localhost`

### A. Middleware Local en Vite (`POST /api/local/scan`) — *Vía Primaria*
* Registrado en `vite.config.js` mediante plugin personalizado (`localScannerPlugin`).
* **Guardia de seguridad:** Activo exclusivamente si `NODE_ENV === 'development'` y la cabecera `host` pertenece a `localhost` o `127.0.0.1`. Cualquier otra solicitud rechaza con `403 Forbidden`.

### B. File System Access API (`window.showDirectoryPicker`) — *Vía Fallback en Navegador*
* Para navegadores Chromium en entornos donde no se disponga del middleware local.
* Procesa la lectura mediante un *Web Worker* aislado.

### Reglas de Exclusión Obligatoria
* Respeto estricto a directivas de `.gitignore`.
* Exclusiones por defecto: `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `.vercel/`, `.expo/`, `coverage/`, temporales y archivos binarios (`.exe`, `.apk`, `.zip`, `.png`, etc.).
* Límite de tamaño: Archivos superiores a 500 KB se indexan en el árbol pero se excluyen del parseo de AST.
* **Escaneo diferido (*Lazy Parsing*):** Se indexa inicialmente la jerarquía de rutas; el análisis de métodos de un archivo se ejecuta al seleccionarlo o al pulsar **"Sincronizar con archifly"**.

---

## 4. Extracción de Métodos Abstractos (AST sin Implementación)

El motor de extracción recorre el árbol de sintaxis abstracta (AST) de cada archivo soportado (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.rs`, `.go`):

```
┌──────────────────────────────────────────────┐
│                  ARCHIVO                     │
│  export class QuoteService {                 │
│    public calculateTotal(roles: number): T { │ ──► EXTRAER FIRMA (Signature)
│      const factor = 1.25;                    │ ──► DESCARTAR (Body)
│      return db.query(...);                   │ ──► DESCARTAR (Body)
│    }                                         │
│  }                                           │
└──────────────────────────────────────────────┘
```

* **Campos capturados:** Ruta relativa, módulo/clase contenedora, nombre del método (`symbol_id`), visibilidad (`public`, `private`, `protected`), modificadores (`async`, `static`, `abstract`), parámetros con tipado, tipo de retorno y número de línea.
* **Campos estrictamente omitidos:** Cuerpo de funciones (`body`), variables internas, consultas SQL, comentarios privados e implementaciones algorítmicas.

---

## 5. Contrato del Manifiesto Ligero (`methods.manifest.json`)

```json
{
  "project_root": "pathrimonio-core",
  "scanned_at": "2026-11-23T13:31:00-05:00",
  "source_mode": "LOCALHOST_FS",
  "tree": [
    {
      "path": "src/modules/quotes/quote.service.ts",
      "type": "file",
      "language": "typescript",
      "abstract_methods": [
        {
          "symbol_id": "QuoteService.calculateMonthlyTotal",
          "signature": "public calculateMonthlyTotal(rolesCount: number, isPartner: boolean): PricingSummary",
          "visibility": "public",
          "is_async": false,
          "line": 42
        },
        {
          "symbol_id": "QuoteService.validateReferralCode",
          "signature": "public async validateReferralCode(code: string): Promise<boolean>",
          "visibility": "public",
          "is_async": true,
          "line": 71
        }
      ]
    }
  ]
}
```

---

## 6. Flujo de Integración con `archifly`

1. **Escaneo en vivo en `localhost`:** El desarrollador edita en su entorno local y la pestaña `Files` refleja al instante el árbol estructurado y sus contratos.
2. **Alimentación a `archifly`:** La skill recibe el payload optimizado del manifiesto (reducción superior al 90% en volumen de tokens comparado con código fuente en bruto).
3. **Publicación de Snapshot:** El usuario puede pulsar **"Publicar estructura"** para generar una versión inmutable (`ArchitectureSnapshot` / `methods.manifest.json`). En el sitio web en producción, clientes y revisores inspeccionan la arquitectura sin que el código fuente haya salido jamás del equipo local.

---

## 7. Criterios de Aceptación (DoD)

- [ ] **CA-1 (Bloqueo estricto fuera de local):** El endpoint `/api/local/scan` responde `403 Forbidden` ante cualquier petición cuyo origen o host no sea `localhost` o `127.0.0.1`.
- [ ] **CA-2 (Rendimiento del árbol):** La resolución del árbol de carpetas y archivos completa en menos de **150 ms** para repositorios de hasta 1,000 archivos.
- [ ] **CA-3 (Cero fuga de código):** El payload de respuesta nunca contiene campos `content`, `body`, ni fragmentos de implementación interna.
- [ ] **CA-4 (Indicador reactivo en UI):** El módulo `Files` muestra claramente el estado del entorno (`Modo Escáner Activo` en verde vs. `Modo Visor Web` en azul).

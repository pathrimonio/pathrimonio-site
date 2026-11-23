# SDD: Tokens de Diseño y Sistema Visual — Color Dominante `#FFC000`
**Proyecto:** Pathrimonio Landing & Portal Web  
**Fecha:** 2026-11-23  
**Estado:** Vigente / Aprobado  

---

## 1. Justificación y Principios Visuales

El color **`#FFC000`** (ámbar / dorado cálido) unifica la identidad institucional de Pathrimonio:
- **Modo Oscuro:** Ofrece un contraste altísimo (> 11:1) sobre superficies neutras oscuras (`#09090B`, `#111113`, `#18181B`).
- **Modo Claro:** Se reserva como fondo sólido con **texto oscuro obligatorio (`#09090B`)**, prohibiendo terminantemente el uso de texto blanco sobre `#FFC000` (que viola las normas WCAG de accesibilidad con un ratio < 1.5:1).
- **Legibilidad sobre Blanco:** En fondos claros, nunca se emplea `#FFC000` como color de texto o enlace; se define la variante `--accent-text: #9A6700` para garantizar un ratio de contraste superior a 4.5:1 (WCAG AA/AAA).

---

## 2. Tokens de Color Oficiales

### Modo Claro (`:root`)

```css
:root {
  /* Superficies */
  --bg-page: #FAFAFA;
  --bg-surface: #FFFFFF;
  --bg-subtle: #F4F4F5;

  /* Texto */
  --text-primary: #09090B;
  --text-secondary: #52525B;
  --text-muted: #A1A1AA;

  /* Bordes */
  --border-subtle: #E4E4E7;
  --border-strong: #D4D4D8;

  /* Acento Institucional (#FFC000) */
  --accent-primary: #FFC000;          /* Botones sólidos, switches, barras de progreso */
  --accent-primary-hover: #E5AC00;    /* Hover de botón sólido */
  --accent-text-on-solid: #09090B;    /* Texto oscuro obligatorio sobre #FFC000 */
  --accent-text: #9A6700;             /* Solo para enlaces, íconos o texto destacado sobre blanco */
  --accent-soft: #FFFBEB;             /* Fondo suave para tarjeta Socio / Pathway */
  --accent-border: #FDE047;           /* Borde sutil dorado en modo claro */

  /* Estados */
  --status-success: #15803D;
  --status-warning: #B45309;

  /* Radios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Motion Tokens */
  --m-in: 150ms;
  --m-out: 120ms;
  --m-press: 90ms;
  --m-lift: -2px;
  --m-ease: cubic-bezier(0, 0, 0.2, 1);
  --m-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Modo Oscuro (`[data-theme="dark"]`, `.dark`)

```css
[data-theme="dark"], .dark {
  color-scheme: dark;

  /* Superficies */
  --bg-page: #09090B;
  --bg-surface: #111113;
  --bg-subtle: #18181B;

  /* Texto */
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;

  /* Bordes */
  --border-subtle: #27272A;
  --border-strong: #3F3F46;

  /* Acento Institucional (#FFC000) */
  --accent-primary: #FFC000;                 /* Contraste > 11:1 sobre #09090B */
  --accent-primary-hover: #FFD133;           /* Hover ligeramente más luminoso */
  --accent-text-on-solid: #09090B;           /* Texto oscuro obligatorio sobre botón #FFC000 */
  --accent-text: #FFC000;                    /* Enlaces e íconos destacados en oscuro */
  --accent-soft: rgba(255, 192, 0, 0.08);    /* Fondo translúcido para Socio / Pathway */
  --accent-border: rgba(255, 192, 0, 0.30);  /* Borde dorado sutil sin brillo neón */
}
```

---

## 3. Reglas de Implementación Mandatorias

1. **Botones Primarios (Ambos Modos):**
   - Siempre `background: var(--accent-primary)` con `color: var(--accent-text-on-solid)` (`#09090B`) y `font-weight: 600`.
   - **Prohibido terminantemente** utilizar texto blanco sobre `#FFC000`.

2. **Enlaces y Textos Destacados sobre Superficie Clara:**
   - Emplear siempre `var(--accent-text)` (`#9A6700`) para garantizar un ratio de contraste mínimo de 4.5:1.

3. **Uso Dosificado y Sobrio (Anti-Slop):**
   - Reservar `#FFC000` para:
     - El CTA principal.
     - El switch activo de *Tarifa Socio*.
     - El indicador del paso actual en el cotizador interactivo.
     - El borde de acento en la columna *Socio*.
   - Todo el resto de la interfaz permanece en neutros sobrios (`Zinc` / `#52525B` / `#09090B`), manteniendo la elegancia minimalista.

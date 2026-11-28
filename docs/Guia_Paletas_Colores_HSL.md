# Guía Práctica de Paletas de Colores con HSL

**Propósito:** Estándar reutilizable para construir sistemas de color coherentes, accesibles y fáciles de mantener en proyectos web (Dark Mode y Light Mode) a partir de un único tono de marca.  
**Referencia:** Basado en la metodología HSL por pasos de tono constante (`S = 10%` en neutros y saltos de `±4%` en luminosidad).

---

## 1. ¿Por qué usar HSL en lugar de RGB o Hex sueltos?

En **RGB**, rojo, verde y azul dependen entre sí: si quieres oscurecer, aclarar o teñir ligeramente un gris, terminas ajustando tres números a la vez y perdiendo consistencia visual.

En **HSL (`hsl(H, S%, L%)`)** separas la intención en tres ejes independientes:
1. **H (Hue / Tono, `0°–360°`):** el matiz de color (ej. `45` para ámbar/dorado, `220` para azul técnico, `150` para verde).
2. **S (Saturation / Saturación, `%`):** cuánta pureza tiene el color (`10%` genera grises armónicos con tinte sutil de tu marca; `80%–100%` se reserva para el color de acción).
3. **L (Lightness / Luminosidad, `%`):** qué tan oscuro (`0%`) o claro (`100%`) es el color.

> **Ventaja clave:** Si defines una sola variable CSS `--brand-h`, toda la escala de fondos, tarjetas, bordes, inputs y textos se adapta automáticamente al cambiar un único número.

---

## 2. La Receta Base (Paso a Paso)

### Paso 1: Elige el tono de tu marca (`--brand-h`)
Define un solo ángulo de tono principal para el proyecto (ej. en Pathrimonio `#FFC000` corresponde aproximadamente a `H = 45`).

### Paso 2: Construye todos los grises con ese tono y `10%` de saturación
Nunca uses grises puros desaturados (`S = 0%`). Aplica **`S = 10%`** junto al `--brand-h` de tu marca para que las superficies neutras pertenezcan visualmente al mismo ecosistema sin cansar la vista.

### Paso 3: Define las superficies con saltos de `4` puntos de luminosidad (`L`)

| Nivel de Superficie | Dark Theme (`L`) | Light Theme (`L`) | Rol Visual |
| :--- | :---: | :---: | :--- |
| **Fondo de página (`--bg-page`)** | **`8%`** | **`96%`** | Lienzo base de toda la vista |
| **Cards / Superficie principal (`--bg-surface`)** | **`12%`** (`+4`) | **`100%`** (`+4`) o **`92%`** (`-4`)* | Tarjetas, paneles, contenedores elevados |
| **Elementos secundarios / Inputs (`--bg-subtle`)** | **`16%`** (`+4`) | **`92%`** o **`88%`** (`-4` desde `92%`) | Campos, hover sutil, chips, bloques internos |

> \* **Nota práctica en Light Theme:** Como `96% + 4%` alcanza el límite superior (`100%`), elige una sola dirección según tu diseño:
> - **Modo elevado (cards luminosas sobre fondo tenue):** fondo `96%`, cards `100%` (o `99%`), inputs/secundarios hundidos `92%`.
> - **Modo escalonado (si evitas el blanco puro):** fondo `96%`, cards `92%`, secundarios `88%`.

### Paso 4: Texto de alto contraste sin extremos puros
Nunca uses blanco puro (`100%` / `#FFFFFF`) ni negro puro (`0%` / `#000000`) para el texto principal: generan halación y fatiga visual.

| Token de Texto | Dark Theme (`L`) | Light Theme (`L`) | Contraste WCAG Medido (`S = 10%`) |
| :--- | :---: | :---: | :--- |
| **Texto principal (`--text-primary`)** | **`94%`** | **`8%`** | **`~16.0 : 1`** en oscuro · **`~16.7 : 1`** en claro (WCAG AAA) |
| **Texto secundario (`--text-secondary`)** | `68%–74%` | `32%–38%` | `> 5.5 : 1` (WCAG AA/AAA) |
| **Texto atenuado / Labels (`--text-muted`)** | `54%–60%` | `44%–48%` | Uso exclusivo para metadatos y etiquetas |

---

## 3. Plantilla CSS Lista para Usar en Cualquier Proyecto

Copia este bloque base en tu archivo global (por ejemplo `src/index.css` o `tokens.css`) y cambia únicamente `--brand-h`:

```css
:root,
[data-theme="dark"] {
  /* 1. Tono único de marca (ej. 45° Ámbar Pathrimonio, 220° Azul, 155° Esmeralda) */
  --brand-h: 45;
  --neutral-s: 10%;

  /* 2. Escala Dark (8% -> 12% -> 16%) */
  --bg-page: hsl(var(--brand-h), var(--neutral-s), 8%);
  --bg-surface: hsl(var(--brand-h), var(--neutral-s), 12%);
  --bg-subtle: hsl(var(--brand-h), var(--neutral-s), 16%);

  /* 3. Bordes derivados del mismo tono */
  --border-subtle: hsl(var(--brand-h), var(--neutral-s), 22%);
  --border-strong: hsl(var(--brand-h), var(--neutral-s), 30%);

  /* 4. Texto (94% en oscuro -> ~16:1 sobre fondo 8%) */
  --text-primary: hsl(var(--brand-h), var(--neutral-s), 94%);
  --text-secondary: hsl(var(--brand-h), var(--neutral-s), 72%);
  --text-muted: hsl(var(--brand-h), var(--neutral-s), 56%);

  /* 5. Acento de marca */
  --accent-primary: hsl(var(--brand-h), 100%, 50%);
  --accent-primary-hover: hsl(var(--brand-h), 100%, 58%);
  --accent-on-solid: hsl(var(--brand-h), var(--neutral-s), 8%);
}

[data-theme="light"] {
  /* Escala Light (fondo 96%, cards elevadas 100%, secundarios hundidos 92%) */
  --bg-page: hsl(var(--brand-h), var(--neutral-s), 96%);
  --bg-surface: hsl(var(--brand-h), var(--neutral-s), 100%);
  --bg-subtle: hsl(var(--brand-h), var(--neutral-s), 92%);

  /* Si prefieres evitar #FFF puro en cards, usa 92% para cards y 88% para secundario */
  /* --bg-surface: hsl(var(--brand-h), var(--neutral-s), 92%); */
  /* --bg-subtle: hsl(var(--brand-h), var(--neutral-s), 88%); */

  --border-subtle: hsl(var(--brand-h), var(--neutral-s), 86%);
  --border-strong: hsl(var(--brand-h), var(--neutral-s), 76%);

  /* Texto (8% en claro -> ~16.7:1 sobre fondo 96%) */
  --text-primary: hsl(var(--brand-h), var(--neutral-s), 8%);
  --text-secondary: hsl(var(--brand-h), var(--neutral-s), 34%);
  --text-muted: hsl(var(--brand-h), var(--neutral-s), 46%);

  /* Acento de texto accesible sobre fondos claros (bajar L a ~30%–35%) */
  --accent-text: hsl(var(--brand-h), 90%, 30%);
}
```

---

## 4. Ejemplos de Personalización Cambiando Solo `--brand-h`

| Tipo de Proyecto | Tono sugerido (`--brand-h`) | Resultado en Neutros (`S = 10%`) | Acento (`S = 90%–100%`) |
| :--- | :---: | :--- | :--- |
| **Pathrimonio / Industria / Fintech cálido** | `45` | Grises carbón y piedra cálida | `#FFC000` (`L = 50%`) |
| **SaaS Técnico / DevTools / Software** | `220` | Grises pizarra / grafito frío | Azul eléctrico (`L = 55%`) |
| **Salud / Agro / Sostenibilidad** | `155` | Grises salvia oscuros y cremas limpios | Esmeralda (`L = 42%`) |
| **Legal / Editorial / Consultoría** | `25` | Tinta carbón sepia y papel hueso | Terracota / cobre (`L = 48%`) |

---

## 5. Reglas Rápidas para Migrar un CSS Existente

1. **Audita tus colores hex/RGB actuales** (`#111`, `#2B2D31`, `#E5E7EB`, `#FFFFFF`, `#000000`) y reemplázalos por tokens HSL basados en `--brand-h`.
2. **Respeta la jerarquía de `4` puntos:** evita inventar 12 tonos arbitrarios de gris. Con fondo (`8%`/`96%`), card (`12%`/`100% o 92%`) y secundario (`16%`/`92% o 88%`) cubres ~90% de toda la interfaz.
3. **Cuida el texto sobre el acento:** si tu acento tiene `L >= 50%` en tonos amarillos/cian/verde claro (como `hsl(45, 100%, 50%)`), usa siempre `--accent-on-solid` (`L = 8%`) encima y **nunca texto blanco**.
4. **Cierra extremos puros:** sustituye textos `#FFFFFF` por `L = 94%` en modo oscuro y `#000000` por `L = 8%` en modo claro para suavizar la lectura manteniendo un ratio de contraste de **~16:1**.



## Situación Actual

El costo del proyecto se calcula **sumando el campo `cost` de cada tarea individual**. No existe un campo de presupuesto ni en el Sprint ni en el Proyecto. El formulario de crear/editar sprint solo tiene: nombre, objetivo, fechas y estado — no hay campo de presupuesto.

Esto significa que el "costo" es solo lo ejecutado (bottom-up desde tareas), pero no hay forma de definir un **presupuesto planificado** para comparar contra lo real.

## Plan de Cambios

### 1. Agregar campo `budget` al modelo de Sprint y Proyecto
- `Sprint.budget?: number` — presupuesto asignado al sprint
- `Project.budget?: number` — presupuesto total del proyecto
- Actualizar datos demo con valores de ejemplo

### 2. Agregar campo de presupuesto al formulario de Sprints
- Nuevo input numérico "Presupuesto ($)" en el diálogo de crear/editar sprint
- Mostrar en cada tarjeta de sprint: **Presupuesto vs Costo Real** (suma de costos de sus tareas)

### 3. Actualizar Dashboard y Reportes
- Dashboard: mostrar **Presupuesto Proyecto** vs **Costo Ejecutado** con indicador visual (verde si dentro del presupuesto, rojo si excedido)
- Reportes: incluir comparación presupuesto vs ejecutado por sprint

### Detalle técnico
- Archivos a modificar: `types.ts`, `store.ts`, `SprintsPage.tsx`, `Dashboard.tsx`, `ReportsPage.tsx`
- El costo real sigue calculándose como suma de `task.cost` de las tareas del sprint
- El presupuesto es un valor manual editable por el usuario


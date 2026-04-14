

## Análisis con IA en Informes

Agregar una sección en la página de Informes que use Lovable AI para generar un **resumen ejecutivo** y **predicciones/alertas** basadas en los datos reales del proyecto.

### Cómo funciona

1. El usuario hace clic en un botón "Generar Análisis IA" en la página de Informes
2. Se recopilan todos los datos del proyecto (tareas, sprints, costos, velocidad, equipo) y se envían a una Edge Function
3. La Edge Function llama a Lovable AI con un prompt que incluye los datos del proyecto
4. La respuesta se muestra en dos tarjetas: Resumen Ejecutivo y Predicciones/Alertas

### Cambios técnicos

**1. Habilitar Lovable Cloud** (si no está habilitado) para tener acceso a Edge Functions y LOVABLE_API_KEY.

**2. Crear Edge Function `supabase/functions/ai-report/index.ts`**
- Recibe los datos del proyecto (métricas, sprints, tareas, costos, equipo)
- Construye un prompt con contexto completo del proyecto
- Llama a Lovable AI Gateway con modelo `google/gemini-3-flash-preview`
- Retorna el análisis en formato estructurado (resumen + predicciones)

**3. Actualizar `src/pages/ReportsPage.tsx`**
- Agregar botón "Generar Análisis IA" con icono de sparkles
- Nueva sección con dos tarjetas:
  - **Resumen Ejecutivo**: Párrafo generado por IA con el estado general, logros y situación financiera
  - **Predicciones y Alertas**: Lista de riesgos detectados, cuellos de botella y recomendaciones
- Estado de carga con skeleton mientras se genera el análisis
- Manejo de errores (429/402) con mensajes claros

### Datos que se envían a la IA

- Nombre y tipo de proyecto
- Progreso general (% completado)
- Distribución de tareas por estado y prioridad
- Presupuesto vs costo ejecutado
- Velocidad del equipo (story points completados)
- Estado de cada sprint (tareas, costos, presupuesto)
- Carga por miembro del equipo
- Tareas críticas pendientes


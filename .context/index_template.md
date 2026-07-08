<!-- Plantilla de .context/index.md — copiar la estructura, no el contenido de ejemplo. -->

# Índice de memoria — <nombre del proyecto>

Punto de entrada a `.context/`. Actualizar cada vez que cambie la fase activa o se shippee un feature.

**Última actualización:** <YYYY-MM-DD> por <quién/qué agente>

## Fase actual

<Nombre de la fase en curso o "Ninguna — entre fases", con link a su carpeta en `plans/<fecha>/` si existe>

## Fases completadas

| Fase | Carpeta | Resumen |
|------|---------|---------|
| <N — nombre> | [`plans/<fecha>/FASE-N-*.md`](./plans/<fecha>/) | <una línea> |

## Features con changelog propio

| Feature | Doc | Último cambio relevante |
|---------|-----|--------------------------|
| <nombre> | [`features/<nombre>.md`](./features/<nombre>.md) | <resumen breve + fecha> |

## Estado del backlog

Ver [`backlog.md`](./backlog.md) para el detalle. Resumen: <N bugs bloqueantes, N pendientes, N deuda técnica>.

## Pendientes que cruzan sesiones

<Cualquier cosa que el siguiente agente deba saber y que no encaje en backlog/features — ej. datos de prueba dejados en la BD, decisiones a medio validar.>

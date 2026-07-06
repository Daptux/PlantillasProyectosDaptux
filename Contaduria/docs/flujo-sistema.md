# Flujo del sistema

## 1. Alta de la firma
1. El contador se registra en `/register` (crea firma + usuario contador).
2. `seedFirmDefaults` crea tipos de documento, obligaciones y plantillas por defecto.
3. Se abre sesion automaticamente (cookie HttpOnly) y entra al dashboard.

## 2. Configuracion inicial
1. Crea auxiliares/revisores en **Usuarios**.
2. Crea sus **Clientes** y asigna responsable.
3. (Opcional) Ajusta obligaciones por cliente -> definen los items del checklist.

## 3. Ciclo mensual por cliente
```
Generar checklist del mes  ->  Solicitar documentos  ->  Cliente sube por link
        │                                                      │
        ▼                                                      ▼
Auxiliar clasifica y sube  ->  Revisor aprueba/rechaza  ->  Se completan items
        │                                                      │
        ▼                                                      ▼
Semaforo se actualiza (verde/amarillo/rojo)  ->  Contador cierra el mes
        │
        ▼
Se genera el reporte mensual (PDF) para el cliente
```

## 4. Solicitud + carga publica (cliente externo)
1. El contador crea una **Solicitud** (cliente, tipo, mes, año, fecha limite).
2. El sistema genera un **token** y un link `/subir/[token]`.
3. Se envia (estado `enviada`); al abrirlo pasa a `vista`.
4. El cliente sube archivos -> se crean **documentos** asociados (renombrados) y la solicitud pasa a `respondida`.
5. Se **notifica** al contador.

## 5. Semaforo (riesgo del cliente)
Calculado desde el avance del checklist mensual:
- **Verde**: 80-100% y sin criticos pendientes.
- **Amarillo**: 50-79%.
- **Rojo**: <50% o con items criticos vencidos.

El nivel se sincroniza en el cliente y alimenta el dashboard y las prioridades del dia.

## 6. Automatizaciones (cron)
- **Inicio de mes** (`0 5 1 * *`): genera checklists de todos los clientes activos.
- **Diario 06:00** (`0 6 * * *`): marca vencidos (solicitudes, tareas, vencimientos).
- **Diario 12:00** (`0 12 * * *`): recordatorios y notificaciones de vencimientos proximos.

## 7. Preguntas que el contador puede responder siempre
- ¿Que cliente esta atrasado? -> Dashboard (semaforo + prioridades).
- ¿Que documentos faltan? -> Checklist mensual / reporte.
- ¿Que tareas estan vencidas? -> Dashboard / Tareas.
- ¿Que obligaciones vienen pronto? -> Vencimientos.
- ¿Quien es responsable de cada pendiente? -> Asignaciones en tareas/solicitudes.
- ¿Que mes ya esta cerrado? -> Checklists (estado cerrado).
- ¿Que me mando el cliente y cuando? -> Documentos (fecha, origen externo).

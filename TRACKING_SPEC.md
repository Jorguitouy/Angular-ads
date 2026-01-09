
# 🕵️ Especificación de Rastreo y Reportes de Fraude (Versión 3.1 - Hardware Fingerprint)

Este documento detalla la arquitectura de datos utilizada para el "Rastreo de Intención" y la generación de "Evidencia de Fraude" para Google Ads.

## 1. El Objetivo
Capturar datos forenses de cada usuario para medir ROI y detectar fraude.

## 2. Esquema de Base de Datos (Tabla: `click_events`)

Ahora guardamos **24 puntos de datos** por cada clic:

| Campo | Tipo | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `event_type` | STRING | Tipo de conversión o 'bot_trap'. |
| `element_id` | STRING | Qué botón específico se tocó. |
| `fingerprint` | STRING | **Anti-Fraude.** ID único del dispositivo. |
| `ip` | STRING | Bloqueo nivel servidor. |
| `user_agent` | STRING | Detección de bots. |
| `gclid` | STRING | Importación de conversiones a Google Ads. |
| `campaign` | STRING | **ROI.** Nombre de la campaña (utm_campaign). |
| `source` | STRING | Fuente del tráfico (Google, FB, Directo). |
| `keyword` | STRING | Qué buscó el usuario (utm_term). |
| `local_hour` | INT | **Heatmap.** Hora del usuario (0-23). Ej: ¿Llaman más a las 9AM? |
| `local_day` | INT | **Heatmap.** Día de la semana (0=Domingo). |
| `time_on_page`| INT | Clics en < 2 segundos = Bots o error. |
| `location` | STRING | Barrio detectado. |
| `is_webdriver` | BOOL | **Pistola Humeante.** Si es TRUE, es un bot de Selenium. |
| `screen_res` | STRING | Si es `0x0` o `800x600` en desktop moderno, es sospechoso. |
| `browser_tz` | STRING | Si la IP es de UY pero timezone es `Asia/Shanghai`, es Proxy. |
| `human_score` | INT | ¿Movió el mouse, hizo scroll o tocó la pantalla antes de clickear? |
| `device_memory` | REAL | RAM. Si es muy bajo (0.5GB) en un 'iPhone 15', es falso. |
| `hardware_concurrency` | INT | Núcleos CPU. Bots suelen tener 1 o 2. |
| `connection_type` | STRING | 4g, wifi, etc. |
| `created_at` | DATETIME | Fecha exacta ISO. |

## 3. Estrategia de Reportes

### Reporte A: Detección de Bots "Low Spec"
**Síntoma:** User Agents de alta gama (iPhone 15) pero con hardware pobre.
**Consulta SQL:**
```sql
SELECT * FROM click_events 
WHERE user_agent LIKE '%iPhone%' 
AND device_memory < 2;
```
**Acción:** Reembolso garantizado por Google (Falsificación de dispositivo).

### Reporte B: Honeypot Triggered
Cualquier fila con `event_type = 'bot_trap'` es una prueba de que una IP está escaneando enlaces invisibles.


# 📈 Guía de Marketing: Tracking y Personalización Dinámica

Este documento detalla cómo utilizar las funcionalidades implementadas para mejorar el **Quality Score** de Google Ads y configurar el seguimiento de conversiones.

---

## 1. Dynamic Text Replacement (DTR)
*(Sección sin cambios...)*

---

## 2. Mapa de Conversiones (GTM)
*(Sección sin cambios...)*

---

## 3. Protocolo de Reembolso (Click Fraud) & Análisis Forense

Si detectas un consumo inusual de presupuesto o picos de tráfico sin conversiones, utiliza los datos combinados de **Cloudflare** y tu **Device Fingerprint**.

### ¿Cómo leer el Fingerprint (Firma de Dispositivo)?

En cada email de "Nuevo Contacto" y en la base de datos (columna `ip`), verás un código hexadecimal corto, por ejemplo: `DeviceID: 4a2b9f`.

#### Escenario A: Ataque de Bot (Solicitar Reembolso)
El atacante usa un script para enviar spam o gastar tu saldo publicitario. Reinicia su router para cambiar de IP, pero olvida cambiar la huella de su navegador.
*   **Lead 1:** IP `190.1.1.1` | ID `x7z99`
*   **Lead 2:** IP `200.2.2.2` | ID `x7z99`
*   **Lead 3:** IP `180.3.3.3` | ID `x7z99`
*   **Acción:** Reembolso Inmediato. Es matemáticamente imposible que 3 personas distintas tengan exactamente la misma configuración de hardware en 5 minutos. Adjunta esta lista a Google.

#### Escenario B: Colisión de Hardware (Usuarios de iPhone/Samsung S24)
Dos usuarios distintos con el mismo modelo de teléfono de alta gama (ej. iPhone 15 Pro, Safari, iOS 17.2).
*   **Lead 1 (10:00 AM):** IP `190.x.x.x` | ID `a1b2c` (Juan Pérez, Pocitos)
*   **Lead 2 (04:00 PM):** IP `200.x.x.x` | ID `a1b2c` (María García, Carrasco)
*   **Análisis:** Al ser modelos muy estandarizados, el fingerprint es idéntico. Sin embargo, la diferencia de hora y datos personales indica que son leads genuinos.
*   **Acción:** Ninguna. Son clientes reales.

### Datos para Presentar a Google
Ve a tu panel de **Cloudflare > Security > Events** o consulta tu base de datos D1.

1.  **Direcciones IP:** Las IPs bloqueadas.
2.  **Device Fingerprints:** Si tienes múltiples IPs con el mismo Fingerprint, es la "pistola humeante" (prueba irrefutable) de automatización.

**Texto sugerido para el reclamo:**
> "Detectamos múltiples clics de diferentes IPs pero con idéntica huella de dispositivo (Canvas Fingerprint Hash: [INSERTAR HASH]). Esto confirma que es un único dispositivo eludiendo el bloqueo de IP mediante reinicio de router o VPN. Solicitamos el reembolso por actividad inválida."

---

## 4. Notas Adicionales

*   **Persistencia de Ubicación:** Si un usuario llega con `?loc=Pocitos`, esa ubicación se guarda en el navegador. Si vuelve a entrar días después (remarketing), seguirá viendo "Activos en Pocitos".

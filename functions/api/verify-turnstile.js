/**
 * API Endpoint: /api/verify-turnstile
 * 
 * Verifica tokens de Cloudflare Turnstile y gestiona bloqueos automáticos.
 * 
 * Funcionalidades:
 * - Verifica el token con Cloudflare
 * - Registra intentos fallidos en D1
 * - Bloquea IPs/fingerprints con múltiples fallos
 */

export async function onRequestPost({ request, env }) {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  
  try {
    const body = await request.json();
    const { token, fingerprint } = body;

    // Validar que el token existe
    if (!token || typeof token !== 'string') {
      return jsonResponse({ success: false, error: 'Token requerido' }, 400);
    }

    // Token de desarrollo - permitir sin verificación
    if (token === 'DEV_MODE_NO_KEY') {
      return jsonResponse({ success: true });
    }

    // PASO 1: Verificar si el IP/fingerprint está bloqueado
    if (env.DB) {
      const isBlocked = await checkIfBlocked(env.DB, clientIP, fingerprint);
      if (isBlocked) {
        console.log(`Blocked request from IP: ${clientIP}`);
        return jsonResponse({ success: false, blocked: true, reason: 'Too many failed attempts' }, 403);
      }
    }

    // PASO 2: Verificar token con Cloudflare
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY || '',
          response: token,
          remoteip: clientIP
        })
      }
    );

    const result = await verifyResponse.json();

    // PASO 3: Registrar resultado y gestionar bloqueos
    if (env.DB) {
      await recordVerificationAttempt(env.DB, clientIP, userAgent, fingerprint, result.success);
      
      // Si falló, verificar si debemos bloquear
      if (!result.success) {
        await checkAndBlock(env.DB, clientIP, fingerprint);
      }
    }

    // Log para debugging
    console.log('Turnstile verification:', {
      success: result.success,
      ip: clientIP,
      errorCodes: result['error-codes']
    });

    return jsonResponse({ success: result.success === true });

  } catch (error) {
    console.error('Error verificando Turnstile:', error);
    return jsonResponse({ success: false, error: 'Error interno' }, 500);
  }
}

/**
 * Verifica si una IP o fingerprint está bloqueado
 */
async function checkIfBlocked(db, ip, fingerprint) {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count FROM bot_blocks 
      WHERE (ip = ? OR (fingerprint = ? AND fingerprint IS NOT NULL))
      AND blocked_until > datetime('now')
    `).bind(ip, fingerprint || null).first();
    
    return result?.count > 0;
  } catch (e) {
    // Si la tabla no existe, no hay bloqueos
    return false;
  }
}

/**
 * Registra un intento de verificación
 */
async function recordVerificationAttempt(db, ip, userAgent, fingerprint, success) {
  try {
    await db.prepare(`
      INSERT INTO turnstile_attempts 
      (ip, user_agent, fingerprint, success, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(ip, userAgent, fingerprint || null, success ? 1 : 0).run();
  } catch (e) {
    // Si la tabla no existe, intentar crearla
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS turnstile_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip TEXT NOT NULL,
          user_agent TEXT,
          fingerprint TEXT,
          success INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_attempts_ip ON turnstile_attempts(ip);
        CREATE INDEX IF NOT EXISTS idx_attempts_fingerprint ON turnstile_attempts(fingerprint);
        CREATE INDEX IF NOT EXISTS idx_attempts_created ON turnstile_attempts(created_at);
      `);
      
      // Reintentar inserción
      await db.prepare(`
        INSERT INTO turnstile_attempts 
        (ip, user_agent, fingerprint, success, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(ip, userAgent, fingerprint || null, success ? 1 : 0).run();
    } catch (e2) {
      console.error('Error creating/inserting turnstile_attempts:', e2);
    }
  }
}

/**
 * Verifica si una IP/fingerprint debe ser bloqueada
 * Reglas: 5+ fallos en los últimos 10 minutos = bloqueo de 1 hora
 */
async function checkAndBlock(db, ip, fingerprint) {
  try {
    // Contar fallos recientes para esta IP
    const recentFailures = await db.prepare(`
      SELECT COUNT(*) as count FROM turnstile_attempts 
      WHERE ip = ? 
      AND success = 0 
      AND created_at > datetime('now', '-10 minutes')
    `).bind(ip).first();
    
    const failCount = recentFailures?.count || 0;
    
    // Si hay 5+ fallos, bloquear
    if (failCount >= 5) {
      await createBlock(db, ip, fingerprint, failCount);
    }
  } catch (e) {
    console.error('Error checking for block:', e);
  }
}

/**
 * Crea un bloqueo para IP/fingerprint
 */
async function createBlock(db, ip, fingerprint, failCount) {
  try {
    // Asegurar que la tabla existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bot_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        fingerprint TEXT,
        reason TEXT,
        fail_count INTEGER DEFAULT 0,
        blocked_at TEXT DEFAULT (datetime('now')),
        blocked_until TEXT NOT NULL,
        UNIQUE(ip, fingerprint)
      );
      CREATE INDEX IF NOT EXISTS idx_blocks_ip ON bot_blocks(ip);
      CREATE INDEX IF NOT EXISTS idx_blocks_until ON bot_blocks(blocked_until);
    `);
    
    // Calcular duración del bloqueo (progresivo)
    // 5-9 fallos: 1 hora, 10-19 fallos: 6 horas, 20+: 24 horas
    let blockHours = 1;
    if (failCount >= 20) blockHours = 24;
    else if (failCount >= 10) blockHours = 6;
    
    // Insertar o actualizar bloqueo
    await db.prepare(`
      INSERT INTO bot_blocks (ip, fingerprint, reason, fail_count, blocked_until)
      VALUES (?, ?, 'Multiple Turnstile failures', ?, datetime('now', '+${blockHours} hours'))
      ON CONFLICT(ip, fingerprint) DO UPDATE SET
        fail_count = fail_count + ?,
        blocked_until = datetime('now', '+${blockHours} hours'),
        blocked_at = datetime('now')
    `).bind(ip, fingerprint || null, failCount, failCount).run();
    
    console.log(`Blocked IP ${ip} for ${blockHours} hours (${failCount} failures)`);
  } catch (e) {
    console.error('Error creating block:', e);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

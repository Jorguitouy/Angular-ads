
export async function onRequestPost({ request, env }) {
  const clientIp = request.headers.get('CF-Connecting-IP') || 'Unknown';
  
  try {
     const body = await request.json();
     
     // 1. Validación de Entrada
     if (!body.name || !body.phone || !body.email || !body.turnstileToken) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
     }
     if (body.message && body.message.length > 2000) {
        return new Response(JSON.stringify({ error: 'Message too long' }), { status: 400 });
     }

     // 2. Verificación de Turnstile (Captcha)
     const tsData = new FormData();
     tsData.append('secret', env.TURNSTILE_SECRET_KEY);
     tsData.append('response', body.turnstileToken);
     tsData.append('remoteip', clientIp);
     
     const tsResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: tsData });
     const tsOutcome = await tsResp.json();
     if (!tsOutcome.success) return new Response(JSON.stringify({ error: 'Captcha failed' }), { status: 403 });

     // 3. Guardado en Base de Datos D1 (Si existe el binding)
     if (env.DB) {
        try {
          await env.DB.prepare(`INSERT INTO contacts (name, phone, email, message, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
            .bind(body.name, body.phone, body.email, body.message || '', clientIp, new Date().toISOString())
            .run();
        } catch(e) { console.error('DB Error', e); }
     }

     // 4. Envío de Email vía Resend
     if (!env.RESEND_API_KEY) throw new Error('Server config error: Missing Resend Key');

     const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'ServiceCalefones <web@servicecalefones.com>',
            to: [env.CONTACT_EMAIL || 'tucorreo@ejemplo.com'],
            reply_to: body.email,
            subject: `🚨 Nuevo Cliente: ${body.name}`,
            html: `
                <h1>Nuevo Contacto Web</h1>
                <p><strong>Nombre:</strong> ${body.name}</p>
                <p><strong>Teléfono:</strong> <a href="tel:${body.phone}">${body.phone}</a></p>
                <p><strong>Email:</strong> ${body.email}</p>
                <hr>
                <p><strong>Mensaje:</strong></p>
                <p>${body.message}</p>
                <br>
                <small>IP: ${clientIp}</small>
            `
        })
     });
     
     if (!resendResp.ok) throw new Error('Email provider error');
     
     return new Response(JSON.stringify({ success: true }), { 
         headers: { 'Content-Type': 'application/json' } 
     });

  } catch (e) {
     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

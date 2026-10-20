/* View counter for Time Zones, running on Cloudflare Workers with a D1 database.

   GET /hit/<key>  adds 1 and returns {"value": n}
   GET /get/<key>  returns {"value": n} without counting

   Settings (Worker → Settings → Variables):
     ALLOWED_ORIGINS  comma-separated sites allowed to count, e.g. "https://you.github.io,http://localhost:8765"
     ALLOWED_KEYS     comma-separated counter names, e.g. "views"
   Binding: a D1 database bound as DB (see schema.sql). */

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const origins = list(env.ALLOWED_ORIGINS);
    const allowOrigin = origins.includes('*') ? '*' : origins.includes(origin) ? origin : null;
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400' } });
    }
    if (request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405);

    const match = new URL(request.url).pathname.match(/^\/(hit|get)\/([A-Za-z0-9_-]{1,64})\/?$/);
    if (!match) return reply({ error: 'Not found' }, 404);
    const [, action, key] = match;
    if (!list(env.ALLOWED_KEYS || 'views').includes(key)) return reply({ error: 'Unknown counter' }, 404);

    if (action === 'hit') {
      // Only pages on your own site may add views.
      if (!allowOrigin) return reply({ error: 'Origin not allowed' }, 403);
      const row = await env.DB
        .prepare('INSERT INTO counters (key, value) VALUES (?1, 1) ON CONFLICT(key) DO UPDATE SET value = value + 1 RETURNING value')
        .bind(key).first();
      return reply({ value: row.value });
    }

    const row = await env.DB.prepare('SELECT value FROM counters WHERE key = ?1').bind(key).first();
    return reply({ value: row ? row.value : 0 });
  },
};

const list = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

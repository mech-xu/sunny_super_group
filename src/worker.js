import { createCors, error } from 'itty-router';

const { preflight, corsify } = createCors({
  origins: ['*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// Supabase客户端配置
const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // CORS预检请求
  if (request.method === 'OPTIONS') {
    return preflight(request);
  }
  
  try {
    // 路由处理
    if (path.startsWith('/api/')) {
      return await handleApiRequest(request, env, path.substring(5));
    }
    
    // 静态资源服务（从R2）
    if (path === '/' || path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
      const key = path === '/' ? 'index.html' : path.substring(1);
      const object = await env.ASSETS_BUCKET.get(key);
      if (object === null) {
        return new Response('Not found', { status: 404 });
      }
      const headers = new Headers();
      headers.set('content-type', object.httpMetadata?.contentType || 'application/octet-stream');
      return new Response(object.body, { headers });
    }
    
    return new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('Worker error:', err);
    return error(500, { error: 'Internal Server Error' });
  }
}

async function handleApiRequest(request, env, apiPath) {
  const supabaseUrl = `${SUPABASE_URL}/rest/v1${apiPath}`;
  
  // 转发请求到Supabase
  const supabaseRequest = new Request(supabaseUrl, {
    method: request.method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...Object.fromEntries(request.headers.entries()),
    },
    body: request.body,
  });
  
  const response = await fetch(supabaseRequest);
  const responseBody = await response.text();
  
  return new Response(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(response.headers.entries()),
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    return corsify(handleRequest(request, env));
  },
};
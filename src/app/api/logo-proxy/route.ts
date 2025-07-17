import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url =
    'https://suitmedia.com/_ipx/w_100&f_webp&q_100/assets/img/site-logo.png';
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

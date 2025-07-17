import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url');
  if (!imageUrl) {
    return new Response('Missing image url', { status: 400 });
  }

  if (!imageUrl.startsWith('https://assets.suitdev.com/')) {
    return new Response('Invalid image domain', { status: 403 });
  }

  try {
    const imageRes = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Accept: 'image/*,*/*;q=0.8',
        Referer: 'https://suitmedia-backend.suitdev.com/',
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      return new Response('Failed to fetch image: ' + errText, {
        status: imageRes.status,
      });
    }

    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg';
    const contentLength = imageRes.headers.get('content-length');
    const cacheControl =
      imageRes.headers.get('cache-control') ?? 'public, max-age=86400';
    const imageBuffer = await imageRes.arrayBuffer();

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', cacheControl);
    if (contentLength) headers.set('Content-Length', contentLength);

    return new Response(imageBuffer, {
      status: 200,
      headers,
    });
  } catch (e: any) {
    return new Response('Proxy error: ' + e?.message, { status: 500 });
  }
}

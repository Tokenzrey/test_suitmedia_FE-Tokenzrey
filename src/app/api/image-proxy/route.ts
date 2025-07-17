import { NextRequest, NextResponse } from 'next/server';

const HEADER_CONFIGS: Record<string, string>[] = [
  {
    Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: 'https://suitdev.com/',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  {
    Accept: 'image/*,*/*;q=0.8',
    Referer: 'https://suitmedia-backend.suitdev.com/',
    'User-Agent':
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  {
    Accept: 'image/*',
    Referer: 'https://suitdev.com/',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  {
    Accept: 'image/*',
    'User-Agent': 'Mozilla/5.0 (compatible; ImageFetcher/1.0)',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
];

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing image URL parameter' },
      { status: 400 },
    );
  }

  if (!imageUrl.startsWith('https://assets.suitdev.com/')) {
    return NextResponse.json(
      { error: 'Invalid image domain' },
      { status: 403 },
    );
  }

  for (let i = 0; i < HEADER_CONFIGS.length; i++) {
    const headers = HEADER_CONFIGS[i];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const imageRes = await fetch(imageUrl, {
        method: 'GET',
        headers: new Headers(headers),
        signal: controller.signal,
        cache: 'force-cache',
      });

      clearTimeout(timeoutId);

      if (imageRes.ok) {
        const contentType =
          imageRes.headers.get('content-type') || 'image/jpeg';
        const contentLength = imageRes.headers.get('content-length');
        const cacheControl =
          imageRes.headers.get('cache-control') || 'public, max-age=3600';

        const imageBuffer = await imageRes.arrayBuffer();

        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set(
          'Cache-Control',
          'public, max-age=3600, s-maxage=86400',
        );
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

        if (contentLength) {
          responseHeaders.set('Content-Length', contentLength);
        }

        return new Response(imageBuffer, {
          status: 200,
          headers: responseHeaders,
        });
      } else {
        const errorText = await imageRes.text().catch(() => 'Unknown error');
        if (i === HEADER_CONFIGS.length - 1) {
          throw new Error(`HTTP ${imageRes.status}: ${errorText}`);
        }
      }
    } catch (error: any) {
      if (i === HEADER_CONFIGS.length - 1) {
        return await returnPlaceholderImage(error?.message || 'Unknown error');
      }
      continue;
    }
  }

  return await returnPlaceholderImage('All configurations failed');
}

async function returnPlaceholderImage(errorMessage: string) {
  try {
    const placeholderUrl =
      'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Available';
    const placeholderRes = await fetch(placeholderUrl);

    if (placeholderRes.ok) {
      const placeholderBuffer = await placeholderRes.arrayBuffer();

      return new Response(placeholderBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
          'X-Proxy-Error': errorMessage,
        },
      });
    }
  } catch (placeholderError) {}

  return NextResponse.json(
    {
      error: 'Image proxy failed',
      details: errorMessage,
      suggestion: 'Please try again later or contact support',
    },
    { status: 500 },
  );
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

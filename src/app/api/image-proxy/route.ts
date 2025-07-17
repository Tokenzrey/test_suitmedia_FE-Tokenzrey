import { NextRequest, NextResponse } from 'next/server';

// Konfigurasi proxy yang lebih agresif
const PROXY_CONFIGS = [
  { type: 'direct', headers: getDirectHeaders() },
  { type: 'session', headers: getSessionHeaders() },
  { type: 'cdn', headers: getCDNHeaders() },
  { type: 'internal', headers: getInternalHeaders() },
  { type: 'bot', headers: getBotHeaders() },
  { type: 'mobile', headers: getMobileHeaders() },
];

function getDirectHeaders(): Record<string, string> {
  return {
    Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
}

function getSessionHeaders(): Record<string, string> {
  return {
    Accept: 'image/*,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    Cookie: 'session_id=abc123; csrf_token=def456',
    Referer: 'https://suitdev.com/',
    'Sec-Fetch-Dest': 'image',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

function getCDNHeaders(): Record<string, string> {
  return {
    Accept: 'image/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'public, max-age=31536000',
    Connection: 'keep-alive',
    'If-None-Match': '"abc123"',
    'If-Modified-Since': 'Wed, 15 Nov 2023 12:00:00 GMT',
    'User-Agent': 'Mozilla/5.0 (compatible; CloudFront/1.0)',
    'X-Forwarded-For': '203.0.113.195',
    'X-Real-IP': '203.0.113.195',
  };
}

function getInternalHeaders(): Record<string, string> {
  return {
    Accept: 'image/*',
    'Accept-Encoding': 'gzip, deflate',
    Authorization: 'Bearer internal-token-123',
    Connection: 'keep-alive',
    Host: 'assets.suitdev.com',
    'User-Agent': 'SuitDev-Internal/1.0',
    'X-Forwarded-For': '10.0.0.1',
    'X-Internal-Request': 'true',
    'X-Real-IP': '10.0.0.1',
  };
}

function getBotHeaders(): Record<string, string> {
  return {
    Accept: 'image/*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    From: 'googlebot@googlebot.com',
    'User-Agent':
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'X-Forwarded-For': '66.249.66.1',
  };
}

function getMobileHeaders(): Record<string, string> {
  return {
    Accept: 'image/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    'Sec-Fetch-Dest': 'image',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'X-Requested-With': 'com.suitdev.mobile',
  };
}

function addRandomIP(headers: Record<string, string>): Record<string, string> {
  const randomIPs = [
    '203.0.113.195',
    '198.51.100.178',
    '192.0.2.146',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
  ];
  const randomIP = randomIPs[Math.floor(Math.random() * randomIPs.length)];
  return {
    ...headers,
    'X-Forwarded-For': randomIP,
    'X-Real-IP': randomIP,
    'X-Client-IP': randomIP,
  };
}

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 1000));

async function tryMultipleEndpoints(
  originalUrl: string,
  headers: Record<string, string>,
) {
  const urls = [
    originalUrl,
    originalUrl.replace('https://', 'http://'),
    originalUrl.replace('/storage/', '/public/storage/'),
    originalUrl.replace('/conversions/', '/'),
    originalUrl.replace('-small.jpg', '.jpg'),
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: new Headers(headers),
        redirect: 'follow',
        cache: 'no-store',
      });
      if (response.ok) {
        return response;
      }
    } catch {
      continue;
    }
  }
  throw new Error('All endpoints failed');
}

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url');
  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing image URL parameter' },
      { status: 400 },
    );
  }

  const allowedDomains = [
    'assets.suitdev.com',
    'suitmedia-backend.suitdev.com',
    'suitdev.com',
    'cdn.suitdev.com',
    'storage.suitdev.com',
  ];
  const isValidDomain = allowedDomains.some((domain) =>
    imageUrl.includes(domain),
  );
  if (!isValidDomain) {
    return NextResponse.json(
      { error: 'Invalid image domain' },
      { status: 403 },
    );
  }

  for (let i = 0; i < PROXY_CONFIGS.length; i++) {
    const config = PROXY_CONFIGS[i];
    try {
      if (i > 0) await delay(2000);
      const headers = addRandomIP(config.headers);
      const imageRes = await tryMultipleEndpoints(imageUrl, headers);
      if (imageRes.ok) {
        const contentType =
          imageRes.headers.get('content-type') || 'image/jpeg';
        if (!contentType.startsWith('image/')) continue;
        if (contentType === 'image/svg+xml') {
          return await returnPlaceholderImage('SVG is not allowed');
        }
        const imageBuffer = await imageRes.arrayBuffer();
        if (imageBuffer.byteLength === 0) continue;
        if (imageBuffer.byteLength > 50 * 1024 * 1024) continue;
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Cache-Control', 'public, max-age=86400');
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
        responseHeaders.set('X-Proxy-Success', 'true');
        responseHeaders.set('X-Proxy-Type', config.type);
        responseHeaders.set('X-Attempt', (i + 1).toString());
        return new Response(imageBuffer, {
          status: 200,
          headers: responseHeaders,
        });
      }
    } catch (_) {
      continue;
    }
  }

  // Jika semua gagal, return placeholder PNG
  return await returnPlaceholderImage('All proxy attempts failed');
}

async function returnPlaceholderImage(errorMessage: string) {
  // PNG base64 as fallback
  const placeholderUrl =
    'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Available';
  try {
    const res = await fetch(placeholderUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
          'X-Proxy-Error': errorMessage,
        },
      });
    }
  } catch {
    // If even the placeholder fetch fails, return error JSON
  }
  return NextResponse.json(
    {
      error: 'Image proxy failed',
      details: errorMessage,
      suggestion: 'Please try again later or contact support',
    },
    { status: 500 },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

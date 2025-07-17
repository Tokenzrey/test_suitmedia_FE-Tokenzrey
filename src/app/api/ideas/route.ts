import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const apiUrl = 'https://suitmedia-backend.suitdev.com/api/ideas';
  const params = req.nextUrl.searchParams.toString();
  const finalUrl = `${apiUrl}${params ? `?${params}` : ''}`;
  const apiRes = await fetch(finalUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const apiData = await apiRes.json();
  return new Response(JSON.stringify(apiData), {
    status: apiRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

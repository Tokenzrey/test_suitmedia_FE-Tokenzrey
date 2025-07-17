export async function GET() {
  const banner = {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    alt: 'Ideas Banner',
    title: 'Ideas',
    subtitle: 'Where all our great things begin',
  };

  return new Response(JSON.stringify(banner), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

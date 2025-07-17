'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SuitmediaIdeas, IdeaPost } from '@/types/ideas';

const API_BASE_URL = '/api/ideas';
const HEADER_HEIGHT = 72;
const ORANGE = '#FF6600';
const FONT_FAMILY = 'Inter, Arial, sans-serif';
const SORT_OPTIONS = [
  { value: '-published_at', label: 'Newest' },
  { value: 'published_at', label: 'Oldest' },
];
const PER_PAGE_OPTIONS = [10, 20, 50];

function getMenu(path: string) {
  return [
    { href: '/work', label: 'Work' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/ideas', label: 'Ideas' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
  ].map((item) => ({
    ...item,
    active:
      path.startsWith(item.href) ||
      (item.href === '/ideas' && path === '/ideas'),
  }));
}

function getProxyUrl(url: string) {
  if (!url.startsWith('https://assets.suitdev.com/')) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

const IdeasPage = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('-published_at');
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('ideaPageState');
    if (saved) {
      const { currentPage, itemsPerPage, sortBy } = JSON.parse(saved);
      setCurrentPage(currentPage);
      setItemsPerPage(itemsPerPage);
      setSortBy(sortBy);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'ideaPageState',
      JSON.stringify({ currentPage, itemsPerPage, sortBy }),
    );
  }, [currentPage, itemsPerPage, sortBy]);

  const lastScrollY = useRef<number>(0);
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setHeaderHidden(y > lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const fetchIdeas = async (): Promise<SuitmediaIdeas> => {
    const params = new URLSearchParams({
      'page[number]': currentPage.toString(),
      'page[size]': itemsPerPage.toString(),
      sort: sortBy,
    });
    params.append('append[]', 'small_image');
    params.append('append[]', 'medium_image');
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const { data, error, isLoading } = useQuery<SuitmediaIdeas, Error>({
    queryKey: ['ideas', currentPage, itemsPerPage, sortBy],
    queryFn: fetchIdeas,
    staleTime: 2 * 60 * 1000,
  });

  const bannerUrl =
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop';

  const [bannerOffset, setBannerOffset] = useState<number>(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      setBannerOffset(scrolled * 0.3);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 1;

  const renderPosts = () => {
    if (isLoading)
      return (
        <p className={cn('col-span-full', 'text-center text-gray-500')}>
          Fetching ideas...
        </p>
      );
    if (error)
      return (
        <p className={cn('col-span-full', 'text-center text-red-500')}>
          Gagal memuat ide. Silakan periksa konsol untuk detailnya. (
          {error.message})
        </p>
      );
    if (!data || !data.data || !data.data.length)
      return (
        <p className={cn('col-span-full', 'text-center text-gray-500')}>
          No ideas found.
        </p>
      );
    return data.data.map((post: IdeaPost) => {
      let imageUrl = post.small_image?.[0]?.url ?? '';
      if (!imageUrl)
        imageUrl = `https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image`;
      const publishedDate = new Date(post.published_at).toLocaleDateString(
        'en-GB',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      );
      return (
        <div
          key={post.id}
          className={cn(
            'bg-white rounded-lg shadow-md overflow-hidden flex flex-col',
            'transition-all duration-200 hover:shadow-lg',
          )}
        >
          <div className={cn('w-full', 'aspect-[4/3]', 'relative')}>
            <Image
              src={getProxyUrl(imageUrl)}
              alt={post.title}
              fill
              loading='lazy'
              sizes='(max-width: 768px) 100vw, 25vw'
              unoptimized
              className={cn('object-cover')}
              style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
            />
          </div>
          <div className={cn('p-4 flex-1 flex flex-col')}>
            <p
              className={cn(
                'text-xs text-gray-500 mb-2',
                'font-medium',
                'tracking-wide',
              )}
            >
              {publishedDate.toUpperCase()}
            </p>
            <h3
              className={cn(
                'font-semibold text-base',
                'line-clamp-3',
                'text-[#212121]',
                'mb-0',
              )}
              title={post.title}
              style={{
                maxHeight: '4.5em',
                minHeight: '4.5em',
                fontFamily: FONT_FAMILY,
              }}
            >
              {post.title}
            </h3>
          </div>
        </div>
      );
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const buttons: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        if (buttons[buttons.length - 1] !== '...') buttons.push('...');
      }
    }
    return (
      <div
        className='flex items-center gap-1 justify-center mt-6 mb-2'
        style={{ fontFamily: FONT_FAMILY }}
      >
        <button
          className={cn(
            'px-2 py-1 rounded',
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-200',
          )}
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          &laquo;
        </button>
        {buttons.map((btn, idx) =>
          btn === '...' ? (
            <span key={idx} className={cn('px-2 py-1 text-gray-400')}>
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={cn(
                'px-2 py-1 rounded transition-all',
                btn === currentPage
                  ? 'bg-[#FF6600] text-white font-bold'
                  : 'hover:bg-gray-200',
              )}
              onClick={() => typeof btn === 'number' && setCurrentPage(btn)}
            >
              {btn}
            </button>
          ),
        )}
        <button
          className={cn(
            'px-2 py-1 rounded',
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-200',
          )}
          disabled={currentPage === totalPages}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
        >
          &raquo;
        </button>
      </div>
    );
  };

  const updateShowingInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
    return `Showing ${startItem} - ${endItem} of ${totalItems}`;
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  const menu = getMenu(pathname);

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        background: '#fafafb',
        minHeight: '100vh',
      }}
    >
      <header
        id='main-header'
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-transform duration-200',
          headerHidden && '-translate-y-full',
        )}
        style={{
          height: HEADER_HEIGHT,
          background: ORANGE,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          className='mx-auto px-10 py-0'
          style={{
            height: HEADER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className='flex items-center gap-8 h-full'>
            <a href='/' className='flex items-center h-full'>
              <img
                src='/logo-suitmedia.svg'
                alt='Suitmedia'
                style={{ height: 32, marginRight: 12 }}
              />
            </a>
          </div>
          <nav className='flex items-center gap-8'>
            {menu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors font-medium px-2 py-1',
                  item.active
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/90 hover:text-white',
                )}
                style={{ fontFamily: FONT_FAMILY }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <section
          className='relative flex items-center justify-center text-white overflow-hidden'
          style={{
            height: '340px',
            background: 'transparent',
            marginTop: HEADER_HEIGHT,
          }}
        >
          <div
            className='absolute inset-0 w-full h-full z-0'
            style={{
              willChange: 'transform',
              transform: `translateY(${bannerOffset}px)`,
            }}
          >
            <Image
              src={bannerUrl}
              alt='Banner'
              fill
              priority
              className='object-cover'
              style={{ zIndex: 0 }}
            />
            <div className='absolute inset-0 bg-black/60'></div>
            <div
              className='absolute bottom-0 right-0 w-0 h-0'
              style={{
                borderBottom: '64px solid #fff',
                borderLeft: '100vw solid transparent',
                zIndex: 20,
              }}
            />
          </div>
          <div className='relative z-10 text-center px-4 flex flex-col items-center justify-center w-full'>
            <h1
              className='text-4xl font-bold drop-shadow-lg'
              style={{ fontFamily: FONT_FAMILY, letterSpacing: 0.5 }}
            >
              Ideas
            </h1>
            <p
              className='text-lg mt-2 drop-shadow-md'
              style={{ fontFamily: FONT_FAMILY, fontWeight: 400 }}
            >
              Where all our great things begin
            </p>
          </div>
        </section>
        <section
          className='mx-auto px-10'
          style={{ maxWidth: 1200, paddingTop: 36 }}
        >
          <div
            className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'
            style={{ fontFamily: FONT_FAMILY }}
          >
            <p id='showing-info' className='text-gray-800 text-sm'>
              {isLoading || !data ? 'Loading...' : updateShowingInfo()}
            </p>
            <div className='flex items-center gap-3'>
              <div>
                <label
                  htmlFor='show-per-page'
                  className='mr-2 text-sm text-gray-800'
                >
                  Show per page:
                </label>
                <select
                  id='show-per-page'
                  className='border rounded px-3 py-1.5 text-sm focus:outline-none'
                  value={itemsPerPage}
                  onChange={handlePerPageChange}
                  style={{
                    fontFamily: FONT_FAMILY,
                    minWidth: 52,
                    background: '#fff',
                  }}
                >
                  {PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor='sort-by' className='mr-2 text-sm text-gray-800'>
                  Sort by:
                </label>
                <select
                  id='sort-by'
                  className='border rounded px-3 py-1.5 text-sm focus:outline-none'
                  value={sortBy}
                  onChange={handleSortChange}
                  style={{
                    fontFamily: FONT_FAMILY,
                    minWidth: 74,
                    background: '#fff',
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div
            id='post-grid'
            className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'
            style={{ fontFamily: FONT_FAMILY }}
          >
            {renderPosts()}
          </div>
          {renderPagination()}
        </section>
      </main>
    </div>
  );
};

export default IdeasPage;

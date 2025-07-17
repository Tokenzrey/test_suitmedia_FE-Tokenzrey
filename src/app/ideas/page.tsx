'use client';
export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { IdeaPost, SuitmediaIdeas } from '@/types/ideas';

const API_BASE_URL = '/api/ideas';
const HEADER_HEIGHT = 72;
const ORANGE = '#FF6600';
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

function PostCard({ post }: { post: IdeaPost }) {
  const imageUrl =
    post.small_image?.[0]?.url ??
    `https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image`;
  const publishedDate = new Date(post.published_at).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );

  return (
    <article
      className={cn(
        'bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
      )}
    >
      <div className={cn('w-full aspect-[4/3] relative overflow-hidden')}>
        <Image
          src={getProxyUrl(imageUrl)}
          alt={post.title}
          fill
          loading='lazy'
          sizes='(max-width: 768px) 100vw, 25vw'
          className='object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>
      <div className='p-4 flex-1 flex flex-col'>
        <time
          className='text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase'
          dateTime={post.published_at}
        >
          {publishedDate}
        </time>
        <h3
          className='font-semibold text-base text-gray-800 line-clamp-3 flex-1 hover:text-orange-600 transition-colors'
          title={post.title}
        >
          {post.title}
        </h3>
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className='flex items-center justify-center mt-8 mb-4'
      aria-label='Pagination'
    >
      <div className='flex items-center gap-1'>
        <button
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          )}
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          aria-label='Previous page'
        >
          ← Previous
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={idx} className='px-3 py-2 text-gray-400'>
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100',
              )}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}

        <button
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100',
          )}
          disabled={currentPage === totalPages}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          aria-label='Next page'
        >
          Next →
        </button>
      </div>
    </nav>
  );
}

function Filters({
  itemsPerPage,
  sortBy,
  handleSortChange,
  handlePerPageChange,
}: {
  itemsPerPage: number;
  sortBy: string;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
      <div className='flex items-center gap-2'>
        <label
          htmlFor='show-per-page'
          className='text-sm text-gray-700 font-medium'
        >
          Show per page:
        </label>
        <select
          id='show-per-page'
          className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
          value={itemsPerPage}
          onChange={handlePerPageChange}
        >
          {PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className='flex items-center gap-2'>
        <label htmlFor='sort-by' className='text-sm text-gray-700 font-medium'>
          Sort by:
        </label>
        <select
          id='sort-by'
          className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
          value={sortBy}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const IdeasPage = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('-published_at');
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);
  const [bannerOffset, setBannerOffset] = useState<number>(0);

  // State persistence: only client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ideaPageState');
      if (saved) {
        try {
          const state = JSON.parse(saved) as {
            currentPage: number;
            itemsPerPage: number;
            sortBy: string;
          };
          if (typeof state.currentPage === 'number')
            setCurrentPage(state.currentPage);
          if (typeof state.itemsPerPage === 'number')
            setItemsPerPage(state.itemsPerPage);
          if (typeof state.sortBy === 'string') setSortBy(state.sortBy);
        } catch {
          setCurrentPage(1);
          setItemsPerPage(10);
          setSortBy('-published_at');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'ideaPageState',
        JSON.stringify({ currentPage, itemsPerPage, sortBy }),
      );
    }
  }, [currentPage, itemsPerPage, sortBy]);

  // Header scroll hide/show (client only)
  const lastScrollY = useRef<number>(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      const y = window.scrollY;
      setHeaderHidden(y > lastScrollY.current && y > HEADER_HEIGHT);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Banner parallax effect (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      const scrolled = window.scrollY;
      setBannerOffset(scrolled * 0.3);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Client-only fetch
  const fetchIdeas = async (): Promise<SuitmediaIdeas> => {
    if (typeof window === 'undefined')
      return {
        data: [],
        links: {
          first: '',
          last: '',
          prev: null,
          next: null,
        },
        meta: {
          current_page: 1,
          from: 0,
          last_page: 1,
          links: [],
          path: '',
          per_page: 10,
          to: 0,
          total: 0,
        },
      };
    const params = new URLSearchParams({
      'page[number]': currentPage.toString(),
      'page[size]': itemsPerPage.toString(),
      sort: sortBy,
    });
    params.append('append[]', 'small_image');
    params.append('append[]', 'medium_image');

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const { data, error, isLoading, refetch } = useQuery<SuitmediaIdeas, Error>({
    queryKey: ['ideas', currentPage, itemsPerPage, sortBy],
    queryFn: fetchIdeas,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: typeof window !== 'undefined',
  });

  const bannerUrl =
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop';

  const totalItems =
    typeof data !== 'undefined' &&
    data &&
    'meta' in data &&
    typeof data.meta.total === 'number'
      ? data.meta.total
      : 0;
  const totalPages =
    typeof data !== 'undefined' &&
    data &&
    'meta' in data &&
    typeof data.meta.last_page === 'number'
      ? data.meta.last_page
      : 1;

  const getShowingInfo = () => {
    if (isLoading || typeof data === 'undefined' || !data || !('meta' in data))
      return 'Loading...';
    if (totalItems === 0) return 'No items found';
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
    return `Showing ${startItem} - ${endItem} of ${totalItems}`;
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const menu = getMenu(pathname);

  return (
    <div className='font-sans bg-[#fafafb] min-h-screen'>
      <header
        id='main-header'
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-transform duration-300',
          headerHidden && '-translate-y-full',
        )}
        style={{
          height: HEADER_HEIGHT,
          background: ORANGE,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
            <Link href='/' className='flex items-center h-full'>
              <Image
                src='/api/logo-proxy'
                alt='Suitmedia Digital Agency'
                width={100}
                height={32}
                style={{
                  marginRight: 12,
                  height: 32,
                  filter: 'brightness(0) invert(1)',
                }}
                className='ease-in-out duration-200 transition-all site-logo logos-invert'
              />
            </Link>
          </div>
          <nav className='flex items-center gap-8'>
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors font-medium px-2 py-1 relative',
                  item.active
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                    : 'text-white/90 hover:text-white',
                )}
              >
                {item.label}
              </Link>
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
              alt='Ideas Banner'
              fill
              priority
              className='object-cover'
              style={{ zIndex: 0 }}
            />
            <div className='absolute inset-0 bg-black/50'></div>
            <div
              className='absolute bottom-0 right-0 w-0 h-0'
              style={{
                borderBottom: '64px solid #fafafb',
                borderLeft: '100vw solid transparent',
                zIndex: 10,
              }}
            />
          </div>
          <div className='relative z-20 text-center px-4 flex flex-col items-center justify-center w-full'>
            <h1 className='text-4xl md:text-5xl font-bold drop-shadow-lg mb-4'>
              Ideas
            </h1>
            <p className='text-lg md:text-xl drop-shadow-md font-normal'>
              Where all our great things begin
            </p>
          </div>
        </section>

        <section
          className='mx-auto px-4 md:px-10'
          style={{ maxWidth: 1200, paddingTop: 36 }}
        >
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
            <div className='flex items-center gap-4'>
              <p className='text-gray-800 text-sm font-medium'>
                {getShowingInfo()}
              </p>
            </div>
            <Filters
              itemsPerPage={itemsPerPage}
              sortBy={sortBy}
              handleSortChange={handleSortChange}
              handlePerPageChange={handlePerPageChange}
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {error ? (
              <div className='col-span-full text-center py-12'>
                <div className='text-red-500 text-lg mb-4'>
                  ⚠️ Failed to load ideas
                </div>
                <p className='text-gray-600 mb-4'>{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors'
                >
                  Try Again
                </button>
              </div>
            ) : typeof data !== 'undefined' &&
              data &&
              'data' in data &&
              Array.isArray(data.data) &&
              data.data.length > 0 ? (
              data.data.map((post: IdeaPost) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className='col-span-full text-center py-12'>
                <div className='text-gray-400 text-6xl mb-4'>📝</div>
                <p className='text-gray-500 text-lg'>No ideas found</p>
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </section>
      </main>
    </div>
  );
};

export default IdeasPage;

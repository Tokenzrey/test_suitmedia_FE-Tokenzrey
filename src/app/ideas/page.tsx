'use client';
export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { IdeaPost, Links, Meta, SuitmediaIdeas } from '@/types/ideas';

function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

const API_BASE_URL = '/api/ideas';
const BANNER_API_URL = '/api/banner';
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

function useFormattedDate(dateStr: string) {
  const hasMounted = useHasMounted();
  return useMemo(() => {
    if (!hasMounted) return dateStr;
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, [dateStr, hasMounted]);
}

function PostCard({ post }: { post: IdeaPost }) {
  const hasMounted = useHasMounted();
  const formattedDate = useFormattedDate(post.published_at);
  const [imgSrc, setImgSrc] = useState(
    getProxyUrl(post.small_image?.[0]?.url ?? ''),
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (imgError) {
      setImgSrc(
        getProxyUrl(
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
        ),
      );
    }
  }, [imgError]);

  if (!hasMounted) {
    return (
      <article
        className={cn(
          'bg-white rounded-lg shadow-md overflow-hidden flex flex-col',
        )}
      >
        <div className={cn('w-full aspect-[4/3] relative overflow-hidden')}>
          <div className='bg-gray-200 w-full h-full' />
        </div>
        <div className='p-4 flex-1 flex flex-col'>
          <time
            className='text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase'
            dateTime={post.published_at}
          >
            {post.published_at}
          </time>
          <h3
            className='font-semibold text-base text-gray-800 line-clamp-3 flex-1'
            title={post.title}
          >
            {post.title}
          </h3>
        </div>
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
      )}
    >
      <div className={cn('w-full aspect-[4/3] relative overflow-hidden')}>
        <Image
          src={imgSrc}
          alt={post.title}
          fill
          loading='lazy'
          sizes='(max-width: 768px) 100vw, 25vw'
          className='object-cover transition-transform duration-300 hover:scale-105'
          onError={() => setImgError(true)}
          priority={false}
        />
      </div>
      <div className='p-4 flex-1 flex flex-col'>
        <time
          className='text-xs text-gray-500 mb-2 font-medium tracking-wide uppercase'
          dateTime={post.published_at}
        >
          {formattedDate}
        </time>
        <h3
          className='font-semibold text-base text-gray-800 line-clamp-3 flex-1 hover:text-orange-600 transition-colors'
          title={post.title}
        >
          {post.title}
        </h3>
      </div>
    </motion.article>
  );
}

function CardSkeleton({ keyId }: { keyId: number }) {
  return (
    <div
      key={keyId}
      className='bg-white rounded-lg shadow-md overflow-hidden flex flex-col animate-pulse'
    >
      <div className='w-full aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer' />
      </div>
      <div className='p-4 flex-1 flex flex-col'>
        <div className='h-3 bg-gray-200 rounded mb-2 w-1/3' />
        <div className='h-4 bg-gray-200 rounded mb-1' />
        <div className='h-4 bg-gray-200 rounded w-3/4' />
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  isFetching,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  isFetching: boolean;
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
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
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
            isFetching && 'pointer-events-none opacity-60',
          )}
          disabled={currentPage === 1 || isFetching}
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
                isFetching && 'pointer-events-none opacity-60',
              )}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              disabled={isFetching}
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
            isFetching && 'pointer-events-none opacity-60',
          )}
          disabled={currentPage === totalPages || isFetching}
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
  onSortChange,
  onPerPageChange,
  isFetching,
}: {
  itemsPerPage: number;
  sortBy: string;
  onSortChange: (newSort: string) => void;
  onPerPageChange: (newPerPage: number) => void;
  isFetching: boolean;
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
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          disabled={isFetching}
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
          onChange={(e) => onSortChange(e.target.value)}
          disabled={isFetching}
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

const dummyLinks: Links = {
  first: '',
  last: '',
  prev: null,
  next: null,
};
const dummyMeta: Meta = {
  current_page: 1,
  from: 0,
  last_page: 1,
  links: [],
  path: '',
  per_page: 10,
  to: 0,
  total: 0,
};

const IdeasSection = ({
  currentPage,
  itemsPerPage,
  sortBy,
  onSortChange,
  onPerPageChange,
  onPageChange,
  isPageAnimating,
}: {
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  onSortChange: (newSort: string) => void;
  onPerPageChange: (newPerPage: number) => void;
  onPageChange: (page: number) => void;
  isPageAnimating: boolean;
}) => {
  const hasMounted = useHasMounted();

  const fetchIdeas = useCallback(async (): Promise<SuitmediaIdeas> => {
    if (typeof window === 'undefined')
      return {
        data: [],
        links: dummyLinks,
        meta: dummyMeta,
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
  }, [currentPage, itemsPerPage, sortBy]);

  const { data, error, isLoading, isFetching, refetch } = useQuery<
    SuitmediaIdeas,
    Error
  >({
    queryKey: ['ideas', currentPage, itemsPerPage, sortBy],
    queryFn: fetchIdeas,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: typeof window !== 'undefined',
  });

  const totalItems =
    data && typeof (data as SuitmediaIdeas).meta?.total === 'number'
      ? (data as SuitmediaIdeas).meta!.total
      : 0;
  const totalPages =
    data && typeof (data as SuitmediaIdeas).meta?.last_page === 'number'
      ? (data as SuitmediaIdeas).meta!.last_page
      : 1;

  const [showingInfo, setShowingInfo] = useState('Loading...');
  useEffect(() => {
    if (isLoading || !data) {
      setShowingInfo('Loading...');
    } else if (totalItems === 0) {
      setShowingInfo('No items found');
    } else {
      const startItem = (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
      setShowingInfo(`Showing ${startItem} - ${endItem} of ${totalItems}`);
    }
  }, [isLoading, data, totalItems, currentPage, itemsPerPage]);

  if (!hasMounted) {
    return (
      <>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <div className='flex items-center gap-4'>
            <p className='text-gray-800 text-sm font-medium'>{showingInfo}</p>
          </div>
          <Filters
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            onSortChange={onSortChange}
            onPerPageChange={onPerPageChange}
            isFetching={isFetching}
          />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: itemsPerPage }, (_, i) => (
            <CardSkeleton key={i} keyId={i} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div className='flex items-center gap-4'>
          <p className='text-gray-800 text-sm font-medium'>{showingInfo}</p>
        </div>
        <Filters
          itemsPerPage={itemsPerPage}
          sortBy={sortBy}
          onSortChange={onSortChange}
          onPerPageChange={onPerPageChange}
          isFetching={isFetching}
        />
      </div>
      <AnimatePresence mode='wait'>
        <motion.div
          key={isPageAnimating ? 'animating' : 'cards'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        >
          {isLoading || isFetching || isPageAnimating ? (
            Array.from({ length: itemsPerPage }, (_, i) => (
              <CardSkeleton key={i} keyId={i} />
            ))
          ) : error ? (
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
          ) : data &&
            Array.isArray((data as SuitmediaIdeas).data) &&
            (data as SuitmediaIdeas).data.length > 0 ? (
            (data as SuitmediaIdeas).data.map((post: IdeaPost) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className='col-span-full text-center py-12'>
              <div className='text-gray-400 text-6xl mb-4'>📝</div>
              <p className='text-gray-500 text-lg'>No ideas found</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={onPageChange}
        isFetching={isFetching || isPageAnimating}
      />
    </>
  );
};

const IdeasPage = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('-published_at');
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);
  const [bannerOffset, setBannerOffset] = useState<number>(0);
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const hasMounted = useHasMounted();

  const [banner, setBanner] = useState<{
    url: string;
    alt?: string;
    title?: string;
    subtitle?: string;
  }>({
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    alt: 'Ideas Banner',
    title: 'Ideas',
    subtitle: 'Where all our great things begin',
  });
  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined') {
      fetch(BANNER_API_URL)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.url) setBanner(json);
        })
        .catch(() => {});
    }
  }, [hasMounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ideaPageState');
      if (saved) {
        try {
          const state: {
            currentPage: number;
            itemsPerPage: number;
            sortBy: string;
          } = JSON.parse(saved);
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

  const lastScrollY = useRef<number>(0);
  useEffect(() => {
    if (!hasMounted) return;
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setHeaderHidden(y > lastScrollY.current && y > HEADER_HEIGHT);
          lastScrollY.current = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    const parallax = () => {
      setBannerOffset(window.scrollY);
    };
    window.addEventListener('scroll', parallax, { passive: true });
    return () => window.removeEventListener('scroll', parallax);
  }, [hasMounted]);

  const handleSortChange = (newSort: string) => {
    setIsPageAnimating(true);
    setSortBy(newSort);
    setCurrentPage(1);
    setTimeout(() => setIsPageAnimating(false), 200);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setIsPageAnimating(true);
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
    setTimeout(() => setIsPageAnimating(false), 200);
  };

  const handlePageChange = (page: number) => {
    setIsPageAnimating(true);
    setCurrentPage(page);
    setTimeout(() => setIsPageAnimating(false), 200);
  };

  const menu = getMenu(pathname);

  return (
    <div className='font-sans bg-[#fafafb] min-h-screen'>
      <AnimatePresence>
        <motion.header
          id='main-header'
          initial={false}
          animate={
            headerHidden
              ? { y: -HEADER_HEIGHT, opacity: 0.96 }
              : { y: 0, opacity: 1 }
          }
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 30,
            duration: 0.35,
          }}
          style={{
            height: HEADER_HEIGHT,
            background: ORANGE,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
            position: 'fixed',
            width: '100vw',
            left: 0,
            top: 0,
            zIndex: 50,
            willChange: 'transform, opacity',
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
                  priority={false}
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
                  tabIndex={0}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </motion.header>
      </AnimatePresence>

      <main>
        <section
          className='relative flex items-center justify-center text-white overflow-hidden'
          style={{
            height: '340px',
            background: 'transparent',
            marginTop: HEADER_HEIGHT,
            zIndex: 0,
          }}
        >
          {hasMounted ? (
            <>
              <motion.div
                className='absolute inset-0 w-full h-full z-0'
                style={{
                  willChange: 'transform',
                  transform: `translateY(${bannerOffset * 0.5}px) scale(${1 + bannerOffset / 1200})`,
                  filter: `brightness(${1 - bannerOffset / 1800})`,
                }}
              >
                <Image
                  src={banner.url}
                  alt={banner.alt || 'Ideas Banner'}
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
              </motion.div>
              <motion.div
                className='relative z-20 text-center px-4 flex flex-col items-center justify-center w-full'
                style={{
                  willChange: 'transform, opacity',
                  transform: `translateY(${bannerOffset * 0.18}px) scale(${1 + bannerOffset / 2200})`,
                  opacity: 1 - Math.min(bannerOffset / 600, 0.3),
                }}
              >
                <h1 className='text-4xl md:text-5xl font-bold drop-shadow-lg mb-4'>
                  {banner.title || 'Ideas'}
                </h1>
                <p className='text-lg md:text-xl drop-shadow-md font-normal'>
                  {banner.subtitle || 'Where all our great things begin'}
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <div className='absolute inset-0 w-full h-full z-0'>
                <Image
                  src={banner.url}
                  alt={banner.alt || 'Ideas Banner'}
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
                  {banner.title || 'Ideas'}
                </h1>
                <p className='text-lg md:text-xl drop-shadow-md font-normal'>
                  {banner.subtitle || 'Where all our great things begin'}
                </p>
              </div>
            </>
          )}
        </section>

        <section
          className='mx-auto px-4 md:px-10'
          style={{ maxWidth: 1200, paddingTop: 36 }}
        >
          <IdeasSection
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onPerPageChange={handlePerPageChange}
            onPageChange={handlePageChange}
            isPageAnimating={isPageAnimating}
          />
        </section>
      </main>
    </div>
  );
};

export default IdeasPage;

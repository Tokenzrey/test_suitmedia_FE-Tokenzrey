'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type IdeaImage = { url: string };
type Idea = {
  id: number;
  title: string;
  published_at: string;
  small_image?: IdeaImage[];
  medium_image?: IdeaImage[];
};
type ApiResponse = {
  data: Idea[];
  meta: {
    total: number;
    last_page: number;
  };
  banner?: {
    url: string;
  };
};

const API_BASE_URL = '/api/ideas';
const HEADER_HEIGHT = 72;
const SORT_OPTIONS = [
  { value: '-published_at', label: 'Terbaru' },
  { value: 'published_at', label: 'Terlama' },
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

  const fetchIdeas = async (): Promise<ApiResponse> => {
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
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const { data, error, isLoading } = useQuery<ApiResponse, Error>({
    queryKey: ['ideas', currentPage, itemsPerPage, sortBy],
    queryFn: fetchIdeas,
    staleTime: 2 * 60 * 1000,
  });

  const bannerUrl =
    data?.banner?.url ||
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop';

  const [bannerOffset, setBannerOffset] = useState<number>(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      setBannerOffset(scrolled * 0.5);
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
    return data.data.map((post: Idea) => {
      const imageUrl =
        post.small_image && post.small_image[0]
          ? post.small_image[0].url
          : `https://placehold.co/400x300/e2e8f0/cbd5e0?text=No+Image`;
      const publishedDate = new Date(post.published_at).toLocaleDateString(
        'id-ID',
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
          )}
        >
          <div className={cn('w-full', 'aspect-[4/3]', 'relative')}>
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className={cn('object-cover')}
              loading='lazy'
              sizes='(max-width: 768px) 100vw, 25vw'
              style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
            />
          </div>
          <div className={cn('p-4 flex-1 flex flex-col')}>
            <p className={cn('text-xs text-gray-500 mb-2')}>{publishedDate}</p>
            <h3
              className={cn('font-bold text-md', 'line-clamp-3')}
              title={post.title}
              style={{ maxHeight: '4.5em', minHeight: '4.5em' }}
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
      <>
        <button
          className={cn(
            'px-3 py-1 border rounded-md text-sm',
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
            <span key={idx} className={cn('px-3 py-1')}>
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={cn(
                'px-3 py-1 border rounded-md text-sm',
                btn === currentPage
                  ? 'bg-[#FF6600] text-white border-[#FF6600]'
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
            'px-3 py-1 border rounded-md text-sm',
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
      </>
    );
  };

  const updateShowingInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
    return `Showing ${startItem} - ${endItem} of ${totalItems} items`;
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  const menu = getMenu(pathname);

  return (
    <div className={cn('font-sans bg-[#f8f9fa] min-h-screen')}>
      <header
        id='main-header'
        className={cn(
          'fixed top-0 left-0 right-0 z-50 shadow-md transition-transform duration-300 bg-white bg-opacity-90 backdrop-blur',
          headerHidden && '-translate-y-full',
        )}
        style={{ height: HEADER_HEIGHT }}
      >
        <div className={cn('container mx-auto px-6 py-4')}>
          <nav className={cn('flex items-center justify-between')}>
            <a href='/' className={cn('text-2xl font-bold text-[#FF6600]')}>
              Suitmedia
            </a>
            <div className={cn('hidden md:flex items-center space-x-8')}>
              {menu.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors',
                    item.active
                      ? 'font-bold text-[#FF6600] border-b-2 border-[#FF6600] pb-1'
                      : 'text-gray-700 hover:text-[#FF6600]',
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className={cn('md:hidden')}>
              <button className={cn('text-[#FF6600] focus:outline-none')}>
                <svg
                  className={cn('w-6 h-6')}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16m-7 6h7'
                  ></path>
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <section
          className={cn(
            'relative h-[60vh] flex items-center justify-center text-white overflow-hidden',
          )}
          style={{
            marginTop: HEADER_HEIGHT,
            background: 'transparent',
          }}
        >
          <div
            className={cn('absolute inset-0', 'w-full h-full z-0')}
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
              className={cn('object-cover')}
              style={{ zIndex: 0 }}
            />
            <div className={cn('absolute inset-0 bg-black/60')}></div>
            <div
              className={cn(
                'absolute bottom-0 right-0 w-0 h-0 border-b-[12vh] md:border-b-[15vh] border-l-[100vw] border-b-white border-l-transparent z-20',
              )}
            />
          </div>
          <div
            className={cn(
              'relative z-10 text-center px-4 flex flex-col items-center justify-center w-full',
            )}
          >
            <h1 className={cn('text-5xl md:text-7xl font-bold drop-shadow-lg')}>
              Ideas
            </h1>
            <p className={cn('text-xl md:text-2xl mt-4 drop-shadow-md')}>
              Where all our great things begin
            </p>
          </div>
        </section>
        <section className={cn('container mx-auto px-6 py-12')}>
          <div
            className={cn(
              'flex flex-col md:flex-row justify-between items-center mb-8 gap-4',
            )}
          >
            <p id='showing-info' className={cn('text-gray-600')}>
              {isLoading || !data ? 'Loading...' : updateShowingInfo()}
            </p>
            <div className={cn('flex items-center gap-4')}>
              <div>
                <label
                  htmlFor='show-per-page'
                  className={cn('mr-2 text-sm text-gray-600')}
                >
                  Show per page:
                </label>
                <select
                  id='show-per-page'
                  className={cn(
                    'border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500',
                  )}
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
              <div>
                <label
                  htmlFor='sort-by'
                  className={cn('mr-2 text-sm text-gray-600')}
                >
                  Sort by:
                </label>
                <select
                  id='sort-by'
                  className={cn(
                    'border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500',
                  )}
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
          </div>
          <div
            id='post-grid'
            className={cn(
              'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
            )}
          >
            {renderPosts()}
          </div>
          <div
            id='pagination-controls'
            className={cn('flex justify-center items-center mt-12 space-x-2')}
          >
            {renderPagination()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default IdeasPage;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// --- Types ---
type Idea = {
  id: number;
  title: string;
  published_at: string;
  small_image?: { url: string }[];
};

type ApiResponse = {
  data: Idea[];
  meta: {
    total: number;
    last_page: number;
  };
};

const API_BASE_URL = 'https://suitmedia-backend.suitdev.com/api/ideas';
const HEADER_HEIGHT = 72; // px, adjust if needed

const IdeasPage: React.FC = () => {
  // --- State Management ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('-published_at');
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);

  // --- Persist State to LocalStorage ---
  useEffect(() => {
    const savedState = localStorage.getItem('ideaPageState');
    if (savedState) {
      const { currentPage, itemsPerPage, sortBy } = JSON.parse(savedState);
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

  // --- Fetch Ideas ---
  const fetchIdeas = async (): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      'page[number]': currentPage.toString(),
      'page[size]': itemsPerPage.toString(),
      sort: sortBy,
    });
    params.append('append[]', 'small_image');
    params.append('append[]', 'medium_image');

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const { data, error, isLoading } = useQuery<ApiResponse, Error>({
    queryKey: ['ideas', currentPage, itemsPerPage, sortBy],
    queryFn: fetchIdeas,
  });

  // --- Scroll Header Hide/Show ---
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHeaderHidden(currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Pagination ---
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 1;

  // --- Render Functions ---
  const renderPosts = () => {
    if (isLoading)
      return (
        <p className='col-span-full text-center text-gray-500'>
          Fetching ideas...
        </p>
      );

    if (error)
      return (
        <p className='col-span-full text-center text-red-500'>
          Gagal memuat ide. Silakan periksa konsol untuk detailnya. (
          {error.message})
        </p>
      );

    if (!data || !data.data || !data.data.length)
      return (
        <p className='col-span-full text-center text-gray-500'>
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
          className='bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300'
        >
          <img
            src={imageUrl}
            alt={post.title}
            className='w-full h-48 object-cover'
            loading='lazy'
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x300/e2e8f0/cbd5e0?text=Error';
            }}
          />
          <div className='p-4'>
            <p className='text-xs text-gray-500 mb-2'>{publishedDate}</p>
            <h3
              className='font-bold text-md h-20 overflow-hidden text-ellipsis line-clamp-3'
              title={post.title}
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
        buttons.push('...');
      }
    }

    return (
      <>
        <button
          className={`px-3 py-1 border rounded-md text-sm ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          &laquo;
        </button>
        {buttons.map((btn, idx) =>
          btn === '...' ? (
            <span key={idx} className='px-3 py-1'>
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={`px-3 py-1 border rounded-md text-sm ${
                btn === currentPage
                  ? 'bg-[#FF6600] text-white border-[#FF6600]'
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => typeof btn === 'number' && setCurrentPage(btn)}
            >
              {btn}
            </button>
          ),
        )}
        <button
          className={`px-3 py-1 border rounded-md text-sm ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
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

  // --- Main Render ---
  return (
    <>
      {/* Global CSS Tailwind classes only */}
      <link
        rel='preconnect'
        href='https://fonts.googleapis.com'
        crossOrigin='anonymous'
      />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link
        href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        rel='stylesheet'
      />

      {/* Header */}
      <header
        id='main-header'
        className={`fixed top-0 left-0 right-0 z-50 bg-[#FF6600] shadow-md transition-transform duration-300 ${
          headerHidden ? '-translate-y-full' : ''
        }`}
        style={{ height: HEADER_HEIGHT }}
      >
        <div className='container mx-auto px-6 py-4'>
          <nav className='flex items-center justify-between'>
            {/* Logo */}
            <a href='#' className='text-2xl font-bold text-white'>
              Suitmedia
            </a>
            {/* Menu Navigasi */}
            <div className='hidden md:flex items-center space-x-8'>
              <a href='#' className='text-white/90 hover:text-white'>
                Work
              </a>
              <a href='#' className='text-white/90 hover:text-white'>
                About
              </a>
              <a href='#' className='text-white/90 hover:text-white'>
                Services
              </a>
              <a className='text-white font-bold border-b-2 border-white pb-1'>
                Ideas
              </a>
              <a href='#' className='text-white/90 hover:text-white'>
                Careers
              </a>
              <a href='#' className='text-white/90 hover:text-white'>
                Contact
              </a>
            </div>
            <div className='md:hidden'>
              <button className='text-white focus:outline-none'>
                <svg
                  className='w-6 h-6'
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
        {/* Banner Section */}
        <section
          className='relative h-[60vh] flex items-center justify-center text-white bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')",
            backgroundAttachment: 'fixed',
          }}
        >
          <div className='absolute inset-0 bg-black/60'></div>
          <div className='relative z-10 text-center px-4'>
            <h1 className='text-5xl md:text-7xl font-bold drop-shadow-lg'>
              Ideas
            </h1>
            <p className='text-xl md:text-2xl mt-4 drop-shadow-md'>
              Where all our great things begin
            </p>
          </div>
          {/* Segitiga Putih di Kanan Bawah */}
          <div className='absolute bottom-0 right-0 w-0 h-0 border-b-[12vh] md:border-b-[15vh] border-l-[100vw] border-b-white border-l-transparent z-20'></div>
        </section>

        {/* Posts Section */}
        <section className='container mx-auto px-6 py-12'>
          {/* Controls */}
          <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
            <p id='showing-info' className='text-gray-600'>
              {isLoading || !data ? 'Loading...' : updateShowingInfo()}
            </p>
            <div className='flex items-center gap-4'>
              <div>
                <label
                  htmlFor='show-per-page'
                  className='mr-2 text-sm text-gray-600'
                >
                  Show per page:
                </label>
                <select
                  id='show-per-page'
                  className='border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div>
                <label htmlFor='sort-by' className='mr-2 text-sm text-gray-600'>
                  Sort by:
                </label>
                <select
                  id='sort-by'
                  className='border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value='-published_at'>Newest</option>
                  <option value='published_at'>Oldest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Post Grid */}
          <div
            id='post-grid'
            className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
          >
            {renderPosts()}
          </div>

          {/* Pagination */}
          <div
            id='pagination-controls'
            className='flex justify-center items-center mt-12 space-x-2'
          >
            {renderPagination()}
          </div>
        </section>
      </main>
    </>
  );
};

export default IdeasPage;

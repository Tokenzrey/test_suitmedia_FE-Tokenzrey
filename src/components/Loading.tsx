export default function LoadingPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-[#fafafb] px-4'>
      <div className='w-full max-w-5xl mx-auto pt-16'>
        {/* Skeleton for header */}
        <div className='h-12 w-full bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 rounded-md mb-10 animate-pulse' />

        {/* Skeleton for banner */}
        <div className='relative w-full h-[240px] md:h-[340px] rounded-lg overflow-hidden mb-10'>
          <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse' />
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <div className='h-10 w-2/5 bg-gray-300 rounded mb-4 animate-pulse' />
            <div className='h-6 w-1/3 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        {/* Skeleton for post grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
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
          ))}
        </div>
      </div>
    </main>
  );
}

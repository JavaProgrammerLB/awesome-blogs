import { Card, Text, Tooltip } from '@radix-ui/themes'
import { Routes, Route, Link } from 'react-router'
import './App.css'
import blogsData from './assets/blogs.json'
import { resolveAvatar } from './services/avatarService'
import News from './components/News'
import { usePagination } from './hooks/usePagination';
import { Pagination } from './components/Pagination';
import { Footer } from './components/Footer'
import { TooltipProvider } from '@radix-ui/react-tooltip'


interface Blog {
  name: string;
  url: string;
  describe: string;
  avatar: string;
}

const blogs: Blog[] = blogsData as Blog[];

function Them() {
  const { currentItems, currentPage, totalPages, startIndex, endIndex, totalItems, setPage } = usePagination(blogs, 20);
  return (
    <div className='container mx-auto flex flex-col gap-4'>
      <div className='text-center text-sm text-gray-500 mb-2'>
        显示第 {startIndex + 1} - {endIndex} 项，共 {totalItems} 项
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentItems.map((blog) => (
          <Card key={blog.name} className="w-full">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-full relative overflow-hidden rounded-lg">
                {/* spacer to create a square box */}
                <div className="pb-[100%]"></div>
                <a href={blog.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 block">
                  <img
                    src={resolveAvatar(blog.avatar)}
                    alt={blog.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
              <div>
                <h3 className="text-3xl font-thick">
                  <a href={blog.url} target="_blank" rel="noopener noreferrer">
                    {blog.name}
                  </a>
                </h3>
              </div>
              <div className="flex flex-col justify-start items-start">
                <p className="text-sm text-gray-700">{blog.describe}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function App() {
  return (
    <div>
      {/* 导航栏 */}
      <nav className="bg-gray-100 p-4 mb-4">
        <TooltipProvider>
          <div className="max-w-7xl mx-auto flex gap-10">
            <Link to="/">
              <Tooltip content="Who thinking and write" side='top'>
                <Text weight="light" size="5" color='gray'>Them</Text>
              </Tooltip>
            </Link>
            <Link to="/new">
                <Text weight="light" size="5" color='green' className='hover:underline underline-offset-2'>NEW</Text>
            </Link>
          </div>
        </TooltipProvider>
      </nav>

      {/* 路由内容 */}
      <Routes>
        <Route path="/" element={<Them />} />
        <Route path="/new" element={<News />} />
      </Routes>

      {/* 底部信息 */}
      <Footer />
    </div>
  )
}

export default App;
export type { Blog };

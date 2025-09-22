import { Card, Text } from '@radix-ui/themes/dist/cjs/components/index.js'
import { Routes, Route, Link } from 'react-router'
import './App.css'
import blogsData from './assets/blogs.json'
import { resolveAvatar } from './services/avatarService'
import News from './components/News'
import { usePagination } from './hooks/usePagination';
import { Pagination } from './components/Pagination';
import { Footer } from './components/Footer'


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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((blog) => (
          <Card key={blog.name} className="w-full">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-64 aspect-square overflow-hidden rounded-lg">
                <a href={blog.url} target="_blank" rel="noopener noreferrer">
                  <img src={resolveAvatar(blog.avatar)} alt={blog.name} className="w-full h-full object-cover object-center" />
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
        <div className="max-w-7xl mx-auto flex gap-10">
          <Link to="/"><Text weight="light" size="5" color='gray'>Them</Text></Link>
          <Link to="/news"><Text weight="light" size="5" color='green' className='hover:underline underline-offset-2'>NEWS</Text></Link>
        </div>
      </nav>

      {/* 路由内容 */}
      <Routes>
        <Route path="/" element={<Them />} />
        <Route path="/news" element={<News />} />
      </Routes>

      {/* 底部信息 */}
      <Footer />
    </div>
  )
}

export default App;
export type { Blog };

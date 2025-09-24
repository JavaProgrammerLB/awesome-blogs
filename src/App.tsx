import { Card, Text } from '@radix-ui/themes'
import { Routes, Route, Link } from 'react-router'
import './App.css'
import blogsData from './assets/blogs.json'
import { resolveAvatar } from './services/avatarService'
import News from './components/News'
import { usePagination } from './hooks/usePagination';
import { Pagination } from './components/Pagination';
import { Footer } from './components/Footer'

interface LikeBlogItem {
  title: string;
  url: string;
}

interface Blog {
  name: string;
  url: string;
  describe?: string;
  avatar: string;
  like?: Array<LikeBlogItem>;
  feed?: string;
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
          <Card key={blog.name} className="w-full max-w-sm mx-auto shadow-lg border border-gray-200">
            <div className="flex flex-col gap-3">
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
                <a href={blog.url} target="_blank" rel="noopener noreferrer">
                  <span className="text-3xl font-thick">
                    {blog.name}
                    {blog.describe !== undefined && <span> / </span>}
                  </span>
                </a>
                <span className="text-xl text-gray-700">{blog.describe}</span>
              </div>
              {blog.like && blog.like.length > 0 && (
                <div className="w-full">
                  <div className='flex flex-col gap-4'>
                    {blog.like.slice(0, 3).map((item, index) => (
                      <div key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <span className='border-2 border-green-700 shadow-2xl rounded-2xl px-3 py-1.5'>
                            {item.title.length > 25 ? item.title.slice(0, 25) + '...' : item.title}
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
          <div className='flex flex-col'>
            <Link to="/">
              <div>
                <Text weight="light" size="7" color='gray' className='hover:underline underline-offset-2'>Them</Text>
              </div>
              <div className='text-sm text-gray-500'>喜欢思考，喜欢写作的人</div>
            </Link>
          </div>
          <Link to="/new">
            <div className='flex flex-col'>
              <div>
                <Text weight="light" size="7" color='green' className='hover:underline underline-offset-2'>NEW</Text>
              </div>
              <div className='text-sm text-gray-500'>看到他们有更新，我会很高兴</div>
            </div>
          </Link>
        </div>
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

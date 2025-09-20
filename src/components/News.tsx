import { useState } from 'react';
import rawItemData from '../assets/items.json'
import rawBlogData from '../assets/blogs.json'
import type { Blog } from '../App';
import { Link } from 'react-router';
import avatar from '../assets/avatar.webp'
import { Card, Button } from '@radix-ui/themes';

interface Item {
  blog_id: string;
  feed: string;
  item_name: string;
  item_url: string;
  time: string;
}

interface ItemData {
  update_time: 'string';
  items: Item[];
}

const itemData: ItemData = rawItemData as ItemData;
const items: Item[] = itemData.items;
const blogs: Blog[] = rawBlogData as Blog[];
const blogMap: Record<string, Blog> = {};

function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  blogs.forEach(blog => {
    blogMap[blog.name] = blog;
  });

  // 计算总页数
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='container mx-auto flex flex-col gap-4'>
      {/* 页面信息 */}
      <div className='text-center text-sm text-gray-500 mb-4'>
        显示第 {startIndex + 1} - {Math.min(endIndex, items.length)} 项，共 {items.length} 项
      </div>
      
      {/* 博客列表 */}
      {currentItems.map(item => (
        <Card key={item.item_url}>
          <div className='flex flex-row gap-2'>
            <div className='w-20 aspect-square overflow-hidden rounded-lg'>
              <img src={blogMap[item.blog_id]?.avatar === 'avatar.webp' ? avatar : blogMap[item.blog_id]?.avatar} />
            </div>
            <div className='flex flex-col gap-1'>
              <Link to={item.item_url}><h2 className='font-mono hover:underline'>{item.item_name}</h2></Link>
              <div>
                <Link to={blogMap[item.blog_id]?.url} className='text-sm text-gray-500 font-mono'>
                  <span className='hover:underline underline-offset-2'>{blogMap[item.blog_id]?.name}</span> <span >{new Date(item.time).toLocaleDateString()}</span>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {/* 分页导航 */}
      <div className='flex justify-center items-center gap-2 mt-8 mb-4'>
        {/* 上一页按钮 */}
        <Button 
          variant="outline" 
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          上一页
        </Button>
        
        {/* 页码显示 */}
        <div className='flex items-center gap-2'>
          {/* 显示前几页 */}
          {currentPage > 3 && (
            <>
              <Button variant="outline" onClick={() => handlePageChange(1)}>1</Button>
              {currentPage > 4 && <span className='text-gray-500'>...</span>}
            </>
          )}
          
          {/* 显示当前页周围的页码 */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (page > totalPages) return null;
            return (
              <Button
                key={page}
                variant={page === currentPage ? "solid" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}
          
          {/* 显示后几页 */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className='text-gray-500'>...</span>}
              <Button variant="outline" onClick={() => handlePageChange(totalPages)}>{totalPages}</Button>
            </>
          )}
        </div>
        
        {/* 下一页按钮 */}
        <Button 
          variant="outline" 
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}

export default News;
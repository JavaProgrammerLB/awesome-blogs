import rawItemData from '../assets/items.json'
import rawBlogData from '../assets/blogs.json'
import type { Blog } from '../App';
import { Link } from 'react-router';
import avatar from '../assets/avatar.webp'
import { Card } from '@radix-ui/themes';

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
  blogs.forEach(blog => {
    blogMap[blog.name] = blog;
  });
  return (
    <div className='container mx-auto flex flex-col gap-4'>
      {items.slice(0, 20).map(item => (
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
    </div>
  );
}

export default News;
import { Card } from '@radix-ui/themes/dist/cjs/components/index.js'
import './App.css'
import blogsData from './assets/blogs.json'
import avatar from './assets/avatar.webp'


function resolveAvatar(path: string): string {
  if (!path) return '';
  if (path === 'avatar.webp') return avatar;
  return path;
}

interface Blog {
  name: string;
  url: string;
  describe: string;
  avatar: string;
}

const blogs: Blog[] = blogsData as Blog[];

function App() {

  return (
    <div className="m-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <Card key={blog.name} className="w-full">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-64 aspect-square overflow-hidden rounded-lg">
                <img src={resolveAvatar(blog.avatar)} alt={blog.name} className="w-full h-full object-cover object-center" />
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
    </div>
  )
}

export default App

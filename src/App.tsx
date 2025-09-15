import { Flex, Text, Button } from '@radix-ui/themes/dist/cjs/components/index.js'
import './App.css'
import blogsData from './assets/blogs.json'

const blogs = blogsData

function App() {
  console.log(blogs)
  return (
    <>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>

      <Flex direction="column" gap="2">
        <Text>Hello from Radix Themes :)</Text>
        <Button>Let's go</Button>
      </Flex>
    </>
  )
}

export default App

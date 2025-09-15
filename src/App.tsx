import { Flex, Text, Button } from '@radix-ui/themes/dist/cjs/components/index.js'
import './App.css'

function App() {
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

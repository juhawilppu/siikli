import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import './App.css'

axios.defaults.baseURL = 'http://localhost:3000/api'

function App() {
  const [posts, setPosts] = useState<{ title: string; content: string }[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    axios.get('/auth/current-user')
  })

  useEffect(() => {
    axios.get('/posts').then((response) => {
      setPosts(response.data)
    })
  }, [])

  const save = async () => {
    try {
      await axios.post('/posts', {
        title,
        content,
      })
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        alert('Rate limit reached, try again later')
      }
    }
  }

  return (
    <>
      <h1>Juulia Stack</h1>
      <div className='card'>
        {posts.map((post) => (
          <div style={{ border: '1px solid black' }}>
            <div>{post.title}</div>
            <div>{post.content}</div>
          </div>
        ))}
        <h2>Title</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <h2>Content</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />{' '}
        <br />
        <button onClick={save}>Save</button>
      </div>
    </>
  )
}

export default App

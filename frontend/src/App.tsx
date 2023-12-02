import './App.css'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'

function App() {

  const [users, setUsers] = useState<{name:string}[]>([])
  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')

  useEffect(() => {
    axios.get('http://localhost:3000/posts').then(response => {
      setUsers(response.data)
    })

  },[])

  const save = async () => {
    try {
      await axios.post('http://localhost:3000/posts', {
        title, content
      })
    } catch (error: unknown) {
      console.log(error)
      console.log('k')
      if (error instanceof AxiosError && error.response?.status === 429) {
        console.log('ko')
        alert('Rate limit reached, try again later')
      }
    }
  }

  return (
    <>
      <h1>Juulia Stack</h1>
      <div className="card">
        {users.map((user) => (
          <div>{user.name}</div>
        ))}
        <h2>Title</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <h2>Content</h2>
        <textarea value={content} onChange={e=>setContent(e.target.value)} /> <br />
        <button onClick={save}>
          Save
        </button>
      </div>
    </>
  )
}

export default App

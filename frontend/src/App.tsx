import './App.css'
import axios from 'axios'
import { useEffect, useState } from 'react'

function App() {

  const [users, setUsers] = useState<{name:string}[]>([])
  const [u,setU]=useState('')
  
  useEffect(() => {
    axios.get('http://localhost:3000/users').then(response => {
      setUsers(response.data)
    })

  },[])

  const f = async () => {
    axios.post('http://localhost:3000/users', {
      name:u, email:u
    })
  }

  return (
    <>
      <h1>Juulia Stack</h1>
      <div className="card">
        {users.map((user) => (
          <div>{user.name}</div>
        ))}
        <input value={u} onChange={e=>setU(e.target.value)}></input>
        <button onClick={() => f()}>
Save
        </button>
      </div>
    </>
  )
}

export default App

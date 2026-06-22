import { useState, useEffect } from 'react'
import { LogOut, Send, Trash2, MessageSquare, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react'

interface Post {
  id: number
  name: string
  message: string
  created_at: string
}

function App() {
  // States for Post Data
  const [posts, setPosts] = useState<Post[]>([])
  const [name, setName] = useState(localStorage.getItem('auth_user_name') || '')
  const [message, setMessage] = useState('')

  // States for Authentication
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [isRegister, setIsRegister] = useState(false)

  // States for Input Forms
  const [authName, setAuthName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const baseUrl = 'https://synapse-backend-qs03.onrender.com'

  // Fetch All Posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/posts`)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Handle User Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: authName, email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('auth_user_name', data.user.name)
        setToken(data.access_token)
        setName(data.user.name)
      } else {
        setError(data.message || '登録に失敗しました。')
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。')
    }
  }

  // Handle User Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('auth_user_name', data.user.name)
        setToken(data.access_token)
        setName(data.user.name)
      } else {
        setError(data.message || 'ログイン情報が正しくありません。')
      }
    } catch (err) {
      setError('ログインに失敗しました。')
    }
  }

  // Handle User Logout
  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      })
    } catch (err) {
      console.error(err)
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user_name')
    setToken(null)
    setName('')
  }

  // Create New Post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !message || !token) return

    try {
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, message }),
      })

      if (response.ok) {
        setMessage('')
        fetchPosts()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Delete Post
  const handleDelete = async (id: number) => {
    if (!token) return
    try {
      const response = await fetch(`${baseUrl}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Format Timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get First Letter for Avatar
  const getAvatarLetter = (string: string) => {
    return string ? string.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className="min-h-screen bg-[#00afcc] py-16 px-4 font-sans antialiased text-slate-800">
      <div className="max-w-xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-12 bg-white p-5 border border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)]">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} className="text-slate-800" />
            <h1 className="text-2xl font-serif font-black tracking-tight text-slate-950">
              Synapse
            </h1>
          </div>
          {token && (
            <button onClick={handleLogout} className="flex items-center space-x-1 bg-slate-50 text-slate-600 hover:bg-slate-950 hover:text-white px-3 py-1.5 border border-slate-300 hover:border-slate-950 transition text-xs font-semibold">
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          )}
        </div>

        {/* Authentication View (Non-Authenticated Users) */}
        {!token ? (
          <div className="bg-white p-8 border border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] mb-12">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-6 text-center tracking-tight border-b border-slate-200 pb-3">
              {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </h2>
            
            {error && <p className="text-red-600 text-xs mb-4 text-center bg-red-50 py-2 border border-red-200 font-medium">{error}</p>}
            
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="text" placeholder="お名前" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfa] border border-slate-300 focus:outline-none focus:border-slate-800 text-sm transition-colors" required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfa] border border-slate-300 focus:outline-none focus:border-slate-800 text-sm transition-colors" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="password" placeholder="パスワード (8文字以上)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfa] border border-slate-300 focus:outline-none focus:border-slate-800 text-sm transition-colors" required />
              </div>
              
              <button type="submit" className="w-full bg-slate-950 text-white font-bold py-3 border border-slate-950 hover:bg-white hover:text-slate-950 transition-colors text-sm tracking-wider mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                {isRegister ? 'REGISTER' : 'LOGIN'}
              </button>
            </form>
            
            <div className="mt-6 text-center border-t border-slate-100 pt-4">
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-slate-500 hover:text-slate-900 text-xs font-semibold underline underline-offset-4 transition">
                {isRegister ? 'Already have an account?' : 'Create an account'}
              </button>
            </div>
          </div>
        ) : (
          /* Post Form View (Authenticated Users) */
          <form onSubmit={handleSubmit} className="bg-white p-6 border border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] mb-12 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 bg-slate-800 rounded-full"></span>
              <span>USER: <span className="text-slate-900">{name}</span></span>
            </div>
            <div>
              <textarea placeholder="ここにメッセージを書き込む..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 bg-[#fbfbfa] border border-slate-200 focus:outline-none focus:border-slate-800 text-base min-h-[100px] resize-none placeholder-slate-400 transition-colors" required />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="flex items-center space-x-2 bg-slate-950 text-white font-bold px-5 py-2 hover:bg-white hover:text-slate-950 border border-slate-950 transition-colors text-xs tracking-wider">
                <span>POST</span>
                <Send size={12} />
              </button>
            </div>
          </form>
        )}

        {/* Timeline View */}
        <div className="flex items-baseline justify-between mb-6 border-b-2 border-slate-950 pb-2">
          <h2 className="text-lg font-serif font-black text-slate-950 tracking-tight">TIMELINE</h2>
          <span className="text-xs font-mono font-bold text-slate-400">{posts.length} POSTS</span>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200">
              <p className="text-slate-400 text-sm font-medium">まだ投稿はありません。</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-5 border border-slate-200 flex items-start space-x-4 hover:border-slate-400 transition-colors relative">
                
                {/* User Avatar */}
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-serif font-bold text-base">
                  {getAvatarLetter(post.name)}
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline mb-1">
                    <strong className="text-base font-bold text-slate-900 mr-2">{post.name}</strong>
                    <span className="text-[11px] font-mono font-medium text-slate-400">{formatDate(post.created_at)}</span>
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed break-words pr-4">{post.message}</p>
                </div>

                {/* Delete Button */}
                {token && (
                  <button onClick={() => handleDelete(post.id)} className="text-slate-300 hover:text-slate-950 p-1.5 transition-colors flex-shrink-0" title="削除">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default App
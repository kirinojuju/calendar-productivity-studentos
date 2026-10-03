import { useState } from 'react'

export default function AuthPage({ onSubmit, onPreview }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try { await onSubmit(mode, email, password) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <main className="auth-screen">
    <div className="auth-card">
      <div className="auth-brand">StudentOS</div>
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h1>
      <p>Keep your plans, classes, money, and notes in one place.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 12 : 1} maxLength={256} value={password} onChange={event => setPassword(event.target.value)} required /></label>
        {mode === 'register' && <span className="auth-hint">Use at least 12 characters.</span>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button type="submit" className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
      <button className="auth-preview" type="button" onClick={onPreview}>Preview on this device</button>
      <p className="auth-preview-hint">Preview data stays in this browser until you import it into an account.</p>
    </div>
  </main>
}

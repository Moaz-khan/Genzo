import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAuth } from '../context/AuthContext';

type ViewState = 'login' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-reset';

const panelContent: Record<ViewState, { image: string; title: string; subtitle: string }> = {
  'login': {
    image: 'https://images.unsplash.com/photo-1511253819057-5408d4d70465?w=1000&h=1200&fit=crop&auto=format',
    title: 'The Lunar Edit',
    subtitle: 'Crescent moons and celestial motifs for quiet dreamers.'
  },
  'signup': {
    image: 'https://images.unsplash.com/photo-1656010280162-772358d9f4ed?w=900&h=650&fit=crop&auto=format',
    title: 'Everyday Elegance',
    subtitle: 'Minimal pieces designed to be worn every single day.'
  },
  'forgot-email': {
    image: 'https://images.unsplash.com/photo-1673131158656-84601f4d00ea?w=900&h=650&fit=crop&auto=format',
    title: 'Curated Gifts',
    subtitle: 'Beautifully packaged sets. Ready to gift to your loved ones.'
  },
  'forgot-otp': {
    image: 'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=1600&h=1000&fit=crop&auto=format',
    title: 'Timeless Classics',
    subtitle: 'Authentic 92.5 sterling silver made to last a lifetime.'
  },
  'forgot-reset': {
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&h=1000&fit=crop&auto=format',
    title: 'A New Chapter',
    subtitle: 'Secure your account and return to exploring our collections.'
  }
};

export default function LoginPage() {
  const { navigate } = useNav();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, continueAsGuest } = useAuth();
  const [view, setView] = useState<ViewState>('login');

  /* Form states */
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  /* Email Login handler */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmail(loginForm.email, loginForm.password);
    navigate('home');
  };

  /* Email Signup handler */
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signupWithEmail(signupForm.firstName, signupForm.lastName, signupForm.email, signupForm.password);
    navigate('home');
  };

  /* Google OAuth Login handler */
  const handleGoogleLogin = async () => {
    const session = await loginWithGoogle();
    setStatusMsg(`Logged in via Google as ${session.name} (${session.email})`);
    setTimeout(() => {
      navigate('home');
    }, 800);
  };

  /* Guest User handler */
  const handleGuestLogin = async () => {
    const session = await continueAsGuest();
    setStatusMsg(`Continuing as ${session.userId}. Fill shipping details at checkout!`);
    setTimeout(() => {
      navigate('home');
    }, 900);
  };

  const currentContent = panelContent[view];

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1400px] min-h-[900px] flex flex-col lg:flex-row rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
        
        {/* Left Panel (Dark, 55%) */}
        <div className="lg:w-[55%] relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-[#0A0A0A]">
          {Object.entries(panelContent).map(([key, content]) => (
            <div 
              key={key}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${view === key ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
              style={{ backgroundImage: `url("${content.image}")` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Bar Left Panel */}
          <div className="relative z-10 flex justify-end items-center w-full">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('login')} 
                className={`text-sm font-medium hover:text-[#E8392A] transition-colors ${view === 'login' ? 'text-[#E8392A]' : ''}`}
              >
                Log In
              </button>
              <button 
                onClick={() => setView('signup')} 
                className={`px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20 text-sm font-medium hover:bg-white/20 transition-all ${view === 'signup' ? 'bg-white/20' : 'bg-white/10'}`}
              >
                Join Us
              </button>
            </div>
          </div>

          {/* Bottom Overlay Text */}
          <div className="relative z-10 mt-auto pt-20 animate-in fade-in slide-in-from-bottom-4 duration-700" key={currentContent.title}>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">{currentContent.title}</h2>
            <p className="text-white/80 text-lg font-sans max-w-md leading-relaxed">{currentContent.subtitle}</p>
          </div>
        </div>

        {/* Right Panel (White, 45%) */}
        <div className="lg:w-[45%] flex flex-col px-8 sm:px-16 lg:px-24 py-8 sm:py-12 bg-white text-[#111111] overflow-y-auto">
          
          {/* Top Bar Right Panel */}
          <div className="flex justify-between items-center w-full mb-8 sm:mb-14">
            <div 
              className="font-serif font-bold text-2xl tracking-widest cursor-pointer text-charcoal flex flex-col leading-none" 
              onClick={() => navigate('home')}
            >
              GENZO
              <span className="text-[9px] tracking-[0.4em] text-gold font-sans font-medium mt-1">SILVER</span>
            </div>
            <button className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
              🇬🇧 EN 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>

          {/* Success Status Banner */}
          {statusMsg && (
            <div className="mb-6 p-4 rounded-xl bg-gold/15 border border-gold text-charcoal text-xs font-sans font-semibold flex items-center gap-2 animate-in fade-in">
              <span>✨</span>
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Form Container */}
          <div className="w-full max-w-[420px] mx-auto flex-1">
            
            {view === 'login' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Hi Dear</h1>
                <p className="text-gray-500 mb-8 text-lg">Welcome back to Genzo</p>

                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button type="button" onClick={() => setView('forgot-email')} className="text-sm font-semibold text-[#E8392A] hover:text-[#c42d20] transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="pt-4 pb-2">
                    <button type="submit" className="w-full py-4 rounded-xl bg-[#E8392A] hover:bg-[#c42d20] text-white font-bold text-lg shadow-[0_8px_20px_-6px_rgba(232,57,42,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(232,57,42,0.5)] transition-all transform hover:-translate-y-0.5">
                      Login
                    </button>
                  </div>
                </form>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-4">
                  {/* Guest Login button */}
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-4 rounded-xl border border-gold/40 bg-gold/5 hover:bg-gold/15 flex items-center justify-center gap-3 font-semibold text-charcoal transition-colors group"
                  >
                    <span className="text-gold">👤</span>
                    <span>Continue as Guest</span>
                    <span className="text-[10px] bg-gold/20 text-gold-dark font-mono px-2 py-0.5 rounded-full font-bold ml-1">Auto ID</span>
                  </button>

                  {/* Google OAuth Login button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Continue with Google
                  </button>
                </div>

                <p className="text-center text-gray-500 mt-8 font-medium">
                  Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-[#E8392A] hover:text-[#c42d20] font-semibold transition-colors">Sign up</button>
                </p>
              </div>
            )}

            {view === 'signup' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Hi Dear</h1>
                <p className="text-gray-500 mb-8 text-lg">Create your Genzo account</p>

                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={signupForm.firstName}
                      onChange={e => setSignupForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={signupForm.lastName}
                      onChange={e => setSignupForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={signupForm.email}
                      onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={signupForm.password}
                      onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50"
                    />
                  </div>
                  <div className="pt-4 pb-2">
                    <button type="submit" className="w-full py-4 rounded-xl bg-[#E8392A] hover:bg-[#c42d20] text-white font-bold text-lg shadow-[0_8px_20px_-6px_rgba(232,57,42,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(232,57,42,0.5)] transition-all transform hover:-translate-y-0.5">
                      Create Account & Generate Token
                    </button>
                  </div>
                </form>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-4">
                  <button type="button" onClick={handleGuestLogin} className="w-full py-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold text-gray-700 transition-colors">
                    Continue as Guest
                  </button>
                </div>

                <p className="text-center text-gray-500 mt-8 font-medium">
                  Already have an account? <button type="button" onClick={() => setView('login')} className="text-[#E8392A] hover:text-[#c42d20] font-semibold transition-colors">Log in</button>
                </p>
              </div>
            )}

            {view === 'forgot-email' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button type="button" onClick={() => setView('login')} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  Back to login
                </button>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Reset Password</h1>
                <p className="text-gray-500 mb-8 text-lg">Enter your email to receive an OTP</p>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail) return;
                  setForgotLoading(true);
                  setStatusMsg(null);
                  try {
                    const response = await fetch('/api/auth/forgot-password', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail }),
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(data.error || 'Could not send OTP');
                    setStatusMsg('Verification code sent to your email!');
                    setView('forgot-otp');
                  } catch (error) {
                    setStatusMsg(error instanceof Error ? error.message : 'Could not send OTP');
                  } finally {
                    setForgotLoading(false);
                  }
                }}>
                  <div>
                    <input type="email" placeholder="Email address" required value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50" />
                  </div>
                  <div className="pt-4 pb-2">
                    <button type="submit" disabled={forgotLoading}
                      className="w-full py-4 rounded-xl bg-[#E8392A] hover:bg-[#c42d20] text-white font-bold text-lg shadow-[0_8px_20px_-6px_rgba(232,57,42,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(232,57,42,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {forgotLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === 'forgot-otp' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button type="button" onClick={() => setView('forgot-email')} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  Back to email
                </button>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Enter OTP</h1>
                <p className="text-gray-500 mb-8 text-lg">We sent a secure code to your email.</p>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotOtp || forgotOtp.length !== 6) return;
                  setForgotLoading(true);
                  setStatusMsg(null);
                  try {
                    const response = await fetch('/api/auth/forgot-password', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(data.error || 'Invalid code');
                    setStatusMsg('Code verified! Set a new password.');
                    setView('forgot-reset');
                  } catch (error) {
                    setStatusMsg(error instanceof Error ? error.message : 'Invalid code');
                  } finally {
                    setForgotLoading(false);
                  }
                }}>
                  <div>
                    <input type="text" placeholder="6-digit OTP" required maxLength={6} pattern="\d{6}"
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-5 py-4 text-center tracking-[0.5em] text-2xl rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50" />
                  </div>
                  <div className="pt-4 pb-2">
                    <button type="submit" disabled={forgotLoading}
                      className="w-full py-4 rounded-xl bg-[#E8392A] hover:bg-[#c42d20] text-white font-bold text-lg shadow-[0_8px_20px_-6px_rgba(232,57,42,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(232,57,42,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>

                <p className="text-center text-gray-500 mt-8 font-medium">
                  Didn't receive code? <button type="button" onClick={async () => {
                    setForgotLoading(true);
                    try {
                      await fetch('/api/auth/forgot-password', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: forgotEmail }),
                      });
                      setStatusMsg('New code sent to your email!');
                    } catch { setStatusMsg('Could not resend code. Please try again.'); }
                    finally { setForgotLoading(false); }
                  }} className="text-[#E8392A] hover:text-[#c42d20] font-semibold transition-colors">Resend</button>
                </p>
              </div>
            )}

            {view === 'forgot-reset' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">New Password</h1>
                <p className="text-gray-500 mb-8 text-lg">Create a new secure password.</p>

                <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (forgotNewPassword !== forgotConfirmPassword) {
                    setStatusMsg('Passwords do not match.');
                    return;
                  }
                  if (forgotNewPassword.length < 8) {
                    setStatusMsg('Password must be at least 8 characters.');
                    return;
                  }
                  setForgotLoading(true);
                  setStatusMsg(null);
                  try {
                    const response = await fetch('/api/auth/reset-password', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword }),
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(data.error || 'Could not reset password');
                    setStatusMsg('Password reset successful! Please log in with your new password.');
                    setView('login');
                    setForgotOtp('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                  } catch (error) {
                    setStatusMsg(error instanceof Error ? error.message : 'Could not reset password');
                  } finally {
                    setForgotLoading(false);
                  }
                }}>
                  <div>
                    <input type="password" placeholder="New Password" required value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50" />
                  </div>
                  <div>
                    <input type="password" placeholder="Confirm Password" required value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E8392A] transition-all bg-gray-50/50" />
                  </div>
                  <div className="pt-4 pb-2">
                    <button type="submit" disabled={forgotLoading}
                      className="w-full py-4 rounded-xl bg-[#E8392A] hover:bg-[#c42d20] text-white font-bold text-lg shadow-[0_8px_20px_-6px_rgba(232,57,42,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(232,57,42,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                      {forgotLoading ? 'Saving...' : 'Save & Login'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Social Icons Bottom (Only on Login/Signup) */}
          {(view === 'login' || view === 'signup') && (
            <div className="mt-auto pt-10 flex justify-center gap-6 text-gray-400">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                <a key={social} href="#" className="hover:text-gray-900 transition-colors">
                  <span className="sr-only">{social}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    {social === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                    {social === 'twitter' && <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />}
                    {social === 'linkedin' && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />}
                    {social === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />}
                  </svg>
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

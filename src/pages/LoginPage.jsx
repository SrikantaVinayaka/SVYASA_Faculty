import { Eye, EyeSlash, GraduationCap } from "@phosphor-icons/react";
import { useState } from "react";

const VALID_USER = "admin";
const VALID_PASS = "123";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!username || !password) return setError("Please enter username and password.");
    setLoading(true);
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        onLogin(username);
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 600);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid overflow-hidden rounded-3xl border border-border bg-white shadow-xl lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden lg:flex flex-col justify-between p-8 bg-linear-to-br from-[#7B1D2E] via-[#9B2335] to-[#C05064] text-white">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-[12px] font-semibold">
            <GraduationCap size={14} />
            S-VYASA Faculty Portal
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/85">Manage dashboard, lesson planning, attendance and reports in one place.</p>
          </div>
          <p className="text-[12px] text-white/70">Modern faculty management platform</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9B2335]">Sign In</p>
            <h2 className="mt-1 text-[24px] font-bold text-text">Faculty Login</h2>
            <p className="mt-1 text-[12.5px] text-text2">Use your username and password to continue.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-[#E5B3B9] bg-[#FFF4F5] px-3 py-2 text-[12.5px] font-semibold text-[#9B2335]">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter username"
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[13px] text-text outline-none focus:border-[#D3A1A7]"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 pr-10 text-[13px] text-text outline-none focus:border-[#D3A1A7]"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text2 hover:bg-page-bg"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl bg-[#7B1D2E] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="mt-6 text-center text-[11.5px] text-text2">Demo credentials: <span className="font-semibold text-text">admin / 123</span></p>
        </div>
      </div>
    </main>
  );
}

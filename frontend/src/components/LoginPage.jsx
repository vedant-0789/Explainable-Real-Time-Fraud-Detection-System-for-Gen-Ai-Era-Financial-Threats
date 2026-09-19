import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Activity,
  PhoneCall,
  Terminal,
  Cpu
} from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Lead Fraud Analyst');
  const [loading, setLoading] = useState(false);

  const demoProfiles = [
    {
      name: 'Vedant Patil',
      email: 'vedant.patil@aegisx.ai',
      role: 'Lead Fraud Analyst',
      clearance: 'Tier-3 Master',
      avatar: 'VP',
      color: 'from-indigo-500 to-purple-600',
      badge: 'Tier 3 Senior'
    },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.j@aegisx.ai',
      role: 'Risk Operations Director',
      clearance: 'Executive Admin',
      avatar: 'SJ',
      color: 'from-amber-500 to-rose-600',
      badge: 'Executive Admin'
    },
    {
      name: 'Alex Mercer',
      email: 'alex.m@aegisx.ai',
      role: 'Cyber Incident Specialist',
      clearance: 'Tier-2 Investigator',
      avatar: 'AM',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Cyber Threat Specialist'
    }
  ];

  const handleCustomLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: email ? email.split('@')[0].toUpperCase() : 'Security Analyst',
        email: email || 'analyst@aegisx.ai',
        role: role,
        clearance: 'Level-2 Security',
        avatar: email ? email.substring(0, 2).toUpperCase() : 'SA',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setLoading(false);
    }, 600);
  };

  const handleDemoSelect = (profile) => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        ...profile,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
        
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>GenAI Era Financial Cyber Defense Engine</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                AegisX <span className="gradient-text">Intelligence</span>
              </h1>
            </div>

            <p className="text-slate-300 text-base leading-relaxed">
              Explainable Real-Time Fraud Detection System designed for GenAI-Era Financial Threats. Powered by XGBoost, SHAP TreeExplainer, and Voice Scam NLP heuristics.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3">
              <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Sub-100ms Inference</h4>
                <p className="text-xs text-slate-400">Real-time PaySim transaction scoring</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">SHAP Explainer</h4>
                <p className="text-xs text-slate-400">Plain-English feature attributions</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3">
              <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Voice Scam Inspector</h4>
                <p className="text-xs text-slate-400">OTP phishing speech transcripts</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Analyst Workflows</h4>
                <p className="text-xs text-slate-400">Account freeze & escalation tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6">
          <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative space-y-6 bg-slate-950/80">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center justify-between">
                <span>Analyst Portal Login</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SYSTEM ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Choose a 1-Click Demo Profile or enter custom credentials</p>
            </div>

            {/* Quick Demo Login Profiles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                ⚡ 1-Click Quick Demo Login
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {demoProfiles.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoSelect(p)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} text-white font-extrabold text-xs flex items-center justify-center shadow-md`}>
                        {p.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.badge}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                or sign in with credentials
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email / Analyst ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="analyst@aegisx.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role / Department</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="Lead Fraud Analyst">Lead Fraud Analyst</option>
                  <option value="Risk Operations Officer">Risk Operations Officer</option>
                  <option value="Cyber Threat Investigator">Cyber Threat Investigator</option>
                  <option value="Compliance Auditor">Compliance Auditor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating Analyst...</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Secure Sign In to AegisX</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

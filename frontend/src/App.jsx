import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Send,
  Lock,
  ArrowUpRight,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Info,
  Sliders,
  Radio,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, tester, transactions, calls
  const [apiOnline, setApiOnline] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [expandedTxnId, setExpandedTxnId] = useState(null);
  const [txnSearch, setTxnSearch] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);

  // Calls State
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [callSearch, setCallSearch] = useState('');

  // Tester State
  const [testTxnForm, setTestTxnForm] = useState({
    step: 3,
    type: 'TRANSFER',
    amount: 850000.0,
    nameOrig: 'C987654321',
    oldbalanceOrg: 850000.0,
    newbalanceOrig: 0.0,
    nameDest: 'C123456789',
    oldbalanceDest: 0.0,
    newbalanceDest: 0.0,
    account_age_days: 12
  });
  const [scoringResult, setScoringResult] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // Call Tester State
  const [testCallForm, setTestCallForm] = useState({
    caller_identity: 'HDFC Bank Security Desk',
    phone_number: '+91-9876543210',
    duration_sec: 140,
    transcript: 'URGENT: This is Bank Fraud Security. Your account has been compromised. Share your 6-digit OTP code immediately to halt unauthorized transfer.'
  });
  const [callResult, setCallResult] = useState(null);
  const [callLoading, setCallLoading] = useState(false);

  // Fetch Dashboard Summary
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch (err) {
      setApiOnline(false);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch Transactions List
  const fetchTransactions = async () => {
    setLoadingTxns(true);
    try {
      const url = filterFlagged
        ? `${API_BASE_URL}/transactions?flagged_only=true`
        : `${API_BASE_URL}/transactions`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  // Fetch Calls List
  const fetchCalls = async () => {
    setLoadingCalls(true);
    try {
      const res = await fetch(`${API_BASE_URL}/calls`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    } finally {
      setLoadingCalls(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    fetchCalls();
  }, [filterFlagged]);

  // Handle Submit Transaction Score
  const handleScoreTransaction = async (e) => {
    if (e) e.preventDefault();
    setScoringLoading(true);
    setScoringResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTxnForm)
      });
      if (res.ok) {
        const data = await res.json();
        setScoringResult(data);
        fetchSummary();
        fetchTransactions();
      }
    } catch (err) {
      console.error("Scoring error:", err);
    } finally {
      setScoringLoading(false);
    }
  };

  // Handle Submit Call Score
  const handleScoreCall = async (e) => {
    if (e) e.preventDefault();
    setCallLoading(true);
    setCallResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/calls/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCallForm)
      });
      if (res.ok) {
        const data = await res.json();
        setCallResult(data);
        fetchSummary();
        fetchCalls();
      }
    } catch (err) {
      console.error("Call scoring error:", err);
    } finally {
      setCallLoading(false);
    }
  };

  // Preset Handlers
  const applyTxnPreset = (preset) => {
    if (preset === 'high_risk') {
      setTestTxnForm({
        step: 3,
        type: 'TRANSFER',
        amount: 950000.0,
        nameOrig: 'C99887766',
        oldbalanceOrg: 950000.0,
        newbalanceOrig: 0.0,
        nameDest: 'C11223344',
        oldbalanceDest: 0.0,
        newbalanceDest: 0.0,
        account_age_days: 5
      });
    } else if (preset === 'legit') {
      setTestTxnForm({
        step: 14,
        type: 'PAYMENT',
        amount: 32.50,
        nameOrig: 'C44332211',
        oldbalanceOrg: 5200.0,
        newbalanceOrig: 5167.50,
        nameDest: 'M987123',
        oldbalanceDest: 120000.0,
        newbalanceDest: 120032.50,
        account_age_days: 420
      });
    } else if (preset === 'cashout_fraud') {
      setTestTxnForm({
        step: 2,
        type: 'CASH_OUT',
        amount: 350000.0,
        nameOrig: 'C55667788',
        oldbalanceOrg: 355000.0,
        newbalanceOrig: 5000.0,
        nameDest: 'C99001122',
        oldbalanceDest: 0.0,
        newbalanceDest: 0.0,
        account_age_days: 14
      });
    }
  };

  const applyCallPreset = (preset) => {
    if (preset === 'otp_phishing') {
      setTestCallForm({
        caller_identity: 'Bank Security Desk',
        phone_number: '+91-9876543210',
        duration_sec: 120,
        transcript: 'URGENT: This is Bank Fraud Security. Your account has been compromised. Share your 6-digit OTP code immediately to halt unauthorized transfer.'
      });
    } else if (preset === 'legit_call') {
      setTestCallForm({
        caller_identity: 'Local Branch Agent',
        phone_number: '1800-220-4000',
        duration_sec: 60,
        transcript: 'Good morning, this is customer service confirming your appointment for tomorrow at 2 PM at the main branch.'
      });
    } else if (preset === 'impersonation_threat') {
      setTestCallForm({
        caller_identity: 'Police Inspector Legal Desk',
        phone_number: '+91-9811223344',
        duration_sec: 240,
        transcript: 'This is an urgent call from Police Cyber Cell. An arrest warrant has been issued in your name. You must immediately wire transfer penalty fees to our safe treasury account.'
      });
    }
  };

  // Utility badge styling
  const getRiskBadge = (level, score) => {
    if (level === 'HIGH' || score >= 0.70) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><ShieldAlert className="w-3 h-3 mr-1" /> HIGH RISK ({ (score * 100).toFixed(1) }%)</span>;
    } else if (level === 'MEDIUM' || score >= 0.40) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> SUSPICIOUS ({ (score * 100).toFixed(1) }%)</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="w-3 h-3 mr-1" /> SAFE ({ (score * 100).toFixed(1) }%)</span>;
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.type.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.nameOrig.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.nameDest.toLowerCase().includes(txnSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AegisX AI <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Major Project</span>
              </h1>
              <p className="text-xs text-slate-400">Explainable Real-Time Financial Fraud & Voice Scam Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Status indicator */}
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-slate-300 font-medium">{apiOnline ? 'FastAPI + XGBoost Online' : 'Backend Connecting...'}</span>
            </div>

            <button
              onClick={() => { fetchSummary(); fetchTransactions(); fetchCalls(); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 border-t border-slate-800/60 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'tester'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Test a Transaction (SHAP)</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Scored Transactions</span>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'calls'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Voice Scam Inspector</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Project Banner */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30">
              <div className="max-w-3xl space-y-2 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>XGBoost + SHAP TreeExplainer Engine</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Explainable Real-Time Fraud Detection for GenAI Financial Threats
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Combining real feature attribution (SHAP values) with rule-based voice scam heuristics to flag impersonation calls and explain financial transaction risk in plain English.
                </p>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Scored</span>
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-white">
                    {summary ? summary.total_transactions_processed : '---'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Processed transactions in SQLite</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fraud Flagged</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-rose-400 flex items-baseline gap-2">
                    {summary ? summary.fraud_transactions_flagged : '---'}
                    <span className="text-xs font-medium text-slate-400">({summary ? summary.fraud_rate_percentage : 0}%)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">PaySim anomaly flagged</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Scam Calls Intercepted</span>
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-amber-400 flex items-baseline gap-2">
                    {summary ? summary.scam_calls_intercepted : '---'}
                    <span className="text-xs font-medium text-slate-400">({summary ? summary.scam_call_rate_percentage : 0}%)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Voice impersonation triggers</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Risk Level Breakdown</span>
                  <Sliders className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-medium">High Risk</span>
                    <span className="font-bold text-white">{summary?.risk_distribution?.HIGH || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-medium">Medium</span>
                    <span className="font-bold text-white">{summary?.risk_distribution?.MEDIUM || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-medium">Low</span>
                    <span className="font-bold text-white">{summary?.risk_distribution?.LOW || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Critical Alerts */}
            <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Recent High-Risk Transaction Alerts & Explanations
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {summary?.recent_alerts?.length > 0 ? (
                  summary.recent_alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs text-indigo-300 font-semibold">{alert.id}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{alert.type}</span>
                          <span className="text-sm font-bold text-white">${alert.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span className="text-rose-200">{alert.primary_explanation}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          { (alert.risk_score * 100).toFixed(1) }% RISK
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No recent fraud alerts.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE TESTER */}
        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Input */}
            <div className="lg:col-span-6 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    Transaction Fraud Simulator
                  </h3>
                  <p className="text-xs text-slate-400">Input custom parameters or select a test scenario preset.</p>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyTxnPreset('high_risk')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors font-medium"
                  >
                    🚨 Preset 1: High-Risk $950k (3 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTxnPreset('cashout_fraud')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium"
                  >
                    ⚠️ Preset 2: Cash-Out Anomaly
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTxnPreset('legit')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-medium"
                  >
                    ✅ Preset 3: Normal Payment ($32.50)
                  </button>
                </div>

                <form onSubmit={handleScoreTransaction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Type</label>
                      <select
                        value={testTxnForm.type}
                        onChange={(e) => setTestTxnForm({...testTxnForm, type: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="TRANSFER">TRANSFER</option>
                        <option value="CASH_OUT">CASH_OUT</option>
                        <option value="PAYMENT">PAYMENT</option>
                        <option value="CASH_IN">CASH_IN</option>
                        <option value="DEBIT">DEBIT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.amount}
                        onChange={(e) => setTestTxnForm({...testTxnForm, amount: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Old Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.oldbalanceOrg}
                        onChange={(e) => setTestTxnForm({...testTxnForm, oldbalanceOrg: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Sender New Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.newbalanceOrig}
                        onChange={(e) => setTestTxnForm({...testTxnForm, newbalanceOrig: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Old Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.oldbalanceDest}
                        onChange={(e) => setTestTxnForm({...testTxnForm, oldbalanceDest: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient New Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.newbalanceDest}
                        onChange={(e) => setTestTxnForm({...testTxnForm, newbalanceDest: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Account Age (Days)</label>
                      <input
                        type="number"
                        value={testTxnForm.account_age_days}
                        onChange={(e) => setTestTxnForm({...testTxnForm, account_age_days: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hour of Day (1-24h)</label>
                      <input
                        type="number"
                        value={testTxnForm.step}
                        onChange={(e) => setTestTxnForm({...testTxnForm, step: parseInt(e.target.value) || 1})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={scoringLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
                  >
                    {scoringLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Run Real-Time XGBoost + SHAP Analysis</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Results Output & SHAP Explanations */}
            <div className="lg:col-span-6 space-y-6">
              {scoringResult ? (
                <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-6 animate-fadeIn">
                  {/* Score Gauge Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">TRANSACTION RECORD</span>
                      <h4 className="text-xl font-bold text-white">{scoringResult.id}</h4>
                    </div>
                    <div>{getRiskBadge(scoringResult.risk_level, scoringResult.risk_score)}</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Fraud Probability Score</span>
                      <span className={scoringResult.risk_score >= 0.50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {(scoringResult.risk_score * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          scoringResult.risk_score >= 0.70
                            ? 'bg-gradient-to-r from-rose-500 to-red-600'
                            : scoringResult.risk_score >= 0.40
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.max(5, scoringResult.risk_score * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* SHAP Plain English Explanations */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      SHAP Explainability Insights (Plain-English)
                    </h5>

                    <div className="space-y-2">
                      {scoringResult.explanations?.map((exp, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-200 leading-relaxed">{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top SHAP Feature Contributions Chart */}
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Top Feature Attributions (|SHAP Value|)
                    </h5>

                    <div className="space-y-2.5">
                      {scoringResult.shap_breakdown?.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{item.feature_name}</span>
                            <span className={`font-mono font-semibold ${item.shap_value > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {item.shap_value > 0 ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.shap_value > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, Math.abs(item.shap_value) * 150)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">No Simulation Executed Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">Fill out the transaction form or select a preset to generate a real-time XGBoost + SHAP explanation report.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Scored Transactions Registry
                </h3>
                <p className="text-xs text-slate-400">Click any row to expand natural language SHAP explanation breakdown.</p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by ID or type..."
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterFlagged}
                    onChange={(e) => setFilterFlagged(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <span>Flagged Only</span>
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount ($)</th>
                    <th className="py-3 px-4">Sender ID</th>
                    <th className="py-3 px-4">Risk Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => {
                      const isExpanded = expandedTxnId === t.id;
                      return (
                        <React.Fragment key={t.id}>
                          <tr
                            onClick={() => setExpandedTxnId(isExpanded ? null : t.id)}
                            className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono font-semibold text-indigo-300">{t.id}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">{t.type}</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">${t.amount.toLocaleString()}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{t.nameOrig}</td>
                            <td className="py-3.5 px-4">{getRiskBadge(t.risk_level, t.risk_score)}</td>
                            <td className="py-3.5 px-4">
                              <button className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-medium">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {isExpanded ? 'Hide' : 'Explain'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Row Details */}
                          {isExpanded && (
                            <tr className="bg-slate-900/90 border-b border-slate-800">
                              <td colSpan="6" className="p-4 space-y-3">
                                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-3">
                                  <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    Plain-English SHAP Explanation (Why this score was given)
                                  </h5>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-slate-400">Natural Language Sentences:</p>
                                      {t.explanations?.map((exp, idx) => (
                                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                                          <span className="text-indigo-400 font-bold">•</span>
                                          <span>{exp}</span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-slate-400">Top SHAP Feature Attributions:</p>
                                      {t.shap_breakdown?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800">
                                          <span className="text-slate-300">{item.feature_name}</span>
                                          <span className={item.shap_value > 0 ? 'text-rose-400 font-mono font-semibold' : 'text-emerald-400 font-mono font-semibold'}>
                                            {item.shap_value > 0 ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No transactions matched your search query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: VOICE SCAM INSPECTOR */}
        {activeTab === 'calls' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Call Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-amber-400" />
                    Voice Scam Call Analyzer
                  </h3>
                  <p className="text-xs text-slate-400">Simulate incoming voice call speech transcripts to detect impersonation & OTP phishing markers.</p>
                </div>

                {/* Call Presets */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyCallPreset('otp_phishing')}
                    className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors font-medium"
                  >
                    🚨 OTP Phishing Call
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCallPreset('impersonation_threat')}
                    className="text-xs px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium"
                  >
                    ⚠️ Police Arrest Threat
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCallPreset('legit_call')}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-medium"
                  >
                    ✅ Normal Call
                  </button>
                </div>

                <form onSubmit={handleScoreCall} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Claimed Caller Identity</label>
                    <input
                      type="text"
                      value={testCallForm.caller_identity}
                      onChange={(e) => setTestCallForm({...testCallForm, caller_identity: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Caller Phone Number</label>
                    <input
                      type="text"
                      value={testCallForm.phone_number}
                      onChange={(e) => setTestCallForm({...testCallForm, phone_number: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Voice Transcript Text</label>
                    <textarea
                      rows="4"
                      value={testCallForm.transcript}
                      onChange={(e) => setTestCallForm({...testCallForm, transcript: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={callLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all"
                  >
                    {callLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4" />
                        <span>Analyze Voice Speech Transcript</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Call Logs & Analysis Result */}
            <div className="lg:col-span-7 space-y-6">
              {callResult && (
                <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400">VOICE ANALYSIS REPORT</span>
                      <h4 className="text-lg font-bold text-white">{callResult.id}</h4>
                    </div>
                    <div>{getRiskBadge(callResult.risk_level, callResult.scam_score)}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Primary Scam Marker:</p>
                    <p className="text-sm font-semibold text-white">{callResult.primary_reason}</p>
                  </div>

                  {callResult.all_reasons?.length > 1 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-400">All Flagged Risk Markers:</p>
                      {callResult.all_reasons.map((r, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* History Table */}
              <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  Voice Call History Log
                </h4>

                <div className="space-y-3">
                  {calls.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{c.caller_identity} ({c.phone_number})</span>
                        <div>{getRiskBadge(c.risk_level, c.scam_score)}</div>
                      </div>
                      <p className="text-xs text-slate-300 font-mono italic bg-slate-950 p-2.5 rounded border border-slate-800">
                        "{c.transcript}"
                      </p>
                      <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {c.primary_reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b0f19] py-6 text-center text-xs text-slate-500">
        <p>Explainable Real-Time Fraud Detection System for GenAI-Era Financial Threats • Major Project Prototype</p>
      </footer>
    </div>
  );
}

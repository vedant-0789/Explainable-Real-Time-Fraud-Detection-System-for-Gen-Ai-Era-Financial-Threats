import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Download,
  FileSpreadsheet,
  LogOut,
  Bell,
  Smartphone,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Flame,
  Award
} from 'lucide-react';

import LoginPage from './components/LoginPage';
import ProfileView from './components/ProfileView';
import Toast from './components/Toast';

const API_BASE_URL = 'http://127.0.0.1:8080';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState({
    name: 'Vedant Patil',
    email: 'vedant.patil@aegisx.ai',
    role: 'Lead Fraud Analyst',
    clearance: 'Tier-3 Master Analyst',
    avatar: 'VP',
    loginTime: '19:30 PM'
  });

  // Active Navigation Tab: overview, tester, transactions, calls, profile
  const [activeTab, setActiveTab] = useState('overview');

  // Global Toast & Notification System State
  const [toast, setToast] = useState(null);
  const showToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Live Auto-Poll & API Connection State
  const [apiOnline, setApiOnline] = useState(false);
  const [autoPollEnabled, setAutoPollEnabled] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // User Action Tracking States
  const [frozenAccounts, setFrozenAccounts] = useState(new Set());
  const [escalatedTxns, setEscalatedTxns] = useState(new Set());
  const [verdictOverrides, setVerdictOverrides] = useState({});

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [expandedTxnId, setExpandedTxnId] = useState(null);
  const [txnSearch, setTxnSearch] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW, FLAGGED

  // Calls State
  const [calls, setCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [callSearch, setCallSearch] = useState('');

  // Transaction Tester Form State
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

  // Call Tester Form State
  const [testCallForm, setTestCallForm] = useState({
    caller_identity: 'HDFC Bank Fraud Security',
    phone_number: '+91-9876543210',
    duration_sec: 140,
    transcript: 'URGENT: This is Bank Fraud Security. Your account has been compromised. Share your 6-digit OTP code immediately to halt unauthorized transfer.'
  });
  const [callResult, setCallResult] = useState(null);
  const [callLoading, setCallLoading] = useState(false);

  // User Dropdown Menu state in Header
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
      const url = filterRiskLevel === 'FLAGGED'
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

  // Initial fetch and auto-poll effect
  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    fetchCalls();
  }, [filterRiskLevel]);

  useEffect(() => {
    if (!autoPollEnabled) return;
    const interval = setInterval(() => {
      fetchSummary();
      fetchTransactions();
      fetchCalls();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPollEnabled, filterRiskLevel]);

  // Submit Transaction Score
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
        showToast({
          type: data.risk_level === 'HIGH' ? 'danger' : 'success',
          title: `Transaction Scored: ${data.risk_level}`,
          message: `Score ${(data.fraud_probability * 100).toFixed(1)}% • ${data.verdict}`
        });
      }
    } catch (err) {
      console.error("Scoring error:", err);
      showToast({ type: 'error', title: 'Scoring Error', message: 'Failed to connect to backend' });
    } finally {
      setScoringLoading(false);
    }
  };

  // Submit Call Score
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
        showToast({
          type: data.scam_score >= 0.7 ? 'danger' : 'success',
          title: `Voice Transcript Scored: ${data.risk_level}`,
          message: `${data.primary_reason}`
        });
      }
    } catch (err) {
      console.error("Call scoring error:", err);
      showToast({ type: 'error', title: 'Scam Call Scoring Error', message: 'Failed to connect to backend' });
    } finally {
      setCallLoading(false);
    }
  };

  // Preset Handlers for Transaction Testing
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
      showToast({ type: 'info', title: 'Preset Applied', message: 'Loaded High-Risk Mule Account Drain Scenario' });
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
      showToast({ type: 'info', title: 'Preset Applied', message: 'Loaded Legitimate Merchant Payment Scenario' });
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
      showToast({ type: 'info', title: 'Preset Applied', message: 'Loaded Rapid Cash-Out Anomaly Scenario' });
    } else if (preset === 'carding_test') {
      setTestTxnForm({
        step: 1,
        type: 'PAYMENT',
        amount: 1.00,
        nameOrig: 'C77889900',
        oldbalanceOrg: 15.00,
        newbalanceOrig: 14.00,
        nameDest: 'M10203040',
        oldbalanceDest: 0.0,
        newbalanceDest: 1.00,
        account_age_days: 1
      });
      showToast({ type: 'info', title: 'Preset Applied', message: 'Loaded Micro Carding Probe Scenario' });
    }
  };

  // Preset Handlers for Call Testing
  const applyCallPreset = (preset) => {
    if (preset === 'otp_phishing') {
      setTestCallForm({
        caller_identity: 'Bank Security Desk',
        phone_number: '+91-9876543210',
        duration_sec: 120,
        transcript: 'URGENT: This is Bank Fraud Security. Your account has been compromised. Share your 6-digit OTP code immediately to halt unauthorized transfer.'
      });
      showToast({ type: 'info', title: 'Call Preset Loaded', message: 'OTP Phishing Urgent Threat Scenario' });
    } else if (preset === 'legit_call') {
      setTestCallForm({
        caller_identity: 'Local Branch Agent',
        phone_number: '1800-220-4000',
        duration_sec: 60,
        transcript: 'Good morning, this is customer service confirming your appointment for tomorrow at 2 PM at the main branch.'
      });
      showToast({ type: 'info', title: 'Call Preset Loaded', message: 'Normal Customer Service Appointment Call' });
    } else if (preset === 'impersonation_threat') {
      setTestCallForm({
        caller_identity: 'Police Inspector Legal Desk',
        phone_number: '+91-9811223344',
        duration_sec: 240,
        transcript: 'This is an urgent call from Police Cyber Cell. An arrest warrant has been issued in your name. You must immediately wire transfer penalty fees to our safe treasury account.'
      });
      showToast({ type: 'info', title: 'Call Preset Loaded', message: 'Police Law Enforcement Impersonation Threat' });
    } else if (preset === 'sim_swap') {
      setTestCallForm({
        caller_identity: 'Telecom Network Desk',
        phone_number: '+91-9700112233',
        duration_sec: 180,
        transcript: 'Your SIM card upgrade to 5G is pending. Please reply with the SMS verification pin sent to your mobile handset to maintain cellular service.'
      });
      showToast({ type: 'info', title: 'Call Preset Loaded', message: 'SIM Swap Social Engineering Scam' });
    }
  };

  // Quick Action Buttons Logic
  const handleFreezeAccount = (accId) => {
    setFrozenAccounts(prev => {
      const updated = new Set(prev);
      if (updated.has(accId)) {
        updated.delete(accId);
        showToast({ type: 'info', title: 'Account Unfrozen', message: `Account ${accId} active status restored.` });
      } else {
        updated.add(accId);
        showToast({ type: 'danger', title: 'Account Frozen', message: `Account ${accId} blocked across all payment rails.` });
      }
      return updated;
    });
  };

  const handleEscalateTxn = (txnId) => {
    setEscalatedTxns(prev => {
      const updated = new Set(prev);
      updated.add(txnId);
      return updated;
    });
    showToast({ type: 'warning', title: 'Case Escalated', message: `Transaction ${txnId} dispatched to Cyber Crime Unit.` });
  };

  const handleToggleVerdict = (txnId) => {
    setVerdictOverrides(prev => {
      const current = prev[txnId];
      const nextVerdict = current === 'FALSE_POSITIVE' ? 'CONFIRMED_FRAUD' : 'FALSE_POSITIVE';
      showToast({
        type: 'success',
        title: 'Verdict Recalibrated',
        message: `Transaction ${txnId} verdict set to ${nextVerdict}`
      });
      return { ...prev, [txnId]: nextVerdict };
    });
  };

  const handleRequest2FA = (accId) => {
    showToast({
      type: 'info',
      title: '2FA Verification Requested',
      message: `Step-Up authentication prompt sent to phone registered with account ${accId}.`
    });
  };

  const handleSendAlertSMS = (accId) => {
    showToast({
      type: 'success',
      title: 'Emergency SMS Dispatched',
      message: `Fraud alert SMS sent to customer owning account ${accId}.`
    });
  };

  // CSV Exporter Functions
  const exportTransactionsCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ["ID", "Time_Step", "Type", "Amount", "Sender", "Recipient", "Fraud_Probability", "Risk_Level", "Verdict"];
    const rows = transactions.map(t => [
      t.id,
      t.step,
      t.type,
      t.amount,
      t.nameOrig,
      t.nameDest,
      t.fraud_probability,
      t.risk_level,
      t.verdict
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aegisx_scored_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ type: 'success', title: 'Export Complete', message: 'Downloaded Scored Transactions CSV report.' });
  };

  const exportCallsCSV = () => {
    if (!calls || calls.length === 0) return;
    const headers = ["ID", "Caller_Identity", "Phone_Number", "Scam_Score", "Risk_Level", "Primary_Reason", "Transcript"];
    const rows = calls.map(c => [
      c.id,
      `"${c.caller_identity}"`,
      `"${c.phone_number}"`,
      c.scam_score,
      c.risk_level,
      `"${c.primary_reason}"`,
      `"${c.transcript.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aegisx_voice_scam_calls_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ type: 'success', title: 'Export Complete', message: 'Downloaded Voice Scam Call Logs CSV.' });
  };

  const exportSHAPReportJSON = (txn) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(txn, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SHAP_Audit_${txn.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({ type: 'info', title: 'SHAP Report Exported', message: `Downloaded forensic JSON audit for ${txn.id}.` });
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

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.nameOrig.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.nameDest.toLowerCase().includes(txnSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (filterRiskLevel === 'HIGH') return t.risk_level === 'HIGH' || t.fraud_probability >= 0.70;
    if (filterRiskLevel === 'MEDIUM') return t.risk_level === 'MEDIUM' || (t.fraud_probability >= 0.40 && t.fraud_probability < 0.70);
    if (filterRiskLevel === 'LOW') return t.risk_level === 'LOW' || t.fraud_probability < 0.40;
    return true;
  });

  // Render Login Page if logged out
  if (!currentUser) {
    return <LoginPage onLogin={(user) => { setCurrentUser(user); showToast({ type: 'success', title: 'Welcome', message: `Signed in as ${user.name}` }); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans">
      
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & System Title */}
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

          {/* Header Controls: Live Poll Status, Refresh, User Profile Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Auto-poll Toggle Button */}
            <button
              onClick={() => {
                setAutoPollEnabled(!autoPollEnabled);
                showToast({ type: 'info', title: 'Live Poll Toggled', message: `Auto-refresh ${!autoPollEnabled ? 'enabled (every 5s)' : 'paused'}` });
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                autoPollEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${apiOnline && autoPollEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{autoPollEnabled ? 'Live Sync Active' : 'Live Sync Paused'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => { fetchSummary(); fetchTransactions(); fetchCalls(); showToast({ type: 'success', title: 'Refreshed', message: 'Updated records from database' }); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* User Profile Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-indigo-400 leading-tight">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 space-y-1 z-50">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-1">
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                    <div className="mt-1.5 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentUser.clearance}
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveTab('profile'); setShowUserDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition-colors font-semibold"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>View Analyst Profile</span>
                  </button>

                  <button
                    onClick={() => { setCurrentUser(null); setShowUserDropdown(false); showToast({ type: 'info', title: 'Signed Out', message: 'You have logged out of AegisX' }); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2 transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs Header */}
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

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Analyst Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Project Hero Banner */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30">
              <div className="max-w-3xl space-y-2 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>XGBoost + SHAP TreeExplainer Engine Active</span>
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

            {/* Quick Actions & Recent Alerts */}
            <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Recent High-Risk Transaction Alerts & Explanations
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportTransactionsCSV}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-400 font-bold">{t.id}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-semibold text-white">{t.type}</span>
                        <span className="font-mono text-white font-bold">${t.amount?.toLocaleString()}</span>
                      </div>
                      <div>{getRiskBadge(t.risk_level, t.fraud_probability)}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-indigo-300">SHAP Explanation:</p>
                      {t.explanations?.map((exp, idx) => (
                        <p key={idx} className="text-slate-300">• {exp}</p>
                      ))}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => handleFreezeAccount(t.nameOrig)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                          frozenAccounts.has(t.nameOrig)
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {frozenAccounts.has(t.nameOrig) ? 'Account Frozen' : 'Freeze Sender Account'}
                      </button>

                      <button
                        onClick={() => handleEscalateTxn(t.id)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                          escalatedTxns.has(t.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        {escalatedTxns.has(t.id) ? 'Escalated to Cyber Cell' : 'Escalate Alert'}
                      </button>

                      <button
                        onClick={() => handleRequest2FA(t.nameOrig)}
                        className="text-xs px-2.5 py-1 rounded font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Request 2FA</span>
                      </button>

                      <button
                        onClick={() => handleSendAlertSMS(t.nameOrig)}
                        className="text-xs px-2.5 py-1 rounded font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Send Alert SMS</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEST A TRANSACTION */}
        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    Transaction Simulator & SHAP Explainer
                  </h3>
                  <p className="text-xs text-slate-400">Simulate financial transaction parameters to view sub-second XGBoost fraud scoring & SHAP feature attributions.</p>
                </div>

                {/* Preset Scenario Buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">Quick Presets:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyTxnPreset('high_risk')}
                      className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold transition-colors"
                    >
                      🚨 Mule Account Drain
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTxnPreset('cashout_fraud')}
                      className="text-xs px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold transition-colors"
                    >
                      ⚠️ Rapid Cash Out
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTxnPreset('carding_test')}
                      className="text-xs px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold transition-colors"
                    >
                      💳 Micro Carding Test
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTxnPreset('legit')}
                      className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors"
                    >
                      ✅ Merchant Payment
                    </button>
                  </div>
                </div>

                <form onSubmit={handleScoreTransaction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Type</label>
                      <select
                        value={testTxnForm.type}
                        onChange={(e) => setTestTxnForm({...testTxnForm, type: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Account ID</label>
                      <input
                        type="text"
                        value={testTxnForm.nameOrig}
                        onChange={(e) => setTestTxnForm({...testTxnForm, nameOrig: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Old Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={testTxnForm.oldbalanceOrg}
                        onChange={(e) => setTestTxnForm({...testTxnForm, oldbalanceOrg: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Account ID</label>
                      <input
                        type="text"
                        value={testTxnForm.nameDest}
                        onChange={(e) => setTestTxnForm({...testTxnForm, nameDest: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Account Age (Days)</label>
                      <input
                        type="number"
                        value={testTxnForm.account_age_days}
                        onChange={(e) => setTestTxnForm({...testTxnForm, account_age_days: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={scoringLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
                  >
                    {scoringLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Run XGBoost + SHAP Scoring Engine</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side: Scoring Results Card */}
            <div className="lg:col-span-6 space-y-6">
              {scoringResult ? (
                <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono text-indigo-400">ANALYSIS REPORT</span>
                      <h4 className="text-lg font-bold text-white">{scoringResult.id}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskBadge(scoringResult.risk_level, scoringResult.fraud_probability)}
                      <button
                        onClick={() => exportSHAPReportJSON(scoringResult)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        title="Export JSON Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Natural Language Explanations:</p>
                    <div className="space-y-1.5">
                      {scoringResult.explanations?.map((exp, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top SHAP Feature Attributions:</p>
                    <div className="space-y-1.5">
                      {scoringResult.shap_breakdown?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-300 font-medium">{item.feature_name}</span>
                          <span className={item.shap_value > 0 ? 'text-rose-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>
                            {item.shap_value > 0 ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Ready to Score Transaction</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Select a quick preset or fill in transaction details to test model inference and SHAP explainability.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SCORED TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  Scored Transactions Audit Log
                </h3>
                <p className="text-xs text-slate-400">All historical transactions with SHAP explanations and analyst quick controls</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={exportTransactionsCSV}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV Log</span>
                </button>
              </div>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">Risk Filter:</span>
                {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'FLAGGED'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterRiskLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterRiskLevel === lvl
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search ID, sender, recipient..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Sender / Recipient</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t) => {
                        const isExpanded = expandedTxnId === t.id;
                        const isFrozen = frozenAccounts.has(t.nameOrig);
                        const isEscalated = escalatedTxns.has(t.id);
                        const overrideVerdict = verdictOverrides[t.id];

                        return (
                          <React.Fragment key={t.id}>
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-white flex items-center gap-2">
                                <span>{t.id}</span>
                                {isFrozen && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">FROZEN</span>}
                                {isEscalated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">ESCALATED</span>}
                              </td>
                              <td className="p-4 font-semibold">{t.type}</td>
                              <td className="p-4 font-mono font-bold text-white">${t.amount?.toLocaleString()}</td>
                              <td className="p-4 font-mono text-slate-400">
                                <div>From: <span className="text-slate-200">{t.nameOrig}</span></div>
                                <div>To: <span className="text-slate-200">{t.nameDest}</span></div>
                              </td>
                              <td className="p-4">
                                {overrideVerdict ? (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {overrideVerdict}
                                  </span>
                                ) : (
                                  getRiskBadge(t.risk_level, t.fraud_probability)
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleFreezeAccount(t.nameOrig)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                      isFrozen
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}
                                  >
                                    {isFrozen ? 'Unfreeze' : 'Freeze'}
                                  </button>

                                  <button
                                    onClick={() => handleToggleVerdict(t.id)}
                                    className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                                  >
                                    Verdict
                                  </button>

                                  <button
                                    onClick={() => setExpandedTxnId(isExpanded ? null : t.id)}
                                    className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"
                                  >
                                    {isExpanded ? 'Hide' : 'Explain'}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded SHAP Breakdown Row */}
                            {isExpanded && (
                              <tr className="bg-slate-900/90 border-b border-slate-800">
                                <td colSpan="6" className="p-4">
                                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        Plain-English SHAP Feature Attribution
                                      </h5>
                                      <button
                                        onClick={() => exportSHAPReportJSON(t)}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Audit JSON</span>
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-400">Natural Language Explanations:</p>
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
                                            <span className={item.shap_value > 0 ? 'text-rose-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>
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
          </div>
        )}

        {/* TAB 4: VOICE SCAM INSPECTOR */}
        {activeTab === 'calls' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                    className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors font-semibold"
                  >
                    🚨 OTP Phishing
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCallPreset('impersonation_threat')}
                    className="text-xs px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-semibold"
                  >
                    ⚠️ Police Threat
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCallPreset('sim_swap')}
                    className="text-xs px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors font-semibold"
                  >
                    📲 SIM Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCallPreset('legit_call')}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-semibold"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Caller Phone Number</label>
                    <input
                      type="text"
                      value={testCallForm.phone_number}
                      onChange={(e) => setTestCallForm({...testCallForm, phone_number: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
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
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all"
                  >
                    {callLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
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

              {/* Voice Call History Log */}
              <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    Voice Call History Log
                  </h4>

                  <button
                    onClick={exportCallsCSV}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Call CSV</span>
                  </button>
                </div>

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

        {/* TAB 5: ANALYST PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onLogout={() => { setCurrentUser(null); showToast({ type: 'info', title: 'Signed Out', message: 'You have logged out' }); }}
            showToast={showToast}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b0f19] py-6 text-center text-xs text-slate-500">
        <p>Explainable Real-Time Fraud Detection System for GenAI-Era Financial Threats • Major Project Prototype</p>
      </footer>
    </div>
  );
}

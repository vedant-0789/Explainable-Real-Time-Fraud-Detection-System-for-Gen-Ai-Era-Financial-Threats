import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Award,
  Clock,
  Activity,
  LogOut,
  Bell,
  Settings,
  Lock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function ProfileView({ currentUser, onLogout, onTriggerAction, showToast }) {
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'ALT-9041',
      title: 'High-Value Mule Transfer ($850,000)',
      source: 'Transaction PaySim Engine',
      risk: 'HIGH',
      time: '12 mins ago',
      targetAccount: 'C987654321',
      status: 'UNDER_INVESTIGATION'
    },
    {
      id: 'ALT-8832',
      title: 'Voice Scam: Police Arrest Threat Intercepted',
      source: 'Voice Scam Analyzer',
      risk: 'HIGH',
      time: '45 mins ago',
      targetAccount: 'Phone: +91-9811223344',
      status: 'ACTION_REQUIRED'
    },
    {
      id: 'ALT-7721',
      title: 'Unusual Cash-Out Spike ($350,000)',
      source: 'Anomaly Detection',
      risk: 'MEDIUM',
      time: '2 hours ago',
      targetAccount: 'C55667788',
      status: 'MONITORING'
    }
  ]);

  const [settings, setSettings] = useState({
    autoPoll: '5s',
    audioAlerts: true,
    emailNotifications: true,
    themeAccent: 'Indigo Cyber'
  });

  const handleResolveAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast({
      type: 'success',
      title: 'Alert Resolved',
      message: `Incident ${alertId} marked as resolved and logged in security audit.`
    });
  };

  const handleEscalateAlert = (alert) => {
    setActiveAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'ESCALATED' } : a));
    showToast({
      type: 'danger',
      title: 'Escalated to Cyber Cell',
      message: `Case ${alert.id} (${alert.targetAccount}) dispatched to National Cyber Crime Unit.`
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Profile Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-white/20">
              {currentUser?.avatar || 'VP'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{currentUser?.name || 'Vedant Patil'}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  {currentUser?.clearance || 'Tier-3 Master Analyst'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>{currentUser?.role || 'Lead Fraud Analyst'}</span>
                <span>•</span>
                <span className="text-slate-400">{currentUser?.email || 'vedant.patil@aegisx.ai'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono">ID: AGX-88042</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Current Session</div>
              <div className="text-xs font-mono font-bold text-indigo-300">Started {currentUser?.loginTime || '19:30 PM'}</div>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analyst KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cases Audited</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">1,482</div>
          <p className="text-[11px] text-slate-400">+14% increase this week</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fraud Loss Prevented</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">$4.85M</div>
          <p className="text-[11px] text-slate-400">PaySim + Scam intercept</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Incident Response</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300">1.2s</div>
          <p className="text-[11px] text-slate-400">SHAP real-time analysis</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Detection Accuracy</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300">99.4%</div>
          <p className="text-[11px] text-slate-400">Validated via XGBoost</p>
        </div>
      </div>

      {/* Main Grid: Assigned Incidents & Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Assigned Incidents Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Assigned High-Risk Incidents Queue
                </h3>
                <p className="text-xs text-slate-400">Real-time fraud cases assigned to your analyst workspace</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                {activeAlerts.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {activeAlerts.length > 0 ? (
                activeAlerts.map(alert => (
                  <div key={alert.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-indigo-400">{alert.id}</span>
                          <span className="text-xs font-bold text-white">{alert.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Target: <span className="font-mono text-slate-200">{alert.targetAccount}</span> • {alert.time}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        alert.status === 'ESCALATED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => handleEscalateAlert(alert)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Escalate to Cyber Cell</span>
                      </button>

                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve Incident</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  All assigned incidents have been resolved! Great work.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Security Preferences & System Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Analyst Preferences & Live Sync
              </h3>
              <p className="text-xs text-slate-400">Customize dashboard polling and notification triggers</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Live Auto-Polling Frequency</label>
                <select
                  value={settings.autoPoll}
                  onChange={(e) => {
                    setSettings({...settings, autoPoll: e.target.value});
                    showToast({ type: 'info', title: 'Settings Saved', message: `Auto-polling set to ${e.target.value}` });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="3s">Fast (Every 3 seconds)</option>
                  <option value="5s">Standard (Every 5 seconds)</option>
                  <option value="10s">Relaxed (Every 10 seconds)</option>
                  <option value="Disabled">Disabled (Manual Refresh)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="font-semibold text-white">Audio Alarm on High Risk</div>
                  <div className="text-[11px] text-slate-400">Play sound when fraud score &gt; 0.70</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.audioAlerts}
                  onChange={(e) => {
                    setSettings({...settings, audioAlerts: e.target.checked});
                    showToast({ type: 'info', title: 'Preference Updated', message: `Audio alarms ${e.target.checked ? 'Enabled' : 'Disabled'}` });
                  }}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="font-semibold text-white">Instant Email Dispatch</div>
                  <div className="text-[11px] text-slate-400">Send SHAP summary to Cyber Crime Desk</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => {
                    setSettings({...settings, emailNotifications: e.target.checked});
                    showToast({ type: 'info', title: 'Preference Updated', message: `Email notifications ${e.target.checked ? 'Enabled' : 'Disabled'}` });
                  }}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

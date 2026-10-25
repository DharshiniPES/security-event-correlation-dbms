'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  PlusCircle, 
  X, 
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface IncidentsTabProps {
  incidents: any[];
  events: any[];
  meta: any;
  currentRole: string;
  onRefresh: () => void;
  onTriggerSla: () => void;
  isEscalating: boolean;
}

export default function IncidentsTab({
  incidents,
  events,
  meta,
  currentRole,
  onRefresh,
  onTriggerSla,
  isEscalating,
}: IncidentsTabProps) {
  // Modal State: Correlate / Create Incident via ACID Transaction
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [newIncident, setNewIncident] = useState({
    title: 'Adversary Persistence via Modified Sudoers & Cron Injection',
    description: 'Adversary achieved persistence by inserting backdoor cron jobs and tampering with the sudoers configuration file on the DMZ gateway node.',
    priority: 'P1-CRITICAL',
    assigned_analyst_id: '1', // Dharshini
    host_id: '1',
    event_ids: [] as number[],
  });

  // Modal State: Resolve Incident (Testing PostgreSQL Trigger Constraint)
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);
  const [triggerErrorMessage, setTriggerErrorMessage] = useState<string | null>(null);

  const analysts = (meta?.users || []).filter(
    (u: any) => u.role === 'Security_Analyst' || u.role === 'Administrator' || u.role === 'SOC_Manager'
  );
  const hosts = meta?.hosts || [];

  // Submit ACID Transaction Incident Creation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIncident,
          assigned_analyst_id: parseInt(newIncident.assigned_analyst_id, 10),
          host_id: newIncident.host_id ? parseInt(newIncident.host_id, 10) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create incident');
      } else {
        alert('Incident created atomically within multi-table ACID transaction!');
        setCreateModalOpen(false);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Submit Incident Resolution (Trigger Test)
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setResolveLoading(true);
    setTriggerErrorMessage(null);

    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: selectedIncident.incident_id,
          status: 'RESOLVED',
          resolution_notes: resolutionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Intercept trigger constraint violation and highlight for examiner
        setTriggerErrorMessage(data.error || 'Resolution failed');
      } else {
        alert('Incident successfully marked as RESOLVED by database trigger verification!');
        setResolveModalOpen(false);
        onRefresh();
      }
    } catch (err: any) {
      setTriggerErrorMessage(err.message);
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Incident Correlation & Response Lifecycle</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {incidents.length} Cases
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ACID multi-table transactions connect events, manage host quarantine, and enforce resolution documentation via triggers.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onTriggerSla}
            disabled={isEscalating}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold transition disabled:opacity-50"
            title="Calls PL/pgSQL Stored Procedure sp_auto_escalate_incidents"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>{isEscalating ? 'Executing Procedure...' : 'Run SLA Stored Procedure'}</span>
          </button>

          {currentRole !== 'Auditor' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Correlate Incident (ACID Transaction)</span>
            </button>
          )}
        </div>
      </div>

      {/* Incidents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {incidents.map((inc) => {
          const priorityStyle =
            inc.priority === 'P1-CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
            inc.priority === 'P2-HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
            inc.priority === 'P3-MEDIUM' ? 'bg-yellow-950 text-yellow-300 border-yellow-800' :
            'bg-blue-950 text-blue-300 border-blue-800';

          const statusBadge =
            inc.status === 'RESOLVED' || inc.status === 'CLOSED'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : inc.status === 'ESCALATED'
              ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
              : 'bg-cyan-950 text-cyan-400 border-cyan-800';

          return (
            <div
              key={inc.incident_id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Top Badges Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="font-bold text-white">{inc.incident_code}</span>
                    <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${priorityStyle}`}>
                      {inc.priority}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge}`}>
                    {inc.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {inc.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                  {inc.description}
                </p>

                {/* Correlated Events & Resolution Notes Info */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2 mb-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Layers className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Correlated Events:</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {inc.correlated_event_count || 0} Events Linked
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <User className="h-3.5 w-3.5 text-blue-400" />
                      <span>Lead Investigator:</span>
                    </span>
                    <span className="font-medium text-slate-200">
                      {inc.analyst_name || 'Unassigned'}
                    </span>
                  </div>

                  {inc.resolution_notes && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-emerald-400 font-semibold block mb-0.5">Resolution Playbook:</span>
                      <p className="text-slate-300 italic">"{inc.resolution_notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px] flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                </span>

                {inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && currentRole !== 'Auditor' && (
                  <button
                    onClick={() => {
                      setSelectedIncident(inc);
                      setResolutionNotes('');
                      setTriggerErrorMessage(null);
                      setResolveModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold transition text-[11px]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Resolve (Trigger Test)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Create Incident via ACID Transaction */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Correlate Security Incident (ACID Transaction)
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto text-xs space-y-4">
              <p className="text-slate-400 text-[11px]">
                Executes a PostgreSQL multi-table transaction with vector embedding generation and automatic rollback on error.
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Title:</label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Priority Level:</label>
                  <select
                    value={newIncident.priority}
                    onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="P1-CRITICAL">P1-CRITICAL (Auto-Isolates Host)</option>
                    <option value="P2-HIGH">P2-HIGH</option>
                    <option value="P3-MEDIUM">P3-MEDIUM</option>
                    <option value="P4-LOW">P4-LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Assigned Lead Analyst:</label>
                  <select
                    value={newIncident.assigned_analyst_id}
                    onChange={(e) => setNewIncident({ ...newIncident, assigned_analyst_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    {analysts.map((a: any) => (
                      <option key={a.user_id} value={a.user_id}>
                        {a.full_name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Associated Target Host:</label>
                <select
                  value={newIncident.host_id}
                  onChange={(e) => setNewIncident({ ...newIncident, host_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="">Select Host...</option>
                  {hosts.map((h: any) => (
                    <option key={h.host_id} value={h.host_id}>
                      {h.hostname} ({h.environment})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {createLoading ? 'Executing Transaction...' : 'Commit Transaction (BEGIN...COMMIT)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Resolve Incident (Testing PostgreSQL Trigger Constraint) */}
      {resolveModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Resolve Incident & Test Database Integrity Trigger
                </h3>
              </div>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-5 text-xs space-y-4">
              
              {/* Trigger Explanation Alert */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                <span className="text-amber-400 font-bold block mb-1">DBMS Trigger Demonstration:</span>
                Trigger <code className="text-cyan-400 font-mono">trg_validate_incident_closure</code> enforces that an incident CANNOT be resolved without thorough notes (&gt;= 15 characters).
                Try submitting with short or empty text to observe the PostgreSQL database exception!
              </div>

              {/* Error Callout if Trigger Fired an Exception */}
              {triggerErrorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Database Trigger Constraint Exception!</span>
                  </div>
                  <p className="text-[11px] font-mono">
                    {triggerErrorMessage}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Incident Code:</span>
                <span className="font-mono text-white font-bold">{selectedIncident.incident_code} - {selectedIncident.title}</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Remediation & Resolution Playbook Notes:
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Quarantined infected host, revoked lateral tokens, and patched CVE-2026-1189 in DMZ firewall rules."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Current length: {resolutionNotes.trim().length} characters (Must be &gt;= 15 to satisfy trigger).
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveLoading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {resolveLoading ? 'Validating Trigger...' : 'Mark Resolved via Trigger'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

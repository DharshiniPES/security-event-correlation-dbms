'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  HardDrive, 
  ExternalLink, 
  CheckCircle2, 
  AlertOctagon, 
  Lock, 
  X, 
  Terminal,
  Zap
} from 'lucide-react';

interface EventsTabProps {
  events: any[];
  meta: any;
  currentRole: string;
  onRefresh: () => void;
}

export default function EventsTab({
  events,
  meta,
  currentRole,
  onRefresh,
}: EventsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for inspecting MongoDB Raw Payload
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectData, setInspectData] = useState<any>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Modal State for Ingesting New Event (Trigger Demo)
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any>(null);

  const [newEvent, setNewEvent] = useState({
    host_id: '',
    user_id: '',
    tactic_id: '',
    event_type: 'Linux Kernel Privilege Escalation Attempt',
    source_ip: '198.51.100.99',
    dest_ip: '10.0.1.15',
    severity: 'CRITICAL',
    raw_payload: 'Unauthorized ptrace attach syscall to init process from unprivileged UID 1002',
    protocol: 'HTTPS',
  });

  const hosts = meta?.hosts || [];
  const users = meta?.users || [];
  const tactics = meta?.tactics || [];

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch = 
      e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.source_ip.includes(searchTerm) ||
      e.dest_ip.includes(searchTerm) ||
      (e.raw_log_id && e.raw_log_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || e.event_status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Fetch MongoDB Document by raw_log_id
  const handleInspectMongo = async (rawLogId: string) => {
    if (!rawLogId) return;
    setInspectLoading(true);
    setInspectModalOpen(true);
    setInspectData(null);
    try {
      const res = await fetch(`/api/telemetry/${rawLogId}`);
      const data = await res.json();
      setInspectData(data);
    } catch (err) {
      console.error('Failed to load MongoDB raw payload:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  // Submit New Event (Testing PostgreSQL Trigger + MongoDB Dual Ingestion)
  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.host_id) {
      alert('Please select a target host.');
      return;
    }
    setIngestLoading(true);
    setTriggerResult(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to ingest event');
      } else {
        setTriggerResult(data);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Security Telemetry & Event Ingestion</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              {filteredEvents.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structured records stored in PostgreSQL with foreign keys to MongoDB unstructured payloads.
          </p>
        </div>

        {/* Action Button: Ingest Event (Trigger Demo) */}
        {currentRole !== 'Auditor' && (
          <button
            onClick={() => {
              setTriggerResult(null);
              setIngestModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ingest Telemetry (Trigger Test)</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by event type, IP, host, raw ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="CORRELATED">Correlated</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs">
            <thead className="bg-slate-950 sticky top-0 z-10">
              <tr className="text-slate-400 font-semibold text-left">
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Target Host</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Network Flow (Src &rarr; Dest)</th>
                <th className="py-3 px-3">MITRE Tactic</th>
                <th className="py-3 px-3">Polyglot NoSQL Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 font-sans">
                    No matching security events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const severityStyle = 
                    event.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    event.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    event.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 border-yellow-800' :
                    'bg-blue-950 text-blue-300 border-blue-800';

                  const statusStyle = 
                    event.event_status === 'RESOLVED' ? 'text-emerald-400' :
                    event.event_status === 'CORRELATED' ? 'text-cyan-400' :
                    'text-rose-400';

                  return (
                    <tr key={event.event_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-white font-sans">
                        <div>{event.event_type}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(event.event_timestamp).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-semibold">{event.hostname}</div>
                        <div className="text-[10px] text-slate-400">{event.environment}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${severityStyle}`}>
                          {event.severity}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-semibold ${statusStyle}`}>
                          {event.event_status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        <div>{event.source_ip}</div>
                        <div className="text-slate-500">&darr; {event.dest_ip}</div>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="text-slate-300">{event.tactic_name || 'N/A'}</span>
                        {event.mitre_id && (
                          <span className="block text-[10px] text-cyan-400 font-mono">{event.mitre_id}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {event.raw_log_id ? (
                          <button
                            onClick={() => handleInspectMongo(event.raw_log_id)}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold transition"
                            title="Inspect MongoDB Raw JSON Document"
                          >
                            <HardDrive className="h-3 w-3 text-emerald-400" />
                            <span>{event.raw_log_id}</span>
                          </button>
                        ) : (
                          <span className="text-slate-600">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Inspect MongoDB Document */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  MongoDB NoSQL Raw Document Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 space-y-4">
              {inspectLoading ? (
                <div className="py-8 text-center text-slate-400">Loading document from MongoDB cluster...</div>
              ) : inspectData?.payload ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-sans">
                    <span>Collection: <code className="text-emerald-400">raw_security_telemetry</code></span>
                    <span>Query Latency: <code className="text-cyan-400">{inspectData.retrievalLatencyMs} ms</code></span>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-300 overflow-x-auto">
                    {JSON.stringify(inspectData.payload, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-rose-400">Document not found or query error.</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Ingest Event (Testing PostgreSQL Trigger + MongoDB Dual Ingestion) */}
      {ingestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Ingest Security Event & Trigger Autonomous Threat Response
                </h3>
              </div>
              <button
                onClick={() => setIngestModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIngestSubmit} className="p-5 overflow-y-auto text-xs space-y-4">
              
              {/* Trigger Notification Banner */}
              {triggerResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/80 text-slate-300 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Database Trigger Executed Successfully!</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {triggerResult.triggerEffect.message}
                  </p>
                  <div className="text-[11px] font-mono bg-slate-900 p-2 rounded border border-slate-800">
                    Host: <span className="text-white font-bold">{triggerResult.triggerEffect.updatedHost.hostname}</span> | 
                    New Risk Score: <span className="text-amber-400 font-bold">{triggerResult.triggerEffect.updatedHost.risk_score}</span> | 
                    Isolated: <span className={triggerResult.triggerEffect.updatedHost.is_isolated ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {triggerResult.triggerEffect.updatedHost.is_isolated ? 'YES (QUARANTINED)' : 'NO'}
                    </span>
                  </div>
                </div>
              )}

              {/* Target Host Dropdown */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Host (PostgreSQL Foreign Key):</label>
                <select
                  value={newEvent.host_id}
                  onChange={(e) => setNewEvent({ ...newEvent, host_id: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Select Monitored Host...</option>
                  {hosts.map((h: any) => (
                    <option key={h.host_id} value={h.host_id}>
                      {h.hostname} ({h.environment} - Risk: {parseFloat(h.risk_score).toFixed(0)}) {h.is_isolated ? '[ISOLATED]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Event Type / Attack Signature:</label>
                <input
                  type="text"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Severity & MITRE Tactic Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Level:</label>
                  <select
                    value={newEvent.severity}
                    onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL (+20 Risk)</option>
                    <option value="HIGH">HIGH (+10 Risk)</option>
                    <option value="MEDIUM">MEDIUM (+4 Risk)</option>
                    <option value="LOW">LOW (+1 Risk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">MITRE ATT&CK Tactic:</label>
                  <select
                    value={newEvent.tactic_id}
                    onChange={(e) => setNewEvent({ ...newEvent, tactic_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="">Select Tactic...</option>
                    {tactics.map((t: any) => (
                      <option key={t.tactic_id} value={t.tactic_id}>
                        {t.mitre_id} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Network IPs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Source IP (INET):</label>
                  <input
                    type="text"
                    value={newEvent.source_ip}
                    onChange={(e) => setNewEvent({ ...newEvent, source_ip: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Destination IP (INET):</label>
                  <input
                    type="text"
                    value={newEvent.dest_ip}
                    onChange={(e) => setNewEvent({ ...newEvent, dest_ip: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Unstructured Payload (Stored in MongoDB) */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Unstructured Telemetry / PCAP Payload (Written to MongoDB NoSQL):
                </label>
                <textarea
                  rows={2}
                  value={newEvent.raw_payload}
                  onChange={(e) => setNewEvent({ ...newEvent, raw_payload: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIngestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={ingestLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {ingestLoading ? 'Ingesting...' : 'Submit Event & Fire Trigger'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

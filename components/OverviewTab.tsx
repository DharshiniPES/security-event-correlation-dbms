'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Database, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Zap, 
  ArrowRight,
  Lock,
  Cpu
} from 'lucide-react';

interface OverviewTabProps {
  status: any;
  hosts: any[];
  incidents: any[];
  onNavigateTab: (tab: string) => void;
  onTriggerSla: () => void;
  isEscalating: boolean;
}

export default function OverviewTab({
  status,
  hosts,
  incidents,
  onNavigateTab,
  onTriggerSla,
  isEscalating,
}: OverviewTabProps) {
  const stats = status?.rdbms?.stats || {};
  const nosqlStats = status?.nosql?.collections || {};

  const isolatedCount = hosts.filter(h => h.is_isolated).length;
  const criticalIncidentsCount = incidents.filter(i => i.priority === 'P1-CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const openIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner: Project Scope & DBMS Focus */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                DBMS Evaluation Ready
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                SQL + Vector + NoSQL Polyglot
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Security Event Intelligence & Incident Correlation Database System
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Engineered with 8 normalized relational tables, ACID transactional correlation, autonomous PostgreSQL triggers, 
              HNSW-indexed pgvector semantic similarity search, and MongoDB polymorphic telemetry log lakes.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onTriggerSla}
              disabled={isEscalating}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>{isEscalating ? 'Invoking Procedure...' : 'Test Stored Procedure (Auto-SLA)'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <span>View Department Reports</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Structured Security Events */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Events</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.total_events || 0}</span>
            <span className="text-xs text-blue-400 font-mono">Postgres DML</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Structured relational events cross-referenced with hosts, users & MITRE tactics.
          </p>
        </div>

        {/* Card 2: Active Correlated Incidents */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Incidents</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-extrabold text-white">{openIncidentsCount}</span>
              {criticalIncidentsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                  {criticalIncidentsCount} P1
                </span>
              )}
            </div>
            <span className="text-xs text-rose-400 font-mono">ACID Triage</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Multi-event groups managed through transactional correlation procedures.
          </p>
        </div>

        {/* Card 3: Host Isolation & Autonomous Triggers */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quarantined Hosts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">{isolatedCount}</span>
            <span className="text-xs text-amber-400 font-mono">Trigger Defense</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            PostgreSQL trigger auto-isolates hosts when risk threshold reaches &gt;= 75.00.
          </p>
        </div>

        {/* Card 4: NoSQL Unstructured Packet Lake */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">MongoDB Telemetry</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{nosqlStats.raw_security_telemetry || 0}</span>
            <span className="text-xs text-emerald-400 font-mono">NoSQL Lake</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Heterogeneous PCAP hex dumps, headers, and syscall traces linked via <code className="text-slate-300">raw_log_id</code>.
          </p>
        </div>

      </div>

      {/* Main Split Section: Host Threat Matrix & Novelty Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Monitored Hosts Threat Matrix */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Monitored Infrastructure & Autonomous Risk Scores</h2>
            </div>
            <span className="text-xs text-slate-400">Live PostgreSQL Table: <code className="text-cyan-400">hosts</code></span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-2.5 px-3">Hostname</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Environment</th>
                  <th className="py-2.5 px-3">OS Platform</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {hosts.map((host) => {
                  const risk = parseFloat(host.risk_score || '0');
                  const riskColor = risk >= 75 ? 'text-rose-400 bg-rose-500/20' : risk >= 40 ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20';
                  const barColor = risk >= 75 ? 'bg-rose-500' : risk >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

                  return (
                    <tr key={host.host_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-white">{host.hostname}</td>
                      <td className="py-3 px-3 text-slate-300">{host.ip_address}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                          {host.environment}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">{host.os_type}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded font-bold ${riskColor}`}>
                            {risk.toFixed(1)}
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${Math.min(risk, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {host.is_isolated ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                            <Lock className="h-3 w-3" />
                            <span>ISOLATED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-900">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>NORMAL</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Project Novelty & Advanced DBMS Showcase */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Project Novelty Factors</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Key engineering components that go beyond basic CRUD applications to demonstrate deep DBMS concepts:
            </p>

            <div className="space-y-3.5">
              {/* Novelty 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                  <Database className="h-3.5 w-3.5" />
                  <span>1. Polyglot Persistence Architecture</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Relational PostgreSQL core holds strict ACID constraints while MongoDB stores heterogeneous, schema-less PCAP network payloads via foreign key linkage.
                </p>
              </div>

              {/* Novelty 2 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>2. In-Engine Trigger Threat Containment</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  PostgreSQL AFTER INSERT trigger dynamically evaluates host blast radius and activates network quarantine autonomously when cumulative risk score reaches &gt;= 75.
                </p>
              </div>

              {/* Novelty 3 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>3. Semantic Vector Similarity Search</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Integrates 384-dimensional dense embeddings stored with <code className="text-cyan-400">pgvector</code> and accelerated using HNSW cosine index (<code className="text-cyan-400">&lt;=&gt;</code>) to recall historical mitigation playbooks.
                </p>
              </div>

              {/* Novelty 4 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <Layers className="h-3.5 w-3.5" />
                  <span>4. Stored Procedure SLA Escalations</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  PL/pgSQL stored procedure <code className="text-emerald-400">sp_auto_escalate_incidents</code> manages cursor loops, updating overdue P1 cases and writing transactional remediation audit records.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Evaluation Team:</span>
            <span className="font-semibold text-slate-300">Dharshini V & Dhruv Rajagopalan</span>
          </div>
        </div>

      </div>

    </div>
  );
}

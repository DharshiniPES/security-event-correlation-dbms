'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  ShieldAlert, 
  HardDrive, 
  Users, 
  Layers, 
  AlertTriangle,
  Lock,
  Activity,
  Flame,
  CheckCircle2,
  BellRing
} from 'lucide-react';

interface ReportsTabProps {
  reports: any;
  loading: boolean;
  onRefresh: () => void;
}

export default function ReportsTab({
  reports,
  loading,
  onRefresh,
}: ReportsTabProps) {
  const [activeReportSubTab, setActiveReportSubTab] = useState<'graphs' | 'cutoffs' | 'dept' | 'mitre' | 'subquery' | 'analyst' | 'nosql'>('graphs');

  const deptData = reports?.departmentPosture?.data || [];
  const mitreData = reports?.mitreAttackSurface?.data || [];
  const subqueryData = reports?.highRiskAnomalyReport?.data || [];
  const analystData = reports?.analystPerformance?.data || [];
  const nosqlData = reports?.noSqlTelemetryMetrics?.data || [];
  const severityData = reports?.severityDistribution?.data || [];
  const cutoffData = reports?.triggerCutoffTelemetry?.data || [];

  const isolatedCutoffCount = cutoffData.filter((c: any) => c.is_isolated).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Visual Analytics & Threat Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                {isolatedCutoffCount} Telemetries Cut Off by Trigger
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Analytical Reports, Risk Graphs & Trigger Cut-Off Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Visual risk distribution charts (Critical, High, Medium, Low), host threat blast-radius gauges, 
              departmental aggregations, and real-time telemetry cut-off notifications enforced by database triggers.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveReportSubTab('graphs')}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition flex items-center space-x-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Visual Graphs</span>
            </button>
            <button
              onClick={() => setActiveReportSubTab('cutoffs')}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition flex items-center space-x-1.5 animate-pulse"
            >
              <BellRing className="h-4 w-4" />
              <span>Trigger Cut-Offs ({isolatedCutoffCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveReportSubTab('graphs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'graphs'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Visual Risk Graphs (High/Med/Low)</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('cutoffs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'cutoffs'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BellRing className="h-4 w-4 text-rose-400" />
          <span>Trigger Cut-Off & Quarantined Feeds</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('dept')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'dept'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Department Posture & Budget</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('mitre')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'mitre'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>MITRE Attack Surface</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('subquery')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'subquery'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Correlated Subquery & HAVING</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('analyst')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'analyst'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>SOC Analyst SLA</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('nosql')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
            activeReportSubTab === 'nosql'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>MongoDB Pipeline</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* Sub-tab 1: Visual Risk & Severity Graphs (CRITICAL / HIGH / MED / LOW) */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'graphs' && (
        <div className="space-y-6">
          
          {/* Top Combined Severity Distribution Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  <span>Security Alert Severity Distribution (Stacked Visual Breakdown)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual composition of all ingested security alerts across Critical, High, Medium, and Low risk thresholds.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Total Events: <code className="text-white font-bold">{reports?.severityDistribution?.data?.reduce((acc: number, r: any) => acc + parseInt(r.count, 10), 0) || 72}</code></span>
            </div>

            {/* Stacked Multi-Color Progress Bar */}
            <div className="h-6 w-full rounded-xl bg-slate-950 flex overflow-hidden p-1 border border-slate-800 gap-1 mb-4">
              {severityData.map((s: any, idx: number) => {
                const color = 
                  s.severity === 'CRITICAL' ? 'bg-rose-500' :
                  s.severity === 'HIGH' ? 'bg-amber-500' :
                  s.severity === 'MEDIUM' ? 'bg-yellow-400' : 'bg-cyan-400';
                return (
                  <div
                    key={idx}
                    style={{ width: `${s.percentage}%` }}
                    className={`${color} h-full rounded transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-black font-mono`}
                    title={`${s.severity}: ${s.count} events (${s.percentage}%)`}
                  >
                    {parseFloat(s.percentage) >= 12 ? `${s.percentage}%` : ''}
                  </div>
                );
              })}
            </div>

            {/* Severity Cards Grid with Individual Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {severityData.map((s: any, idx: number) => {
                const isCrit = s.severity === 'CRITICAL';
                const isHigh = s.severity === 'HIGH';
                const isMed = s.severity === 'MEDIUM';

                const borderColor = isCrit ? 'border-rose-800/80' : isHigh ? 'border-amber-800/80' : isMed ? 'border-yellow-800/80' : 'border-cyan-800/80';
                const textColor = isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : isMed ? 'text-yellow-400' : 'text-cyan-400';
                const barColor = isCrit ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : isMed ? 'bg-yellow-400' : 'bg-cyan-400';
                const weightLabel = isCrit ? '+20.0 pts/event' : isHigh ? '+10.0 pts/event' : isMed ? '+4.0 pts/event' : '+1.0 pt/event';

                return (
                  <div key={idx} className={`bg-slate-950/80 border ${borderColor} rounded-xl p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{s.severity}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {weightLabel}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-white font-mono">{s.count}</span>
                      <span className={`text-sm font-bold font-mono ${textColor}`}>{s.percentage}%</span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${s.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Risk Exposure Graph (Comparative Horizontal Bars) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-amber-400" />
                  <span>Monitored Host Risk Score Exposure Graph (0 to 100 Scale)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual comparative gauge of all infrastructure servers. Hosts with Risk &ge; 75 are quarantined by database trigger.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="flex items-center space-x-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>&ge;75 Quarantined</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>40-74 Elevated</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>&lt;40 Normal</span>
                </span>
              </div>
            </div>

            {/* Horizontal Bar Visualizations */}
            <div className="space-y-3 font-mono text-xs">
              {(reports?.hostThreatAnalysis?.data || []).map((host: any) => {
                const score = parseFloat(host.risk_score || '0');
                const isIsolated = host.is_isolated;
                const barColor = score >= 75 ? 'bg-gradient-to-r from-amber-500 to-rose-600' : score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500';
                const textColor = score >= 75 ? 'text-rose-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';

                return (
                  <div key={host.host_id} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{host.hostname}</span>
                        <span className="text-[10px] text-slate-400 font-sans">({host.environment} &bull; {host.ip_address})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${textColor}`}>{score.toFixed(1)} / 100</span>
                        {isIsolated ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse flex items-center space-x-1">
                            <Lock className="h-3 w-3" />
                            <span>TRIGGER CUT-OFF</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-900">
                            ONLINE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(score, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 2: Autonomous Trigger Cut-Off & Quarantined Feeds           */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'cutoffs' && (
        <div className="space-y-6">
          
          {/* Urgent Trigger Cut-Off Banner */}
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-600/80 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center animate-pulse shadow-lg shadow-rose-600/40">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <span>AUTONOMOUS TRIGGER CONTAINMENT: {isolatedCutoffCount} TELEMETRY FEEDS SEVERED</span>
                  </h3>
                  <p className="text-xs text-rose-300 mt-0.5">
                    PostgreSQL Trigger <code className="text-white font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">trg_security_event_risk</code> has 
                    automatically isolated infected hosts to halt lateral network propagation.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-900 text-rose-200 border border-rose-700 animate-pulse">
                ACTION: NETWORK TRAFFIC CUT OFF
              </span>
            </div>
          </div>

          {/* List of Cut-Off Hosts */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lock className="h-4 w-4 text-rose-400" />
              <span>Quarantined Host Telemetry Streams (Cut-Off by Database Engine)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cutoffData.map((item: any) => {
                const isIsolated = item.is_isolated;
                return (
                  <div 
                    key={item.host_id}
                    className={`bg-slate-900/95 border rounded-2xl p-5 shadow-xl transition space-y-3 ${
                      isIsolated ? 'border-rose-600/80 bg-rose-950/10 glow-red' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${isIsolated ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <Lock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm font-mono">{item.hostname}</div>
                          <div className="text-[11px] text-slate-400">{item.ip_address} &bull; {item.environment}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-extrabold text-rose-400 font-mono">
                          {parseFloat(item.risk_score).toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {isIsolated ? 'TELEMETRY CUT OFF' : 'ELEVATED RISK'}
                        </span>
                      </div>
                    </div>

                    {/* Cutoff Reason Box */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1">
                      <span className="text-slate-400 font-sans font-semibold block text-[11px]">Database Containment Event:</span>
                      <p className="text-rose-300 text-[11px] leading-relaxed">
                        {item.cutoff_reason}
                      </p>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Total Alerts</span>
                        <span className="font-bold text-white">{item.total_events}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-rose-400 block text-[10px]">Critical</span>
                        <span className="font-bold text-rose-400">{item.critical_events}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-amber-400 block text-[10px]">High</span>
                        <span className="font-bold text-amber-400">{item.high_events}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between items-center">
                      <span>Owner Dept: <span className="text-slate-300">{item.dept_name || 'Infrastructure'}</span></span>
                      <span>Last Seen: {new Date(item.last_threat_timestamp || item.last_seen).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 3: Department Posture & Budget (Primary Syllabus Checkpoint) */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'dept' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  <span>Report: Department Security Posture & Budget Allocation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Backed by PostgreSQL View <code className="text-cyan-400">vw_department_security_posture</code> with departmental risk aggregations.
                </p>
              </div>

              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
                SQL: <code className="text-amber-400">GROUP BY d.dept_id, d.dept_name, d.budget_allocated</code>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 font-semibold text-left">
                    <th className="py-3 px-3 font-sans">Department Name</th>
                    <th className="py-3 px-3">Budget Allocated</th>
                    <th className="py-3 px-3">Users</th>
                    <th className="py-3 px-3">Hosts</th>
                    <th className="py-3 px-3 text-cyan-400">Avg Host Risk (AVG)</th>
                    <th className="py-3 px-3 text-rose-400">Max Host Risk (MAX)</th>
                    <th className="py-3 px-3">Total Events</th>
                    <th className="py-3 px-3">Critical Events</th>
                    <th className="py-3 px-3">Active Incidents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deptData.map((row: any) => (
                    <tr key={row.dept_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-sans font-bold text-white">{row.dept_name}</td>
                      <td className="py-3 px-3 text-slate-300">
                        ${parseFloat(row.budget_allocated).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{row.total_users}</td>
                      <td className="py-3 px-3 text-slate-300">{row.total_hosts}</td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          {row.avg_host_risk_score}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          {row.max_host_risk_score}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{row.total_security_events}</td>
                      <td className="py-3 px-3 text-amber-300 font-bold">{row.critical_high_events}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                          {row.active_incidents}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 4: MITRE ATT&CK Surface Breakdown                           */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'mitre' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Report: MITRE ATT&CK Surface Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregates detection frequencies and pending alerts grouped by attack tactics and kill chain phases.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              View: <code className="text-cyan-400">vw_mitre_attack_surface</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3">MITRE ID</th>
                  <th className="py-3 px-3 font-sans">Tactic Name</th>
                  <th className="py-3 px-3 font-sans">Kill Chain Phase</th>
                  <th className="py-3 px-3">Base Severity</th>
                  <th className="py-3 px-3">Total Detections</th>
                  <th className="py-3 px-3">Affected Hosts</th>
                  <th className="py-3 px-3">Pending Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mitreData.map((row: any) => (
                  <tr key={row.tactic_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{row.mitre_id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-white">{row.tactic_name}</td>
                    <td className="py-3 px-3 font-sans text-slate-400">{row.kill_chain_phase}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        row.base_severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {row.base_severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{row.total_detections}</td>
                    <td className="py-3 px-3 text-slate-300">{row.affected_hosts_count}</td>
                    <td className="py-3 px-3 text-rose-400 font-bold">{row.pending_alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 5: Correlated Subquery & HAVING                             */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'subquery' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <span>Report: Correlated Subquery & HAVING Constraint</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isolates anomalous hosts whose risk score is &ge; the environment average and possess active unresolved critical events.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              Query: <code className="text-amber-400">HAVING COUNT(se.event_id) &gt;= 1</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3 font-sans">Hostname</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Environment</th>
                  <th className="py-3 px-3 text-amber-400">Host Risk</th>
                  <th className="py-3 px-3 text-slate-400">Environment Avg Risk</th>
                  <th className="py-3 px-3">Critical Events</th>
                  <th className="py-3 px-3">Network Isolation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subqueryData.map((row: any) => (
                  <tr key={row.host_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white">{row.hostname}</td>
                    <td className="py-3 px-3 text-slate-300">{row.ip_address}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {row.environment}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-amber-400">{row.risk_score}</td>
                    <td className="py-3 px-3 text-slate-400">{row.env_avg_risk}</td>
                    <td className="py-3 px-3 font-bold text-rose-400">{row.critical_event_count}</td>
                    <td className="py-3 px-3">
                      {row.is_isolated ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                          QUARANTINED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 6: SOC Analyst SLA Performance                              */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'analyst' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Report: SOC Analyst Workload & Mean Resolution Time</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Measures incident triage capacity and calculates average resolution hours using PostgreSQL epoch intervals.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              View: <code className="text-cyan-400">vw_analyst_workload</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3 font-sans">Analyst Full Name</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Assigned Incidents</th>
                  <th className="py-3 px-3 text-amber-400">Active Cases</th>
                  <th className="py-3 px-3 text-emerald-400">Resolved Cases</th>
                  <th className="py-3 px-3 text-cyan-400">Avg Resolution Time (Hours)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analystData.map((row: any) => (
                  <tr key={row.user_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-white">{row.full_name}</td>
                    <td className="py-3 px-3 text-slate-400">{row.username}</td>
                    <td className="py-3 px-3 text-slate-200">{row.assigned_incidents}</td>
                    <td className="py-3 px-3 font-bold text-amber-400">{row.active_cases}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{row.resolved_cases}</td>
                    <td className="py-3 px-3 font-extrabold text-cyan-400">
                      {row.avg_resolution_hours ? `${row.avg_resolution_hours} hrs` : 'N/A (Active)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Sub-tab 7: MongoDB NoSQL Pipeline Aggregation                       */}
      {/* ==================================================================== */}
      {activeReportSubTab === 'nosql' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-emerald-400" />
                <span>Report: MongoDB NoSQL Aggregation Pipeline</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregates heterogeneous raw telemetry payloads by transport protocol, calculating average content lengths and sensor density.
              </p>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
              Pipeline: <code className="text-emerald-400">$group &rarr; $project &rarr; $sort</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead>
                <tr className="text-slate-400 font-semibold text-left">
                  <th className="py-3 px-3">Protocol Type</th>
                  <th className="py-3 px-3">Total Ingested Packets</th>
                  <th className="py-3 px-3 text-emerald-400">Avg Content-Length (Bytes)</th>
                  <th className="py-3 px-3">Unique Sensors Active</th>
                  <th className="py-3 px-3">Payload Sample Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nosqlData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{row.protocol}</td>
                    <td className="py-3 px-3 text-slate-200">{row.totalEvents}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-400">{row.avgPayloadLength} bytes</td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">{row.sensorCount} sensors</td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{row.samplePayloadSnippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Database,
  Cpu
} from 'lucide-react';

export default function SqlExplorerTab() {
  const defaultQuery = `SELECT 
    d.dept_name,
    COUNT(DISTINCT h.host_id) AS total_hosts,
    ROUND(AVG(h.risk_score), 2) AS avg_host_risk,
    MAX(h.risk_score) AS max_host_risk,
    COUNT(se.event_id) AS total_events
FROM departments d
LEFT JOIN hosts h ON d.dept_id = h.dept_id
LEFT JOIN security_events se ON h.host_id = se.host_id
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(se.event_id) > 0
ORDER BY avg_host_risk DESC;`;

  const [sqlQuery, setSqlQuery] = useState(defaultQuery);
  const [includeExplain, setIncludeExplain] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    {
      title: '1. Department Posture (GROUP BY + HAVING + AVG)',
      query: `SELECT 
    d.dept_name,
    COUNT(DISTINCT h.host_id) AS total_hosts,
    ROUND(AVG(h.risk_score), 2) AS avg_host_risk,
    MAX(h.risk_score) AS max_host_risk,
    COUNT(se.event_id) AS total_events
FROM departments d
LEFT JOIN hosts h ON d.dept_id = h.dept_id
LEFT JOIN security_events se ON h.host_id = se.host_id
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(se.event_id) > 0
ORDER BY avg_host_risk DESC;`,
    },
    {
      title: '2. 4-Table INNER JOIN (Events + Hosts + Tactics + Analysts)',
      query: `SELECT 
    se.event_id,
    se.event_type,
    se.severity,
    h.hostname,
    h.environment,
    t.name AS tactic_name,
    u.full_name AS reported_by,
    se.event_timestamp
FROM security_events se
JOIN hosts h ON se.host_id = h.host_id
JOIN attack_tactics t ON se.tactic_id = t.tactic_id
LEFT JOIN users u ON se.user_id = u.user_id
ORDER BY se.event_timestamp DESC
LIMIT 15;`,
    },
    {
      title: '3. Correlated Subquery (Risk Exceeding Environment Average)',
      query: `SELECT 
    h.hostname,
    h.environment,
    h.risk_score,
    h.is_isolated,
    ROUND((SELECT AVG(h2.risk_score) FROM hosts h2 WHERE h2.environment = h.environment), 2) AS env_average_risk
FROM hosts h
WHERE h.risk_score >= (SELECT AVG(h3.risk_score) FROM hosts h3 WHERE h3.environment = h.environment)
ORDER BY h.risk_score DESC;`,
    },
    {
      title: '4. MITRE Surface Aggregation (COUNT + HAVING >= 2)',
      query: `SELECT 
    t.mitre_id,
    t.name AS tactic_name,
    t.base_severity,
    COUNT(se.event_id) AS event_count,
    COUNT(DISTINCT se.host_id) AS impacted_hosts
FROM attack_tactics t
JOIN security_events se ON t.tactic_id = se.tactic_id
GROUP BY t.tactic_id, t.mitre_id, t.name, t.base_severity
HAVING COUNT(se.event_id) >= 2
ORDER BY event_count DESC;`,
    },
    {
      title: '5. Vector Cosine Distance (<=> Nearest Neighbor)',
      query: `SELECT 
    incident_code,
    title,
    priority,
    status,
    ROUND((1 - (embedding <=> (SELECT embedding FROM incidents WHERE incident_code = 'INC-2026-001')))::numeric, 4) AS similarity_to_inc_001
FROM incidents
ORDER BY embedding <=> (SELECT embedding FROM incidents WHERE incident_code = 'INC-2026-001') ASC
LIMIT 5;`,
    },
    {
      title: '6. Check Triggers & Performance Indexes (System Catalogs)',
      query: `SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;`,
    },
  ];

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setQueryResult(null);

    try {
      const res = await fetch('/api/query-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery, explain: includeExplain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Query failed to execute.');
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Engine Query Plan Inspector
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                PostgreSQL 17 Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive SQL Query & Relational Algebra Console
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Execute analytical queries live against the PostgreSQL database or input custom SQL queries. 
              Supports query plan inspection (<code className="text-cyan-400">EXPLAIN ANALYZE</code>) for index scan verification.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 space-y-1 shrink-0">
            <div><span className="text-slate-500">Database:</span> <span className="text-cyan-400">security_event_db</span></div>
            <div><span className="text-slate-500">Engine:</span> <span className="text-blue-400">PostgreSQL 17.11</span></div>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Pre-Configured Analytical Queries:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSqlQuery(p.query);
                setErrorMessage(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 font-medium transition text-[11px]"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold flex items-center space-x-1.5">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>SQL Query Editor (Read-Only Analytical Console)</span>
          </span>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={includeExplain}
                onChange={(e) => setIncludeExplain(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
              />
              <span>Generate Query Execution Plan (EXPLAIN ANALYZE)</span>
            </label>
          </div>
        </div>

        <textarea
          rows={7}
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />

        <div className="flex justify-end">
          <button
            onClick={handleRunQuery}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{loading ? 'Executing on Engine...' : 'Run SQL Query'}</span>
          </button>
        </div>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-rose-300">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>SQL Syntax / Execution Error</span>
          </div>
          <p className="font-mono text-[11px]">{errorMessage}</p>
        </div>
      )}

      {/* Query Result Section */}
      {queryResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          
          {/* Latency & Row Count Bar */}
          <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Returned <span className="text-white font-bold">{queryResult.rowCount}</span> rows</span>
            </div>
            <div>
              Execution Time: <span className="text-amber-400 font-bold">{queryResult.durationMs} ms</span>
            </div>
          </div>

          {/* Table Results */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto px-5 pb-5">
            <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
              <thead className="bg-slate-950 sticky top-0">
                <tr className="text-slate-400 font-semibold text-left">
                  {queryResult.columns.map((col: string, idx: number) => (
                    <th key={idx} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queryResult.rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                    {queryResult.columns.map((col: string, cIdx: number) => (
                      <td key={cIdx} className="py-2 px-3 text-slate-300 whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Query Execution Plan (EXPLAIN ANALYZE) */}
          {queryResult.explainPlan && (
            <div className="px-5 pb-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <span className="text-amber-400 font-bold block mb-2">PostgreSQL Query Execution Plan (EXPLAIN ANALYZE):</span>
                {queryResult.explainPlan.map((line: string, idx: number) => (
                  <div key={idx} className="text-slate-400 text-[11px] whitespace-pre">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

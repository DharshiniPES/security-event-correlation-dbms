'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  Key, 
  HardDrive, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  FileText,
  Workflow,
  Cpu,
  Table as TableIcon,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  Code2,
  Lock,
  Zap,
  Activity,
  Image as ImageIcon
} from 'lucide-react';

interface SchemaDocsTabProps {
  initialSection?: 'data' | 'bridge' | 'schema' | 'diagram';
}

export default function SchemaDocsTab({ initialSection = 'data' }: SchemaDocsTabProps) {
  const [activeSection, setActiveSection] = useState<'data' | 'bridge' | 'schema' | 'diagram'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  const [selectedTable, setSelectedTable] = useState<string>('departments');
  const [entitiesData, setEntitiesData] = useState<any>(null);
  const [loadingEntities, setLoadingEntities] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // SQL + NoSQL Bridge State
  const [selectedBridgeLogId, setSelectedBridgeLogId] = useState<string>('RAW-2026-LOG-001');
  const [bridgeMongoDoc, setBridgeMongoDoc] = useState<any>(null);
  const [bridgeLatency, setBridgeLatency] = useState<number | null>(null);
  const [bridgeLoading, setBridgeLoading] = useState<boolean>(false);

  // Fetch all 8 tables live data from /api/entities
  const fetchEntities = async () => {
    setLoadingEntities(true);
    try {
      const res = await fetch('/api/entities');
      const data = await res.json();
      if (data.entities) {
        setEntitiesData(data.entities);
      }
    } catch (err) {
      console.error('Failed to fetch entity data:', err);
    } finally {
      setLoadingEntities(false);
    }
  };

  // Fetch MongoDB Document for the bridge
  const fetchMongoPayload = async (rawId: string) => {
    if (!rawId) return;
    setBridgeLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/telemetry/${rawId}`);
      const data = await res.json();
      setBridgeLatency(Math.round(performance.now() - start));
      if (data.success && data.payload) {
        setBridgeMongoDoc(data.payload);
      } else {
        setBridgeMongoDoc(null);
      }
    } catch (err) {
      console.error('Failed to fetch MongoDB telemetry doc:', err);
      setBridgeMongoDoc(null);
    } finally {
      setBridgeLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    if (selectedBridgeLogId) {
      fetchMongoPayload(selectedBridgeLogId);
    }
  }, [selectedBridgeLogId]);

  const tables = [
    {
      name: 'departments',
      role: 'Organizational unit managing infrastructure assets & budgets',
      pk: 'dept_id (SERIAL)',
      fks: 'None',
      attributes: [
        'dept_id: SERIAL PRIMARY KEY',
        'dept_name: VARCHAR(100) UNIQUE NOT NULL',
        'budget_allocated: NUMERIC(14,2) NOT NULL DEFAULT 50000.00 CHECK (budget_allocated >= 0)',
        'contact_email: VARCHAR(120) NOT NULL',
        'created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      ],
      relationships: '1:N with users, 1:N with hosts',
    },
    {
      name: 'users',
      role: 'SOC personnel & system users with Role-Based Access Control',
      pk: 'user_id (SERIAL)',
      fks: 'dept_id -> departments(dept_id) ON DELETE SET NULL',
      attributes: [
        'user_id: SERIAL PRIMARY KEY',
        'username: VARCHAR(50) UNIQUE NOT NULL',
        'full_name: VARCHAR(100) NOT NULL',
        'email: VARCHAR(120) UNIQUE NOT NULL',
        'role: VARCHAR(30) CHECK IN (Administrator, Security_Analyst, SOC_Manager, Auditor)',
        'dept_id: INT REFERENCES departments(dept_id)',
        'failed_logins: INT NOT NULL DEFAULT 0 CHECK (failed_logins >= 0)',
        'is_active: BOOLEAN NOT NULL DEFAULT TRUE',
        'created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      ],
      relationships: 'N:1 with departments, 1:N with security_events, 1:N with incidents',
    },
    {
      name: 'hosts',
      role: 'Monitored servers, firewalls, and cloud worker nodes',
      pk: 'host_id (SERIAL)',
      fks: 'dept_id -> departments(dept_id) ON DELETE SET NULL',
      attributes: [
        'host_id: SERIAL PRIMARY KEY',
        'hostname: VARCHAR(100) UNIQUE NOT NULL',
        'ip_address: INET UNIQUE NOT NULL',
        'os_type: VARCHAR(50) NOT NULL',
        'environment: VARCHAR(30) CHECK IN (Production, Staging, Development, DMZ, Internal_Core)',
        'risk_score: NUMERIC(5,2) DEFAULT 0.00 CHECK (risk_score BETWEEN 0.00 AND 100.00)',
        'is_isolated: BOOLEAN NOT NULL DEFAULT FALSE',
        'dept_id: INT REFERENCES departments(dept_id)',
        'last_seen: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      ],
      relationships: 'N:1 with departments, 1:N with security_events',
    },
    {
      name: 'attack_tactics',
      role: 'Standardized MITRE ATT&CK framework catalog',
      pk: 'tactic_id (SERIAL)',
      fks: 'None',
      attributes: [
        'tactic_id: SERIAL PRIMARY KEY',
        'mitre_id: VARCHAR(20) UNIQUE NOT NULL (e.g. TA0001)',
        'name: VARCHAR(100) NOT NULL',
        'kill_chain_phase: VARCHAR(50) NOT NULL',
        'base_severity: VARCHAR(20) CHECK IN (LOW, MEDIUM, HIGH, CRITICAL)',
        'description: TEXT NOT NULL',
      ],
      relationships: '1:N with security_events',
    },
    {
      name: 'security_events',
      role: 'High-velocity structured security telemetry events',
      pk: 'event_id (SERIAL)',
      fks: 'host_id -> hosts(host_id) ON DELETE CASCADE, user_id -> users(user_id) ON DELETE SET NULL, tactic_id -> attack_tactics(tactic_id) ON DELETE RESTRICT',
      attributes: [
        'event_id: SERIAL PRIMARY KEY',
        'host_id: INT REFERENCES hosts(host_id) ON DELETE CASCADE',
        'user_id: INT REFERENCES users(user_id) ON DELETE SET NULL',
        'tactic_id: INT REFERENCES attack_tactics(tactic_id) ON DELETE RESTRICT',
        'event_type: VARCHAR(100) NOT NULL',
        'source_ip: INET NOT NULL',
        'dest_ip: INET NOT NULL',
        'severity: VARCHAR(20) CHECK IN (LOW, MEDIUM, HIGH, CRITICAL)',
        'event_status: VARCHAR(30) CHECK IN (UNRESOLVED, ANALYZING, CORRELATED, RESOLVED, FALSE_POSITIVE)',
        'raw_log_id: VARCHAR(64) (Foreign reference to MongoDB payload document)',
        'event_timestamp: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      ],
      relationships: 'N:1 with hosts, N:1 with users, N:1 with attack_tactics, 1:N via incident_event_mapping',
    },
    {
      name: 'incidents',
      role: 'Correlated security cases with dense vector embeddings',
      pk: 'incident_id (SERIAL)',
      fks: 'assigned_analyst_id -> users(user_id) ON DELETE SET NULL',
      attributes: [
        'incident_id: SERIAL PRIMARY KEY',
        'incident_code: VARCHAR(30) UNIQUE NOT NULL',
        'title: VARCHAR(200) NOT NULL',
        'description: TEXT NOT NULL',
        'priority: VARCHAR(20) CHECK IN (P1-CRITICAL, P2-HIGH, P3-MEDIUM, P4-LOW)',
        'status: VARCHAR(30) CHECK IN (OPEN, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED)',
        'assigned_analyst_id: INT REFERENCES users(user_id)',
        'embedding: vector(384) (pgvector dense vector embedding)',
        'resolution_notes: TEXT (Required by trigger before closing)',
        'created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
        'resolved_at: TIMESTAMP WITH TIME ZONE',
      ],
      relationships: 'N:1 with users (analysts), 1:N with incident_event_mapping, 1:N with remediation_audit',
    },
    {
      name: 'incident_event_mapping',
      role: 'M:N Associative bridge linking security events to correlated incidents',
      pk: 'mapping_id (SERIAL)',
      fks: 'incident_id -> incidents(incident_id) ON DELETE CASCADE, event_id -> security_events(event_id) ON DELETE CASCADE',
      attributes: [
        'mapping_id: SERIAL PRIMARY KEY',
        'incident_id: INT REFERENCES incidents(incident_id) ON DELETE CASCADE',
        'event_id: INT REFERENCES security_events(event_id) ON DELETE CASCADE',
        'correlation_confidence: NUMERIC(4,2) DEFAULT 0.85 CHECK (correlation_confidence BETWEEN 0.0 AND 1.0)',
        'mapped_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
        'UNIQUE CONSTRAINT (incident_id, event_id)',
      ],
      relationships: 'Resolves M:N cardinality between incidents and security_events',
    },
    {
      name: 'remediation_audit',
      role: 'Immutable audit ledger of automated & analyst containment actions',
      pk: 'audit_id (SERIAL)',
      fks: 'incident_id -> incidents(incident_id) ON DELETE CASCADE, performed_by -> users(user_id) ON DELETE SET NULL',
      attributes: [
        'audit_id: SERIAL PRIMARY KEY',
        'incident_id: INT REFERENCES incidents(incident_id) ON DELETE CASCADE',
        'performed_by: INT REFERENCES users(user_id) ON DELETE SET NULL',
        'action_type: VARCHAR(100) NOT NULL (e.g. HOST_NETWORK_ISOLATION, AUTO_SLA_ESCALATION)',
        'execution_status: VARCHAR(30) CHECK IN (SUCCESS, PENDING, FAILED)',
        'remarks: TEXT',
        'executed_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
      ],
      relationships: 'N:1 with incidents, N:1 with users',
    },
  ];

  const currentTableData = entitiesData?.[selectedTable]?.data || [];
  const currentTableCount = entitiesData?.[selectedTable]?.count ?? 0;

  // Filtered rows based on search
  const filteredRows = currentTableData.filter((row: any) => {
    if (!searchTerm) return true;
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = currentTableData.length > 0 ? Object.keys(currentTableData[0]) : [];

  // Security Events list for Bridge Selector
  const securityEventsList = entitiesData?.security_events?.data || [];
  const currentBridgeEvent = securityEventsList.find(
    (ev: any) => ev.raw_log_id === selectedBridgeLogId
  ) || securityEventsList[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                8 Normalized 3NF Tables Live
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                PostgreSQL 17 + MongoDB 9.0 Polyglot
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Entity-Relationship Architecture & Live Data Inspection
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Inspect all real database records populated across all 8 normalized entities, examine our cross-database 
              SQL &harr; NoSQL integration bridge, and review complete relational schema constraints.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 shrink-0">
            <div>Authors: <span className="text-white font-bold">Dharshini V & Dhruv Rajagopalan</span></div>
            <div>PRN: <span className="text-cyan-400">PES1UG24AM428 / PES1UG24AM086</span></div>
          </div>
        </div>
      </div>

      {/* Main Sub-tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveSection('data')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition shrink-0 ${
            activeSection === 'data'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TableIcon className="h-4 w-4" />
          <span>Live ER Entity Data (All 8 Tables)</span>
        </button>

        <button
          onClick={() => setActiveSection('bridge')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition shrink-0 ${
            activeSection === 'bridge'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Workflow className="h-4 w-4" />
          <span>Live SQL + NoSQL Integration Bridge</span>
        </button>

        <button
          onClick={() => setActiveSection('schema')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition shrink-0 ${
            activeSection === 'schema'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Schema Dictionary & Constraints</span>
        </button>

        <button
          onClick={() => setActiveSection('diagram')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition shrink-0 ${
            activeSection === 'diagram'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Visual ER Diagram & Cardinality</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: LIVE ER ENTITY DATA EXPLORER (ALL 8 RELATIONAL TABLES)     */}
      {/* ==================================================================== */}
      {activeSection === 'data' && (
        <div className="space-y-4">
          
          {/* Table Selector Pills */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Select Relational Entity to Inspect Live Data Rows:
                </span>
                <span className="text-xs text-slate-500">
                  Click any entity to view its normalized records currently residing in PostgreSQL 17.
                </span>
              </div>
              <button
                onClick={fetchEntities}
                disabled={loadingEntities}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingEntities ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Refresh Live Rows</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
              {tables.map((t) => {
                const count = entitiesData?.[t.name]?.count ?? '...';
                const isSelected = selectedTable === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSelectedTable(t.name);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold truncate block">{t.name}</span>
                    <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {count} records
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Data View Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            
            {/* Table Metadata Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight">
                    {selectedTable}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentTableCount} Rows
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {tables.find(t => t.name === selectedTable)?.role}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-900">
                    PK: {tables.find(t => t.name === selectedTable)?.pk}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-900">
                    FK: {tables.find(t => t.name === selectedTable)?.fks}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    Cardinality: {tables.find(t => t.name === selectedTable)?.relationships}
                  </span>
                </div>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${selectedTable}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Live Data Grid */}
            {loadingEntities ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Fetching entity records from PostgreSQL...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                No matching records found in table <code className="text-white">{selectedTable}</code>.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
                  <thead className="bg-slate-950">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="py-3 px-3 text-left font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                      {selectedTable === 'security_events' && (
                        <th className="py-3 px-3 text-right font-semibold text-emerald-400 uppercase tracking-wider">
                          NoSQL Bridge
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {filteredRows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                        {columns.map((col) => {
                          const val = row[col];
                          const isPk = col.endsWith('_id') && col.startsWith(selectedTable.slice(0, 4));
                          const isFk = col.endsWith('_id') && !isPk;
                          const isRisk = col === 'risk_score';
                          const isIsolated = col === 'is_isolated';
                          const isSeverity = col === 'severity' || col === 'base_severity' || col === 'priority';
                          const isBudget = col === 'budget_allocated';

                          return (
                            <td key={col} className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                              {isPk ? (
                                <span className="font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                                  {val}
                                </span>
                              ) : isFk ? (
                                <span className="font-semibold text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/60">
                                  {val ?? 'NULL'}
                                </span>
                              ) : isBudget ? (
                                <span className="text-emerald-400 font-bold">
                                  ${parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              ) : isRisk ? (
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                  parseFloat(val) >= 75 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                  parseFloat(val) >= 40 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}>
                                  {val}
                                </span>
                              ) : isIsolated ? (
                                val ? (
                                  <span className="text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                                    ISOLATED
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900">
                                    NORMAL
                                  </span>
                                )
                              ) : isSeverity ? (
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                  val === 'CRITICAL' || val === 'P1-CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                  val === 'HIGH' || val === 'P2-HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-slate-800 text-slate-300'
                                }`}>
                                  {val}
                                </span>
                              ) : col === 'raw_log_id' ? (
                                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                  {val ?? 'None'}
                                </span>
                              ) : col.includes('timestamp') || col.includes('_at') ? (
                                <span className="text-slate-400">
                                  {val ? new Date(val).toLocaleString() : 'N/A'}
                                </span>
                              ) : (
                                <span>{val !== null && val !== undefined ? String(val) : <em className="text-slate-600">NULL</em>}</span>
                              )}
                            </td>
                          );
                        })}

                        {selectedTable === 'security_events' && (
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {row.raw_log_id ? (
                              <button
                                onClick={() => {
                                  setSelectedBridgeLogId(row.raw_log_id);
                                  setActiveSection('bridge');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition inline-flex items-center space-x-1"
                              >
                                <span>Inspect Bridge</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[11px]">N/A</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: LIVE SQL + NoSQL POLYGLOT INTEGRATION BRIDGE             */}
      {/* ==================================================================== */}
      {activeSection === 'bridge' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/30">
                  <Workflow className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    LIVE POLYGLOT INTEGRATION BRIDGE: PostgreSQL 17 &harr; MongoDB 9.0
                  </h3>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    Demonstrating Cross-Database Foreign Reference Linkage via <code className="text-white font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700">raw_log_id</code>.
                  </p>
                </div>
              </div>

              {/* Event Selector Dropdown */}
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-2 shrink-0">
                <span className="text-xs text-slate-400 font-semibold font-mono">Select Alert:</span>
                <select
                  value={selectedBridgeLogId}
                  onChange={(e) => setSelectedBridgeLogId(e.target.value)}
                  className="bg-slate-900 text-emerald-400 font-mono text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {securityEventsList
                    .filter((ev: any) => ev.raw_log_id)
                    .slice(0, 30)
                    .map((ev: any) => (
                      <option key={ev.event_id} value={ev.raw_log_id}>
                        {ev.raw_log_id} &bull; {ev.event_type} ({ev.severity})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Bridge Mechanics Bar */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-slate-500 block text-[10px]">Relational Foreign Key Column:</span>
                <span className="text-cyan-400 font-bold">security_events.raw_log_id</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-slate-500 block text-[10px]">NoSQL Target Collection & Key:</span>
                <span className="text-emerald-400 font-bold">raw_security_telemetry.raw_log_id</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Cross-Database Lookup Latency:</span>
                <span className="text-amber-400 font-bold">{bridgeLatency ? `${bridgeLatency} ms (Indexed O(1))` : '< 2 ms'}</span>
              </div>
            </div>
          </div>

          {/* Visual Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Left: PostgreSQL Relational Row */}
            <div className="bg-slate-900/90 border border-blue-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">1. PostgreSQL 17 Relational Record</h4>
                      <p className="text-[11px] text-slate-400">Table: <code className="text-blue-300 font-mono">security_events</code> (Structured ACID Core)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    B-Tree Indexed
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">event_id (PK):</span>
                    <span className="font-bold text-white">{currentBridgeEvent?.event_id || '1'}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">event_type:</span>
                    <span className="font-bold text-cyan-300">{currentBridgeEvent?.event_type || 'SSH Brute Force Attack'}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">severity:</span>
                    <span className="font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      {currentBridgeEvent?.severity || 'CRITICAL'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">source_ip &rarr; dest_ip:</span>
                    <span className="text-slate-200">{currentBridgeEvent?.source_ip} &rarr; {currentBridgeEvent?.dest_ip}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">host_id / hostname:</span>
                    <span className="text-slate-200">{currentBridgeEvent?.host_id} ({currentBridgeEvent?.hostname})</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500">event_status:</span>
                    <span className="text-amber-300 font-bold">{currentBridgeEvent?.event_status || 'UNRESOLVED'}</span>
                  </div>
                  
                  {/* The Bridge Reference Key */}
                  <div className="p-3 rounded-xl bg-blue-950/60 border-2 border-blue-500/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase tracking-wide block font-sans font-bold">
                        Bridge Reference Key:
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        raw_log_id: <span className="text-emerald-400">{selectedBridgeLogId}</span>
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-4">
                <strong className="text-slate-300">Why SQL here?</strong> Relational constraints guarantee that every security event belongs to a verified host, links to an analyst, and triggers automated risk recalculation.
              </div>
            </div>

            {/* Right: MongoDB Unstructured Document */}
            <div className="bg-slate-900/90 border border-emerald-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">2. MongoDB 9.0 NoSQL Document</h4>
                      <p className="text-[11px] text-slate-400">Collection: <code className="text-emerald-300 font-mono">raw_security_telemetry</code> (Packet Lake)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    BSON Document
                  </span>
                </div>

                {bridgeLoading ? (
                  <div className="py-20 text-center space-y-2">
                    <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-mono">Querying MongoDB cluster for {selectedBridgeLogId}...</p>
                  </div>
                ) : bridgeMongoDoc ? (
                  <div className="mt-4 space-y-3 font-mono text-xs">
                    
                    {/* Key Elements Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Protocol Type:</span>
                        <span className="font-bold text-emerald-400">{bridgeMongoDoc.protocol || 'TCP/HTTPS'}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Sensor Node:</span>
                        <span className="font-bold text-cyan-300">{bridgeMongoDoc.sensor_id}</span>
                      </div>
                    </div>

                    {/* PCAP Binary Hex Dump */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold">
                        Raw PCAP Packet Hex Dump (Variable Length):
                      </span>
                      <div className="text-[11px] text-amber-300 break-all bg-black/60 p-2 rounded border border-slate-900 font-mono select-all">
                        {bridgeMongoDoc.payload_hex}
                      </div>
                    </div>

                    {/* Syscall Trace Array */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold">
                        Kernel System Call Trace Array (<code className="text-emerald-400">system_call_trace</code>):
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {(bridgeMongoDoc.system_call_trace || []).map((sc: any, idx: number) => (
                          <div key={idx} className="text-[10px] bg-slate-900/80 px-2 py-1 rounded text-slate-300 flex justify-between">
                            <span className="text-cyan-300 font-bold">{sc.syscall}</span>
                            <span className="text-slate-400">{sc.binary}</span>
                            <span className="text-slate-500">PID: {sc.pid}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Headers */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] font-sans font-semibold">
                        Polymorphic Packet Headers (Schema-less):
                      </span>
                      <pre className="text-[10px] text-emerald-400 bg-black/60 p-2 rounded overflow-x-auto max-h-20">
                        {JSON.stringify(bridgeMongoDoc.headers, null, 2)}
                      </pre>
                    </div>

                  </div>
                ) : (
                  <div className="py-20 text-center text-xs text-slate-500 font-mono">
                    No matching BSON document found in MongoDB for ID: {selectedBridgeLogId}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-4">
                <strong className="text-emerald-400">Why NoSQL here?</strong> Packet headers and kernel syscall arrays are polymorphic and high-velocity. Storing them in MongoDB prevents polluting relational tables with dozens of nullable columns.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: SCHEMA DICTIONARY & CONSTRAINTS (ORIGINAL 8 CARDS)        */}
      {/* ==================================================================== */}
      {activeSection === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tables.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-6 w-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-sm font-bold text-white uppercase">{t.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Table</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{t.role}</p>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 mb-3 font-mono">
                    <div className="text-emerald-400">
                      <span className="text-slate-500 font-sans font-semibold">Primary Key: </span>
                      {t.pk}
                    </div>
                    <div className="text-blue-400">
                      <span className="text-slate-500 font-sans font-semibold">Foreign Keys: </span>
                      {t.fks}
                    </div>
                    <div className="text-cyan-300">
                      <span className="text-slate-500 font-sans font-semibold">Cardinality: </span>
                      {t.relationships}
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 font-sans font-semibold block mb-1">Columns & Constraints:</span>
                    {t.attributes.map((attr, aIdx) => (
                      <div key={aIdx} className="truncate">
                        &bull; {attr}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Polyglot Persistence Architecture Map */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Workflow className="h-5 w-5 text-emerald-400" />
              <span>Polyglot Persistence Architecture (RDBMS + Vector + NoSQL)</span>
            </h3>
            <p className="text-xs text-slate-400">
              How data flows across relational, vector, and document storage layers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <Database className="h-4 w-4" />
                  <span>1. PostgreSQL 17 (RDBMS Core)</span>
                </div>
                <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                  <li>Structured schema & strict normalization</li>
                  <li>ACID transactional boundary for triage</li>
                  <li>Autonomous host isolation triggers</li>
                  <li>Views with complex multi-table JOINs</li>
                  <li>Stored procedures with SLA cursors</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Cpu className="h-4 w-4" />
                  <span>2. pgvector (Vector Engine)</span>
                </div>
                <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                  <li>384-dimensional dense semantic vectors</li>
                  <li>Native <code className="text-cyan-400 font-mono">vector(384)</code> column type</li>
                  <li>HNSW Cosine Distance (<code className="text-cyan-400 font-mono">&lt;=&gt;</code>) Index</li>
                  <li>Natural language threat description query</li>
                  <li>Instant retrieval of historical playbooks</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <HardDrive className="h-4 w-4" />
                  <span>3. MongoDB 9.0 (NoSQL Lake)</span>
                </div>
                <ul className="text-slate-400 space-y-1 text-[11px] list-disc list-inside">
                  <li>Schema-less raw PCAP hex payloads</li>
                  <li>HTTP headers & system call traces</li>
                  <li>Cross-referenced via <code className="text-emerald-400 font-mono">raw_log_id</code></li>
                  <li>Dynamic threat intelligence indicators</li>
                  <li>High-throughput multi-stage aggregation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: VISUAL ER DIAGRAM & CARDINALITY MATRIX                   */}
      {/* ==================================================================== */}
      {activeSection === 'diagram' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Normalized 3NF Entity-Relationship Diagram</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Generated via Matplotlib / Graph Engine</span>
            </div>

            <p className="text-xs text-slate-400">
              Visual architectural diagram displaying all 8 normalized tables, primary keys, foreign key references, and relationship cardinalities:
            </p>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex justify-center">
              {/* Image served directly from /er_diagram.png */}
              <img
                src="/er_diagram.png"
                alt="CYBERPULSE Normalized 3NF ER Diagram"
                className="max-w-full h-auto rounded-lg shadow-2xl object-contain max-h-[600px]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

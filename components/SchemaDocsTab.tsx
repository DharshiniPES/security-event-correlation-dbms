'use client';

import React from 'react';
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
  Cpu
} from 'lucide-react';

export default function SchemaDocsTab() {
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

  const vivaQuestions = [
    {
      q: '1. Why did you choose a Polyglot Architecture (SQL + NoSQL + Vector)?',
      a: 'Structured relational data (users, hosts, events, incidents) requires strong referential integrity, ACID transactions, and complex analytical JOINs (handled by PostgreSQL). Conversely, high-velocity network packet hex dumps, arbitrary HTTP headers, and system-call traces vary widely in structure, making MongoDB (NoSQL) optimal for polymorphic storage without schema migrations. Lastly, pgvector allows semantic cosine similarity retrieval (<=>) to match natural language incident descriptions against historical resolution playbooks.',
    },
    {
      q: '2. How does the system satisfy the 5-table minimum for the ER diagram?',
      a: 'Our ER design incorporates 8 normalized relational tables (departments, users, hosts, attack_tactics, security_events, incidents, incident_event_mapping, remediation_audit), far exceeding the 5-table requirement. It demonstrates 1:1, 1:N, and M:N relationships (via an associative bridge entity), along with composite uniqueness and check constraints.',
    },
    {
      q: '3. What advanced DBMS features are implemented (minimum 4 required)?',
      a: 'We implemented seven advanced DBMS features: (1) ACID Multi-Statement Transactions with ROLLBACK in incident triage, (2) Database Views for complex multi-table aggregations (vw_department_security_posture), (3) Stored Procedures (sp_auto_escalate_incidents with cursor loops), (4) Stored Functions (fn_calculate_host_risk), (5) PostgreSQL Triggers (trg_security_event_risk for autonomous threat response and trg_validate_incident_closure for data integrity), (6) Performance Indexing (B-Tree on composite foreign keys and HNSW vector index on 384-dim embeddings), and (7) NoSQL Pipeline Aggregations ($group, $project, $sort in MongoDB).',
    },
    {
      q: '4. How does the database trigger enforce autonomous containment?',
      a: 'The trigger trg_security_event_risk is an AFTER INSERT trigger on security_events. Whenever an event is ingested, it invokes fn_calculate_host_risk(host_id) to recalculate the host’s cumulative weighted severity. If the risk reaches >= 75.00, it autonomously executes an UPDATE statement setting hosts.is_isolated = TRUE directly in the database engine, quarantining the compromised machine.',
    },
    {
      q: '5. How does the database trigger enforce incident resolution integrity?',
      a: 'The trigger trg_validate_incident_closure is a BEFORE UPDATE trigger on incidents. If an analyst attempts to change status to RESOLVED or CLOSED without providing adequate resolution_notes (minimum 15 characters), the trigger raises an exception: RAISE EXCEPTION "Data Integrity Constraint Violation...". This ensures no security incident can be marked resolved without forensic documentation.',
    },
    {
      q: '6. What is the indexing strategy and what is HNSW?',
      a: 'We use standard B-Tree indexes on frequently queried composite columns like (host_id, event_timestamp DESC) to accelerate event time-series retrieval. For vector similarity search, we use HNSW (Hierarchical Navigable Small World) index with cosine distance operator (<=>). HNSW builds a multi-layer graph that allows sub-millisecond approximate nearest neighbor searches across 384-dimensional vector space.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                8 Normalized Relational Tables
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Viva Voce Technical Guide
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Entity-Relationship Architecture & Schema Data Dictionary
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Complete architectural documentation identifying entities, attributes, primary keys, foreign keys, 
              relationships, database constraints, and oral defense answers for PES University Level 3 evaluation.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 shrink-0">
            <div>Authors: <span className="text-white font-bold">Dharshini V & Dhruv Rajagopalan</span></div>
            <div>PRN: <span className="text-cyan-400">PES1UG24AM428 / PES1UG24AM086</span></div>
          </div>
        </div>
      </div>

      {/* Relational Schema ER Entity Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <span>Relational Schema (8 Normalized Tables)</span>
        </h3>

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

                {/* Primary & Foreign Keys */}
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

                {/* Attributes List */}
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

      {/* Viva Voce Defense Preparation Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Viva Voce Examiner Q&A Guide</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Evaluator Ready</span>
        </div>
        <p className="text-xs text-slate-400">
          Direct, structured responses aligned with the Level 3 DBMS evaluation criteria:
        </p>

        <div className="space-y-4">
          {vivaQuestions.map((item, qIdx) => (
            <div key={qIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
              <span className="font-bold text-white block">{item.q}</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
